import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import re
import numpy as np
from database import (
    get_training_feedback,
    mark_used_feedback,
    save_model_version,
    get_latest_version,
)

# Load Kaggle dataset
kaggle_df = pd.read_csv("cognitive_distortion_dataset.csv")

# Drop empty rows and any without a dominant distortion label
kaggle_df = kaggle_df.dropna(subset=["Patient Question", "Dominant Distortion"])

# load augmented data (AI-genereated)
augmented_df = pd.read_csv("augmented_data.csv")




# Split into no distortion vs distortion
no_distortion = kaggle_df[kaggle_df["Dominant Distortion"]== "No Distortion"]
has_distortion = kaggle_df[kaggle_df["Dominant Distortion"] != "No Distortion"]

# for distortion rows, just grab the distorted sentence
has_distortion_clean = has_distortion[["Distorted part", "Dominant Distortion"]]
has_distortion_clean.columns = ["text", "label"]

# for no distortion, split each paragraph into sentences
no_distortion_sentences = []
for _, row in no_distortion.iterrows():
    sentences = re.split(r'(?<=[.!?])\s+', row["Patient Question"].strip())
    for sentence in sentences:
        if sentence.strip():
            no_distortion_sentences.append({"text": sentence.strip(), "label": "No Distortion"})

no_distortion_clean = pd.DataFrame(no_distortion_sentences)
# Downsample "No Distortion" to ~400 to mitigate class imbalance
no_distortion_downsampled = no_distortion_clean.sample(n=400, random_state=42)

# Store this downsample + rest of data in the primary df
kaggle_clean_df = pd.concat([has_distortion_clean, no_distortion_downsampled])

# combine with augmented data
df = pd.concat([kaggle_clean_df, augmented_df])

# Load user feedback
feedback_data = get_training_feedback()
if len(feedback_data) > 0:
    feedback_df = pd.DataFrame(
        feedback_data, columns=["text", "label"]
    )
    df = pd.concat([df, feedback_df])


# Prepare features and labels
X = df["text"]
y = df["label"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Build pipeline for ML: TF-IDF + Logistic Regression Model
pipeline = Pipeline(
    [
        # first step in the pipeline is creating feature vectors using TF-IDF
        (
            "tfidf",
            TfidfVectorizer(
                stop_words="english",
                ngram_range=(
                    1,
                    2,
                ),  # only use unigrams and bigrams, which are often more informative for text classification tasks than all possible combinations of words
                max_features=5000,  # reduce the vocabulary size, which can increase accuracy because it reduces noise from less informative words
                min_df=2,  # skip terms that appear in less than 2 documents, since they are too rare to be useful
                max_df=0.8,  # skip terms that appear in more than 80% of documents, since they aren't indicative of specific distortion types
            ),
        ),
        # second step in the pipeline is feeding the vectors to a Logistic Regression classifier
        # so that we can get probability estimates on the test data
        # we are also using class_weight='balanced' to handle any class imbalance, which occurs when classes (types of distortions) are not equally represented in the dataset
        # this imbalance is problematic because the model may become biased towards the majority class (No Distortion in this case) and perform poorly on minority classes
        # we are also setting max_iter to 1000 to ensure convergence, which means the model has enough iterations to find the optimal solution
        # we are also using regularization, which reduces weights on specific words that aren't indicative of a particular distortion type
        # lastly, we are using the lbfgs sovler to find the optimal weights for the LR model
        (
            "clf",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                C=1.0,  # Regularization strength
                solver="lbfgs",  # Better solver for multiclass
            ),
        ),
    ]
)

# fit the model to the training data
pipeline.fit(X_train, y_train)

# run the prediction method from the pipeline/LR model on the test data
y_pred = pipeline.predict(X_test)


# using the accuracy method, compute the overall accuracy of the model on the test data
accuracy = accuracy_score(y_test, y_pred)
print(f"\nOverall Accuracy: {accuracy:.2%}")

# print out some metrics about the training and test sets
print(f"\nTraining set size: {len(y_train)}")
print(f"Test set size: {len(y_test)}")
print(f"\nClass distribution in test set:")
print(y_test.value_counts().sort_index())

# using the classification report method from sklearn, print out a detailed classification report, which
# contains info such as precision, recall, and F1-score for each class
print("Classification Report:")

print(classification_report(y_test, y_pred))

# save the model to a file and essentially cache it for later use in the Flask API
# this reduces latency for the end user since we don't have to retrain the model on every request / text that the user enters
joblib.dump(pipeline, "distortion_model.pkl")

try:
    if len(feedback_data) > 0:
        mark_used_feedback()
except Exception as e:
    print(f"Error with marking feedback as used in the database: {e}")

try:
    new_version = get_latest_version() + 1
    save_model_version(
        new_version,
        len(X_train),
        accuracy,
        f"Trained with {len(feedback_data)} new feedback samples",
    )
except Exception as e:
    print(f"Error with saving model: {e}")

print("Model successfully saved!")
