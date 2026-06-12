const {
  sanitizeString,
  sanitizeNumber,
  sanitizeEmail,
  rateLimit,
  setSecurityHeaders,
  setCorsHeaders,
  getClientIP,
  validateMethod,
  generateCSRFToken,
  validateCSRFToken,
  logSecurityEvent,
  getSecurityEvents,
} = require('../../lib/security');

describe('security.js', () => {
  // ── sanitizeString ──
  describe('sanitizeString', () => {
    it('strips angle brackets', () => {
      expect(sanitizeString('<script>alert(1)</script>')).not.toContain('<');
      expect(sanitizeString('<script>alert(1)</script>')).not.toContain('>');
    });

    it('removes javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).not.toMatch(/javascript:/i);
    });

    it('removes inline event handlers', () => {
      expect(sanitizeString('onerror=alert(1)')).not.toMatch(/on\w+\s*=/i);
    });

    it('removes eval calls', () => {
      expect(sanitizeString('eval(document.cookie)')).not.toMatch(/eval\s*\(/i);
    });

    it('removes data: URI scheme', () => {
      expect(sanitizeString('data:text/html,<h1>hi</h1>')).not.toMatch(/data:/i);
    });

    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('truncates to maxLength', () => {
      const long = 'a'.repeat(1000);
      expect(sanitizeString(long, 10)).toHaveLength(10);
    });

    it('uses default maxLength of 500', () => {
      const long = 'a'.repeat(600);
      expect(sanitizeString(long)).toHaveLength(500);
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(42)).toBe('');
      expect(sanitizeString({})).toBe('');
    });

    it('passes through safe strings unchanged', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });
  });

  // ── sanitizeNumber ──
  describe('sanitizeNumber', () => {
    it('parses valid numbers', () => {
      expect(sanitizeNumber('42')).toBe(42);
      expect(sanitizeNumber(3.14)).toBe(3.14);
    });

    it('clamps to min', () => {
      expect(sanitizeNumber(-5, 0, 100)).toBe(0);
    });

    it('clamps to max', () => {
      expect(sanitizeNumber(200, 0, 100)).toBe(100);
    });

    it('returns min for NaN input', () => {
      expect(sanitizeNumber('abc', 10, 100)).toBe(10);
      expect(sanitizeNumber(undefined, 5)).toBe(5);
    });

    it('uses default min=0 and max=999999999', () => {
      expect(sanitizeNumber(-1)).toBe(0);
      expect(sanitizeNumber(9999999999)).toBe(999999999);
    });
  });

  // ── sanitizeEmail ──
  describe('sanitizeEmail', () => {
    it('normalises valid email to lowercase', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('trims whitespace', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('returns empty for invalid email', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('@no-local.com')).toBe('');
      expect(sanitizeEmail('no-domain@')).toBe('');
    });

    it('returns empty for non-string input', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(123)).toBe('');
    });

    it('truncates to 254 chars before validating', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      // The truncated version may or may not be valid depending on where it cuts
      const result = sanitizeEmail(longEmail);
      expect(result.length).toBeLessThanOrEqual(254);
    });
  });

  // ── rateLimit ──
  describe('rateLimit', () => {
    it('allows first request', () => {
      const result = rateLimit('test-ip-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(59); // default max=60, first request
    });

    it('denies requests past the max', () => {
      const ip = 'flood-ip-' + Date.now();
      for (let i = 0; i < 60; i++) {
        rateLimit(ip, { max: 60 });
      }
      const result = rateLimit(ip, { max: 60 });
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('respects custom max', () => {
      const ip = 'custom-max-' + Date.now();
      const result = rateLimit(ip, { max: 5 });
      expect(result.remaining).toBe(4);
    });

    it('handles null/undefined IP gracefully', () => {
      const result = rateLimit(null);
      expect(result).toHaveProperty('allowed');
    });
  });

  // ── setSecurityHeaders ──
  describe('setSecurityHeaders', () => {
    let res;
    beforeEach(() => {
      res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
    });

    it('sets standard security headers', () => {
      setSecurityHeaders(res);
      expect(res.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(res.headers['X-Frame-Options']).toBe('DENY');
      expect(res.headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(res.headers['Strict-Transport-Security']).toContain('max-age=');
      expect(res.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['Permissions-Policy']).toBeDefined();
    });

    it('sets X-Frame-Options to SAMEORIGIN when allowFrame is true', () => {
      setSecurityHeaders(res, { allowFrame: true });
      expect(res.headers['X-Frame-Options']).toBe('SAMEORIGIN');
    });

    it('sets no-cache headers by default', () => {
      setSecurityHeaders(res);
      expect(res.headers['Cache-Control']).toContain('no-store');
    });

    it('omits no-cache headers when allowCache is true', () => {
      setSecurityHeaders(res, { allowCache: true });
      expect(res.headers['Cache-Control']).toBeUndefined();
    });
  });

  // ── setCorsHeaders ──
  describe('setCorsHeaders', () => {
    it('sets CORS headers with wildcard by default', () => {
      const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
      setCorsHeaders(res);
      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
    });

    it('sets custom origin', () => {
      const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
      setCorsHeaders(res, 'https://goatroyalty.com');
      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://goatroyalty.com');
    });
  });

  // ── getClientIP ──
  describe('getClientIP', () => {
    it('reads x-forwarded-for header', () => {
      const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: {} };
      expect(getClientIP(req)).toBe('1.2.3.4');
    });

    it('falls back to x-real-ip', () => {
      const req = { headers: { 'x-real-ip': '10.0.0.1' }, socket: {} };
      expect(getClientIP(req)).toBe('10.0.0.1');
    });

    it('falls back to socket.remoteAddress', () => {
      const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
      expect(getClientIP(req)).toBe('127.0.0.1');
    });

    it('returns unknown when no IP source', () => {
      const req = { headers: {}, socket: {} };
      expect(getClientIP(req)).toBe('unknown');
    });
  });

  // ── validateMethod ──
  describe('validateMethod', () => {
    let res;
    beforeEach(() => {
      res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; },
        end() { return this; },
      };
    });

    it('returns true for allowed method', () => {
      const req = { method: 'GET' };
      expect(validateMethod(req, res, ['GET', 'POST'])).toBe(true);
    });

    it('returns false and sends 200 for OPTIONS', () => {
      const req = { method: 'OPTIONS' };
      expect(validateMethod(req, res)).toBe(false);
      expect(res.statusCode).toBe(200);
    });

    it('returns false and sends 405 for disallowed method', () => {
      const req = { method: 'DELETE' };
      expect(validateMethod(req, res, ['GET'])).toBe(false);
      expect(res.statusCode).toBe(405);
      expect(res.body.error).toContain('DELETE');
    });
  });

  // ── CSRF tokens ──
  describe('CSRF token management', () => {
    it('generates and validates a token', () => {
      const token = generateCSRFToken('session-1');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(validateCSRFToken('session-1', token)).toBe(true);
    });

    it('rejects wrong token', () => {
      generateCSRFToken('session-2');
      expect(validateCSRFToken('session-2', 'wrong-token')).toBe(false);
    });

    it('rejects unknown session', () => {
      expect(validateCSRFToken('nonexistent', 'any-token')).toBe(false);
    });
  });

  // ── Security event logging ──
  describe('logSecurityEvent / getSecurityEvents', () => {
    it('logs and retrieves events', () => {
      logSecurityEvent('TEST_EVENT', { ip: '1.2.3.4' });
      const events = getSecurityEvents(1);
      expect(events.length).toBeGreaterThanOrEqual(1);
      const last = events[events.length - 1];
      expect(last.type).toBe('TEST_EVENT');
      expect(last.details.ip).toBe('1.2.3.4');
      expect(last.timestamp).toBeDefined();
    });

    it('limits returned events', () => {
      for (let i = 0; i < 10; i++) {
        logSecurityEvent('BULK_EVENT', { i });
      }
      const events = getSecurityEvents(3);
      expect(events.length).toBe(3);
    });
  });
});
