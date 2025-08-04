// This would typically be a backend API endpoint
// For demo purposes, we'll simulate the API call

export async function cloneWebsite(url) {
  const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a";
  
  try {
    const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article"],
        excludeTags: ["script", "style", "meta", "link"]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    let htmlContent = null;
    if (data && data.data) {
      if (data.data.html) {
        htmlContent = data.data.html;
      } else if (data.data.content) {
        // Convert markdown content to basic HTML structure
        const content = data.data.content;
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Homepage</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { color: #333; }
      p { line-height: 1.6; }
      a { color: #0066cc; }
    </style>
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
      return {
        success: true,
        url: url,
        size: `${(htmlContent.length / 1024).toFixed(2)} KB`,
        status: "Successfully cloned",
        previewHtml: htmlContent,
        html: htmlContent
      };
    } else {
      throw new Error("No HTML content received from Firecrawl API");
    }

  } catch (error) {
    console.error("Clone error:", error);
    throw new Error(`Failed to clone website: ${error.message}`);
  }
}