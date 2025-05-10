'use client';

import React, { useState, useEffect, useRef, ChangeEvent, RefObject } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

interface BodyProps {
  file: File | null;
  originalVideoUrl: string | null;
  processedVideoUrl: string | null;
  darkMode: boolean;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo: () => void;
  processingTime: number | null;
  totalFrames: number | null;
  videoPlayerRef: RefObject<HTMLVideoElement | null>; // Corrected type here
}

const Body: React.FC<BodyProps> = ({
  file,
  originalVideoUrl,
  processedVideoUrl,
  handleFileChange,
  handleRemoveVideo,
  processingTime,
  totalFrames,
  videoPlayerRef,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {originalVideoUrl && (
        <div className="border rounded-md shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold mb-2">Original Video</h3>
          <video ref={videoPlayerRef} src={originalVideoUrl} controls className="w-full max-w-2xl" />
        </div>
      )}

      {processedVideoUrl && (
        <div className="border rounded-md shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold mb-2">Processed Video</h3>
          <video src={processedVideoUrl} controls className="w-full max-w-2xl" />
          {processingTime !== null && <p>Processing Time: {processingTime.toFixed(1)} seconds</p>}
          {totalFrames !== null && <p>Total Frames: {totalFrames}</p>}
        </div>
      )}

      {!originalVideoUrl && (
        <div className="border rounded-md shadow-md p-6 text-center">
          <label htmlFor="videoUpload" className="cursor-pointer">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l3 3m-3-3v12m6-4h16m2-2l3-3m0 0l-3-3m3 3V11m-6 4h16" />
            </svg>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Click to upload a video
            </p>
            <input id="videoUpload" type="file" className="sr-only" accept={allowedVideoTypes.join(',')} onChange={handleFileChange} />
          </label>
          {file && (
            <div className="mt-4">
              <p>Selected File: {file.name}</p>
              <button onClick={handleRemoveVideo} className="mt-2 text-sm text-red-500 hover:text-red-700">Remove</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [, setVideoPreviewUrl] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [totalFrames, setTotalFrames] = useState<number | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null); // Initialized as potentially null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (allowedVideoTypes.includes(selectedFile.type)) {
        console.log("File selected:", selectedFile.name);
        setFile(selectedFile);
        setVideoPreviewUrl(null);
        setProcessingStatus('');
        setUploadError(null);

        const previewUrl = URL.createObjectURL(selectedFile);
        setOriginalVideoUrl(previewUrl);
        console.log("Preview URL created:", previewUrl);
      } else {
        setFile(null);
        setOriginalVideoUrl(null);
        setUploadError(`Invalid file type. Please select a video file (${allowedVideoTypes.map(type => type.split('/')[1]).join(', ')}).`);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a video file first.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setProcessingStatus('Starting upload...');
      console.log('Starting video upload process...');

      const formData = new FormData();
      formData.append('video', file);
      formData.append('filename', file.name);

      const uploadResponse = await fetch('/api/uploadVideo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);

      console.log('Sending video for processing...');
      const detectResponse = await fetch('http://localhost:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: uploadData.filePath
        }),
      });

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      const detectData = await detectResponse.json();
      console.log('Processing response:', detectData);

      if (detectData.success && detectData.annotatedVideoUrl) {
        setProcessedVideoUrl(`http://localhost:5000${detectData.annotatedVideoUrl}`);
        setProcessingTime(detectData.processingTime);
        setTotalFrames(detectData.totalFrames);
        setProcessingStatus(`Processing complete! Time taken: ${detectData.processingTime?.toFixed(1) || 0} seconds`);
      } else {
        throw new Error('No processed video URL received');
      }

    } catch (err) {
      console.error('Error:', err);
      setUploadError(err instanceof Error ? err.message : 'An error occurred');
      setProcessingStatus('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    if (originalVideoUrl) {
      URL.revokeObjectURL(originalVideoUrl);
    }
    setFile(null);
    setOriginalVideoUrl(null);
    setProcessedVideoUrl(null);
    setProcessingStatus('');
    setUploadError(null);
    setProcessingTime(null);
    setTotalFrames(null);
  };

  useEffect(() => {
    return () => {
      if (originalVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(originalVideoUrl);
      }
      if (processedVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [originalVideoUrl, processedVideoUrl]);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen flex flex-col`}
    >
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-grow flex flex-col items-center p-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Football Video Analysis with Yolov8
          </h2>
          <p className="mb-4">
            This website uses Yolov8 to process your football video and will
            annotate the players and the ball.
          </p>
          <div className="border border-gray-700 rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Instructions:</h3>
            <p>
              Upload your video using the file upload button, and the Machine
              Learning tool will process it.
            </p>
          </div>
        </div>

        <Body
          file={file}
          originalVideoUrl={originalVideoUrl}
          processedVideoUrl={processedVideoUrl}
          darkMode={darkMode}
          handleFileChange={handleFileChange}
          handleRemoveVideo={handleRemoveVideo}
          processingTime={processingTime}
          totalFrames={totalFrames}
          videoPlayerRef={videoPlayerRef}
        />

        {file && (
          <section className="mb-8 text-center">
            <h2 className="text-lg font-semibold mb-2">File Details:</h2>
            <ul className="list-disc list-inside">
              <li>Name: {file.name}</li>
              <li>Size: {formatFileSize(file.size)}</li>
            </ul>
          </section>
        )}

        {processingStatus && (
          <div className="mb-4 p-4 bg-blue-900 text-blue-100 rounded-lg">
            {processingStatus}
          </div>
        )}

        {uploadError && (
          <div className="mb-4 p-4 bg-red-900 text-red-100 rounded-lg">
            Error: {uploadError}
          </div>
        )}

        {file && (
          <div className="text-center">
            <button
              onClick={handleUpload}
              className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUploading}
            >
              {isUploading ? "Processing..." : "Analyze Video"}
            </button>
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}