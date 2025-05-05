



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
    <main className="flex min-h-screen flex-col items-center justify-start bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 w-full py-4 px-8 flex justify-between items-center">
        <span className="font-bold text-xl">PSAC Football Analysis</span>
        <div>
          <button className="text-sm text-gray-300 hover:text-white mr-4">Contact</button>
          <button className="text-sm text-gray-300 hover:text-white">Light Mode</button>
        </div>
      </div>

      <div className="max-w-5xl w-full py-16 px-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Football Video Analysis with YOLOv8</h1>
        <p className="text-lg text-gray-400 mb-4 text-center">This website uses YOLOv8 to process your football video and will annotate the players and the ball.</p>
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <p className="text-gray-300">Upload your video using the file upload button, and the Machine Learning tool will process it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-start">
            <h2 className="text-lg font-semibold mb-4">Original Video</h2>
            <div className="w-full">
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600"
              />
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={state.isProcessing}
                  className="mt-4 px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-600 w-full"
                >
                  {state.isProcessing ? 'Processing...' : 'Upload Video'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-start">
            <h2 className="text-lg font-semibold mb-4">Processed Video</h2>
            <div className="w-full flex-grow flex flex-col items-center justify-center">
              {state.error && (
                <div className="bg-red-700 text-white px-4 py-2 rounded relative mb-4 w-full text-center">
                  {state.error}
                </div>
              )}

              {state.isProcessing && (
                <div className="mb-4 w-full">
                  <p className="text-gray-400 mb-2 text-center">Processing video... {state.progress}%</p>
                  <div className="bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {state.videoUrl && (
                <div className="mt-4 w-full aspect-video">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full rounded-lg shadow-lg object-fit-contain"
                    src={state.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {!state.isProcessing && !state.videoUrl && !state.error && (
                <p className="text-gray-400 text-center">Processed video will appear here.</p>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-500 mt-8">
          <p>&copy; 2025 PSAC Football Analysis. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

export default Home;