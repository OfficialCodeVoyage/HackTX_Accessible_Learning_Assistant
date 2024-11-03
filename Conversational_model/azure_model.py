from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO, emit
import requests
import azure.cognitiveservices.speech as speechsdk
from io import BytesIO
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Azure Credentials
OPENAI_API_KEY = '#'
OPENAI_ENDPOINT = '##ew'
SPEECH_KEY = '#'
SPEECH_REGION = '#'

# Initialize Speech Config
speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
speech_config.speech_synthesis_voice_name = 'en-US-JennyNeural'  # Choose appropriate voice

# In-memory conversation history per session
conversation_histories = {}


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Initialize conversation history for this session
    conversation_histories[request.sid] = []


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    # Remove conversation history for this session
    conversation_histories.pop(request.sid, None)


@socketio.on('user_audio')
def handle_user_audio(data):
    try:
        audio_data = BytesIO(data['audio'])  # Assuming 'audio' is sent as bytes
        user_text = speech_to_text(audio_data.getvalue(), request.sid)
        if not user_text:
            emit('error', {'message': 'Could not transcribe audio.'})
            return

        # Update conversation history
        conversation_histories[request.sid].append({"role": "user", "content": user_text})

        # Get AI response
        ai_text = get_ai_response(user_text, conversation_histories[request.sid])

        # Update conversation history
        conversation_histories[request.sid].append({"role": "assistant", "content": ai_text})

        # Convert AI text to speech
        ai_audio = text_to_speech(ai_text)
        if not ai_audio:
            emit('error', {'message': 'Could not synthesize speech.'})
            return

        # Send AI audio back to frontend
        emit('ai_audio', {'audio': ai_audio})

    except Exception as e:
        print(f"WebSocket Error: {e}")
        emit('error', {'message': 'Internal server error.'})


def speech_to_text(audio_data, session_id):
    try:
        audio_stream = BytesIO(audio_data)
        audio_input = speechsdk.AudioConfig(stream=speechsdk.AudioInputStream(
            stream_format=speechsdk.AudioStreamFormat(encoding=speechsdk.AudioStreamEncodingFormat.Pcm,
                                                      samples_per_second=16000, bits_per_sample=16, channels=1),
            audio_stream=audio_stream))
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)
        result = speech_recognizer.recognize_once()
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        else:
            print(f"STT Error for session {session_id}: {result.reason}")
            return ""
    except Exception as e:
        print(f"STT Exception for session {session_id}: {e}")
        return ""


def get_ai_response(prompt, conversation_history):
    try:
        headers = {
            'Content-Type': 'application/json',
            'api-key': OPENAI_API_KEY
        }
        payload = {
            "messages": conversation_history,
            "max_tokens": 150,
            "temperature": 0.7
        }
        response = requests.post(
            f"{OPENAI_ENDPOINT}/openai/deployments/gpt-4-32k/chat/completions?api-version=2024-08-01-preview",
            headers=headers, json=payload
        )
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"OpenAI API Error: {response.status_code}, {response.text}")
            return "I'm sorry, I couldn't process that."
    except Exception as e:
        print(f"AI Response Error: {e}")
        return "I'm sorry, I encountered an error."


def text_to_speech(text):
    try:
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
        result = synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            print(f"TTS Error: {result.reason}")
            return None
    except Exception as e:
        print(f"TTS Exception: {e}")
        return None


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)