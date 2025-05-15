# 🧠 AI Journaling App – Cognitive Distortion Analyzer

This is a journaling web app that helps users become more aware of their negative thinking patterns. It uses a **fine-tuned Cohere Classify model** to detect **cognitive distortions** like Overgeneralization, Mind Reading, and All-or-Nothing Thinking.

Built with [Next.js 13+ (App Router)](https://nextjs.org/) and Cohere's V2 API.

---

## ✨ Features

- 📝 Type or paste in a journal entry
- ✂️ Automatically splits your entry into individual sentences
- 🧠 Detects the **most likely cognitive distortion** per sentence
- 📊 Shows top predictions + confidence scores
- ⚡ Real-time results powered by a fine-tuned [Cohere](https://cohere.com) model

---

## 🚀 Getting Started

### 1. Clone this repo
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

**### 2.  Install dependencies**
```bash
npm install

**### 3. Set up your .env.local**
Create a .env.local file in the root with your Cohere API key:
```bash
COHERE_API_KEY=your-cohere-api-key

You can get your key at dashboard.cohere.com

---
**## 🧠 Model Info**

This app uses a fine-tuned Cohere Classify model, trained on 40+ examples across 9 cognitive distortions:

- All-or-Nothing Thinking

- Overgeneralization

- Emotional Reasoning

- Labeling

- Should Statements

- Mind Reading

- Disqualifying the Positive

- Mental Filtering

- Jumping to Conclusions

The model returns one prediction per sentence alongside a confidence score for the prediction.

---
**## 🛣️ Next Steps (Ideas)**
- 📚 Show definitions + CBT-style reframes per distortion

- 💾 Save journal entries to localStorage or Supabase

- 🔒 Add authentication (Auth.js or Firebase)

- 📈 Track progress over time with entry history

---

## 🧠 Why This Matters
Cognitive distortions are automatic, negative thought patterns that reinforce anxiety, depression, and self-doubt. This tool helps you catch those thoughts in real time — and eventually reframe them.
