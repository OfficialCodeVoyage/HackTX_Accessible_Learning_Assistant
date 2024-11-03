import openai
import pyaudio
import speech_recognition as sr
from gtts import gTTS
from playsound import playsound
import os
import threading

# Set up OpenAI API key and model
openai.api_key = '###'

MODEL_NAME = "gpt-4-turbo"

# Initial context for the conversation (replace with your specific context)
initial_context = {
    "role": "system",
    "content": """
    You are speaking with a user who has provided the following background:
    - The user is a Computer Science student interested in AI, hackathons, and productivity.
    - They have specific questions about real-time conversational AI and application design.
    - The user’s focus is on interactive, real-time applications, and they are familiar with Python and cloud computing.
    Keep these details in mind as you respond.
    """
}

# Conversation history for chat context
conversation_history = [initial_context]


# Function to get response from OpenAI with conversation history
def get_response(user_text):
    global conversation_history

    # Append the user's message to the conversation history
    conversation_history.append({"role": "user", "content": user_text})

    # Call OpenAI's Chat API with conversation history
    response = openai.ChatCompletion.create(
        model=MODEL_NAME,
        messages=conversation_history,
        max_tokens=100
    )

    # Extract the AI's response
    ai_response = response['choices'][0]['message']['content'].strip()

    # Append the AI's response to conversation history for continuity
    conversation_history.append({"role": "assistant", "content": ai_response})

    return ai_response


# Function to convert text to speech and play it
def speak_text(text):
    tts = gTTS(text=text, lang='en')
    tts.save("response.mp3")
    playsound("response.mp3")
    os.remove("response.mp3")


# Initialize speech recognizer
recognizer = sr.Recognizer()


def listen_and_respond():
    # Use the default microphone as the audio source
    with sr.Microphone() as source:
        print("Adjusting for ambient noise, please wait...")
        recognizer.adjust_for_ambient_noise(source)
        print("Listening...")

        while True:
            try:
                # Capture the audio
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
                print("Processing...")

                # Transcribe audio to text
                user_text = recognizer.recognize_google(audio)
                print(f"You: {user_text}")

                # Get the AI response with context
                ai_response = get_response(user_text)
                print(f"AI: {ai_response}")

                # Speak AI's response in a separate thread to avoid blocking
                threading.Thread(target=speak_text, args=(ai_response,)).start()

            except sr.UnknownValueError:
                print("Could not understand audio, please speak again.")
            except sr.RequestError as e:
                print(f"Could not request results; {e}")
            except Exception as e:
                print(f"An error occurred: {e}")


# Run the real-time conversation loop
listen_and_respond()
