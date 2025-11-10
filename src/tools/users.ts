/**
 * User-related MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Get user information
 */
const getUserInfo = async (args: { username: string }) => {
  try {
    const client = getRedditClient();
    const username = args.username.replace(/^u\//, ''); // Remove u/ prefix if present

    console.error(`🔍 Fetching info for user ${username}...`);

    const user = await client.getUserInfo(username);

    const result = {
      id: user.id,
      username: user.name,
      created_utc: user.created_utc,
      link_karma: user.link_karma,
      comment_karma: user.comment_karma,
      total_karma: user.link_karma + user.comment_karma,
      is_gold: user.is_gold,
      is_mod: user.is_mod,
      verified: user.verified,
      has_verified_email: user.has_verified_email,
      subreddit: user.subreddit ? {
        display_name: user.subreddit.display_name,
        title: user.subreddit.title,
        description: user.subreddit.description,
      } : null,
    };

    console.error(`✅ Retrieved info for user ${username}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching user info:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Get user's posts
 */
const getUserPosts = async (args: {
  username: string;
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  limit?: number;
  after?: string;
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}) => {
  try {
    const client = getRedditClient();
    const username = args.username.replace(/^u\//, ''); // Remove u/ prefix if present
    const sort = args.sort || 'new';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API
    const time = args.time;

    console.error(`🔍 Fetching posts by user ${username}...`);

    const response = await client.getUserPosts(username, sort, limit, args.after, time);

    const posts = response.data.children.map((child) => child.data);
    const result = {
      username,
      sort,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        url: post.url,
        permalink: `https://reddit.com${post.permalink}`,
        selftext: post.selftext?.substring(0, 500), // Truncate long text
        over_18: post.over_18,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${posts.length} posts by ${username}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching user posts:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Get user's comments
 */
const getUserComments = async (args: {
  username: string;
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  limit?: number;
  after?: string;
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}) => {
  try {
    const client = getRedditClient();
    const username = args.username.replace(/^u\//, ''); // Remove u/ prefix if present
    const sort = args.sort || 'new';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API
    const time = args.time;

    console.error(`🔍 Fetching comments by user ${username}...`);

    const response = await client.getUserComments(username, sort, limit, args.after, time);

    const comments = response.data.children.map((child) => child.data);
    const result = {
      username,
      sort,
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body?.substring(0, 500), // Truncate long text
        subreddit: comment.subreddit,
        score: comment.score,
        created_utc: comment.created_utc,
        permalink: `https://reddit.com${comment.permalink}`,
        link_id: comment.link_id,
        parent_id: comment.parent_id,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${comments.length} comments by ${username}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching user comments:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const userTools: MCPToolDefinition[] = [
  {
    name: 'get_user_info',
    description: 'Get information about a Reddit user including karma, account age, and profile details.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Reddit username (can include u/ prefix or just the username)',
        },
      },
      required: ['username'],
    },
    handler: getUserInfo,
  },
  {
    name: 'get_user_posts',
    description: 'Get posts submitted by a specific Reddit user. Supports sorting and pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Reddit username (can include u/ prefix or just the username)',
        },
        sort: {
          type: 'string',
          enum: ['hot', 'new', 'top', 'controversial'],
          description: 'Sort order for posts (default: new)',
          default: 'new',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period for top/controversial sorting',
        },
      },
      required: ['username'],
    },
    handler: getUserPosts,
  },
  {
    name: 'get_user_comments',
    description: 'Get comments made by a specific Reddit user. Supports sorting and pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Reddit username (can include u/ prefix or just the username)',
        },
        sort: {
          type: 'string',
          enum: ['hot', 'new', 'top', 'controversial'],
          description: 'Sort order for comments (default: new)',
          default: 'new',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period for top/controversial sorting',
        },
      },
      required: ['username'],
    },
    handler: getUserComments,
  },
];

