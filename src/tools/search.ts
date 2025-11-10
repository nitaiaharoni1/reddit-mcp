/**
 * Search-related MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Search Reddit
 */
const searchReddit = async (args: {
  query: string;
  subreddit?: string;
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  after?: string;
}) => {
  try {
    const client = getRedditClient();
    const query = args.query;
    const subreddit = args.subreddit?.replace(/^r\//, ''); // Remove r/ prefix if present
    const sort = args.sort || 'relevance';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API
    const time = args.time;

    console.error(`🔍 Searching Reddit for: "${query}"${subreddit ? ` in r/${subreddit}` : ''}...`);

    const response = await client.search(
      query,
      subreddit,
      sort,
      time,
      limit,
      args.after
    );

    const posts = response.data.children.map((child) => child.data);
    const result = {
      query,
      subreddit: subreddit || 'all',
      sort,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        author: post.author,
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

    console.error(`✅ Found ${posts.length} posts`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error searching Reddit:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const searchTools: MCPToolDefinition[] = [
  {
    name: 'search_reddit',
    description:
      'Search Reddit for posts matching a query. Can search all of Reddit or within a specific subreddit. Supports sorting and pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (up to 512 characters)',
        },
        subreddit: {
          type: 'string',
          description: 'Optional: Limit search to a specific subreddit (e.g., "programming" or "r/programming")',
        },
        sort: {
          type: 'string',
          enum: ['relevance', 'hot', 'top', 'new', 'comments'],
          description: 'Sort order for results (default: relevance)',
          default: 'relevance',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period for sorting (useful with top/comments sort)',
        },
        limit: {
          type: 'number',
          description: 'Number of results to retrieve (1-100, default: 25)',
          default: 25,
        },
        after: {
          type: 'string',
          description: 'Pagination token from previous response to get next page',
        },
      },
      required: ['query'],
    },
    handler: searchReddit,
  },
];

