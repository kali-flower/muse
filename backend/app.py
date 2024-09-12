from flask import Flask, request, jsonify
from flask_cors import CORS 
import google.generativeai as genai
import os
from dotenv import load_dotenv
import requests

# load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# configure API key 
genai.configure(api_key=os.environ["API_KEY"])

UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")

# home route
@app.route('/')
def home():
    return "Flask server is running!"

# generates prompt keywords and fetches Unsplash images
@app.route('/generate', methods=['POST'])
def generate_prompt():
    data = request.json
    user_prompt = data.get('prompt')

    model = genai.GenerativeModel("gemini-1.5-flash")
    
    try:
        # instructions for Gemini
        gemini_prompt = f"""
        Generate 3-5 specific, visual keywords related to '{user_prompt}'.
        Focus on describing visual elements, colors, or scenes directly related to the prompt.
        Aim for concrete, imageable concepts that would make good search terms for pictures.
        Separate keywords with commas.
        """
        
        response = model.generate_content(gemini_prompt)
        generated_keywords = response.text.strip()
        
        # process keywords
        keywords_list = [kw.strip() for kw in generated_keywords.split(',')]
        
        # combine user input with generated keywords
        search_query = f"{user_prompt} {' '.join(keywords_list)}"
        
        unsplash_images = search_unsplash_images(search_query)
        
        return jsonify({"keywords": generated_keywords, "images": unsplash_images})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def search_unsplash_images(keywords):
    url = "https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": keywords,
        "per_page": 5,
        "orientation": "landscape"  # optional (for more consistent results lol)
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        images = [{"url": img['urls']['regular'], "description": img['alt_description'] or "No description available"}
                  for img in data['results']]
        
        return images
    except requests.RequestException as e:
        print(f"Unsplash API error: {e}")
        return []

if __name__ == '__main__':
    app.run(port=5000)
