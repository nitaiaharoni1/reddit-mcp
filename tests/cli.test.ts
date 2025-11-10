/**
 * CLI Tests
 * Tests for command-line interface functionality
 */

// Mock database modules to prevent SQLite3 loading issues
jest.mock('../src/database', () => ({
  detectDatabaseType: jest.fn(),
  validateConnectionString: jest.fn(),
  getConnectionStringExamples: jest.fn(() => ({
    postgresql: ['postgresql://user:pass@localhost/db'],
    mysql: ['mysql://user:pass@localhost/db'],
    sqlite: ['./database.db'],
  })),
}));

// Mock package.json require
jest.mock(
  '../../package.json',
  () => ({
    version: '1.2.2',
  }),
  { virtual: true },
);

import { handleCliCommands } from '../src/cli';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { detectDatabaseType, validateConnectionString } from '../src/database';

// Mock file system operations
jest.mock('fs');
jest.mock('path');
jest.mock('os');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockOs = os as jest.Mocked<typeof os>;
const mockDetectDatabaseType = detectDatabaseType as jest.MockedFunction<
  typeof detectDatabaseType
>;
const mockValidateConnectionString =
  validateConnectionString as jest.MockedFunction<
    typeof validateConnectionString
  >;

describe('CLI Module', () => {
  let consoleSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Reset mocks
    jest.clearAllMocks();

    // Reset specific mocks to default behavior
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.writeFileSync.mockImplementation();
    mockFs.mkdirSync.mockImplementation();
    mockPath.join.mockReturnValue('/mocked/config/claude_desktop_config.json');
    mockPath.dirname.mockReturnValue('/mocked/config');
    mockOs.platform.mockReturnValue('darwin');
    mockOs.homedir.mockReturnValue('/mocked/home');
    mockDetectDatabaseType.mockReturnValue('postgresql');
    mockValidateConnectionString.mockReturnValue({ isValid: true, errors: [] });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('handleCliCommands', () => {
    test('should handle --help command', () => {
      const result = handleCliCommands(['--help']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Multi-Database MCP Server'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Usage (NPX - Recommended):'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp'),
      );
    });

    test('should handle -h flag', () => {
      const result = handleCliCommands(['-h']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Multi-Database MCP Server'),
      );
    });

    test('should handle --version command', () => {
      const result = handleCliCommands(['--version']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/database-mcp v\d+\.\d+\.\d+/),
      );
    });

    test('should handle -v flag', () => {
      const result = handleCliCommands(['-v']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/database-mcp v\d+\.\d+\.\d+/),
      );
    });

    test('should handle --configure command', () => {
      const result = handleCliCommands(['--configure']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration Instructions:'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL'),
      );
    });

    test('should handle --find-config command', () => {
      // Mock the path operations
      mockPath.join.mockReturnValue(
        '/mocked/config/path/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(false);

      const result = handleCliCommands(['--find-config']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Desktop config location:'),
      );
    });

    test('should handle empty arguments', () => {
      const result = handleCliCommands([]);
      expect(result).toBe(false);
    });

    test('should handle unknown arguments', () => {
      const result = handleCliCommands(['--unknown']);
      expect(result).toBe(false);
    });

    test('should handle --setup command without DATABASE_URL', () => {
      // Mock environment variable not being set
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      const result = handleCliCommands(['--setup']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL is required'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      }
    });

    test('should handle --setup command with valid DATABASE_URL', () => {
      // Mock environment and file system
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"mcpServers":{}}');
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands(['--setup']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setting up database-mcp'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      } else {
        delete process.env.DATABASE_URL;
      }
    });

    test('should handle setup with cloud database', () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.digitalocean.com:5432/db';

      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands(['--setup']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setup complete'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      } else {
        delete process.env.DATABASE_URL;
      }
    });

    test('should handle setup with invalid DATABASE_URL', () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'invalid-connection-string';

      // Mock database validation to throw error
      mockDetectDatabaseType.mockImplementation(() => {
        throw new Error('Invalid connection string');
      });

      const result = handleCliCommands(['--setup']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid DATABASE_URL'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      } else {
        delete process.env.DATABASE_URL;
      }
    });

    test('should handle init command with connection string argument', () => {
      // Mock file system
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"mcpServers":{}}');
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands([
        'init',
        'postgresql://user:pass@localhost:5432/testdb',
      ]);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setting up database-mcp'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Valid postgresql connection string detected'),
      );
    });

    test('should handle init command without arguments (fallback to env)', () => {
      // Mock environment and file system
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"mcpServers":{}}');
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands(['init']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setting up database-mcp'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      } else {
        delete process.env.DATABASE_URL;
      }
    });

    test('should handle init command without connection string or env var', () => {
      // Mock environment variable not being set
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      const result = handleCliCommands(['init']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL is required'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Provide it as an argument:'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp init'),
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      }
    });

    test('should handle init command with invalid connection string', () => {
      // Mock database validation to throw error
      mockDetectDatabaseType.mockImplementation(() => {
        throw new Error('Invalid connection string');
      });

      const result = handleCliCommands(['init', 'invalid-connection-string']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid DATABASE_URL'),
      );
    });

    test('should handle init command with cloud database', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands([
        'init',
        'postgresql://user:pass@db.digitalocean.com:5432/db',
      ]);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setup complete'),
      );
    });

    test('should handle status command', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'database-mcp': {
              command: 'database-mcp',
              env: {
                DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
              },
            },
          },
        }),
      );

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands(['status']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Current Database Configuration Status'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp server is configured'),
      );
    });

    test('should handle status command with no config', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(false);

      const result = handleCliCommands(['status']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Desktop config file does not exist'),
      );
    });

    test('should handle update command with valid connection string', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"mcpServers":{}}');
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('mysql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands([
        'update',
        'mysql://user:pass@localhost:3306/newdb',
      ]);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Updating database connection'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Valid mysql connection string detected'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration updated successfully'),
      );
    });

    test('should handle update command without connection string', () => {
      const result = handleCliCommands(['update']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Connection string is required'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp update'),
      );
    });

    test('should handle update command with invalid connection string', () => {
      // Mock database validation to throw error
      mockDetectDatabaseType.mockImplementation(() => {
        throw new Error('Invalid connection string');
      });

      const result = handleCliCommands(['update', 'invalid-connection']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid connection string'),
      );
    });

    test('should show deprecation warning for --setup', () => {
      // Mock environment variable
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockPath.dirname.mockReturnValue('/mocked/config');
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"mcpServers":{}}');
      mockFs.writeFileSync.mockImplementation();

      // Mock database validation
      mockDetectDatabaseType.mockReturnValue('postgresql');
      mockValidateConnectionString.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = handleCliCommands(['--setup']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️  WARNING: --setup is deprecated. Use "database-mcp init" instead.',
      );

      // Restore environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv;
      } else {
        delete process.env.DATABASE_URL;
      }
    });

    test('should show deprecation warning for --configure', () => {
      const result = handleCliCommands(['--configure']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️  WARNING: --configure is deprecated. Use "database-mcp init" instead.',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration Instructions'),
      );
    });
  });

  describe('Configuration file detection', () => {
    test('should detect existing config file with database-mcp server', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'database-mcp': {
              command: 'database-mcp',
              env: { DATABASE_URL: 'postgresql://test' },
            },
          },
        }),
      );

      const result = handleCliCommands(['--find-config']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp server already configured'),
      );
    });

    test('should detect existing config file without database-mcp server', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'other-server': { command: 'other' },
          },
        }),
      );

      const result = handleCliCommands(['--find-config']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('database-mcp server not configured'),
      );
    });

    test('should handle non-existent config file', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(false);

      const result = handleCliCommands(['--find-config']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Config file does not exist'),
      );
    });

    test('should handle corrupted config file', () => {
      mockPath.join.mockReturnValue(
        '/mocked/config/claude_desktop_config.json',
      );
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/mocked/home');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      const result = handleCliCommands(['--find-config']);
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Config file exists but cannot be parsed'),
      );
    });
  });

  describe('Platform-specific config paths', () => {
    test('should return correct path for macOS', () => {
      mockOs.platform.mockReturnValue('darwin');
      mockOs.homedir.mockReturnValue('/Users/testuser');
      mockPath.join.mockReturnValue(
        '/Users/testuser/Library/Application Support/Claude/claude_desktop_config.json',
      );

      handleCliCommands(['--find-config']);
      expect(mockPath.join).toHaveBeenCalledWith(
        '/Users/testuser',
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json',
      );
    });

    test('should return correct path for Windows', () => {
      mockOs.platform.mockReturnValue('win32');
      mockPath.join.mockReturnValue(
        'C:\\Users\\testuser\\AppData\\Roaming\\Claude\\claude_desktop_config.json',
      );
      process.env.APPDATA = 'C:\\Users\\testuser\\AppData\\Roaming';

      handleCliCommands(['--find-config']);
      expect(mockPath.join).toHaveBeenCalledWith(
        '/mocked/home',
        'AppData',
        'Roaming',
        'Claude',
        'claude_desktop_config.json',
      );
    });

    test('should return correct path for Linux', () => {
      mockOs.platform.mockReturnValue('linux');
      mockOs.homedir.mockReturnValue('/home/testuser');
      mockPath.join.mockReturnValue(
        '/home/testuser/.config/claude/claude_desktop_config.json',
      );

      handleCliCommands(['--find-config']);
      expect(mockPath.join).toHaveBeenCalledWith(
        '/home/testuser',
        '.config',
        'Claude',
        'claude_desktop_config.json',
      );
    });
  });

  describe('Help content validation', () => {
    test('should include all required information in help', () => {
      handleCliCommands(['--help']);

      const helpOutput = consoleSpy.mock.calls
        .map((call) => call[0])
        .join('\n');

      // Check for essential help content
      expect(helpOutput).toContain('Claude Multi-Database MCP Server');
      expect(helpOutput).toContain('Usage (NPX - Recommended):');
      expect(helpOutput).toContain('Options:');
      expect(helpOutput).toContain('--help');
      expect(helpOutput).toContain('--version');
      expect(helpOutput).toContain('--find-config');
      expect(helpOutput).toContain('init');
      expect(helpOutput).toContain('status');
      expect(helpOutput).toContain('update');
      expect(helpOutput).toContain('--configure');
      expect(helpOutput).toContain('--setup');
      expect(helpOutput).toContain('DEPRECATED');
      expect(helpOutput).toContain('DATABASE_URL');
      expect(helpOutput).toContain('PostgreSQL');
      expect(helpOutput).toContain('MySQL');
      expect(helpOutput).toContain('SQLite');
      expect(helpOutput).toContain('Quick Start');
      expect(helpOutput).toContain('Examples (NPX):');
      expect(helpOutput).toContain('database-mcp init');
      expect(helpOutput).toContain('database-mcp status');
      expect(helpOutput).toContain('database-mcp update');
    });

    test('should include configuration instructions in configure command', () => {
      handleCliCommands(['--configure']);

      const configOutput = consoleSpy.mock.calls
        .map((call) => call[0])
        .join('\n');

      expect(configOutput).toContain('Configuration Instructions');
      expect(configOutput).toContain('DATABASE_URL');
      expect(configOutput).toContain('Claude Desktop');
      expect(configOutput).toContain('mcpServers');
      expect(configOutput).toContain('Restart Claude Desktop');
    });
  });
});

describe('CLI Error Handling', () => {
  test('should handle file system errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock file system error
    mockFs.existsSync.mockImplementation(() => {
      throw new Error('File system error');
    });

    // Should not throw, but handle gracefully
    expect(() => {
      handleCliCommands(['--find-config']);
    }).not.toThrow();

    // Should show graceful error message
    expect(consoleSpy).toHaveBeenCalledWith('⚠️  Unable to check config file');
    expect(consoleSpy).toHaveBeenCalledWith(
      '💡 Run --setup to create configuration',
    );

    consoleSpy.mockRestore();
  });
});

describe('Integration with server.ts', () => {
  test('should properly separate CLI commands from server startup', () => {
    // Reset mocks to clean state for this test
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.writeFileSync.mockImplementation();
    mockFs.mkdirSync.mockImplementation();

    // This test verifies that CLI commands return true to indicate
    // they were handled and should exit before server startup

    const cliCommands = [
      '--help',
      '-h',
      '--version',
      '-v',
      '--configure',
      '--find-config',
    ];

    cliCommands.forEach((command) => {
      const result = handleCliCommands([command]);
      expect(result).toBe(true);
    });

    // Test init, status, update, and --setup commands separately (they need special setup)
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const initResult = handleCliCommands(['init']);
    expect(initResult).toBe(true);

    const statusResult = handleCliCommands(['status']);
    expect(statusResult).toBe(true);

    const updateResult = handleCliCommands([
      'update',
      'mysql://user:pass@localhost:3306/newdb',
    ]);
    expect(updateResult).toBe(true);

    const setupResult = handleCliCommands(['--setup']);
    expect(setupResult).toBe(true);

    // Restore environment
    if (originalEnv) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }

    // Non-CLI arguments should return false to proceed with server startup
    expect(handleCliCommands([])).toBe(false);
    expect(handleCliCommands(['--unknown'])).toBe(false);
  });
});
