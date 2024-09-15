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
        # make more specific instructions for Gemini
        gemini_prompt = f"""
        Generate 5 specific, visual keywords directly related to '{user_prompt}'.
        Focus on describing:
        1. The main subject itself
        2. Its physical characteristics
        3. Its typical environment
        4. Related objects or concepts
        5. Actions or states associated with it

        Ensure all keywords are closely tied to the visual aspects of '{user_prompt}'.
        Separate keywords with commas.
        """
        
        response = model.generate_content(gemini_prompt)
        generated_keywords = response.text.strip()
        
        # process keywords
        keywords_list = [kw.strip() for kw in generated_keywords.split(',')]
        
        # construct search query using user prompt and top 3 keywords
        search_query = f"{user_prompt} {' '.join(keywords_list[:3])}"
        
        unsplash_images = search_unsplash_images(search_query, user_prompt)
        
        return jsonify({"keywords": generated_keywords, "images": unsplash_images})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def search_unsplash_images(keywords, original_prompt, fallback=False):
    url = "https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": keywords if not fallback else original_prompt,
        "per_page": 5,
        "orientation": "landscape"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        images = [{"url": img['urls']['regular'], "description": img['alt_description'] or "No description available"}
                  for img in data['results']]
        
        if not images and not fallback:
            # if no results, try again with just the original prompt
            return search_unsplash_images(keywords, original_prompt, fallback=True)
        
        return images
    except requests.RequestException as e:
        print(f"Unsplash API error: {e}")
        return []

if __name__ == '__main__':
    app.run(port=5000)