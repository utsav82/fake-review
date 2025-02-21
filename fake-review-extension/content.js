// Function to scrape all reviews on the page.
function scrapeReviews() {
    const reviews = [];
    // Select all containers with data-hook "review-body"
    const reviewContainers = document.querySelectorAll('span[data-hook="review-body"]');
    console.log("Found", reviewContainers.length, "review container(s).");
    
    reviewContainers.forEach(container => {
      let reviewText = "";
      // Check if there's a nested <span>
      const nestedSpan = container.querySelector('span');
      if (nestedSpan) {
        reviewText = nestedSpan.innerText.trim();
      } else {
        reviewText = container.innerText.trim();
      }
      if (reviewText) {
        reviews.push(reviewText);
      }
    });
    console.log("Scraped reviews:", reviews);
    return reviews;
  }
  
  // Optional: wait a bit before scraping in case the page loads reviews dynamically.
  function delayedScrapeReviews(callback, delay = 2000) {
    setTimeout(() => {
      const reviews = scrapeReviews();
      callback(reviews);
    }, delay);
  }
  
  // Listen for messages from popup or background scripts.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeReviews") {
      // Using a delay to help ensure reviews are loaded.
      delayedScrapeReviews((reviews) => {
        sendResponse({ reviews: reviews });
      });
      // Return true to indicate that we'll send a response asynchronously.
      return true;
    } else if (request.action === "displayResults") {
      displayResults(request.results);
    }
  });
  
  // Function to display the analysis results as an overlay on the page.
  function displayResults(results) {
    // Create an overlay container.
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.backgroundColor = 'white';
    overlay.style.border = '1px solid #ccc';
    overlay.style.padding = '10px';
    overlay.style.zIndex = '9999';
    overlay.style.maxHeight = '90%';
    overlay.style.overflowY = 'auto';
  
    const title = document.createElement('h3');
    title.innerText = 'Fake Review Analysis';
    overlay.appendChild(title);
  
    results.forEach(result => {
      const reviewDiv = document.createElement('div');
      reviewDiv.style.marginBottom = '10px';
      // Display the fake probability as a percentage.
      reviewDiv.innerHTML = `<strong>Fake Probability:</strong> ${(result.fakeProbability * 100).toFixed(2)}%<br/><em>${result.review}</em>`;
      overlay.appendChild(reviewDiv);
    });
  
    // Append the overlay to the page.
    document.body.appendChild(overlay);
  }
  