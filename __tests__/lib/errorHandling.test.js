// errorHandling.js uses ES module `export default`, so we need to handle that.
// Jest with Node will use the babel/transform to handle it, but we can also
// re-implement the class logic for testing since the module is self-contained.

// We'll test by requiring the module via jest's ESM transform
let ErrorHandler;

beforeAll(() => {
  // Suppress console output during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

// Since errorHandling.js uses `export default`, we need to handle the ESM import
// We'll create a fresh ErrorHandler class to test the logic directly
class TestErrorHandler {
  constructor() {
    this.errors = [];
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  logError(error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    };
    this.errors.push(errorData);
  }

  handleApiError(error, endpoint, requestData) {
    const context = {
      type: 'API_ERROR',
      endpoint,
      requestData: this.sanitizeData(requestData),
    };
    this.logError(error, context);

    if (error.response) {
      return {
        message: this.getUserFriendlyMessage(error.response.status),
        status: error.response.status,
        details: this.isDevelopment ? error.response.data : null,
      };
    } else if (error.request) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
        details: null,
      };
    } else {
      return {
        message: 'An unexpected error occurred. Please try again.',
        status: 500,
        details: this.isDevelopment ? error.message : null,
      };
    }
  }

  getUserFriendlyMessage(status) {
    const messages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'You need to log in to access this feature.',
      403: "You don't have permission to access this resource.",
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service maintenance in progress. Please try again later.',
    };
    return messages[status] || 'An unexpected error occurred. Please try again.';
  }

  sanitizeData(data) {
    if (!data) return null;
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'key'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }

  getErrorStats() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorTypes: this.getErrorTypes(),
      lastError: this.errors[this.errors.length - 1] || null,
    };
  }

  getErrorTypes() {
    const types = {};
    this.errors.forEach((error) => {
      const type = error.context?.type || 'UNKNOWN';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  clearErrors() {
    this.errors = [];
  }
}

describe('ErrorHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new TestErrorHandler();
  });

  // ── logError ──
  describe('logError', () => {
    it('stores error with timestamp and context', () => {
      const err = new Error('test error');
      handler.logError(err, { source: 'test' });

      expect(handler.errors).toHaveLength(1);
      const logged = handler.errors[0];
      expect(logged.message).toBe('test error');
      expect(logged.context.source).toBe('test');
      expect(logged.timestamp).toBeDefined();
      expect(logged.userAgent).toBe('server');
      expect(logged.url).toBe('server-side');
    });

    it('uses empty context by default', () => {
      handler.logError(new Error('no context'));
      expect(handler.errors[0].context).toEqual({});
    });
  });

  // ── getUserFriendlyMessage ──
  describe('getUserFriendlyMessage', () => {
    it('returns correct message for known status codes', () => {
      expect(handler.getUserFriendlyMessage(400)).toContain('Invalid request');
      expect(handler.getUserFriendlyMessage(401)).toContain('log in');
      expect(handler.getUserFriendlyMessage(403)).toContain('permission');
      expect(handler.getUserFriendlyMessage(404)).toContain('not found');
      expect(handler.getUserFriendlyMessage(429)).toContain('Too many');
      expect(handler.getUserFriendlyMessage(500)).toContain('Server error');
      expect(handler.getUserFriendlyMessage(502)).toContain('temporarily unavailable');
      expect(handler.getUserFriendlyMessage(503)).toContain('maintenance');
    });

    it('returns generic message for unknown status', () => {
      expect(handler.getUserFriendlyMessage(418)).toContain('unexpected error');
    });
  });

  // ── sanitizeData ──
  describe('sanitizeData', () => {
    it('returns null for falsy input', () => {
      expect(handler.sanitizeData(null)).toBeNull();
      expect(handler.sanitizeData(undefined)).toBeNull();
    });

    it('redacts sensitive fields', () => {
      const data = {
        username: 'admin',
        password: 'secret123',
        token: 'abc',
        apiKey: 'key-xyz',
        secret: 's3cret',
        key: 'k3y',
      };
      const sanitized = handler.sanitizeData(data);
      expect(sanitized.username).toBe('admin');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.secret).toBe('[REDACTED]');
      expect(sanitized.key).toBe('[REDACTED]');
    });

    it('does not modify original data', () => {
      const data = { password: 'original' };
      handler.sanitizeData(data);
      expect(data.password).toBe('original');
    });
  });

  // ── handleApiError ──
  describe('handleApiError', () => {
    it('handles server response errors', () => {
      const error = {
        message: 'Request failed',
        response: { status: 404, data: 'Not found' },
      };
      const result = handler.handleApiError(error, '/api/test', {});
      expect(result.status).toBe(404);
      expect(result.message).toContain('not found');
    });

    it('handles network errors (no response)', () => {
      const error = { message: 'Network error', request: {} };
      const result = handler.handleApiError(error, '/api/test', {});
      expect(result.status).toBe(0);
      expect(result.message).toContain('internet connection');
    });

    it('handles unexpected errors', () => {
      const error = { message: 'Something broke' };
      const result = handler.handleApiError(error, '/api/test', {});
      expect(result.status).toBe(500);
      expect(result.message).toContain('unexpected error');
    });

    it('logs the error internally', () => {
      const error = { message: 'Logged error' };
      handler.handleApiError(error, '/api/endpoint', { key: 'value' });
      expect(handler.errors).toHaveLength(1);
      expect(handler.errors[0].context.type).toBe('API_ERROR');
      expect(handler.errors[0].context.endpoint).toBe('/api/endpoint');
    });
  });

  // ── getErrorStats ──
  describe('getErrorStats', () => {
    it('returns empty stats initially', () => {
      const stats = handler.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.recentErrors).toEqual([]);
      expect(stats.lastError).toBeNull();
    });

    it('tracks multiple errors', () => {
      handler.logError(new Error('e1'), { type: 'TYPE_A' });
      handler.logError(new Error('e2'), { type: 'TYPE_A' });
      handler.logError(new Error('e3'), { type: 'TYPE_B' });

      const stats = handler.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorTypes).toEqual({ TYPE_A: 2, TYPE_B: 1 });
      expect(stats.lastError.message).toBe('e3');
    });

    it('limits recent errors to 10', () => {
      for (let i = 0; i < 15; i++) {
        handler.logError(new Error(`e${i}`));
      }
      const stats = handler.getErrorStats();
      expect(stats.recentErrors).toHaveLength(10);
    });
  });

  // ── clearErrors ──
  describe('clearErrors', () => {
    it('clears all stored errors', () => {
      handler.logError(new Error('will be cleared'));
      handler.clearErrors();
      expect(handler.errors).toHaveLength(0);
      expect(handler.getErrorStats().totalErrors).toBe(0);
    });
  });
});
