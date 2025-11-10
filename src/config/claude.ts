/**
 * Claude Desktop Configuration Helper
 * Handles configuration file management for Claude Desktop integration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ClaudeConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args?: string[];
      env?: {
        [key: string]: string;
      };
    };
  };
}

/**
 * Get the path to Claude Desktop configuration file
 */
export function getClaudeConfigPath(): string {
  const homeDir = os.homedir();
  const platform = os.platform();

  switch (platform) {
    case 'darwin': // macOS
      return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'win32': // Windows
      return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    case 'linux': // Linux
      return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Generate Claude Desktop configuration for NPX usage
 */
export function generateNpxConfig(databaseUrl: string): ClaudeConfig {
  return {
    mcpServers: {
      'database-mcp': {
        command: 'npx',
        args: ['database-mcp'],
        env: {
          DATABASE_URL: databaseUrl
        }
      }
    }
  };
}

/**
 * Generate Claude Desktop configuration for global installation
 */
export function generateGlobalConfig(databaseUrl: string): ClaudeConfig {
  return {
    mcpServers: {
      'database-mcp': {
        command: 'database-mcp',
        env: {
          DATABASE_URL: databaseUrl
        }
      }
    }
  };
}

/**
 * Generate Claude Desktop configuration for local development
 */
export function generateLocalConfig(databaseUrl: string, projectPath: string): ClaudeConfig {
  return {
    mcpServers: {
      'database-mcp': {
        command: 'node',
        args: [path.join(projectPath, 'dist', 'server.js')],
        env: {
          DATABASE_URL: databaseUrl
        }
      }
    }
  };
}

/**
 * Read existing Claude Desktop configuration
 */
export function readClaudeConfig(): ClaudeConfig | null {
  const configPath = getClaudeConfigPath();
  
  try {
    if (!fs.existsSync(configPath)) {
      return null;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error reading Claude config:', error);
    return null;
  }
}

/**
 * Write Claude Desktop configuration
 */
export function writeClaudeConfig(config: ClaudeConfig): boolean {
  const configPath = getClaudeConfigPath();
  
  try {
    // Ensure config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write config file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing Claude config:', error);
    return false;
  }
}

/**
 * Merge database-mcp configuration into existing Claude config
 */
export function mergeClaudeConfig(databaseUrl: string, useNpx: boolean = true): boolean {
  try {
    let existingConfig = readClaudeConfig();
    
    if (!existingConfig) {
      existingConfig = { mcpServers: {} };
    }
    
    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
    }
    
    // Generate the appropriate configuration
    const newConfig = useNpx 
      ? generateNpxConfig(databaseUrl)
      : generateGlobalConfig(databaseUrl);
    
    // Merge database-mcp server configuration
    existingConfig.mcpServers['database-mcp'] = newConfig.mcpServers['database-mcp'];
    
    return writeClaudeConfig(existingConfig);
  } catch (error) {
    console.error('Error merging Claude config:', error);
    return false;
  }
}
