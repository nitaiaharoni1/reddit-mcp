/**
 * MCP (Model Context Protocol) Type Definitions
 */

// MCP Tool Result Content
export interface MCPTextContent {
  type: 'text';
  text: string;
}

export interface MCPImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export type MCPContent = MCPTextContent | MCPImageContent;

// MCP Tool Result
export interface MCPResult {
  content: MCPContent[];
  isError?: boolean;
}

// MCP Tool Input Schema Property
export interface MCPInputProperty {
  type: string;
  description: string;
  default?: any;
  enum?: string[];
  items?: MCPInputProperty;
  properties?: { [key: string]: MCPInputProperty };
  required?: string[];
}

// MCP Tool Input Schema
export interface MCPInputSchema {
  type: 'object';
  properties: { [key: string]: MCPInputProperty };
  required?: string[];
}

// MCP Tool Definition
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: MCPInputSchema;
  handler: (args: any) => Promise<MCPResult>;
}

// MCP Tool Arguments (generic)
export interface MCPToolArgs {
  [key: string]: any;
}

// Reddit-specific tool argument interfaces
export interface GetSubredditPostsArgs extends MCPToolArgs {
  subreddit: string;
  sort?: 'hot' | 'new' | 'top' | 'rising';
  limit?: number;
  after?: string;
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface GetPostCommentsArgs extends MCPToolArgs {
  subreddit: string;
  post_id: string;
  sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa' | 'live';
  limit?: number;
}

export interface SearchRedditArgs extends MCPToolArgs {
  query: string;
  subreddit?: string;
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  after?: string;
}

export interface GetUserInfoArgs extends MCPToolArgs {
  username: string;
}

// MCP Server Configuration
export interface MCPServerConfig {
  name: string;
  version: string;
}

// MCP Error Response
export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

