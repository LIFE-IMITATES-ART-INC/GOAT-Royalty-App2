/**
 * Shared API Route Handler Utilities
 * Provides reusable middleware patterns for Next.js API routes:
 * - Method validation
 * - CORS headers
 * - Error handling
 */

/**
 * Apply CORS headers to a response.
 * @param {Object} res - Next.js API response object
 * @param {Object} [options]
 * @param {string} [options.origin] - Allowed origin (default: '*')
 * @param {string} [options.methods] - Allowed methods (default: 'GET, POST, OPTIONS')
 * @param {string} [options.headers] - Allowed headers (default: 'Content-Type, Authorization')
 */
export function applyCorsHeaders(res, options = {}) {
  const {
    origin = '*',
    methods = 'GET, POST, OPTIONS',
    headers = 'Content-Type, Authorization',
  } = options;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);
}

/**
 * Create an API handler with built-in method validation, CORS, and error handling.
 *
 * @param {Object} config
 * @param {string|string[]} config.methods - Allowed HTTP method(s) (e.g., 'POST' or ['GET', 'POST'])
 * @param {boolean} [config.cors] - Whether to add CORS headers (default: true)
 * @param {Object} [config.corsOptions] - CORS header options
 * @param {Function} config.handler - The actual handler function(req, res)
 * @returns {Function} Next.js API route handler
 *
 * @example
 * import { createApiHandler } from '../../lib/api-handler';
 *
 * export default createApiHandler({
 *   methods: 'POST',
 *   handler: async (req, res) => {
 *     const { message } = req.body;
 *     // ... handle request
 *   }
 * });
 */
export function createApiHandler({ methods, cors = true, corsOptions = {}, handler }) {
  const allowedMethods = Array.isArray(methods) ? methods : [methods];

  return async function apiHandler(req, res) {
    if (cors) {
      applyCorsHeaders(res, corsOptions);
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      return await handler(req, res);
    } catch (error) {
      console.error(`API Error [${req.url}]:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  };
}

/**
 * Validate that required fields exist in the request body.
 * Returns an error response if validation fails, or null if valid.
 *
 * @param {Object} req - Next.js API request
 * @param {Object} res - Next.js API response
 * @param {string[]} requiredFields - Field names that must be present and truthy
 * @returns {boolean} true if validation passed, false if error response was sent
 *
 * @example
 * if (!validateRequiredFields(req, res, ['message'])) return;
 */
export function validateRequiredFields(req, res, requiredFields) {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      res.status(400).json({ error: `${field} is required` });
      return false;
    }
  }
  return true;
}
