from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import traceback
import re
from database import save_feedback, init_db

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# initalize db on startup of the backend
init_db()

# Load the trained model
model = joblib.load("distortion_model.pkl")

# route to call the model and predict CD's for each sentence
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

# route to post feedback to our SQL db
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    feedback_id = save_feedback(
        text=data.get("text"),
        predicted_distortion=data.get("predicted_distortion"),
        user_correction=data.get("user_correction"),
        is_accepted=data.get("is_accepted"),
        confidence=data.get("confidence")
    )

    return jsonify("feedback row id: ", feedback_id)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
