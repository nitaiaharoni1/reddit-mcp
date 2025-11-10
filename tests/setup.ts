/**
 * Jest Test Setup
 * Global configuration and utilities for database testing
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Intelligent SSL handling based on environment and connection string
function configureSSL() {
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'test';

  if (!databaseUrl) {
    return;
  }

  // Parse connection string to determine SSL requirements
  const isLocalhost =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  // Detect cloud providers that commonly use self-signed certificates
  const isCloudProvider =
    databaseUrl.includes('ondigitalocean.com') ||
    databaseUrl.includes('amazonaws.com') ||
    databaseUrl.includes('database.windows.net') ||
    databaseUrl.includes('cloudsql.com') ||
    databaseUrl.includes('herokuapp.com');

  // For testing environments with cloud databases, we need to relax SSL verification
  // to handle self-signed certificates that cloud providers often use
  const shouldRelaxSSL =
    !isLocalhost &&
    isCloudProvider &&
    (nodeEnv === 'test' || nodeEnv === 'development');

  if (shouldRelaxSSL && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    console.warn(
      '⚠️  TLS certificate verification disabled for cloud database in test environment',
    );
    console.warn(
      '   This is safe for testing but should not be used in production',
    );
  }
}

// Configure SSL based on environment
configureSSL();

// Global test timeout for database operations
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
  // Allow time for connections to close
  await new Promise((resolve) => setTimeout(resolve, 500));
});

// Test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDatabaseResult(): R;
      toHaveValidQueryStructure(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidDatabaseResult(received) {
    const pass =
      received &&
      typeof received === 'object' &&
      Array.isArray(received.rows) &&
      typeof received.rowCount === 'number';

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid database result`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to be a valid database result with rows array and rowCount`,
        pass: false,
      };
    }
  },

  toHaveValidQueryStructure(received) {
    const pass =
      received &&
      typeof received === 'object' &&
      received.content &&
      Array.isArray(received.content);

    if (pass) {
      return {
        message: () =>
          `Expected ${received} not to have valid MCP query structure`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to have valid MCP query structure with content array`,
        pass: false,
      };
    }
  },
});

export {};
