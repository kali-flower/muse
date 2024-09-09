import React, { useState } from 'react';

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
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-center p-6">
      <h1 className="text-4xl font-bold text-[#1f1f1f] mt-8 mb-4">
        Your next stroke of inspiration is just a click away
      </h1>
      <p className="text-xl text-[#1f1f1f] mb-6">
        Type your mood, get your match
      </p>
      
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your art prompt here..."
          className="w-full p-3 text-lg border border-gray-300 rounded-md mb-4"
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full p-3 text-lg text-white rounded-md mb-4 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{background: 'linear-gradient(to right, #B06AB3, #4568DC)'}}
        >
          {loading ? 'Generating...' : 'Create a Picture'}
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {images.map((img, index) => (
          <div key={index} className="max-w-sm mx-auto">
            <img src={img.url} alt={img.description} className="w-full h-auto rounded-md shadow-md" />
            <p className="mt-2 text-gray-600">{img.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={handleRefresh}
          className="px-6 py-2 text-[#1f1f1f] bg-[#f7f7f7] border border-[#f1f1f1] rounded-md transition duration-300 ease-in-out hover:bg-[#f1f1f1]"
        >
          Refresh
        </button>
        <button
          onClick={() => handleDownload(images[0]?.url)}
          disabled={images.length === 0}
          className="px-6 py-2 text-[#1f1f1f] bg-[#f7f7f7] border border-[#f1f1f1] rounded-md transition duration-300 ease-in-out hover:bg-[#f1f1f1] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ImageGenerator;
