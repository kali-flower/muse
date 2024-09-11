import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faDownload } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const ImageGenerator = () => {
  // state variables for managing prompt/generated images/loading state 
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // function to generate images based on user prompt
  const handleGenerate = async () => {
    if (prompt.trim()) { // only generate if prompt isn't empty 
      setLoading(true);
      try {
        // API request to backend to generate images 
        const response = await fetch("http://localhost:5000/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }), // send prompt to backend
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json(); // parse JSON response 
        setImages(data.images); // set images from the response
        // log the generated keywords
        console.log("Generated Keywords:", data.keywords);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false); // turn off loading state after request is finished 
      }
    }
  };
  
  // refresh images by re-calling generate function 
  const handleRefresh = () => {
    handleGenerate();
  };

  // function to download images
  const handleDownload = (url) => {
    if (!url) return;

    const link = document.createElement('a'); // create anchor element
    link.href = url; // set the image URL as href
    link.download = 'image.jpg'; // set filename
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); // remove link after download
  };


  // styling with Tailwind CSS
  return (
    <div className="min-h-screen bg-white font-sans p-6 flex flex-col items-center">
      <div className="w-full flex justify-center mb-3">
        <h1 
          className="text-4xl font-bold text-[#1f1f1f] mb-2 text-center"
          style={{ whiteSpace: 'nowrap' }} 
        >
          Your next stroke of inspiration is just a click away!
        </h1>
      </div>

      <p className="text-lg text-[#1f1f1f] text-center mb-6">
        Type in a prompt to instantly receive a curated image from Unsplash. 
      </p>

      <div className="w-full max-w-md">
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
          style={{ background: 'linear-gradient(to right, #B06AB3, #4568DC)' }}
        >
          {loading ? 'Generating...' : 'Create a Picture'}
        </button>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-[#1f1f1f] bg-white border border-gray-300 rounded-md transition duration-300 ease-in-out hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faRedo} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => handleDownload(images[0]?.url)}
            disabled={images.length === 0}
            className="px-4 py-2 text-[#1f1f1f] bg-white border border-gray-300 rounded-md transition duration-300 ease-in-out hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
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
