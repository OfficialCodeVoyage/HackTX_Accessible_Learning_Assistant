from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import openai
import json
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from pinecone import Pinecone, ServerlessSpec
import uuid  # Add this import
import easyocr
from pdf2image import convert_from_path
import numpy as np
from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from pydantic import BaseModel
from typing import List, Dict

load_dotenv()

openai_api_key = os.getenv('OPENAI_API_KEY')
pinecone_api_key = os.getenv('PINECONE')
openai.api_key = openai_api_key
pc = Pinecone(api_key=pinecone_api_key)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo", openai_api_key=openai_api_key)

def get_embedding(text):
    return embeddings.embed_query(text)

index_name = "hacktx"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # OpenAI's ada-002 model uses 1536 dimensions
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"  # Changed to us-east-1 for the free Starter plan
        )
    )

index = pc.Index(index_name)

# def get_embedding(text, model="text-embedding-ada-002"):
#     response = openai.Embedding.create(
#         model=model,
#         input=[text]
#     )
#     return response['data'][0]['embedding']

app = FastAPI()

UPLOAD_DIR = "uploaded_files"
EXTRACTED_TEXT_DIR = "extracted_texts"
EMBEDDINGS_DIR = "embeddings"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXTRACTED_TEXT_DIR, exist_ok=True)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    pdf_reader = PdfReader(pdf_path)
    extracted_text = []

    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)

    # If no text was extracted, use OCR
    if not extracted_text:
        reader = easyocr.Reader(['en'])
        images = convert_from_path(pdf_path)
        
        for image in images:
            image_np = np.array(image)
            result = reader.readtext(image_np)
            page_text = " ".join([text for (bbox, text, prob) in result])
            if page_text.strip():
                extracted_text.append(page_text)

    # If still no text after OCR, return an error
    if not extracted_text:
        return {"error": "No text could be extracted from the PDF, even with OCR"}

    text_filename = f"{os.path.splitext(file.filename)[0]}.txt"
    text_path = os.path.join(EXTRACTED_TEXT_DIR, text_filename)
    with open(text_path, "w", encoding="utf-8") as text_file:
        text_file.write("\n\n".join(extracted_text))

    # Generate embeddings and store in Pinecone
    for i, page_text in enumerate(extracted_text):
        if page_text.strip():
            embedding = get_embedding(page_text)
            unique_id = str(uuid.uuid4())
            index.upsert(vectors=[
                {
                    "id": unique_id,
                    "values": embedding,
                    "metadata": {"text": page_text, "page": i, "filename": file.filename}
                }
            ])

    return {
        "message": "PDF processed, text extracted, and embeddings stored in Pinecone",
        "text_file": text_path
    }

# @app.post("/query")
# async def query_document(query: str):
#     query_embedding = get_embedding(query)
#     search_results = index.query(vector=query_embedding, top_k=3, include_metadata=True)

#     context = "\n".join([result['metadata']['text'] for result in search_results['matches']])

#     response = openai.ChatCompletion.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": "You are a helpful assistant. Use the following context to answer the user's question."},
#             {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}"}
#         ]
#     )

#     return {
#         "answer": response['choices'][0]['message']['content'],
#         "context": context
#     }

def get_embedding(text):
    return embeddings.embed_query(text)

class QuestionAnswer(BaseModel):
    question: str
    answer: str

class MultipleChoiceQuestion(BaseModel):
    question: str
    choices: Dict[str, str]
    correct_answer: str

def get_context(query: str):
    query_embedding = get_embedding(query)
    search_results = index.query(vector=query_embedding, top_k=3, include_metadata=True)
    return "\n".join([result['metadata']['text'] for result in search_results['matches']])

def get_full_context():
    # Fetch all vectors from the Pinecone index
    # This is a hypothetical method - you'd need to check Pinecone's API for the actual method
    all_vectors = index.fetch_all()
    
    # Extract all text from the metadata
    all_text = [vector['metadata']['text'] for vector in all_vectors if 'text' in vector['metadata']]
    
    # Join all text into a single string
    full_context = "\n\n".join(all_text)
    
    return full_context

def create_summary(context: str) -> str:
    prompt_template = PromptTemplate(
        input_variables=["context"],
        template="Summarize the following text in a concise paragraph:\n\n{context}"
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    summary = chain.run(context=context)
    return summary.strip()

def create_questions(context: str) -> List[QuestionAnswer]:
    prompt_template = PromptTemplate(
        input_variables=["context"],
        template="Generate 3 open-ended questions based on the following text. For each question, also provide a concise answer. Format your response as JSON:\n\n{context}"
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    questions_raw = chain.run(context=context)
    
    try:
        questions_list = json.loads(questions_raw)
        return [QuestionAnswer(question=q["question"], answer=q["answer"]) for q in questions_list]
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse questions output")

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

class MCQResponse(BaseModel):
    multiple_choice_questions: List[MultipleChoiceQuestion]

@app.post("/qa")
async def get_qa(query: str):
    context = get_context(query)
    questions = create_questions(context)
    return {"questions": questions}

@app.post("/mcq", response_model=MCQResponse)
async def get_mcq(query: str = "create MCQs", num_questions: int = 1):
    context = get_context(query)
    mcqs = create_multiple_choice_questions(context, num_questions)
    return MCQResponse(multiple_choice_questions=mcqs)

@app.post("/query")
async def query_document(query: str):
    context = get_context(query)

    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="You are a helpful assistant. Use the following context to answer the user's question.\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
    )
    chain = LLMChain(llm=llm, prompt=prompt_template)
    answer = chain.run(context=context, question=query)

    return {
        "answer": answer.strip(),
        "context": context
    }

# @app.post("/query")
# async def query_document(query: str):
#     # Get query embedding and search Pinecone
#     query_embedding = get_embedding(query)
#     search_results = index.query(vector=query_embedding, top_k=3, include_metadata=True)
#     context = "\n".join([result['metadata']['text'] for result in search_results['matches']])

#     # Initialize LangChain components
#     llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo", openai_api_key=openai_api_key)
    
#     # Create a prompt template
#     prompt_template = PromptTemplate(
#         input_variables=["context", "question"],
#         template="You are a helpful assistant. Use the following context to answer the user's question.\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
#     )

#     # Create an LLMChain
#     chain = LLMChain(llm=llm, prompt=prompt_template)

#     # Run the chain
#     response = chain.run(context=context, question=query)

#     return {
#         "answer": response,
#         "context": context
#     }


@app.get("/summary")
async def summary_document():
    # Get query embedding and search Pinecone
    query = "Create a Summary of the document"
    query_embedding = get_embedding(query)
    search_results = index.query(vector=query_embedding, top_k=3, include_metadata=True)
    context = "\n".join([result['metadata']['text'] for result in search_results['matches']])

    # Create a prompt template
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="You are a helpful assistant. Use the following context to answer the user's question.\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
    )

    # Create an LLMChain
    chain = LLMChain(llm=llm, prompt=prompt_template)

    # Run the chain
    response = chain.run(context=context, question=query)

    return {
        "answer": response,
        "context": context
    }