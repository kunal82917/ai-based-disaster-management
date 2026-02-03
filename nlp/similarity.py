from sklearn.metrics.pairwise import cosine_similarity
import joblib
from preprocess import clean_text

vectorizer = joblib.load("../models/vectorizer.pkl")

def similarity_score(text1, text2):
    t1 = vectorizer.transform([clean_text(text1)])
    t2 = vectorizer.transform([clean_text(text2)])
    return cosine_similarity(t1, t2)[0][0]
