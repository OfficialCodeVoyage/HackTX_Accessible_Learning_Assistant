# Import necessary libraries
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import uuid
import easyocr
from pdf2image import convert_from_path
import numpy as np
from typing import List, Dict
from pydantic import BaseModel
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_iris import IRISVector

# Load environment variables
load_dotenv(override=True)

# Initialize FastAPI and add CORS middleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
UPLOAD_DIR = "uploaded_files"
EXTRACTED_TEXT_DIR = "extracted_texts"
COLLECTION_NAME = "document_store"
IRIS_CONNECTION_STRING = os.getenv("CONNECTION_STRING")

# Create directories for uploads and extracted texts
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXTRACTED_TEXT_DIR, exist_ok=True)

# Initialize LangChain components
embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
llm = ChatOpenAI(
    temperature=0, 
    model_name="gpt-3.5-turbo", 
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Global IRIS vector store instance
vector_store = None

def initialize_vector_store(docs):
    """Initialize or update the global vector store."""
    global vector_store
    if vector_store is None:
        vector_store = IRISVector.from_documents(
            embedding=embeddings,
            documents=docs,
            collection_name=COLLECTION_NAME,
            connection_string=IRIS_CONNECTION_STRING
        )
    else:
        vector_store.add_documents(docs)
    return vector_store

# Pydantic models for structured responses
class QuestionAnswer(BaseModel):
    question: str
    answer: str

class MultipleChoiceQuestion(BaseModel):
    question: str
    choices: Dict[str, str]
    correct_answer: str

class MCQResponse(BaseModel):
    multiple_choice_questions: List[MultipleChoiceQuestion]

# Endpoint to upload and process PDFs
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), directory: str = ""):
    # Save uploaded file
    upload_dir = os.path.join(UPLOAD_DIR, directory)
    os.makedirs(upload_dir, exist_ok=True)
    pdf_path = os.path.join(upload_dir, file.filename)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text from PDF
    pdf_reader = PdfReader(pdf_path)
    extracted_text = [page.extract_text() for page in pdf_reader.pages if page.extract_text()]

    # Use OCR if no text was extracted
    if not extracted_text:
        reader = easyocr.Reader(['en'])
        images = convert_from_path(pdf_path)
        for image in images:
            result = reader.readtext(np.array(image))
            page_text = " ".join([text for (bbox, text, prob) in result])
            if page_text.strip():
                extracted_text.append(page_text)

    if not extracted_text:
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")

    # Save extracted text
    extracted_dir = os.path.join(EXTRACTED_TEXT_DIR, directory)
    os.makedirs(extracted_dir, exist_ok=True)
    text_filename = f"{os.path.splitext(file.filename)[0]}.txt"
    text_path = os.path.join(extracted_dir, text_filename)
    with open(text_path, "w", encoding="utf-8") as text_file:
        text_file.write("\n\n".join(extracted_text))

    # Create documents for vector store
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = [Document(page_content=text, metadata={"page": i, "filename": file.filename, "directory": directory}) 
            for i, text in enumerate(extracted_text)]
    docs = text_splitter.split_documents(docs)

    # Initialize or update vector store
    initialize_vector_store(docs)

    return {
        "message": "PDF processed and stored in IRIS Vector database",
        "text_file": text_path
    }

# Endpoint to query the documents in vector store
@app.post("/query")
async def query_document(query: str):
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents have been uploaded yet")

    docs_with_score = vector_store.similarity_search_with_score(query, k=3)
    context = "\n".join([doc.page_content for doc, _ in docs_with_score])

    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="Use the following context to answer the user's question.\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    answer = chain.run(context=context, question=query)

    return {
        "answer": answer.strip(),
        "context": context,
        "sources": [{"content": doc.page_content, "score": score} for doc, score in docs_with_score]
    }

# Endpoint to generate open-ended questions with answers
@app.post("/qa")
async def get_qa(query: str):
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents have been uploaded yet")

    docs_with_score = vector_store.similarity_search_with_score(query)
    context = "\n".join([doc.page_content for doc, _ in docs_with_score])

    prompt_template = PromptTemplate(
        input_variables=["context"],
        template="Generate 3 open-ended questions based on the following text. For each question, also provide a concise answer. Format your response as JSON:\n\n{context}"
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    questions_raw = chain.run(context=context)
    
    try:
        questions_list = json.loads(questions_raw)
        return {"questions": [QuestionAnswer(question=q["question"], answer=q["answer"]) 
                            for q in questions_list]}
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse questions output")

# Helper function to generate multiple-choice questions
def create_multiple_choice_questions(context: str, num_questions: int) -> List[MultipleChoiceQuestion]:
    prompt_template = PromptTemplate(
        input_variables=["context", "num_questions"],
        template="""Create {num_questions} multiple-choice questions with 4 options each based on the following text. Format your response as a JSON list of questions:

        [
            {{
                "question": "Your question here",
                "choices": {{
                    "A": "First option",
                    "B": "Second option",
                    "C": "Third option",
                    "D": "Fourth option"
                }},
                "correct_answer": "A"
            }},
            // More questions...
        ]

        Text: {context}"""
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    mcq_raw = chain.run(context=context, num_questions=num_questions)
    
    try:
        mcq_list = json.loads(mcq_raw)
        return [MultipleChoiceQuestion(**mcq) for mcq in mcq_list]
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse MCQ output")

# Endpoint to create multiple-choice questions
@app.post("/mcq", response_model=MCQResponse)
async def get_mcq(query: str = "create MCQs", num_questions: int = 1):
    context = get_context(query)
    mcqs = create_multiple_choice_questions(context, num_questions)
    return MCQResponse(multiple_choice_questions=mcqs)

# Endpoint to summarize the document
@app.get("/summary")
async def summary_document():
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents have been uploaded yet")

    docs_with_score = vector_store.similarity_search_with_score("Create a Summary of the document")
    context = "\n".join([doc.page_content for doc, _ in docs_with_score])

    prompt_template = PromptTemplate(
        input_variables=["context"],
        template="Provide a comprehensive summary of the following text:\n\n{context}"
    )
    
    chain = LLMChain(llm=llm, prompt=prompt_template)
    summary = chain.run(context=context)

    return {
        "summary": summary.strip(),
        "context": context
    }
