"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });

const Body = ({
    originalVideoUrl,
    darkMode,
    handleFileChange,
    handleRemoveVideo,
    videoPlayerRef,
}) => {
    const boxBackgroundColorClass = darkMode ? 'bg-gray-800' : 'bg-[#f0f0f0]';

    return (
        <div className="w-full max-w-4xl mb-8">
            <div className="grid grid-cols-1 gap-4"> {/* Changed to grid-cols-1 */}
                {/* Original Video */}
                <div className={`p-6 rounded-lg shadow-md ${boxBackgroundColorClass}`}>
                    <h3 className="text-lg font-medium mb-2">Original Video:</h3>
                    {originalVideoUrl ? (
                        <div className="relative">
                            <video
                                ref={videoPlayerRef}
                                src={originalVideoUrl}
                                controls
                                className="w-full rounded-lg"
                                key={originalVideoUrl}
                            />
                            <button
                                onClick={handleRemoveVideo}
                                className="absolute top-2 right-2 bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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
                                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                                Upload File
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

exports.default = Body;