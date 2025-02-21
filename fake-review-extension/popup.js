document.getElementById('analyzeBtn').addEventListener('click', () => {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = "<p>Analyzing reviews, please wait...</p>";
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeReviews" }, (response) => {
      if (response && response.reviews && response.reviews.length > 0) {
        chrome.runtime.sendMessage({ action: "analyzeReviews", reviews: response.reviews }, (result) => {
          if (result && result.results) {
            let html = "<ul>";
            result.results.forEach(r => {
              html += `<li>
                <strong>Fake Probability:</strong> ${(r.fakeProbability * 100).toFixed(2)}%<br/>
                <em>${r.review}</em>
              </li>`;
            });
            html += "</ul>";
            resultsContainer.innerHTML = html;
          } else {
            resultsContainer.innerHTML = "<p>No analysis results returned.</p>";
          }
        });
      } else {
        resultsContainer.innerHTML = "<p>No reviews found on this page.</p>";
      }
    });
  });
});
