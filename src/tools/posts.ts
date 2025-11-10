/**
 * Post-related MCP tools
 */

import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Get comments for a post
 */
const getPostComments = async (args: {
  subreddit: string;
  post_id: string;
  sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa' | 'live';
  limit?: number;
}) => {
  try {
    const client = getRedditClient();
    const subreddit = args.subreddit.replace(/^r\//, ''); // Remove r/ prefix if present
    const postId = args.post_id.replace(/^t3_/, ''); // Remove t3_ prefix if present
    const sort = args.sort || 'top';
    const limit = Math.min(args.limit || 25, 100); // Max 100 per Reddit API

    console.error(`🔍 Fetching comments for post ${postId} in r/${subreddit}...`);

    const responses = await client.getPostComments(subreddit, postId, sort, limit);
    
    // First response is the post, second is comments
    const postListing = responses[0];
    const commentsListing = responses[1];
    
    const postData = postListing?.data?.children?.[0]?.data as any;
    const commentsData = commentsListing?.data?.children || [];

    const comments = commentsData.map((child: any) => {
      const comment = child.data;
      return {
        id: comment.id,
        author: comment.author,
        body: comment.body,
        score: comment.score,
        created_utc: comment.created_utc,
        permalink: `https://reddit.com${comment.permalink}`,
        is_submitter: comment.is_submitter,
        stickied: comment.stickied,
        parent_id: comment.parent_id,
        num_replies: comment.replies?.data?.children?.length || 0,
      };
    });

    const result = {
      post: postData ? {
        id: postData.id,
        title: postData.title,
        author: postData.author,
        score: postData.score,
        num_comments: postData.num_comments,
        url: postData.url,
        permalink: `https://reddit.com${postData.permalink}`,
      } : null,
      comments,
      count: comments.length,
      sort,
    };

    console.error(`✅ Retrieved ${comments.length} comments`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching post comments:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Get a specific post by ID
 */
const getPost = async (args: {
  subreddit: string;
  post_id: string;
}) => {
  try {
    const client = getRedditClient();
    const subreddit = args.subreddit.replace(/^r\//, ''); // Remove r/ prefix if present
    const postId = args.post_id.replace(/^t3_/, ''); // Remove t3_ prefix if present

    console.error(`🔍 Fetching post ${postId} from r/${subreddit}...`);

    const post = await client.getPost(subreddit, postId);

    const result = {
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
      is_video: post.is_video,
      over_18: post.over_18,
      stickied: post.stickied,
      locked: post.locked,
      archived: post.archived,
      thumbnail: post.thumbnail,
    };

    console.error(`✅ Retrieved post ${postId}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error fetching post:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const postTools: MCPToolDefinition[] = [
  {
    name: 'get_post_comments',
    description:
      'Retrieve all comments for a specific Reddit post along with the post details. Supports multiple comment sorting methods including confidence (best), top (highest scored), new (recent), controversial (divisive), old (chronological), random, qa (Q&A format), and live (real-time). Returns the full comment thread structure with nested replies. Essential for reading discussions and understanding community responses to posts.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: {
          type: 'string',
          description: 'Subreddit name (e.g., "programming" or "r/programming")',
        },
        post_id: {
          type: 'string',
          description: 'Post ID (can include t3_ prefix or just the ID)',
        },
        sort: {
          type: 'string',
          enum: ['confidence', 'top', 'new', 'controversial', 'old', 'random', 'qa', 'live'],
          description: 'Sort order for comments: confidence (best), top (highest scored), new (recent), controversial (divisive), old (chronological), random, qa (Q&A format), live (real-time). Default: top',
          default: 'top',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to retrieve (1-100, default: 25)',
          default: 25,
        },
      },
      required: ['subreddit', 'post_id'],
    },
    handler: getPostComments,
  },
  {
    name: 'get_post',
    description: 'Fetch detailed information about a specific Reddit post by its ID, including title, content, author, scores, comment count, timestamps, and metadata. Useful for retrieving complete post details when you have the post ID.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: {
          type: 'string',
          description: 'Subreddit name (e.g., "programming" or "r/programming")',
        },
        post_id: {
          type: 'string',
          description: 'Post ID (can include t3_ prefix or just the ID)',
        },
      },
      required: ['subreddit', 'post_id'],
    },
    handler: getPost,
  },
];

