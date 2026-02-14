from sklearn.model_selection import GridSearchCV
import pandas as pd
import re
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split


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
                    3,
                ),  # only use unigrams and bigrams, which are often more informative for text classification tasks than all possible combinations of words
                max_features=3000,  # reduce the vocabulary size, which can increase accuracy because it reduces noise from less informative words
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


param_grid = {
    'tfidf__max_features': [3000, 5000, 10000],
    'tfidf__ngram_range': [(1,1), (1,2), (1,3)],
    'clf__C': [0.01, 0.1, 1.0, 10.0],
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='f1_macro')
grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best F1 score: {grid_search.best_score_:.2%}")