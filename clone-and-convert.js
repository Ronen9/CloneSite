#!/usr/bin/env node
// clone-and-convert.js
// Automated script to clone a homepage and prepare it for React conversion

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a";

async function cloneAndPrepare(url) {
  console.log(`🚀 Starting homepage clone process for: ${url}`);
  
  try {
    // Step 1: Fetch HTML using Firecrawl
    console.log("📡 Fetching HTML content...");
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article", "main", "aside"],
        excludeTags: ["script", "style", "meta", "link"]
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.data && response.data.data.html) {
      const htmlContent = response.data.data.html;
      fs.writeFileSync("homepage-clone.html", htmlContent);
      console.log("✅ homepage-clone.html saved successfully");
      console.log(`📄 File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);
      
      // Step 2: Create conversion instructions
      const promptTemplate = fs.readFileSync("conversion-prompt.md", "utf8");
      const instructionsWithHtml = promptTemplate + "\n\n" + htmlContent;
      fs.writeFileSync("conversion-instructions.md", instructionsWithHtml);
      console.log("✅ conversion-instructions.md created with HTML content");
      
      console.log("\n🎯 Next Steps:");
      console.log("1. Open conversion-instructions.md");
      console.log("2. Copy the content and paste it into your AI assistant");
      console.log("3. The AI will generate React components for you");
      console.log("4. Replace the template components in homepage-clone/src/components/");
      console.log("5. Run 'npm run dev' in the homepage-clone directory to see your cloned site");
      
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

// Get URL from command line argument
const url = process.argv[2];
if (!url) {
  console.log("Usage: node clone-and-convert.js <URL>");
  console.log("Example: node clone-and-convert.js https://stripe.com");
  process.exit(1);
}

cloneAndPrepare(url);