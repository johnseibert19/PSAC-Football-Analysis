'use client';

import React, { useState, useEffect, useRef } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Body from './components/Body';

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [setVideoPreviewUrl] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
    const [processingTime, setProcessingTime] = useState<number | null>(null);
    const [totalFrames, setTotalFrames] = useState<number | null>(null);
    const videoPlayerRef = useRef<HTMLVideoElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (allowedVideoTypes.includes(selectedFile.type)) {
                console.log("File selected:", selectedFile.name);
                setFile(selectedFile);
                setVideoPreviewUrl(null);
                setProcessingStatus('');
                setUploadError(null);

                // Create a local preview URL for the selected file
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
                // Set the processed video URL directly from the response
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
        // Revoke the object URL to free up memory
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

    // Cleanup URLs when component unmounts or URLs change
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
            } min-h-screen flex flex-col`} // Added flex-col
        >
            {/* Use the separate Header component */}
            <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="flex-grow flex flex-col items-center p-8"> {/* Added flex-grow */}
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

                {/* Use the Body component here */}
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
                            {/* <li>Type: {file.type}</li> */}
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

            {/* Use the separate Footer component */}
            <Footer darkMode={darkMode}  />
        </div>
    );
}