// // src/core/llmService.js

// const axios = require('axios');
// require('dotenv').config();

// // Your OpenAI API key should be stored as an environment variable (OPENAI_API_KEY)
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// /**
//  * Builds a prompt for clear API documentation.
//  * @param {string} method - HTTP method (GET, POST, etc.)
//  * @param {string} path - The API endpoint path
//  * @param {string} handlerCode - Handler source code string
//  * @param {string} comments - JSDoc or inline comments
//  * @returns {string} Prompt for LLM
//  */
// function buildPrompt(method, path, handlerCode, comments) {
//   return `You are an expert backend developer documentation generator.
// Given the following Express.js endpoint information, generate a concise, clear markdown snippet documenting the endpoint.

// HTTP Method: ${method}
// Path: ${path}
// Handler Code:
// ${handlerCode}
// Comments:
// ${comments}

// Document:
// - What this endpoint does
// - Expected request parameters and request body
// - Expected response format and status codes

// Provide the output in markdown format suitable for API documentation.`;
// }

// /**
//  * Sends endpoint data to OpenAI API and returns doc markdown.
//  * @param {Object} endpointInfo
//  * @param {string} endpointInfo.method
//  * @param {string} endpointInfo.path
//  * @param {string} endpointInfo.handlerCode
//  * @param {string} endpointInfo.comments
//  * @returns {Promise<string>} Generated markdown documentation.
//  */
// async function generateDocumentation({ method, path, handlerCode, comments }) {
//   if (!OPENAI_API_KEY) {
//     throw new Error('OpenAI API key is missing. Set OPENAI_API_KEY in your environment variables.');
//   }

//   const prompt = buildPrompt(method, path, handlerCode, comments);

//   const data = {
//     model: 'gpt-4',
//     messages: [
//       { role: 'system', content: 'You are a helpful assistant that generates developer-friendly API documentation.' },
//       { role: 'user', content: prompt }
//     ],
//     max_tokens: 500,
//     temperature: 0.3
//   };

//   try {
//     const response = await axios.post(OPENAI_API_URL, data, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${OPENAI_API_KEY}`
//       }
//     });

//     const docs = response.data.choices[0].message.content;
//     return docs;

//   } catch (error) {
//     console.error('Error calling OpenAI API:', error.response?.data || error.message);
//     throw error;
//   }
// }

// module.exports = { generateDocumentation };



// src/core/llmService.js

const { OpenAI } = require('openai');
require('dotenv').config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  throw new Error('HF_TOKEN is missing. Set it in your .env file');
}

// Create OpenAI-compatible client for Hugging Face router
const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: HF_TOKEN,
});

/**
 * Builds a prompt for clear API documentation.
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - The API endpoint path
 * @param {string} handlerCode - Handler source code string
 * @param {string} comments - JSDoc or inline comments
 * @returns {string} Prompt for LLM
 */
function buildPrompt(method, path, handlerCode, comments) {
  return `
You are an expert technical writer creating API documentation for a backend developer audience. Your tone is clear, concise, and professional.

Analyze the provided Express.js endpoint information and generate a complete, beautiful markdown documentation entry for it.

**Endpoint Information:**
- **HTTP Method:** ${method}
- **Path:** ${path}
- **Handler Source Code:**
  \`\`\`javascript
  ${handlerCode}
  \`\`\`
- **Developer Comments/JSDoc:**
  \`\`\`
  ${comments || 'No comments provided.'}
  \`\`\`

**Your Task:**
Generate the documentation by strictly following the markdown structure below. Infer all details like parameters, request bodies, and responses from the provided code and comments.

---

### \`${method.toUpperCase()}\` ${path}

[Provide a brief, one-sentence summary of what the endpoint does here.]

**Parameters**

[If the endpoint uses URL parameters (e.g., /:id) or query parameters (e.g., ?limit=10), create a markdown table here. The table should have columns: | Name | Type | Location | Description |. If there are no parameters, omit this section entirely.]

**Request Body**

[If the endpoint is a POST, PUT, or PATCH, describe the expected request body schema. Provide a clear JSON example inside a code block. If there is no request body (e.g., for GET requests), omit this section entirely.]

**Responses**

[Detail the possible responses using <details> blocks for each status code. Always include at least one success response (e.g., 200 OK, 201 Created) and one common error response (e.g., 400 Bad Request, 404 Not Found). Inside each block, provide a brief description and a JSON example in a code block.]

**Example <details> block structure:**
<details>
<summary><code>[Status Code] [Status Text]</code> - [Brief description of this response]</summary>

\`\`\`json
{
  "key": "value"
}
\`\`\`

</details>

**Permissions**

[If you can infer any permission requirements (e.g., authentication middleware, admin checks from the code or comments), list them here as a bullet point. For example: "- Requires admin authentication." If none are apparent, state "- Public endpoint.".]

---

Adhere to this structure precisely. Do not add any extra headers or conversational text outside of this format.
`;
}

/**
 * Sends endpoint data to Hugging Face and returns doc markdown.
 * @param {Object} endpointInfo
 * @param {string} endpointInfo.method
 * @param {string} endpointInfo.path
 * @param {string} endpointInfo.handlerCode
 * @param {string} endpointInfo.comments
 * @returns {Promise<string>} Generated markdown documentation.
 */
async function generateDocumentation({ method, path, handlerCode, comments }) {
  const prompt = buildPrompt(method, path, handlerCode, comments);

  try {
    const chatCompletion = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates developer-friendly API documentation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Hugging Face LLM:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { generateDocumentation };
