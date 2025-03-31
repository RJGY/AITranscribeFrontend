import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      setElapsedTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        fetch(`http://192.168.4.56:8000/transcribe/`, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.text();
            console.log('Audio file uploaded successfully!', result);
          })
          .catch((error) => {
            console.error('Error uploading audio file:', error);
            if (error instanceof TypeError) {
              console.error('Network error or CORS issue:', error.message);
            }
          });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      audioChunksRef.current = [];
      
      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="title">Voice Transcription</h1>
          <p className="description">
            Record your voice and get an instant text transcription. 
            Simply click the record button and speak clearly into your microphone.
          </p>
        </div>
        <div className="button-container">
          <button 
            className={`record-button ${isRecording ? 'disabled' : ''}`}
            onClick={startRecording} 
            disabled={isRecording}
          >
            {isRecording ? 'Recording...' : '🎤 Start Recording'}
          </button>
          <button 
            className={`stop-button ${!isRecording ? 'disabled' : ''}`}
            onClick={stopRecording} 
            disabled={!isRecording}
          >
            ⏹️ Stop Recording
          </button>
          {isRecording && (
            <div className="timer">
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;