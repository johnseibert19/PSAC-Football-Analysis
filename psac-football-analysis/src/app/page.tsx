"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      if (selectedFile.type.startsWith("video/")) {
        setVideoPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setVideoPreviewUrl(null);
        console.error("Selected file is not a video.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("filename", file.name);

    console.log("FormData:", formData);

    try {
      const response = await fetch("/api/uploadVideo", {
        method: "POST",
        body: formData,
      });

      console.log("Response:", response);

      if (response.ok) {
        const data = await response.json();
        setVideoPreviewUrl(data.url);
        console.log("Video upload successful:", data.url);
        setUploadError(null);
      } else {
        console.error("Video upload failed:", response.statusText);
        const responseBody = await response.text();
        console.error("Response body:", responseBody);
        setUploadError(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      if (error instanceof Error) {
        setUploadError(`Error uploading video: ${error.message}`);
      } else {
        setUploadError("An unknown error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

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

        <div className="w-full max-w-2xl mb-8 p-6 bg-gray-800 rounded-lg shadow-md">
          {videoPreviewUrl ? (
            <video
              src={videoPreviewUrl}
              controls
              className="w-full rounded-lg"
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

        {uploadError && <p className="text-red-500">{uploadError}</p>}

        {file && (
          <div className="text-center">
            <button
              onClick={handleUpload}
              className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUploading}
            >
              {isUploading ? "Analyzing..." : "Analyze Video"}
            </button>
            {isUploading && <p className="mt-2">Uploading video...</p>}
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