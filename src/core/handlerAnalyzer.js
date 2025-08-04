// src/core/handlerAnalyzer.js

const acorn = require('acorn');
const walk = require('acorn-walk');

/**
 * Analyzes a handler function using AST parsing to reliably extract its
 * source code and any associated JSDoc comments.
 *
 * @param {Function} handler - The Express route handler function.
 * @returns {{code: string, comments: string}} - An object with the code and comments.
 */
function analyzeHandler(handler) {
  if (typeof handler !== 'function') {
    throw new Error('Handler must be a function.');
  }

  const code = handler.toString();
  let comments = '';

  try {
    // We need to wrap the handler code to make it valid for parsing
    // (e.g., an arrow function by itself is not a valid program)
    const parsableCode = `const temp = ${code};`;

    const commentsFound = [];
    const ast = acorn.parse(parsableCode, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // This is crucial: it tells acorn to attach comments to nodes
      onComment: commentsFound
    });

    // Walk the AST to find the function expression
    walk.simple(ast, {
      FunctionExpression(node) {
        // Find comments that appear directly before the function
        const relevantComments = commentsFound.filter(comment => comment.end < node.start);
        if (relevantComments.length > 0) {
          // Get the last comment block before the function
          const lastComment = relevantComments[relevantComments.length - 1];
          comments = `/*${lastComment.value}*/`;
        }
      },
      ArrowFunctionExpression(node) {
        // Same logic for arrow functions
        const relevantComments = commentsFound.filter(comment => comment.end < node.start);
        if (relevantComments.length > 0) {
          const lastComment = relevantComments[relevantComments.length - 1];
          // Acorn gives us different comment types, format them consistently
          if (lastComment.type === 'Block') {
            comments = `/*${lastComment.value}*/`;
          } else if (lastComment.type === 'Line') {
            comments = `//${lastComment.value}`;
          }
        }
      }
    });

  } catch (error) {
    console.warn('Could not parse handler with Acorn, falling back to regex. Error:', error.message);
    // Fallback to simple regex if AST parsing fails
    const commentRegex = /\/\*\*([\s\S]*?)\*\//;
    const match = code.match(commentRegex);
    if (match) {
      comments = match[0];
    }
  }

  return {
    code,
    comments,
  };
}

module.exports = { analyzeHandler };
