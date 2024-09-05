from flask import Flask, request, jsonify
import google.generativeai as genai
import os
import requests

app = Flask(__name__)

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
    prompt = data.get('prompt')

    # create GenerativeModel object 
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    # generate keywords/content based on prompt
    response = model.generate_content(f"Generate keywords for an art prompt: {prompt}")
    
    # extract generated text from response
    generated_keywords = response.text.strip()
    
    # call Unsplash API to search for images
    unsplash_images = search_unsplash_images(generated_keywords)

    return jsonify({"keywords": generated_keywords, "images": unsplash_images})

def search_unsplash_images(keywords):
    url = f"https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": keywords,
        "per_page": 5  # number of images to return
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        images = []
        
        # extract image URLs from response
        for image in data['results']:
            images.append({
                "url": image['urls']['regular'],
                "description": image['alt_description'] or "No description available"
            })
        
        return images
    else:
        return []

if __name__ == '__main__':
    app.run(port=5000)
