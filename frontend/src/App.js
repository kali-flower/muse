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
}

export default App;
