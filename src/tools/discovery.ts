/**
 * Subreddit discovery MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Get popular subreddits
 */
const getPopularSubreddits = async (args: {
  limit?: number;
  after?: string;
}) => {
  try {
    const client = getRedditClient();
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API

    console.error(`🔍 Fetching popular subreddits...`);

    const response = await client.getPopularSubreddits(limit, args.after);

    const subreddits = response.data.children.map((child) => child.data);
    const result = {
      subreddits: subreddits.map((sub) => ({
        id: sub.id,
        name: sub.display_name,
        title: sub.title,
        description: sub.public_description,
        subscribers: sub.subscribers,
        active_users: sub.active_user_count,
        created_utc: sub.created_utc,
        over18: sub.over18,
        type: sub.subreddit_type,
        url: `https://reddit.com${sub.url}`,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${subreddits.length} popular subreddits`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching popular subreddits:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Get new subreddits
 */
const getNewSubreddits = async (args: {
  limit?: number;
  after?: string;
}) => {
  try {
    const client = getRedditClient();
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API

    console.error(`🔍 Fetching new subreddits...`);

    const response = await client.getNewSubreddits(limit, args.after);

    const subreddits = response.data.children.map((child) => child.data);
    const result = {
      subreddits: subreddits.map((sub) => ({
        id: sub.id,
        name: sub.display_name,
        title: sub.title,
        description: sub.public_description,
        subscribers: sub.subscribers,
        active_users: sub.active_user_count,
        created_utc: sub.created_utc,
        over18: sub.over18,
        type: sub.subreddit_type,
        url: `https://reddit.com${sub.url}`,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${subreddits.length} new subreddits`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching new subreddits:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Search subreddits
 */
const searchSubreddits = async (args: {
  query: string;
  limit?: number;
  after?: string;
}) => {
  try {
    const client = getRedditClient();
    const query = args.query;
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API

    console.error(`🔍 Searching subreddits for: "${query}"...`);

    const response = await client.searchSubreddits(query, limit, args.after);

    const subreddits = response.data.children.map((child) => child.data);
    const result = {
      query,
      subreddits: subreddits.map((sub) => ({
        id: sub.id,
        name: sub.display_name,
        title: sub.title,
        description: sub.public_description,
        subscribers: sub.subscribers,
        active_users: sub.active_user_count,
        created_utc: sub.created_utc,
        over18: sub.over18,
        type: sub.subreddit_type,
        url: `https://reddit.com${sub.url}`,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Found ${subreddits.length} subreddits matching "${query}"`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error searching subreddits:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const discoveryTools: MCPToolDefinition[] = [
  {
    name: 'get_popular_subreddits',
    description:
      'Discover the most popular and active subreddits on Reddit. Returns a list of subreddits sorted by popularity and activity, including subscriber counts, descriptions, and metadata. Perfect for finding trending communities and exploring what\'s popular on Reddit.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of subreddits to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
      },
      required: [],
    },
    handler: getPopularSubreddits,
  },
  {
    name: 'get_new_subreddits',
    description:
      'Find newly created subreddits on Reddit. Returns recently established communities sorted by creation date. Useful for discovering fresh communities and getting in early on new subreddits.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of subreddits to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
      },
      required: [],
    },
    handler: getNewSubreddits,
  },
  {
    name: 'search_subreddits',
    description:
      'Search for subreddits by name or description. Finds communities matching your search query, including their subscriber counts, descriptions, and metadata. Essential for discovering subreddits when you know what topic you\'re interested in but not the exact subreddit name.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find matching subreddits (searches names and descriptions)',
        },
        limit: {
          type: 'number',
          description: 'Number of results to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
      },
      required: ['query'],
    },
    handler: searchSubreddits,
  },
];

