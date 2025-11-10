#!/usr/bin/env node

/**
 * Reddit MCP Server
 * Model Context Protocol server for Reddit API integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { initializeReddit } from './src/reddit';
import { getToolDefinitions, handleToolCall } from './src/tools';
import { SERVER_CONFIG } from './src/config/constants';

// Initialize Reddit client
try {
  initializeReddit();
  console.error('✅ Reddit MCP Server initialized');
} catch (error: any) {
  console.error(`⚠️  Warning: ${error.message}`);
  console.error('   Reddit client will be initialized on first tool call');
}

// Create MCP server
const server = new Server(
  {
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getToolDefinitions(),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall({ params: { name, arguments: args } });
    return result;
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// List resources (empty for now)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [],
  };
});

// Read resource (empty for now)
server.setRequestHandler(ReadResourceRequestSchema, async () => {
  throw new Error('No resources available');
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Reddit MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
