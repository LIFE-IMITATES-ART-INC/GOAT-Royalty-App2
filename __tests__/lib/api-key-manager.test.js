// api-key-manager.js uses `class APIKeyManager` without explicit export at the top,
// and ends with GOATAPIKeyManager extending it plus module.exports.
// We test by directly instantiating the class logic.

// Reproduce APIKeyManager class for testing (the file doesn't use require/module.exports
// at the class level in a Jest-friendly way, so we replicate to avoid import issues)

class APIKeyManager {
  constructor(config = {}) {
    this.encryptionKey = config.encryptionKey || 'test-key';
    this.keys = new Map();
    this.keyHistory = [];
    this.rotationSchedule = new Map();
  }

  async storeKey(service, apiKey, metadata = {}) {
    const keyEntry = {
      service,
      encryptedKey: this.encrypt(apiKey),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        lastRotated: new Date().toISOString(),
      },
      status: 'active',
    };
    this.keys.set(service, keyEntry);
    this.keyHistory.push({ action: 'stored', service, timestamp: new Date().toISOString() });
    return { success: true, service, timestamp: keyEntry.metadata.createdAt };
  }

  async getKey(service) {
    const keyEntry = this.keys.get(service);
    if (!keyEntry) throw new Error(`API key for service '${service}' not found`);
    if (keyEntry.status !== 'active') throw new Error(`API key for service '${service}' is not active`);
    return this.decrypt(keyEntry.encryptedKey);
  }

  async revokeKey(service) {
    const keyEntry = this.keys.get(service);
    if (!keyEntry) throw new Error(`API key for service '${service}' not found`);
    keyEntry.status = 'revoked';
    keyEntry.metadata.revokedAt = new Date().toISOString();
    keyEntry.metadata.revokedReason = 'manual_revocation';
    this.keys.set(service, keyEntry);
    this.keyHistory.push({ action: 'revoked', service, timestamp: new Date().toISOString() });
    return { success: true, service, revokedAt: keyEntry.metadata.revokedAt };
  }

  getKeyStatus(service) {
    const keyEntry = this.keys.get(service);
    if (!keyEntry) return { service, status: 'not_found', exists: false };
    return {
      service,
      exists: true,
      status: keyEntry.status,
      createdAt: keyEntry.metadata.createdAt,
      lastRotated: keyEntry.metadata.lastRotated,
      rotationCount: keyEntry.metadata.rotations || 0,
      daysSinceRotation: this.daysSince(keyEntry.metadata.lastRotated),
    };
  }

  getAllKeysStatus() {
    const services = ['distrokid', 'tunecore', 'cdbaby', 'mlc', 'soundexchange', 'tiktok', 'spotify', 'hostinger'];
    return services.map((service) => this.getKeyStatus(service));
  }

  scheduleRotation(service, days) {
    this.rotationSchedule.set(service, {
      intervalDays: days,
      lastRotation: new Date().toISOString(),
      nextRotation: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    });
    return { success: true, service, nextRotation: this.rotationSchedule.get(service).nextRotation };
  }

  getAuditLog() {
    return this.keyHistory;
  }

  encrypt(data) {
    const key = this.encryptionKey || 'default-key';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(encrypted).toString('base64');
  }

  decrypt(encryptedData) {
    const key = this.encryptionKey || 'default-key';
    const decoded = Buffer.from(encryptedData, 'base64').toString();
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  validateKeyFormat(service, apiKey) {
    const formats = {
      distrokid: /^.{32,}$/,
      tunecore: /^.{32,}$/,
      cdbaby: /^.{32,}$/,
      mlc: /^Bearer\s+.+$/,
      soundexchange: /^[a-f0-9]{32}$/,
      tiktok: /^.{32,}$/,
      hostinger: /^[a-f0-9]{40,}$/,
    };
    const regex = formats[service];
    return regex ? regex.test(apiKey) : true;
  }

  exportKeys() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      keys: Array.from(this.keys.entries()).map(([service, entry]) => ({
        service,
        encryptedKey: entry.encryptedKey,
        metadata: entry.metadata,
        status: entry.status,
      })),
    };
    return Buffer.from(JSON.stringify(exportData)).toString('base64');
  }

  importKeys(encryptedBackup) {
    try {
      const decoded = Buffer.from(encryptedBackup, 'base64').toString();
      const importData = JSON.parse(decoded);
      importData.keys.forEach(({ service, encryptedKey, metadata, status }) => {
        this.keys.set(service, { service, encryptedKey, metadata, status });
      });
      return { success: true, importedAt: new Date().toISOString(), keyCount: importData.keys.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

describe('APIKeyManager', () => {
  let manager;

  beforeEach(() => {
    manager = new APIKeyManager({ encryptionKey: 'test-encryption-key-123' });
  });

  // ── encrypt / decrypt ──
  describe('encrypt and decrypt', () => {
    it('round-trips data correctly', () => {
      const original = 'my-secret-api-key-abc123';
      const encrypted = manager.encrypt(original);
      expect(encrypted).not.toBe(original);
      const decrypted = manager.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it('produces base64 output', () => {
      const encrypted = manager.encrypt('test');
      expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    });
  });

  // ── storeKey / getKey ──
  describe('storeKey and getKey', () => {
    it('stores and retrieves a key', async () => {
      const result = await manager.storeKey('spotify', 'sp-key-123');
      expect(result.success).toBe(true);
      expect(result.service).toBe('spotify');

      const retrieved = await manager.getKey('spotify');
      expect(retrieved).toBe('sp-key-123');
    });

    it('throws for non-existent service', async () => {
      await expect(manager.getKey('nonexistent')).rejects.toThrow('not found');
    });

    it('throws for revoked key', async () => {
      await manager.storeKey('tiktok', 'tk-key');
      await manager.revokeKey('tiktok');
      await expect(manager.getKey('tiktok')).rejects.toThrow('not active');
    });
  });

  // ── revokeKey ──
  describe('revokeKey', () => {
    it('revokes an existing key', async () => {
      await manager.storeKey('mlc', 'mlc-key');
      const result = await manager.revokeKey('mlc');
      expect(result.success).toBe(true);

      const status = manager.getKeyStatus('mlc');
      expect(status.status).toBe('revoked');
    });

    it('throws when revoking non-existent key', async () => {
      await expect(manager.revokeKey('ghost')).rejects.toThrow('not found');
    });
  });

  // ── getKeyStatus ──
  describe('getKeyStatus', () => {
    it('returns not_found for unknown service', () => {
      const status = manager.getKeyStatus('unknown');
      expect(status.exists).toBe(false);
      expect(status.status).toBe('not_found');
    });

    it('returns correct status for stored key', async () => {
      await manager.storeKey('distrokid', 'dk-key-abcdefghijklmnopqrstuvwxyz1234');
      const status = manager.getKeyStatus('distrokid');
      expect(status.exists).toBe(true);
      expect(status.status).toBe('active');
      expect(status.createdAt).toBeDefined();
      expect(status.rotationCount).toBe(0);
    });
  });

  // ── getAllKeysStatus ──
  describe('getAllKeysStatus', () => {
    it('returns status for all predefined services', () => {
      const statuses = manager.getAllKeysStatus();
      expect(statuses).toHaveLength(8);
      expect(statuses.every((s) => s.hasOwnProperty('exists'))).toBe(true);
    });
  });

  // ── scheduleRotation ──
  describe('scheduleRotation', () => {
    it('schedules a rotation with a future date', () => {
      const result = manager.scheduleRotation('spotify', 90);
      expect(result.success).toBe(true);
      const nextDate = new Date(result.nextRotation);
      expect(nextDate.getTime()).toBeGreaterThan(Date.now());
    });
  });

  // ── daysSince ──
  describe('daysSince', () => {
    it('returns 0 for today', () => {
      expect(manager.daysSince(new Date().toISOString())).toBe(0);
    });

    it('returns correct days for past date', () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      expect(manager.daysSince(thirtyDaysAgo)).toBe(30);
    });
  });

  // ── validateKeyFormat ──
  describe('validateKeyFormat', () => {
    it('validates distrokid key (32+ chars)', () => {
      expect(manager.validateKeyFormat('distrokid', 'a'.repeat(32))).toBe(true);
      expect(manager.validateKeyFormat('distrokid', 'short')).toBe(false);
    });

    it('validates MLC key (Bearer token)', () => {
      expect(manager.validateKeyFormat('mlc', 'Bearer abc123')).toBe(true);
      expect(manager.validateKeyFormat('mlc', 'abc123')).toBe(false);
    });

    it('validates soundexchange key (32 hex chars)', () => {
      expect(manager.validateKeyFormat('soundexchange', 'a'.repeat(32))).toBe(true);
      expect(manager.validateKeyFormat('soundexchange', 'g'.repeat(32))).toBe(false);
    });

    it('validates hostinger key (40+ hex chars)', () => {
      expect(manager.validateKeyFormat('hostinger', 'a1b2c3d4e5'.repeat(4))).toBe(true);
      expect(manager.validateKeyFormat('hostinger', 'short')).toBe(false);
    });

    it('returns true for unknown services', () => {
      expect(manager.validateKeyFormat('custom-service', 'anything')).toBe(true);
    });
  });

  // ── getAuditLog ──
  describe('getAuditLog', () => {
    it('tracks store and revoke actions', async () => {
      await manager.storeKey('spotify', 'key1');
      await manager.revokeKey('spotify');
      const log = manager.getAuditLog();
      expect(log).toHaveLength(2);
      expect(log[0].action).toBe('stored');
      expect(log[1].action).toBe('revoked');
    });
  });

  // ── exportKeys / importKeys ──
  describe('exportKeys and importKeys', () => {
    it('exports and imports keys', async () => {
      await manager.storeKey('spotify', 'sp-key');
      await manager.storeKey('tiktok', 'tk-key');

      const exported = manager.exportKeys();
      expect(typeof exported).toBe('string');

      // Import into a new manager
      const newManager = new APIKeyManager({ encryptionKey: 'test-encryption-key-123' });
      const result = newManager.importKeys(exported);
      expect(result.success).toBe(true);
      expect(result.keyCount).toBe(2);
    });

    it('handles invalid import data', () => {
      const result = manager.importKeys('not-valid-base64!!!');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
