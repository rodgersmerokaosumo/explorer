from flask import Flask, request, jsonify
import os
from openai import OpenAI
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can talk to backend

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    try:
        print("[USER]:", user_message)

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are Explorer, an intelligent and eco-conscious travel assistant. Help the user find beautiful, safe, and unique travel experiences. When asked about places like restaurants or hotels, give specific names and locations and coordinates if possible."},
                {"role": "user", "content": user_message}
            ]
        )

        reply = response.choices[0].message.content.strip()
        print("[REPLY]:", reply)

        # Mock POIs for restaurant queries (same as your original logic)
        places = []
        if "restaurant" in user_message.lower() or "eat" in user_message.lower():
            places = [
                { "name": "Carnivore Restaurant", "lat": -1.3191, "lon": 36.8155 },
                { "name": "Talisman Restaurant", "lat": -1.3377, "lon": 36.7113 },
                { "name": "Nyama Mama", "lat": -1.2854, "lon": 36.8190 },
                { "name": "J's Fresh Bar and Kitchen", "lat": -1.2985, "lon": 36.7794 },
                { "name": "88 Restaurant", "lat": -1.2706, "lon": 36.8128 }
            ]

        return jsonify({ "reply": reply, "places": places })

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": "Something went wrong with the AI backend."}), 500

@app.route("/", methods=["GET"])
def index():
    return "Explorer AI backend is live."

# This is what Vercel looks for - the WSGI application
handler = app