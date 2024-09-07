import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState("");  // for user input
  const [images, setImages] = useState([]);  // for storing generated images
  const [loading, setLoading] = useState(false);  // loading state for API call

  // function to handle prompt generation
  const handleGenerate = () => {
    if (prompt.trim()) {
      setLoading(true);
      fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      })
      .then(response => response.json())
      .then(data => {
        setImages(data.images);  // data.images returns image URL
        setLoading(false);
      })
      .catch(error => {
        console.error("Error:", error);
        setLoading(false);
      });
    }
  };

  // refresh images with the same prompt
  const handleRefresh = () => {
    handleGenerate();  // re-calls generate function
  };

  // function to download images
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'image.jpg';
    link.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Your next stroke of inspiration is just a click away</h1> {/* header text */}
        <p className="sub-header">Type your mood, get your match</p> {/* subheader text */}
        
        {/* text input box */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your art prompt here..."
        />
        
        {/* generate image button */}
        <button onClick={handleGenerate}>Create a Picture</button>
        
        {/* image display section */}
        <div className="images-section">
          {loading ? (
            <p>Generating images...</p>
          ) : (
            images.map((img, index) => (
              <div key={index}>
                <img src={img.url} alt={img.description} />
                <p>{img.description}</p>
                <button onClick={() => handleDownload(img.url)}>Download</button>
              </div>
            ))
          )}
        </div>

        {/* refresh/download buttons */}
        <button onClick={handleRefresh}>Refresh</button>
      </header>
    </div>
  );
}

export default App;