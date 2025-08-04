// clone-homepage.js
// This script uses Firecrawl API to fetch the static visual HTML of any URL

const axios = require("axios");
const fs = require("fs");

const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a"; // Your Firecrawl API key
const targetUrl = "https://example.com"; // Replace with the URL you want to clone

async function fetchHomepageClone(url) {
  try {
    console.log(`🔄 Fetching homepage from: ${url}`);
    
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article"],
        excludeTags: ["script", "style", "meta", "link"]
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Handle both html and content formats from Firecrawl
    let htmlContent = null;
    if (response.data && response.data.data) {
      if (response.data.data.html) {
        htmlContent = response.data.data.html;
      } else if (response.data.data.content) {
        // Convert markdown content to basic HTML structure
        const content = response.data.data.content;
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Homepage</title>
</head>
<body>
    <div class="content">
        ${content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}
    </div>
</body>
</html>`;
      }
    }

    if (htmlContent) {
      fs.writeFileSync("homepage-clone.html", htmlContent);
      console.log("✅ homepage-clone.html saved successfully");
      console.log(`📄 File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);
    } else {
      console.error("❌ No HTML content received from Firecrawl API");
      console.log("Response structure:", JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error("❌ Failed to clone homepage:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error("🔑 Check your Firecrawl API key");
    }
  }
}

// Allow command line argument for URL
const urlArg = process.argv[2];
const finalUrl = urlArg || targetUrl;

fetchHomepageClone(finalUrl);