/**
 * Application Constants
 */

import { MCPServerConfig } from '../types/mcp';

// Reddit API limits
export const REDDIT_LIMITS = {
  MAX_POSTS_PER_REQUEST: 100,
  MAX_COMMENTS_PER_REQUEST: 100,
  DEFAULT_POSTS_LIMIT: 25,
  DEFAULT_COMMENTS_LIMIT: 25,
  RATE_LIMIT_REQUESTS_PER_MINUTE: 100,
} as const;

// Server configuration
export const SERVER_CONFIG: MCPServerConfig = {
  name: 'reddit-mcp',
  version: '1.0.0',
} as const;

// Reddit API base URLs
export const REDDIT_API_URLS = {
  OAUTH: 'https://www.reddit.com/api/v1/access_token',
  API: 'https://oauth.reddit.com',
  WWW: 'https://www.reddit.com',
} as const;

// Tool categories for Reddit operations
export const TOOL_CATEGORIES = {
  SUBREDDITS: 'Subreddit Operations',
  POSTS: 'Post Operations',
  COMMENTS: 'Comment Operations',
  SEARCH: 'Search Operations',
  USERS: 'User Operations',
} as const;
