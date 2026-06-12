// GOAT Royalty App - CORS Middleware
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://goatroyalty.com',
  'https://www.goatroyalty.com'
];

// Allow extra origins via env var (comma-separated)
if (process.env.CORS_ALLOWED_ORIGINS) {
  process.env.CORS_ALLOWED_ORIGINS.split(',').forEach(o => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

export function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    
    // Only reflect back origins that are explicitly allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // If origin is not in the allowlist, omit the header entirely (deny cross-origin)
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

export default withCors;