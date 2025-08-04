// src/cli/main.js

const { getRoutes } = require('../core/routerExtractor');
const { analyzeHandler } = require('../core/handlerAnalyzer');
const { generateDocumentation } = require('../core/llmService');
const { aggregateDocs, writeMarkdownToFile } = require('../core/docFormatter');
const path = require('path');

/**
 * Main function to scan an Express app, generate docs, and write markdown file.
 * @param {Object} app - Your Express app instance
 */
async function generateApiDocs(app) {
  try {
    const routes = getRoutes(app.router.stack);

    const docsArray = [];

    // Inside the generateApiDocs function in src/cli/main.js...

for (const route of routes) {
  // --- START: THE FIX ---
  // A route can have multiple handlers (middleware). We only want the last one.
  if (route.handlers.length === 0) continue;

  const mainHandler = route.handlers[route.handlers.length - 1];
  // --- END: THE FIX ---

  const { code, comments } = analyzeHandler(mainHandler); // Use mainHandler
  const docMarkdown = await generateDocumentation({
    method: route.method,
    path: route.path,
    handlerCode: code,
    comments: comments
  });

  docsArray.push({
    method: route.method,
    path: route.path,
    docMarkdown
  });
}


    const finalMd = aggregateDocs(docsArray);
    writeMarkdownToFile(finalMd, path.resolve(process.cwd(), 'API.md'));

    console.log('API documentation generated successfully.');
  } catch (error) {
    console.error('Error generating API docs:', error);
  }
}

module.exports = { generateApiDocs };

// Optionally: Add CLI invocation if this should be run as `node src/cli/main.js`
if (require.main === module) {
  // Example: user provides path to their Express app file as argument
  const expressAppPath = process.argv[2];
  if (!expressAppPath) {
    console.error('Usage: node src/cli/main.js <path-to-express-app>');
    process.exit(1);
  }
  const app = require(path.resolve(process.cwd(), expressAppPath));
  generateApiDocs(app);
}
