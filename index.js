const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the URL
  await page.goto('https://news.ycombinator.com/newest');
  
  // Extract timestamps from the first 100 articles
  const timestamps = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('.itemlist .athing'));
    return articles.slice(0, 100).map(article => {
      const timeElement = article.querySelector('.age a');
      return timeElement ? timeElement.innerText : null;
    }).filter(time => time !== null);
  });

  // Function to convert timestamp string to Date object
  function parseTimestamp(timestamp) {
    const units = {
      'minute': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000,
      'year': 365 * 24 * 60 * 60 * 1000,
    };

    const [value, unit] = timestamp.split(' ');
    const now = new Date();

    return new Date(now - parseInt(value) * units[unit.replace(/s$/, '')]);
  }

  // Convert timestamps to Date objects
  const dateObjects = timestamps.map(parseTimestamp);

  // Check if the dates are sorted from newest to oldest
  const isSorted = dateObjects.every((date, i, arr) => !i || date <= arr[i - 1]);

  console.log(`The articles are sorted from newest to oldest: ${isSorted}`);
  
  // Close browser
  await browser.close();
})();
