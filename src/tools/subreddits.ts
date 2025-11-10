/**
 * Subreddit-related MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Get posts from a subreddit
 */
const getSubredditPosts = async (args: {
  subreddit: string;
  sort?: 'hot' | 'new' | 'top' | 'rising';
  limit?: number;
  after?: string;
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}) => {
  try {
    const client = getRedditClient();
    const subreddit = args.subreddit.replace(/^r\//, ''); // Remove r/ prefix if present
    const sort = args.sort || 'hot';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API
    const time = args.time;

    console.error(`🔍 Fetching ${sort} posts from r/${subreddit}...`);

    const response = await client.getSubredditPosts(
      subreddit,
      sort,
      limit,
      args.after,
      time
    );

    const posts = response.data.children.map((child) => child.data);
    const result = {
      subreddit,
      sort,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        author: post.author,
        score: post.score,
        upvote_ratio: post.upvote_ratio,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        url: post.url,
        permalink: `https://reddit.com${post.permalink}`,
        selftext: post.selftext,
        is_self: post.is_self,
        over_18: post.over_18,
        stickied: post.stickied,
        locked: post.locked,
        archived: post.archived,
      })),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${posts.length} posts from r/${subreddit}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching subreddit posts:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Get subreddit information
 */
const getSubredditInfo = async (args: { subreddit: string }) => {
  try {
    const client = getRedditClient();
    const subreddit = args.subreddit.replace(/^r\//, ''); // Remove r/ prefix if present

    console.error(`🔍 Fetching info for r/${subreddit}...`);

    const info = await client.getSubredditInfo(subreddit);

    const result = {
      id: info.id,
      name: info.display_name,
      title: info.title,
      description: info.description,
      public_description: info.public_description,
      subscribers: info.subscribers,
      active_users: info.active_user_count,
      created_utc: info.created_utc,
      over18: info.over18,
      language: info.lang,
      type: info.subreddit_type,
      url: `https://reddit.com${info.url}`,
    };

    console.error(`✅ Retrieved info for r/${subreddit}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching subreddit info:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const subredditTools: MCPToolDefinition[] = [
  {
    name: 'get_subreddit_posts',
    description:
      'Get posts from a subreddit. Supports sorting by hot, new, top, or rising. Can paginate using the "after" parameter from previous responses.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: {
          type: 'string',
          description: 'Subreddit name (e.g., "programming" or "r/programming")',
        },
        sort: {
          type: 'string',
          enum: ['hot', 'new', 'top', 'rising'],
          description: 'Sort order for posts (default: hot)',
          default: 'hot',
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
          description: 'Time period for top/controversial sorting (required for top sort)',
        },
      },
      required: ['subreddit'],
    },
    handler: getSubredditPosts,
  },
  {
    name: 'get_subreddit_info',
    description: 'Get information about a subreddit including description, subscriber count, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: {
          type: 'string',
          description: 'Subreddit name (e.g., "programming" or "r/programming")',
        },
      },
      required: ['subreddit'],
    },
    handler: getSubredditInfo,
  },
];

