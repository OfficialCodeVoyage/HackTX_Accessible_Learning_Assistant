import openai
import azure.cognitiveservices.speech as speechsdk
import time

# OpenAI API Key Configuration (hardcoded for testing)
openai.api_key = "#lbk#AA"

# Azure Speech SDK Configuration for STT and TTS (hardcoded for testing)
speech_key = "#"
speech_region = "#"
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

# STT: Speech recognizer setup
speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

# TTS: Speech synthesizer setup
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

def get_ai_response(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",  # Ensure this is the correct model name
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.5
        )
        return response.choices[0].message['content'].strip() if response.choices else "I didn't catch that. Could you repeat?"
    except openai.error.AuthenticationError as e:
        print("Authentication Error:", e)
        return "I'm having trouble authenticating with the OpenAI service."
    except Exception as e:
        print("An error occurred:", e)
        return "I'm having trouble processing your request right now."

def listen_and_respond():
    print("Listening...")

    # Start STT for capturing speech
    result = speech_recognizer.recognize_once()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        user_input = result.text
        print(f"User said: {user_input}")

        # Get AI Response from OpenAI
        ai_response = get_ai_response(user_input)
        print(f"AI Response: {ai_response}")

        # Check if ai_response is empty or None
        if not ai_response:
            ai_response = "I'm sorry, I didn't understand that. Could you say it again?"

        # TTS for responding back to the user
        synthesis_result = speech_synthesizer.speak_text_async(ai_response).get()

        # Check if synthesis was successful
        if synthesis_result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            print("Response playback completed.")
        else:
            print("Error synthesizing audio:", synthesis_result.error_details)
    elif result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized.")
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print("Speech Recognition canceled:", cancellation_details.reason)
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details:", cancellation_details.error_details)

# Loop for continuous listening
try:
    while True:
        listen_and_respond()
        time.sleep(1)  # Short delay before listening again
except KeyboardInterrupt:
    print("Real-time voice interaction terminated.")
