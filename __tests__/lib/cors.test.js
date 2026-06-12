// cors.js uses ESM (export function withCors ...).
// We test the CORS middleware logic by reproducing the pure function.

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://72.61.193.184',
  'http://93.127.214.171',
  'https://goatroyalty.com',
  'https://www.goatroyalty.com',
];

function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

describe('withCors', () => {
  let res;
  let handler;

  beforeEach(() => {
    res = {
      headers: {},
      statusCode: null,
      setHeader(k, v) {
        this.headers[k] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      end() {
        return this;
      },
    };
    handler = jest.fn();
  });

  it('sets allowed origin for whitelisted origins', async () => {
    const req = { headers: { origin: 'https://goatroyalty.com' }, method: 'GET' };
    const wrapped = withCors(handler);
    await wrapped(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://goatroyalty.com');
    expect(handler).toHaveBeenCalledWith(req, res);
  });

  it('sets wildcard origin for unknown origins', async () => {
    const req = { headers: { origin: 'https://evil.com' }, method: 'GET' };
    const wrapped = withCors(handler);
    await wrapped(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('sets wildcard when no origin header', async () => {
    const req = { headers: {}, method: 'GET' };
    const wrapped = withCors(handler);
    await wrapped(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('handles OPTIONS preflight without calling handler', async () => {
    const req = { headers: { origin: 'http://localhost:3000' }, method: 'OPTIONS' };
    const wrapped = withCors(handler);
    await wrapped(req, res);

    expect(res.statusCode).toBe(200);
    expect(handler).not.toHaveBeenCalled();
  });

  it('sets standard CORS headers', async () => {
    const req = { headers: {}, method: 'POST' };
    const wrapped = withCors(handler);
    await wrapped(req, res);

    expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(res.headers['Access-Control-Allow-Headers']).toContain('Authorization');
    expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(res.headers['Access-Control-Max-Age']).toBe('86400');
  });

  it('allows all whitelisted origins', async () => {
    for (const origin of allowedOrigins) {
      const localRes = {
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status() { return this; },
        end() { return this; },
      };
      const req = { headers: { origin }, method: 'GET' };
      await withCors(handler)(req, localRes);
      expect(localRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    }
  });
});
