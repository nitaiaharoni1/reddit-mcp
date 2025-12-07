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
      'Search Reddit for posts matching a query string. Can search across all of Reddit or limit results to a specific subreddit. Supports multiple sorting options (relevance, hot, top, new, comments) and time-based filtering. Includes pagination for browsing through large result sets. Essential for finding specific content, discussions, or information on Reddit.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string (up to 512 characters)',
        },
        subreddit: {
          type: 'string',
          description: 'Optional: Limit search to a specific subreddit (e.g., "programming" or "r/programming")',
        },
        sort: {
          type: 'string',
          enum: ['relevance', 'hot', 'top', 'new', 'comments'],
          description: 'Sort order for results: relevance (best match), hot (trending), top (highest scored), new (recent), comments (most discussed). Default: relevance',
          default: 'relevance',
        },
        time: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
          description: 'Time period filter for sorting (useful with top/comments sort)',
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
    handler: searchReddit,
  },
];

