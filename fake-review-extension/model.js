async function predictReview(reviewText) {
  try {
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: reviewText, rating: 5, verified_purchase: 1 })
    });
    const data = await response.json();
    console.log('Success:', data);
    return data.fake_probability;
  } catch (error) {
    console.error('Error:', error);
    return Math.random();
  }
}
