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
    let username = args.username.replace(/^u\//, ''); // Remove u/ prefix if present
    
    // If username is "me" or empty, get current authenticated user
    if (username === 'me' || !username) {
      try {
        const currentUser = await client.getMe();
        username = currentUser.name;
        console.error(`🔍 Using current authenticated user: ${username}`);
      } catch (error: any) {
        // Fallback to configured username from environment
        const configUsername = process.env.REDDIT_USERNAME;
        if (configUsername) {
          username = configUsername;
          console.error(`🔍 Using configured username: ${username}`);
        } else {
          throw new Error('No username provided and unable to determine current user. Please provide a username or ensure REDDIT_USERNAME is set.');
        }
      }
    }
    
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

/**
 * Get user overview (posts and comments combined)
 */
const getUserOverview = async (args: {
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

    console.error(`🔍 Fetching overview for user ${username}...`);

    const response = await client.getUserOverview(username, sort, limit, args.after, time);

    const items = response.data.children.map((child) => child.data);
    const result = {
      username,
      sort,
      items: items.map((item: any) => {
        // Determine if it's a post or comment
        const isPost = 'title' in item;
        if (isPost) {
          return {
            type: 'post',
            id: item.id,
            title: item.title,
            subreddit: item.subreddit,
            score: item.score,
            num_comments: item.num_comments,
            created_utc: item.created_utc,
            url: item.url,
            permalink: `https://reddit.com${item.permalink}`,
            selftext: item.selftext?.substring(0, 500),
            over_18: item.over_18,
          };
        } else {
          return {
            type: 'comment',
            id: item.id,
            body: item.body?.substring(0, 500),
            subreddit: item.subreddit,
            score: item.score,
            created_utc: item.created_utc,
            permalink: `https://reddit.com${item.permalink}`,
            link_id: item.link_id,
            parent_id: item.parent_id,
          };
        }
      }),
      pagination: {
        after: response.data.after,
        before: response.data.before,
        count: response.data.dist,
      },
    };

    console.error(`✅ Retrieved ${items.length} items from ${username}'s overview`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching user overview:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const userTools: MCPToolDefinition[] = [
  {
    name: 'reddit_get_user_info',
    description: 'Retrieve comprehensive profile information about a Reddit user including their karma scores (link and comment karma), account creation date, verification status, moderator status, and profile metadata. Useful for understanding a user\'s reputation and activity level on Reddit.',
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
    name: 'reddit_get_user_posts',
    description: 'Fetch all posts submitted by a specific Reddit user across all subreddits. Supports multiple sorting options (hot, new, top, controversial) and time-based filtering. Includes pagination for browsing through a user\'s entire post history. Perfect for analyzing a user\'s contributions or finding their best content. Use "me" as username to get posts from the current authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Reddit username (can include u/ prefix or just the username). Use "me" to get posts from the current authenticated user.',
        },
        sort: {
          type: 'string',
          enum: ['hot', 'new', 'top', 'controversial'],
          description: 'Sort order for posts: hot (trending), new (recent), top (highest scored), controversial (divisive). Default: new',
          default: 'new',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period filter for top or controversial sorting',
        },
      },
      required: ['username'],
    },
    handler: getUserPosts,
  },
  {
    name: 'reddit_get_user_comments',
    description: 'Retrieve all comments made by a specific Reddit user across all subreddits. Supports multiple sorting options and time-based filtering. Includes pagination for browsing through a user\'s entire comment history. Useful for understanding a user\'s discussion participation and finding their most engaging comments.',
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
          description: 'Sort order for comments: hot (trending), new (recent), top (highest scored), controversial (divisive). Default: new',
          default: 'new',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period filter for top or controversial sorting',
        },
      },
      required: ['username'],
    },
    handler: getUserComments,
  },
  {
    name: 'reddit_get_user_overview',
    description: 'Get a combined feed of a user\'s posts and comments together, sorted chronologically or by score. This provides a unified view of all user activity across Reddit. Perfect for getting a complete picture of a user\'s contributions in a single request.',
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
          description: 'Sort order for items: hot (trending), new (recent), top (highest scored), controversial (divisive). Default: new',
          default: 'new',
        },
        limit: {
          type: 'number',
          description: 'Number of items to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page of results',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period filter for top or controversial sorting',
        },
      },
      required: ['username'],
    },
    handler: getUserOverview,
  },
];

