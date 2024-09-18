import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faDownload, faCheck } from '@fortawesome/free-solid-svg-icons';
import JSZip from 'jszip';
import './App.css';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleGenerate = async () => {
    if (prompt.trim()) {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const text = await response.text(); // Get the raw text of the response
        console.log("Raw response:", text); // Log the raw response
  
        try {
          const data = JSON.parse(text); // Try to parse the response as JSON
          setImages(data.images);
          console.log("Generated Keywords:", data.keywords);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          throw new Error("The server response was not valid JSON");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
        setShowCheckboxes(false);
        setSelectedImages([]);
      }
    }
  };

  const toggleImageSelection = (index) => {
    setSelectedImages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.length === 0) return;

    if (selectedImages.length === 1) {
      handleDownload(images[selectedImages[0]].url);
    } else {
      const zip = new JSZip();
      
      for (let i = 0; i < selectedImages.length; i++) {
        const imageIndex = selectedImages[i];
        const response = await fetch(images[imageIndex].url);
        const blob = await response.blob();
        zip.file(`image${i + 1}.png`, blob);
      }
      
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownload = async (url) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  const toggleCheckboxes = () => {
    setShowCheckboxes(!showCheckboxes);
    if (showCheckboxes) {
      setSelectedImages([]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans p-6 flex flex-col items-center">
      <div className="w-full flex justify-center mb-3">
        <h1 className="text-4xl font-bold text-[#1f1f1f] mb-2 text-center whitespace-nowrap">
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
          className="w-full p-3 text-lg text-white rounded-md mb-4 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-blue-500"
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
            onClick={toggleCheckboxes}
            disabled={images.length === 0}
            className={`px-4 py-2 text-[#1f1f1f] bg-white border border-gray-300 rounded-md transition duration-300 ease-in-out hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${showCheckboxes ? 'bg-gray-200' : ''}`}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {showCheckboxes ? 'Cancel Download' : 'Download Image(s)'}
          </button>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md mb-20">
        {images.map((img, index) => (
          <div key={index} className="mb-6 relative">
            {showCheckboxes && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(index)}
                  onChange={() => toggleImageSelection(index)}
                  className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            )}
            <img src={img.url} alt={img.description} className="w-full h-auto rounded-md shadow-md" />
            <p className="mt-2 text-gray-600">{img.description}</p>
          </div>
        ))}
      </div>

      {showCheckboxes && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleDownloadSelected}
            disabled={selectedImages.length === 0}
            className="px-6 py-3 text-white bg-[#666ff2] rounded-md transition duration-300 ease-in-out hover:bg-[#5158c2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            Download Selected ({selectedImages.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;