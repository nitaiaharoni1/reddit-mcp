/**
 * Server CLI Integration Tests
 * Tests to ensure CLI commands work without triggering database connections
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

describe('Server CLI Integration', () => {
  const serverPath = path.join(__dirname, '..', 'dist', 'server.js');

  beforeAll(async () => {
    // Ensure the server is built
    try {
      await execAsync('npm run build');
    } catch (error) {
      console.warn('Build failed, but continuing with tests:', error);
    }
  });

  describe('CLI Commands (no database connection required)', () => {
    test('--help should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} --help`, {
        env: { ...process.env, DATABASE_URL: undefined },
      });

      expect(stdout).toContain('Claude Multi-Database MCP Server');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('database-mcp');
      expect(stdout).toContain('--help');
      expect(stdout).toContain('--version');
      expect(stdout).toContain('--setup');
      expect(stderr).toBe('');
    }, 10000);

    test('--version should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --version`,
        {
          env: { ...process.env, DATABASE_URL: undefined },
        },
      );

      expect(stdout).toMatch(/database-mcp v\d+\.\d+\.\d+/);
      expect(stderr).toBe('');
    }, 10000);

    test('--configure should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --configure`,
        {
          env: { ...process.env, DATABASE_URL: undefined },
        },
      );

      expect(stdout).toContain('Configuration Instructions');
      expect(stdout).toContain('DATABASE_URL');
      expect(stdout).toContain('Claude Desktop');
      expect(stderr).toBe('');
    }, 10000);

    test('--find-config should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --find-config`,
        {
          env: { ...process.env, DATABASE_URL: undefined },
        },
      );

      expect(stdout).toContain('Claude Desktop config location:');
      expect(stderr).toBe('');
    }, 10000);

    test('-h flag should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} -h`, {
        env: { ...process.env, DATABASE_URL: undefined },
      });

      expect(stdout).toContain('Claude Multi-Database MCP Server');
      expect(stderr).toBe('');
    }, 10000);

    test('-v flag should work without DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} -v`, {
        env: { ...process.env, DATABASE_URL: undefined },
      });

      expect(stdout).toMatch(/database-mcp v\d+\.\d+\.\d+/);
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Server startup (database connection required)', () => {
    test('should require DATABASE_URL for server startup', async () => {
      try {
        // Create a clean environment without DATABASE_URL
        const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
        await execAsync(`node ${serverPath}`, {
          env: cleanEnv,
          timeout: 5000,
          cwd: '/tmp', // Run from a different directory to avoid .env file
        });
        fail('Expected command to fail without DATABASE_URL');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        expect(output).toContain(
          'DATABASE_URL environment variable is required',
        );
        expect(output).toContain('Use --help for configuration instructions');
      }
    }, 10000);

    test('should show help suggestion when DATABASE_URL is missing', async () => {
      try {
        // Create a clean environment without DATABASE_URL
        const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
        await execAsync(`node ${serverPath}`, {
          env: cleanEnv,
          timeout: 5000,
          cwd: '/tmp', // Run from a different directory to avoid .env file
        });
        fail('Expected command to fail without DATABASE_URL');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        expect(output).toContain('--help');
      }
    }, 10000);
  });

  describe('Setup command behavior', () => {
    test('--setup should require DATABASE_URL', async () => {
      // Create a clean environment without DATABASE_URL
      const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
      const { stdout, stderr } = await execAsync(`node ${serverPath} --setup`, {
        env: cleanEnv,
        cwd: '/tmp', // Run from a different directory to avoid .env file
      });

      expect(stdout).toContain('DATABASE_URL is required');
      expect(stdout).toContain('export DATABASE_URL');
      expect(stdout).toContain('database-mcp init');
      expect(stderr).toBe('');
    }, 10000);

    test('--setup should detect invalid DATABASE_URL', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} --setup`, {
        env: { ...process.env, DATABASE_URL: 'invalid-connection-string' },
      });

      expect(stdout).toContain('Invalid DATABASE_URL');
      expect(stderr).toBe('');
    }, 10000);

    test('--setup should work with valid PostgreSQL URL', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} --setup`, {
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        },
      });

      expect(stdout).toContain('Setting up database-mcp');
      expect(stdout).toContain('Valid postgresql connection string detected');
      // Note: Config file writing might fail in CI, but validation should work
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Unknown commands', () => {
    test('should fall through to server startup for unknown commands', async () => {
      try {
        // Create a clean environment without DATABASE_URL
        const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
        await execAsync(`node ${serverPath} --unknown-command`, {
          env: cleanEnv,
          timeout: 5000,
          cwd: '/tmp', // Run from a different directory to avoid .env file
        });
        fail('Expected command to fail without DATABASE_URL');
      } catch (error: any) {
        // Should try to start server and fail due to missing DATABASE_URL
        const output = error.stdout || error.stderr || '';
        expect(output).toContain(
          'DATABASE_URL environment variable is required',
        );
      }
    }, 10000);
  });

  describe('Command precedence', () => {
    test('first valid CLI command should take precedence', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --help --version`,
        {
          env: { ...process.env, DATABASE_URL: undefined },
        },
      );

      // Should show help, not version
      expect(stdout).toContain('Claude Multi-Database MCP Server');
      expect(stdout).toContain('Usage:');
      expect(stdout).not.toMatch(/^database-mcp v\d+\.\d+\.\d+$/m);
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Exit codes', () => {
    test('CLI commands should exit with code 0', async () => {
      const { stdout } = await execAsync(`node ${serverPath} --help`, {
        env: { ...process.env, DATABASE_URL: undefined },
      });

      expect(stdout).toContain('Claude Multi-Database MCP Server');
    }, 10000);

    test('missing DATABASE_URL should exit with non-zero code', async () => {
      try {
        // Create a clean environment without DATABASE_URL
        const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
        await execAsync(`node ${serverPath}`, {
          env: cleanEnv,
          timeout: 5000,
          cwd: '/tmp', // Run from a different directory to avoid .env file
        });
        fail('Expected command to fail');
      } catch (error: any) {
        expect(error.code).not.toBe(0);
      }
    }, 10000);
  });

  describe('Error handling in CLI', () => {
    test('should handle filesystem permission errors gracefully', async () => {
      // Test --find-config with potential permission issues
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --find-config`,
        {
          env: { ...process.env, DATABASE_URL: undefined, HOME: '/root' },
        },
      );

      // Should not crash, even if config file access fails
      expect(stdout).toContain('Claude Desktop config location:');
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Init command behavior', () => {
    test('init should work with connection string argument', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} init "postgresql://user:pass@localhost:5432/testdb"`,
        {
          env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        },
      );

      expect(stdout).toContain('Setting up database-mcp');
      expect(stdout).toContain('Valid postgresql connection string detected');
      // Note: Config file writing might fail in CI, but validation should work
      expect(stderr).toBe('');
    }, 10000);

    test('init should require connection string when no env var', async () => {
      // Create a clean environment without DATABASE_URL
      const cleanEnv = { PATH: process.env.PATH, NODE_ENV: 'test' };
      const { stdout, stderr } = await execAsync(`node ${serverPath} init`, {
        env: cleanEnv,
        cwd: '/tmp', // Run from a different directory to avoid .env file
      });

      expect(stdout).toContain('DATABASE_URL is required');
      expect(stdout).toContain('export DATABASE_URL');
      expect(stdout).toContain('database-mcp init');
      expect(stderr).toBe('');
    }, 10000);

    test('init should fallback to DATABASE_URL env var', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} init`, {
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        },
      });

      expect(stdout).toContain('Setting up database-mcp');
      expect(stdout).toContain('Valid postgresql connection string detected');
      expect(stderr).toBe('');
    }, 10000);

    test('init should detect invalid connection string', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} init "invalid-connection-string"`,
        {
          env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        },
      );

      expect(stdout).toContain('Invalid DATABASE_URL');
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Status command behavior', () => {
    test('status should show configuration details', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} status`, {
        env: { PATH: process.env.PATH, NODE_ENV: 'test' },
      });

      expect(stdout).toContain('Current Database Configuration Status');
      expect(stdout).toContain('Config file:');
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Update command behavior', () => {
    test('update should require connection string', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} update`, {
        env: { PATH: process.env.PATH, NODE_ENV: 'test' },
      });

      expect(stdout).toContain('Connection string is required');
      expect(stdout).toContain('Usage:');
      expect(stderr).toBe('');
    }, 10000);

    test('update should validate connection string', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} update "postgresql://user:pass@localhost:5432/testdb"`,
        {
          env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        },
      );

      expect(stdout).toContain('Updating database connection');
      expect(stdout).toContain('Valid postgresql connection string detected');
      expect(stderr).toBe('');
    }, 10000);

    test('update should detect invalid connection string', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} update "invalid-connection-string"`,
        {
          env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        },
      );

      expect(stdout).toContain('Invalid connection string');
      expect(stderr).toBe('');
    }, 10000);
  });

  describe('Deprecation warnings', () => {
    test('--setup should show deprecation warning', async () => {
      const { stdout, stderr } = await execAsync(`node ${serverPath} --setup`, {
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        },
      });

      expect(stdout).toContain('WARNING: --setup is deprecated');
      expect(stdout).toContain('Use "database-mcp init" instead');
      expect(stderr).toBe('');
    }, 10000);

    test('--configure should show deprecation warning', async () => {
      const { stdout, stderr } = await execAsync(
        `node ${serverPath} --configure`,
        {
          env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        },
      );

      expect(stdout).toContain('WARNING: --configure is deprecated');
      expect(stdout).toContain('Use "database-mcp init" instead');
      expect(stdout).toContain('Configuration Instructions');
      expect(stderr).toBe('');
    }, 10000);
  });
});
