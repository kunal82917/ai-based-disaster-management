import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

from preprocess import clean_text

# Load data
data = pd.read_csv("../data/hazard_texts.csv")
data["text"] = data["text"].apply(clean_text)

# Vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(data["text"])
y = data["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Save model & vectorizer
joblib.dump(model, "../models/hazard_model.pkl")
joblib.dump(vectorizer, "../models/vectorizer.pkl")

print("Model trained and saved successfully")
