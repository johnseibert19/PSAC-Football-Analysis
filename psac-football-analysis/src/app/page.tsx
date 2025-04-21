'use client';

import React, { useState, useRef } from 'react';
import { NextPage } from 'next';

// API URL configuration
const API_URL = process.env.NEXT_PUBLIC_FLASK_SERVER_URL || 'http://3.148.242.252:5000';

interface VideoProcessingState {
  videoUrl: string | null;
  error: string | null;
  isProcessing: boolean;
  progress: number;
}

const Home: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<VideoProcessingState>({
    videoUrl: null,
    error: null,
    isProcessing: false,
    progress: 0
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setState({
        videoUrl: null,
        error: null,
        isProcessing: false,
        progress: 0
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();
      const taskId = uploadData.task_id;

      const eventSource = new EventSource(`${API_URL}/events/${taskId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'progress':
            setState(prev => ({ ...prev, progress: data.progress }));
            break;
          case 'complete':
            eventSource.close();
            setState(prev => ({
              ...prev,
              isProcessing: false,
              videoUrl: `${API_URL}${data.video_url}`,
              progress: 100
            }));
            break;
          case 'error':
            eventSource.close();
            setState(prev => ({
              ...prev,
              isProcessing: false,
              error: data.error
            }));
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: 'Connection lost'
        }));
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">PSAC Football Analysis</h1>
        
        <div className="mb-8">
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <button
              onClick={handleUpload}
              disabled={state.isProcessing}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {state.isProcessing ? 'Processing...' : 'Upload'}
            </button>
          )}
        </div>

        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {state.error}
          </div>
        )}

        {state.isProcessing && (
          <div className="mb-4">
            <p className="text-gray-700">Processing video... {state.progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {state.videoUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Processed Video</h2>
            <video
              ref={videoRef}
              controls
              className="w-full rounded-lg shadow-lg"
              src={state.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </main>
  );
}

export default Home; 
