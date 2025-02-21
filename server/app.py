from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS  # Import CORS
from scipy.sparse import csr_matrix, hstack

app = Flask(__name__)
CORS(app)  

# Load the saved TF-IDF vectorizer and logistic regression model
with open('tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)

with open('best_lr_model.pkl', 'rb') as f:
    best_lr = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    
    # Extract review text and optional additional features.
    review = data.get('review', '')
    # Optional: you can provide rating and verified_purchase, or use default values.
    rating = data.get('rating', 5)  # default rating value
    verified_purchase = data.get('verified_purchase', 1)  # default: 1 means verified

    if not review:
        return jsonify({'error': 'No review text provided'}), 400

    # Transform the review text using the pre-fitted TF-IDF vectorizer.
    X_text = tfidf.transform([review])
    additional_features = np.array([[rating, verified_purchase]])
    X_add = csr_matrix(additional_features)
    
    # Combine the text features with additional features.
    X_input = hstack([X_text, X_add])
    
    # Use the logistic regression model to predict the probability.
    # Assumes that class 1 represents "fake" (adjust accordingly if not)
    fake_probability = best_lr.predict_proba(X_input)[0][1]
    
    return jsonify({'fake_probability': fake_probability})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
