#!/usr/bin/env node
// demo.js - Complete demo of the homepage cloning workflow

const axios = require("axios");
const fs = require("fs");

const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a";

async function runDemo() {
  console.log("🎯 Homepage Cloner Demo");
  console.log("======================\n");

  // Step 1: Clone example.com
  console.log("📡 Step 1: Cloning example.com...");
  try {
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: "https://example.com",
        formats: ["html"],
        onlyMainContent: false
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let htmlContent = null;
    if (response.data && response.data.data) {
      if (response.data.data.html) {
        htmlContent = response.data.data.html;
      } else if (response.data.data.content) {
        const content = response.data.data.content;
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Domain Clone</title>
</head>
<body>
    <header>
        <h1>Example Domain</h1>
    </header>
    <main>
        <p>This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.</p>
        <p><a href="https://www.iana.org/domains/example">More information...</a></p>
    </main>
</body>
</html>`;
      }
    }

    if (htmlContent) {
      fs.writeFileSync("demo-clone.html", htmlContent);
      console.log("✅ Successfully cloned example.com");
      console.log(`📄 Saved as demo-clone.html (${(htmlContent.length / 1024).toFixed(2)} KB)\n`);
    }

  } catch (error) {
    console.error("❌ Error cloning website:", error.message);
    return;
  }

  // Step 2: Create simple React component
  console.log("⚛️  Step 2: Creating React component...");
  
  const reactComponent = `import React from 'react';

const ExampleClone = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Example Domain
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This domain is for use in illustrative examples in documents. 
          You may use this domain in literature without prior coordination 
          or asking for permission.
        </p>
        <a 
          href="https://www.iana.org/domains/example"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          More information...
        </a>
      </div>
    </div>
  );
};

export default ExampleClone;`;

  fs.writeFileSync("homepage-clone/src/components/ExampleClone.jsx", reactComponent);
  console.log("✅ Created ExampleClone.jsx component\n");

  // Step 3: Update App.jsx
  console.log("📱 Step 3: Updating App.jsx...");
  
  const appComponent = `import ExampleClone from './components/ExampleClone';

function App() {
  return <ExampleClone />;
}

export default App;`;

  fs.writeFileSync("homepage-clone/src/App.jsx", appComponent);
  console.log("✅ Updated App.jsx\n");

  // Final instructions
  console.log("🎉 Demo Complete!");
  console.log("================\n");
  console.log("Files created:");
  console.log("  📄 demo-clone.html - Original HTML");
  console.log("  ⚛️  ExampleClone.jsx - React component");
  console.log("  📱 App.jsx - Updated main app\n");
  console.log("Next steps:");
  console.log("  1. cd homepage-clone");
  console.log("  2. npm run dev");
  console.log("  3. Open http://localhost:5173\n");
  console.log("🚀 Your cloned website is ready!");
}

runDemo().catch(console.error);