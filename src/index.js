// src/index.js

const path = require('path');
const fs = require('fs');
const dotevn = require('dotenv');
const { generateApiDocs } = require('./cli/main');

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 1) {
      console.error('Usage: node src/index.js <path-to-express-app-file>');
      process.exit(1);
    }

    const expressAppPath = path.resolve(process.cwd(), args[0]);
    const targetProjectDir = path.dirname(expressAppPath);
    const targetEnvPath = path.join(targetProjectDir, '.env');

    // --- START: The Smart Solution ---
    // Check if the target project has a .env file and load it first.
    if (fs.existsSync(targetEnvPath)) {
      console.log(`Found .env file in target project, loading environment variables from: ${targetEnvPath}`);
      dotevn.config({ path: targetEnvPath });
    }
    // --- END: The Smart Solution ---

    // Now, require the user's app. It will now have access to its own env variables.
    const importedModule = require(expressAppPath);
    let app = null;

    if (typeof importedModule === 'function') {
      app = importedModule;
    } else if (importedModule && typeof importedModule.default === 'function') {
      app = importedModule.default;
    }

    if (!app) {
      throw new Error(`Could not find a valid Express app instance in ${expressAppPath}.`);
    }

    await generateApiDocs(app);

  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main();
