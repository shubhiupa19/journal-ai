# AI Journaling App – Cognitive Distortion Analyzer

This is a journaling web app that helps users become more aware of their negative thinking patterns. It uses a **machine learning model** to detect **cognitive distortions** like Overgeneralization, Mind Reading, and All-or-Nothing Thinking.

Built with [Next.js 13+ (App Router)](https://nextjs.org/) frontend and a Flask backend powered by scikit-learn.

---

## Features

- Type or paste in a journal entry
- Automatically splits your entry into individual sentences
- Detects the **most likely cognitive distortion** per sentence
- Shows predictions with confidence scores
- Color-coded highlighting for each distortion type
- Hover over highlighted text to see distortion definitions
- Real-time predictions using a locally-trained ML model

---

## Getting Started

### 1. Clone this repo
```bash
git clone https://github.com/shubhiupa19/journal-ai.git
cd journal-ai
```

### 2. Install Python dependencies
```bash
cd backend
pip install flask flask-cors scikit-learn pandas joblib
```

### 3. Train the model
```bash
cd backend
python train_model.py
```
This will train a Logistic Regression classifier on the cognitive distortion dataset and save it as `distortion_model.pkl`.

### 4. Start the Flask backend
```bash
cd backend
python app.py
```
The API will run on `http://127.0.0.1:5000`

### 5. Install frontend dependencies
```bash
# In a new terminal, from the project root
npm install
```

### 6. Run the Next.js frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---
## Model Info

This app uses a **scikit-learn Pipeline** with:
- **TF-IDF Vectorization** (unigrams + bigrams, 5000 max features)
- **Logistic Regression** classifier with balanced class weights

### Dataset
- **2,530 labeled examples** from the [Cognitive Distortion Detection Dataset on Kaggle](https://www.kaggle.com/datasets/sagarikashreevastava/cognitive-distortion-detetction-dataset)
- **11 classes** including 10 cognitive distortions + "No Distortion"
- 80/20 train-test split with stratification
- Dataset also includes therapist responses (not currently used but available for future improvements)

### Cognitive Distortions Detected

1. **All-or-Nothing Thinking** - Thinking in absolutes like "always," "never," or "every"
2. **Overgeneralization** - Drawing broad conclusions from single events
3. **Emotional Reasoning** - Believing feelings reflect reality
4. **Labeling** - Assigning negative labels to yourself or others
5. **Should Statements** - Rigid rules about how things "should" be
6. **Mind Reading** - Assuming you know what others are thinking
7. **Disqualifying the Positive** - Dismissing positive experiences
8. **Mental Filtering** - Focusing only on negatives
9. **Fortune-telling** - Predicting negative outcomes without evidence
10. **Personalization** - Taking responsibility for things outside your control
11. **No Distortion** - Healthy, balanced thinking

### Model Performance
- **Accuracy: ~34%** on the test set
- The model performs best on "No Distortion" (majority class)
- Performance is limited by class imbalance and dataset size
- Best used as a journaling aid rather than clinical diagnosis

The model analyzes each sentence independently and returns a prediction with a confidence score.

---
## Future AI Improvements

The original Kaggle dataset includes therapist responses and CBT-style reframes. Future versions could leverage this to:

1. ** Generate therapeutic reframes** - Fine-tune an LLM (GPT, Llama, Claude) on the patient-therapist pairs to provide personalized CBT responses
   - Example: "I always fail" → "You've succeeded at many things. Setbacks are part of learning and growth."

2. ** Multi-task learning** - Train a model to simultaneously classify distortions AND generate helpful reframes, improving both tasks

3. ** Improve classification accuracy** - Experiment with transformer models (BERT, RoBERTa) or collect more balanced training data to boost performance beyond 34%

---

## Why This Matters
Cognitive distortions are automatic, negative thought patterns that reinforce anxiety, depression, and self-doubt. This tool helps you catch those thoughts in real time — and eventually reframe them.

---

## Tech Stack

**Frontend Frameworks and Libraries:**
- Next.js 13+ (App Router)
- React
- Tailwind CSS
- react-highlight-words

**Backend Frameworks and Libraries:**
- Flask 
- scikit-learn 
- pandas 
- joblib 

---

## Note
Built as a personal learning project to explore ML classification with scikit-learn and Next.js. Runs locally with Flask backend + Next.js frontend.
