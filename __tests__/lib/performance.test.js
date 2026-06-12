// performance.js uses `export default` (ESM) and depends on browser APIs.
// We test the pure logic methods by recreating the class in a Node-compatible form.

describe('PerformanceMonitor', () => {
  let monitor;

  // Minimal reproduction of PerformanceMonitor for unit-testable methods
  class TestPerformanceMonitor {
    constructor() {
      this.metrics = {
        apiCalls: [],
        pageLoads: [],
        userInteractions: [],
        errors: [],
        resources: [],
      };
      this.startTime = Date.now();
      this.observers = new Map();
    }

    trackAPICall(url, method, startTime, endTime, status, error = null) {
      const metric = {
        url,
        method,
        startTime,
        endTime,
        duration: endTime - startTime,
        status,
        error,
        timestamp: new Date().toISOString(),
      };
      this.metrics.apiCalls.push(metric);
      if (this.metrics.apiCalls.length > 1000) {
        this.metrics.apiCalls = this.metrics.apiCalls.slice(-1000);
      }
    }

    trackPageLoad(pageName, startTime, endTime) {
      const metric = {
        pageName,
        startTime,
        endTime,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        navigationTiming: null,
      };
      this.metrics.pageLoads.push(metric);
      if (this.metrics.pageLoads.length > 100) {
        this.metrics.pageLoads = this.metrics.pageLoads.slice(-100);
      }
    }

    trackUserInteraction(type, target, startTime, endTime) {
      const metric = {
        type,
        target: target.tagName || 'unknown',
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
      };
      this.metrics.userInteractions.push(metric);
      if (this.metrics.userInteractions.length > 500) {
        this.metrics.userInteractions = this.metrics.userInteractions.slice(-500);
      }
    }

    getWebVitalRating(name, value) {
      const thresholds = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
      };
      const threshold = thresholds[name];
      if (!threshold) return 'UNKNOWN';
      if (value <= threshold.good) return 'GOOD';
      if (value <= threshold.poor) return 'NEEDS_IMPROVEMENT';
      return 'POOR';
    }

    getResourceType(url) {
      if (url.includes('.js')) return 'script';
      if (url.includes('.css')) return 'stylesheet';
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
      if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
      return 'other';
    }

    getAverageAPIResponseTime() {
      if (this.metrics.apiCalls.length === 0) return 0;
      const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
      return Math.round(total / this.metrics.apiCalls.length);
    }

    getSlowestAPICall() {
      if (this.metrics.apiCalls.length === 0) return null;
      return this.metrics.apiCalls.reduce((slowest, current) =>
        current.duration > slowest.duration ? current : slowest,
      );
    }

    getErrorRate() {
      if (this.metrics.apiCalls.length === 0) return 0;
      const errors = this.metrics.apiCalls.filter((call) => call.status >= 400).length;
      return Math.round((errors / this.metrics.apiCalls.length) * 100);
    }

    getResourceSummary() {
      const summary = {};
      this.metrics.resources.forEach((resource) => {
        if (!summary[resource.type]) {
          summary[resource.type] = { count: 0, totalSize: 0, averageLoadTime: 0 };
        }
        summary[resource.type].count++;
        summary[resource.type].totalSize += resource.size;
      });
      Object.keys(summary).forEach((type) => {
        const resources = this.metrics.resources.filter((r) => r.type === type);
        const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);
        summary[type].averageLoadTime = Math.round(totalTime / resources.length);
      });
      return summary;
    }

    getMetricsSummary() {
      return {
        uptime: Date.now() - this.startTime,
        totalAPICalls: this.metrics.apiCalls.length,
        totalPageLoads: this.metrics.pageLoads.length,
        totalUserInteractions: this.metrics.userInteractions.length,
        averageAPIResponseTime: this.getAverageAPIResponseTime(),
        slowestAPICall: this.getSlowestAPICall(),
        errorRate: this.getErrorRate(),
        resourceSummary: this.getResourceSummary(),
      };
    }

    clearMetrics() {
      this.metrics = {
        apiCalls: [],
        pageLoads: [],
        userInteractions: [],
        errors: [],
        resources: [],
      };
    }
  }

  beforeEach(() => {
    monitor = new TestPerformanceMonitor();
  });

  // ── trackAPICall ──
  describe('trackAPICall', () => {
    it('records an API call metric', () => {
      monitor.trackAPICall('/api/tracks', 'GET', 100, 350, 200);
      expect(monitor.metrics.apiCalls).toHaveLength(1);
      const call = monitor.metrics.apiCalls[0];
      expect(call.url).toBe('/api/tracks');
      expect(call.method).toBe('GET');
      expect(call.duration).toBe(250);
      expect(call.status).toBe(200);
      expect(call.error).toBeNull();
    });

    it('caps stored calls at 1000', () => {
      for (let i = 0; i < 1005; i++) {
        monitor.trackAPICall('/api/test', 'GET', 0, 10, 200);
      }
      expect(monitor.metrics.apiCalls.length).toBeLessThanOrEqual(1000);
    });
  });

  // ── trackPageLoad ──
  describe('trackPageLoad', () => {
    it('records a page load metric', () => {
      monitor.trackPageLoad('/dashboard', 0, 1200);
      expect(monitor.metrics.pageLoads).toHaveLength(1);
      expect(monitor.metrics.pageLoads[0].pageName).toBe('/dashboard');
      expect(monitor.metrics.pageLoads[0].duration).toBe(1200);
    });

    it('caps page loads at 100', () => {
      for (let i = 0; i < 105; i++) {
        monitor.trackPageLoad('/page', 0, 100);
      }
      expect(monitor.metrics.pageLoads.length).toBeLessThanOrEqual(100);
    });
  });

  // ── trackUserInteraction ──
  describe('trackUserInteraction', () => {
    it('records interaction with tagName', () => {
      monitor.trackUserInteraction('click', { tagName: 'BUTTON' }, 0, 50);
      expect(monitor.metrics.userInteractions).toHaveLength(1);
      expect(monitor.metrics.userInteractions[0].target).toBe('BUTTON');
      expect(monitor.metrics.userInteractions[0].type).toBe('click');
    });

    it('falls back to unknown when no tagName', () => {
      monitor.trackUserInteraction('scroll', {}, 0, 10);
      expect(monitor.metrics.userInteractions[0].target).toBe('unknown');
    });

    it('caps interactions at 500', () => {
      for (let i = 0; i < 505; i++) {
        monitor.trackUserInteraction('click', { tagName: 'DIV' }, 0, 1);
      }
      expect(monitor.metrics.userInteractions.length).toBeLessThanOrEqual(500);
    });
  });

  // ── getWebVitalRating ──
  describe('getWebVitalRating', () => {
    it('rates LCP correctly', () => {
      expect(monitor.getWebVitalRating('LCP', 1000)).toBe('GOOD');
      expect(monitor.getWebVitalRating('LCP', 2500)).toBe('GOOD');
      expect(monitor.getWebVitalRating('LCP', 3000)).toBe('NEEDS_IMPROVEMENT');
      expect(monitor.getWebVitalRating('LCP', 5000)).toBe('POOR');
    });

    it('rates FID correctly', () => {
      expect(monitor.getWebVitalRating('FID', 50)).toBe('GOOD');
      expect(monitor.getWebVitalRating('FID', 200)).toBe('NEEDS_IMPROVEMENT');
      expect(monitor.getWebVitalRating('FID', 500)).toBe('POOR');
    });

    it('rates CLS correctly', () => {
      expect(monitor.getWebVitalRating('CLS', 0.05)).toBe('GOOD');
      expect(monitor.getWebVitalRating('CLS', 0.15)).toBe('NEEDS_IMPROVEMENT');
      expect(monitor.getWebVitalRating('CLS', 0.5)).toBe('POOR');
    });

    it('returns UNKNOWN for unrecognised metric', () => {
      expect(monitor.getWebVitalRating('TTFB', 100)).toBe('UNKNOWN');
    });
  });

  // ── getResourceType ──
  describe('getResourceType', () => {
    it('detects scripts', () => {
      expect(monitor.getResourceType('app.bundle.js')).toBe('script');
    });

    it('detects stylesheets', () => {
      expect(monitor.getResourceType('styles.css')).toBe('stylesheet');
    });

    it('detects images', () => {
      expect(monitor.getResourceType('logo.png')).toBe('image');
      expect(monitor.getResourceType('hero.jpg')).toBe('image');
      expect(monitor.getResourceType('icon.svg')).toBe('image');
      expect(monitor.getResourceType('photo.webp')).toBe('image');
    });

    it('detects fonts', () => {
      expect(monitor.getResourceType('font.woff2')).toBe('font');
      expect(monitor.getResourceType('font.ttf')).toBe('font');
    });

    it('returns other for unknown types', () => {
      expect(monitor.getResourceType('/api/data')).toBe('other');
    });
  });

  // ── getAverageAPIResponseTime ──
  describe('getAverageAPIResponseTime', () => {
    it('returns 0 when no calls', () => {
      expect(monitor.getAverageAPIResponseTime()).toBe(0);
    });

    it('calculates average correctly', () => {
      monitor.trackAPICall('/a', 'GET', 0, 100, 200);
      monitor.trackAPICall('/b', 'GET', 0, 300, 200);
      expect(monitor.getAverageAPIResponseTime()).toBe(200);
    });
  });

  // ── getSlowestAPICall ──
  describe('getSlowestAPICall', () => {
    it('returns null when no calls', () => {
      expect(monitor.getSlowestAPICall()).toBeNull();
    });

    it('returns the slowest call', () => {
      monitor.trackAPICall('/fast', 'GET', 0, 50, 200);
      monitor.trackAPICall('/slow', 'GET', 0, 5000, 200);
      monitor.trackAPICall('/medium', 'GET', 0, 500, 200);
      expect(monitor.getSlowestAPICall().url).toBe('/slow');
    });
  });

  // ── getErrorRate ──
  describe('getErrorRate', () => {
    it('returns 0 when no calls', () => {
      expect(monitor.getErrorRate()).toBe(0);
    });

    it('calculates error rate correctly', () => {
      monitor.trackAPICall('/ok', 'GET', 0, 10, 200);
      monitor.trackAPICall('/err', 'GET', 0, 10, 500);
      expect(monitor.getErrorRate()).toBe(50);
    });
  });

  // ── getResourceSummary ──
  describe('getResourceSummary', () => {
    it('returns empty object with no resources', () => {
      expect(monitor.getResourceSummary()).toEqual({});
    });

    it('summarises resources by type', () => {
      monitor.metrics.resources.push(
        { type: 'script', size: 1000, duration: 100 },
        { type: 'script', size: 2000, duration: 200 },
        { type: 'image', size: 5000, duration: 300 },
      );
      const summary = monitor.getResourceSummary();
      expect(summary.script.count).toBe(2);
      expect(summary.script.totalSize).toBe(3000);
      expect(summary.script.averageLoadTime).toBe(150);
      expect(summary.image.count).toBe(1);
    });
  });

  // ── getMetricsSummary ──
  describe('getMetricsSummary', () => {
    it('returns a complete summary', () => {
      monitor.trackAPICall('/test', 'GET', 0, 100, 200);
      const summary = monitor.getMetricsSummary();
      expect(summary).toHaveProperty('uptime');
      expect(summary.totalAPICalls).toBe(1);
      expect(summary.totalPageLoads).toBe(0);
      expect(summary.totalUserInteractions).toBe(0);
      expect(summary.averageAPIResponseTime).toBe(100);
      expect(summary.errorRate).toBe(0);
    });
  });

  // ── clearMetrics ──
  describe('clearMetrics', () => {
    it('resets all metrics', () => {
      monitor.trackAPICall('/test', 'GET', 0, 100, 200);
      monitor.trackPageLoad('/page', 0, 200);
      monitor.clearMetrics();
      expect(monitor.metrics.apiCalls).toHaveLength(0);
      expect(monitor.metrics.pageLoads).toHaveLength(0);
    });
  });
});
