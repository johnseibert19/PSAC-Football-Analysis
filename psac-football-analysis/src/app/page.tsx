'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [totalFrames, setTotalFrames] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("File selected:", selectedFile.name);
      setFile(selectedFile);
      setVideoPreviewUrl(null);
      setProcessingStatus('');
      setUploadError(null);
      
      // Create a local preview URL for the selected file
      const previewUrl = URL.createObjectURL(selectedFile);
      setOriginalVideoUrl(previewUrl);
      console.log("Preview URL created:", previewUrl);
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

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('video', file);
      formData.append('filename', file.name);

      // Upload to Next.js API
      const uploadResponse = await fetch('/api/uploadVideo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);

      // Send to Flask server for processing
      console.log('Sending video for processing...');
      const detectResponse = await fetch('http://localhost:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: uploadData.filePath // Send just the filename
        }),
      });

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      const detectData = await detectResponse.json();
      console.log('Processing response:', detectData);

      if (detectData.success && detectData.annotatedVideoUrl) {
        setProcessedVideoUrl(detectData.annotatedVideoUrl);
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

  // Cleanup preview URL when component unmounts
  useState(() => {
    return () => {
      if (originalVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(originalVideoUrl);
      }
    };
  }, [originalVideoUrl]);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full mr-4">
            {/* Replace with logo */}
          </div>
          <span className="text-lg font-semibold">PSAC Football Analysis</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/contact" className="hover:text-gray-300">
            Contact Page
          </Link>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </header>

      <main className="flex flex-col items-center p-8">
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

        <div className="w-full max-w-4xl mb-8">
          <div className="grid grid-cols-2 gap-4">
            {/* Original Video */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Original Video:</h3>
              {originalVideoUrl ? (
                <video
                  src={originalVideoUrl}
                  controls
                  className="w-full rounded-lg"
                  key={originalVideoUrl}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
                  <input
                    id="file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Upload File
                  </label>
                </div>
              )}
            </div>

            {/* Processed Video */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Processed Video:</h3>
              {processedVideoUrl ? (
                <div className="relative w-full max-w-4xl mx-auto">
                  <video
                    controls
                    className="w-full rounded-lg shadow-lg"
                    src={processedVideoUrl}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                  {processingTime && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Processing time: {processingTime.toFixed(2)} seconds
                    </p>
                  )}
                  {totalFrames && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Total frames processed: {totalFrames}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
                  <p className="text-gray-400">Processed video will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {file && (
          <section className="mb-8 text-center">
            <h2 className="text-lg font-semibold mb-2">File Details:</h2>
            <ul className="list-disc list-inside">
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {file.size} bytes</li>
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

      <footer
        className={`p-4 text-center text-sm ${
          darkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        <p>
          &copy; 2025 PSAC FootBall. Authors: Matt Boehme, Zach Eisele, Justin
          Peasley, John Seibert.
        </p>
      </footer>
    </div>
  );
} 