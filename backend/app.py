from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import traceback
import re
from database import save_feedback, init_db
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os


app = Flask(__name__)
CORS(app, origins=["https://journal-ai-zeta.vercel.app","http://localhost:3000"])  # Enable CORS for frontend requests

# creating a limiter object to reduce the amount of requests made to our API routes
limiter = Limiter(get_remote_address, app=app)

# preventing content over 16kb
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024

# initalize db on startup of the backend
init_db()

# get API key for cross checking with frontend requests
API_KEY = os.environ.get("API_KEY")

# Load the trained model
model = joblib.load("distortion_model.pkl")

# route to call the model and predict CD's for each sentence
@app.route("/predict", methods=["POST"])
@limiter.limit("20 per minute")
def predict():
    try:
        data = request.get_json()
        input_text = data.get("text", "")

        if not input_text:
            return jsonify({"error": "Missing input text"}), 400
        elif len(input_text.strip()) > 5000:
            return jsonify({"error": "Text is too long, please enter a shorter message" }), 400

        # Split text into sentences (same logic as frontend expects)
        sentences = re.split(r'(?<=[.!?])\s+', input_text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]

        # Make predictions for each sentence
        results = []
        for sentence in sentences:
            prediction = model.predict([sentence])[0]
            probs = model.predict_proba([sentence])[0]

            # Get confidence for the predicted class
            class_index = list(model.classes_).index(prediction)
            confidence = float(probs[class_index])

            results.append({
                "input": sentence,
                "prediction": prediction,
                "confidence": round(confidence, 3)
            })

        return jsonify({"results": results})

    except Exception as e:
        return (jsonify({"error": str(e)}), 500)

# route to post feedback to our SQL db
@app.route("/feedback", methods=["POST"])
@limiter.limit("10 per minute")
def feedback():
    try:
        request_key = request.headers.get("X-API-Key")
        if request_key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json()
        if len(data.get("text", "").strip()) > 500:
            return jsonify({"error": "Sentence is too long for feedback"}), 400
        feedback_id = save_feedback(
            text=data.get("text"),
            predicted_distortion=data.get("predicted_distortion"),
            user_correction=data.get("user_correction"),
            is_accepted=data.get("is_accepted"),
            confidence=data.get("confidence")
        )
    except Exception as e:
        return (jsonify({"error": str(e)}), 500)
        


    return (jsonify({"feedback_id": feedback_id}))

if __name__ == "__main__":
    app.run(debug=True, port=5001)
