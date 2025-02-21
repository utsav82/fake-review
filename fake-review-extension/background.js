// Import your model API call or use the fetch-based function.
function predictReview(reviewText) {
  return fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review: reviewText, rating: 5, verified_purchase: 1 })
  })
  .then(response => response.json())
  .then(data => {
    return data.fake_probability; // This should be a number
  })
  .catch(error => {
    console.error('Error:', error);
    return Math.random(); // fallback dummy value if API fails
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeReviews" && request.reviews) {
    // Map over reviews and create an array of promises.
    Promise.all(request.reviews.map(review => {
      return predictReview(review).then(fakeProbability => {
        return { review, fakeProbability };
      });
    })).then(results => {
      // Send results to the content script for display.
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: "displayResults", results: results });
      }
      sendResponse({ results: results });
    }).catch(error => {
      console.error("Error analyzing reviews:", error);
      sendResponse({ results: [] });
    });
    // Return true to indicate the response is asynchronous.
    return true;
  }
});
