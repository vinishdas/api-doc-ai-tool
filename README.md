# API Doc AI Tool

[![npm version](https://img.shields.io/npm/v/api-doc-ai-tool.svg?style=flat-square)](https://www.npmjs.com/package/api-doc-ai-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Instantly generate beautiful, professional API documentation for your Node.js Express projects using the power of AI.**

This command-line tool dynamically analyzes any Express application, including those with complex nested routers, and uses Large Language Models (LLMs) to generate clear, structured, and human-readable documentation in a single markdown file.

## Features

-   **Fully Automated:** Zero manual documentation writing. Just point the tool at your project.
-   **AI-Powered Descriptions:** Uses AI to analyze your handler code and generate clear descriptions, parameter tables, and request/response examples.
-   **Deep Router Analysis:** Intelligently traverses your entire Express router stack to find every endpoint, no matter how deeply nested.
-   **Smart Environment Loading:** Automatically detects and loads `.env` files from the target project to ensure correct initialization.
-   **Beautiful Markdown Output:** Generates a clean, professional, and interactive `API.md` file ready for your GitHub repository or internal documentation portal.
-   **Highly Configurable:** Easily switch between LLM providers (e.g., OpenAI, Hugging Face) by adapting the LLM service.

## Installation

Install the tool globally using npm to make the `api-doc-ai-tool` command available anywhere on your system.

npm install -g api-doc-ai-tool

## Configuration

Before first use, you must provide an API key for the AI model. This tool uses the `openai` library's interface, which is compatible with many services, including the Hugging Face Inference Router.

1.  Create a file named `.env` in the root directory of the **`api-doc-ai-tool` project itself** (not your target project).
2.  Add your API key to this file. For example, if using Hugging Face:

    ```
    HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

    Or for OpenAI:

    ```
    OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

## Usage

To generate documentation, simply run the command and provide the path to your Express application's main entry file.

api-doc-ai-tool /path/to/your/project/server.js

The tool will then analyze the project and generate a new `API.md` file in the directory where you ran the command.

### Prerequisites for Your Express Project

For the tool to work correctly, your target Express project should follow these two standard Node.js practices:

1.  **Export the `app` instance:** Your main server file must export the Express `app` object.
    ```
    // In your server.js
    const app = express();
    // ... setup ...
    module.exports = app;
    ```
2.  **Conditionally start the server:** The `app.listen()` call should be wrapped in a condition to prevent the server from starting when it is being imported by an external tool.
    ```
    // In your server.js
    if (require.main === module) {
      app.listen(3000, () => console.log('Server running!'));
    }
    ```

## Example Output

The tool generates a clean, structured markdown file. Here is a sample of what an entry looks like:

---

### `GET` /api/users/:id

Retrieves a specific user by their unique ID.

**Parameters**

| Name | Type   | Location | Description         |
| :--- | :----- | :------- | :------------------ |
| `id` | string | Path     | The ID of the user. |

**Responses**

<details>
<summary><code>200 OK</code> - The user was found and returned successfully.</summary>

{
"id": "123e4567-e89b-12d3-a456-426614174000",
"name": "Alice",
"email": "alice@example.com"
}

</details>

<details>
<summary><code>404 Not Found</code> - No user was found with the specified ID.</summary>

{
"error": "User not found"
}

</details>

---

## How It Works

This tool uses a **dynamic analysis** approach. It safely loads your Express application into memory to gain access to the fully constructed router object. This allows it to accurately map out every registered route, middleware, and handler. It then analyzes the source code of each handler, sends it to an LLM for documentation generation, and assembles the results into a single file.

 