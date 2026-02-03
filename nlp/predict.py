import joblib
from preprocess import clean_text

model = joblib.load("../models/hazard_model.pkl")
vectorizer = joblib.load("../models/vectorizer.pkl")

labels = {
    0: "Oil Spill",
    1: "High Waves",
    2: "Cyclone",
    3: "Marine Life Death",
    4: "Pollution",
    5: "Ship Accident"
}

def predict_hazard(text):
    text = clean_text(text)
    vector = vectorizer.transform([text])
    prediction = model.predict(vector)[0]
    confidence = max(model.predict_proba(vector)[0])
    return labels[prediction], confidence
