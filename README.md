# AITranscribeFrontend

Frontend for AITranscribe that you can host on your local network to record audio and get AI-powered transcriptions.

## Overview

This React application provides a simple, user-friendly interface for recording audio and receiving transcriptions. It connects to a backend transcription service running on your local network, making it easy to transcribe voice recordings without relying on external services.

## Features

- **Audio Recording**: One-click recording from your device's microphone
- **Real-time Timer**: Shows recording duration while in progress
- **Transcription Processing**: Sends recordings to the backend for AI-powered transcription
- **Summary View**: Displays both a concise summary and the full transcript of your recording
- **Error Handling**: Provides clear feedback when unable to connect to the server
- **Responsive Design**: Works on various screen sizes

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/aitranscribefrontend.git
   cd aitranscribefrontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the backend server address:
   Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://your-backend-ip:8000
   ```
   Replace `your-backend-ip` with the IP address of your backend server.

4. Start the development server:
   ```
   npm start
   ```

5. For production build:
   ```
   npm run build
   ```
   
   You can then serve the built files from the `build` directory using any static file server.

## Usage

1. Click "Start Recording" to begin capturing audio
2. Speak clearly into your microphone
3. Click "Stop Recording" when finished
4. Wait for the AI to process your recording
5. View both the summary and full transcript of your recording

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | URL of the backend transcription service | http://localhost:8000 |

## Tech Stack

- React with TypeScript
- MediaRecorder API for audio capture
- Fetch API for communication with the backend

## Backend Requirements

This frontend expects the backend to:
- Accept POST requests at the `/transcribe/` endpoint
- Accept form data with an audio file named "file"
- Return JSON with the following format:
  ```json
  {
    "status": "success",
    "summary": "Concise summary of the audio",
    "transcript": "Full transcript of the audio"
  }
  ```