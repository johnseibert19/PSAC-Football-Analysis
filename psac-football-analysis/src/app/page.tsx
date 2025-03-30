'use client';

import React, { useState } from 'react';

// API URL configuration
const API_URL = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://psacfootball-python-f58da7eeb938.herokuapp.com'
  : 'https://psacfootball-python-f58da7eeb938.herokuapp.com';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setProcessedVideoUrl(null);
      setTaskId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setIsProcessing(false);
    setError(null);
    setProcessedVideoUrl(null);
    setStatusMessage('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setIsProcessing(true);
      setStatusMessage('Processing started...');
      
      // Start SSE connection for status updates
      const eventSource = new EventSource(`${API_URL}/events/${data.task_id}`);
      
      eventSource.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        setStatusMessage(eventData.message);
        
        if (eventData.progress !== undefined) {
          setProcessingProgress(eventData.progress);
        }
        
        if (eventData.status === 'completed') {
          eventSource.close();
          setIsProcessing(false);
          setIsUploading(false);
          setProcessedVideoUrl(`${API_URL}/uploads/processed_${selectedFile.name}`);
        } else if (eventData.status === 'error') {
          eventSource.close();
          setIsProcessing(false);
          setIsUploading(false);
          setError(eventData.message || 'Processing failed');
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsProcessing(false);
        setIsUploading(false);
        setError('Connection error while processing video');
      };
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PSAC Football Analysis</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Video</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isUploading || isProcessing}
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isProcessing}
              className={`w-full py-2 px-4 rounded-md text-white font-medium
                ${!selectedFile || isUploading || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload and Process'}
            </button>

            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {statusMessage}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {processedVideoUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Processed Video</h3>
                <video
                  controls
                  className="w-full rounded-lg shadow-md"
                  src={processedVideoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 