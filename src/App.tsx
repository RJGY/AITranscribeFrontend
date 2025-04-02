import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcriptionData, setTranscriptionData] = useState<{
    summary: string;
    transcript: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Get API URL from environment variables with fallback
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      setError(null); // Clear any previous errors
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

        setIsLoading(true);
        fetch(`${apiUrl}/transcribe/`, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setTranscriptionData({
              summary: result.summary.trim(),
              transcript: result.transcript.trim()
            });
            console.log('Audio file uploaded successfully!', result);
          })
          .catch((error) => {
            console.error('Error uploading audio file:', error);
            setError('Error: Unable to connect to server. Please try again later.');
            if (error instanceof TypeError) {
              console.error('Network error or CORS issue:', error.message);
            }
          })
          .finally(() => {
            setIsLoading(false);
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

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your recording...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <p>{error}</p>
          </div>
        )}

        {transcriptionData && (
          <div className="transcription-container" style={{ maxWidth: '80%', textAlign: 'left' }}>
            <div className="transcription-section">
              <h2>Summary</h2>
              <div className="transcription-text">
                {transcriptionData.summary}
              </div>
            </div>
            <div className="transcription-section" style={{ marginTop: '1.5rem' }}>
              <h2>Transcript</h2>
              <div className="transcription-text">
                {transcriptionData.transcript}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;