/**
 * Front page listing MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Get front page posts
 */
const getFrontPagePosts = async (args: {
  sort?: 'best' | 'hot' | 'new' | 'top' | 'rising' | 'controversial';
  limit?: number;
  after?: string;
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}) => {
  try {
    const client = getRedditClient();
    const sort = args.sort || 'hot';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API
    const time = args.time;

    console.error(`🔍 Fetching ${sort} posts from front page...`);

    const response = await client.getFrontPagePosts(sort, limit, args.after, time);

    const posts = response.data.children.map((child) => child.data);
    const result = {
      sort,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        author: post.author,
        subreddit: post.subreddit,
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

    console.error(`✅ Retrieved ${posts.length} posts from front page`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching front page posts:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const frontPageTools: MCPToolDefinition[] = [
  {
    name: 'get_front_page_posts',
    description:
      'Retrieve posts from Reddit\'s front page (home feed) with multiple sorting options. The front page shows the best content from all your subscribed subreddits (or popular subreddits if not logged in). Supports best (curated), hot (trending), new (recent), top (highest scored), rising (gaining traction), and controversial (divisive) sorting. Essential for browsing Reddit\'s main feed.',
    inputSchema: {
      type: 'object',
      properties: {
        sort: {
          type: 'string',
          enum: ['best', 'hot', 'new', 'top', 'rising', 'controversial'],
          description: 'Sort order for posts: best (curated), hot (trending), new (recent), top (highest scored), rising (gaining traction), controversial (divisive). Default: hot',
          default: 'hot',
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
          description: 'Time period filter for top or controversial sorting (required for top/controversial sort)',
        },
      },
      required: [],
    },
    handler: getFrontPagePosts,
  },
];

