from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

# configure API key 
genai.configure(api_key=os.environ["API_KEY"])

# home route
@app.route('/')
def home():
    return "Flask server is running!"

# generates prompt keywords
def generate_prompt():
    data = request.json
    prompt = data.get('prompt')

    # create GenerativeModel object 
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    # generate keywords/content based on prompt
    response = model.generate_content(f"Generate keywords for an art prompt: {prompt}")
    
    # Extract generated text from response
    generated_keywords = response.text.strip()

    # [Unsplash API integration here]
    return jsonify({"keywords": generated_keywords, "images": []})

if __name__ == '__main__':
    app.run(port=5000)
