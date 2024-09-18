from flask import Flask, request, jsonify
from flask_cors import CORS 
import google.generativeai as genai
import os
import random
from dotenv import load_dotenv
import requests

# load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "*"}})

# # Configure CORS 
# ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', '*')
# CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGIN}})

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
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        user_prompt = data.get('prompt')
        if not user_prompt:
            return jsonify({"error": "No prompt provided"}), 400

        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # updated Gemini prompt
        gemini_prompt = f"""
        Analyze the phrase '{user_prompt}' and generate 5 specific, visual keywords.
        Focus on:
        1. The main subject or technique mentioned
        2. Visual characteristics or styles implied
        3. Specific elements or props that might be involved
        4. Potential settings or environments
        5. Mood or atmosphere suggested

        Ensure all keywords are directly relevant to creating visually striking images of '{user_prompt}'.
        Prioritize uncommon or specific terms over general ones.
        Separate keywords with commas.
        """

        # generate keywords using Gemini API
        response = model.generate_content(gemini_prompt)
        generated_keywords = response.text.strip()
        
        # process keywords into a list
        keywords_list = [kw.strip() for kw in generated_keywords.split(',')]

        # create search query for Unsplash using the user prompt and 4 keywords
        search_query = f"{user_prompt} {' '.join(keywords_list[:4])}"

        # fetch images from Unsplash using the generated search query
        unsplash_images = search_unsplash_images(search_query, user_prompt)
        
        return jsonify({"keywords": generated_keywords, "images": unsplash_images})

    except Exception as e:
        app.logger.error(f"Error in generate_prompt: {str(e)}")
        return jsonify({"error": str(e)}), 500


def search_unsplash_images(keywords, original_prompt, fallback=False):
    url = "https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": keywords if not fallback else original_prompt,
        "per_page": 10,  
        "orientation": "landscape",
        "order_by": "relevant" 
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
        
        # randomly select 5 images from the 10 fetched
        return random.sample(images, min(5, len(images)))
    except requests.RequestException as e:
        print(f"Unsplash API error: {e}")
        return []

if __name__ == '__main__':
    # use the environment variable PORT if available
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)