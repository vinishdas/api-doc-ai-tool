// src/core/routerExtractor.js

/**
 * Recursively extract all routes from an Express app or router stack.
 * @param {Array} stack - Express app or router internal stack (app._router.stack)
 * @param {string} prefix - URL prefix accumulated during recursion
 * @returns {Array} List of route objects { method, path, handlers }
 */
function getRoutes(stack, prefix = '') {
  let routes = [];

  stack.forEach(layer => {
    if (layer.route) {
      // Direct route on app or router
      const routePath = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      methods.forEach(method => {
        routes.push({
          method,
          path: routePath,
          handlers: layer.route.stack.map(l => l.handle),
        });
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Nested router - extract path prefix from `regexp`
      const regex = layer.regexp?.toString() || '';
      const prefixPath = regex
        .replace(/^\/\^/, '')
        .replace(/\\\/\?\(\?\=\\\/\|\$\)\/i$/, '')
        .replace(/\\\//g, '/')
        .replace(/\$$/, '');

      routes = routes.concat(getRoutes(layer.handle.stack, prefix + prefixPath));
    }
  });

  return routes;
}

module.exports = { getRoutes };
