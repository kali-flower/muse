import React, { useState } from 'react';
import './App.css';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      setLoading(true);
      // Simulating API call
      setTimeout(() => {
        setImages([{ url: "/api/placeholder/300/300", description: prompt }]);
        setLoading(false);
      }, 1500);
    }
  };

  const handleRefresh = () => {
    handleGenerate();
  };

  const handleDownload = (url) => {
    // In a real app, this would trigger a download
    console.log("Downloading:", url);
  };

  return (
    <div className="min-h-screen bg-white font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#1f1f1f] mb-2 text-center">
          Your next stroke of inspiration is just a click away
        </h1>
        <p className="text-lg text-[#1f1f1f] mb-6 text-center">
          Type your mood, get your match
        </p>
        
        <div className="mb-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your art prompt here..."
            className="w-full p-3 text-lg border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full p-3 text-lg text-white rounded-md mb-4 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          style={{background: 'linear-gradient(to right, #B06AB3, #4568DC)'}}
        >
          {loading ? 'Generating...' : 'Create a Picture'}
        </button>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRefresh}
            className="px-6 py-2 text-[#1f1f1f] bg-white border border-gray-300 rounded-md transition duration-300 ease-in-out hover:bg-gray-100"
          >
            Refresh
          </button>
          <button
            onClick={() => handleDownload(images[0]?.url)}
            disabled={images.length === 0}
            className="px-6 py-2 text-[#1f1f1f] bg-white border border-gray-300 rounded-md transition duration-300 ease-in-out hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download
          </button>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md">
        {images.map((img, index) => (
          <div key={index} className="mb-6">
            <img src={img.url} alt={img.description} className="w-full h-auto rounded-md shadow-md" />
            <p className="mt-2 text-gray-600">{img.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGenerator;