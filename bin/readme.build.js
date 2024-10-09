#!/usr/bin/env node

const fs = require("fs-extra");
const { marked } = require("marked"); // Updated import

// Define your dark CSS theme
const simpleTheme = `
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      background-color: #121212; /* Dark background */
      color: #e0e0e0; /* Light text color */
    }
    h1, h2, h3 {
      border-bottom: 1px solid #333; /* Darker border */
      padding-bottom: 10px;
      color: #ffffff; /* White headings */
    }
    pre {
      background-color: #1e1e1e; /* Darker preformatted text background */
      padding: 10px;
      border-radius: 4px;
      color: #e0e0e0; /* Light text color */
    }
    code {
      font-family: monospace;
      background-color: #2a2a2a; /* Dark code background */
      padding: 2px 4px;
      border-radius: 4px;
      color: #e0e0e0; /* Light text color */
    }
    a {
      color: #bb86fc; /* Light purple for links */
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      border: 1px solid #333; /* Darker border for table */
      text-align: left;
      color: #e0e0e0; /* Light text color */
    }
    th {
      background-color: #1e1e1e; /* Darker background for table header */
    }
  </style>
`;

async function build_readme() {
  try {
    // Read the readme.md file
    const data = await fs.readFile("readme.md", "utf8");

    // Convert Markdown to HTML
    const htmlContent = marked(data).replace(/\/themes\//g, "/");

    // Add basic HTML structure with the theme
    const finalHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>hexo-themes - HexoJS theme collection</title>
      ${simpleTheme}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

    // Write the HTML file
    await fs.outputFile(".deploy_git/index.html", finalHtml);
    console.log(".deploy_git/index.html created successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = build_readme;

// If you want to execute this script directly
if (require.main === module) {
  build_readme();
}
