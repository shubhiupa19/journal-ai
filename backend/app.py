from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import traceback
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load the trained model
model = joblib.load("distortion_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        input_text = data.get("text", "")

        if not input_text:
            return jsonify({"error": "Missing input text"}), 400

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
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
