/**
 * Posting-related MCP tools (create, edit, delete posts and comments)
 */

import axios from 'axios';
import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Replace em dashes (—) with regular hyphens (-) deterministically
 * This ensures consistent formatting for Reddit API compatibility
 */
const normalizeDashes = (text: string): string => {
  return text.replace(/—/g, '-');
};

/**
 * Submit a new post to a subreddit
 */
const submitPost = async (args: {
  subreddit: string;
  title: string;
  kind: 'link' | 'self';
  text?: string;
  url?: string;
  sendreplies?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
  flair_id?: string;
  flair_text?: string;
}) => {
  try {
    const client = getRedditClient();
    const subreddit = args.subreddit.replace(/^r\//, ''); // Remove r/ prefix if present

    // Validate required fields
    if (!args.title || args.title.length > 300) {
      throw new Error('Title is required and must be 300 characters or less');
    }

    if (args.kind === 'link' && !args.url) {
      throw new Error('URL is required for link posts');
    }


    if (args.kind === 'self' && !args.text) {
      throw new Error('Text is required for self posts');
    }

    console.error(`📝 Submitting ${args.kind} post to r/${subreddit}...`);

    // Normalize dashes in all text fields
    const normalizedTitle = normalizeDashes(args.title);
    const normalizedText = args.text ? normalizeDashes(args.text) : undefined;
    const normalizedFlairText = args.flair_text ? normalizeDashes(args.flair_text) : undefined;

    const response = await client.submitPost({
      subreddit,
      title: normalizedTitle,
      kind: args.kind,
      text: normalizedText,
      url: args.url,
      sendreplies: args.sendreplies ?? true,
      nsfw: args.nsfw ?? false,
      spoiler: args.spoiler ?? false,
      flairId: args.flair_id,
      flairText: normalizedFlairText,
    });

    // Reddit API returns { json: { data: { name: "t3_xxxxx", url: "...", ... }, errors: [] } }
    const jsonData = response.json;
    
    if (jsonData.errors && jsonData.errors.length > 0) {
      throw new Error(`Reddit API errors: ${JSON.stringify(jsonData.errors)}`);
    }

    const postData = jsonData.data;

    const result = {
      success: true,
      post_id: postData.name,
      post_id_short: postData.name.replace(/^t3_/, ''),
      url: postData.url,
      permalink: `https://reddit.com${postData.url}`,
      title: normalizedTitle,
      subreddit: subreddit,
    };

    console.error(`✅ Post submitted successfully: ${postData.name}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error submitting post:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Submit a comment or reply
 */
const submitComment = async (args: {
  parent_id: string; // Post ID (t3_xxxxx) or comment ID (t1_xxxxx)
  text: string;
}) => {
  try {
    const client = getRedditClient();

    if (!args.text || args.text.trim().length === 0) {
      throw new Error('Comment text is required');
    }

    // Ensure parent_id has the correct prefix
    let parentId = args.parent_id;
    if (!parentId.startsWith('t3_') && !parentId.startsWith('t1_')) {
      // Assume it's a post ID if it doesn't have a prefix
      parentId = `t3_${parentId}`;
    }

    console.error(`💬 Submitting comment to ${parentId}...`);

    // Normalize dashes in comment text
    const normalizedText = normalizeDashes(args.text);

    const response = await client.submitComment({
      parentId: parentId,
      text: normalizedText,
    });

    const jsonData = response.json;
    
    if (jsonData.errors && jsonData.errors.length > 0) {
      throw new Error(`Reddit API errors: ${JSON.stringify(jsonData.errors)}`);
    }

    const commentData = jsonData.data?.things?.[0]?.data;

    const result = {
      success: true,
      comment_id: commentData?.name,
      comment_id_short: commentData?.name?.replace(/^t1_/, ''),
      permalink: commentData?.permalink ? `https://reddit.com${commentData.permalink}` : null,
      text: normalizedText,
    };

    console.error(`✅ Comment submitted successfully: ${commentData?.name}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error submitting comment:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Edit a post or comment
 */
const editPostOrComment = async (args: {
  thing_id: string; // Post ID (t3_xxxxx) or comment ID (t1_xxxxx)
  text: string;
}) => {
  try {
    const client = getRedditClient();

    if (!args.text || args.text.trim().length === 0) {
      throw new Error('Text is required for editing');
    }

    // Ensure thing_id has the correct prefix
    let thingId = args.thing_id;
    if (!thingId.startsWith('t3_') && !thingId.startsWith('t1_')) {
      throw new Error('thing_id must be a fullname (t3_xxxxx for posts, t1_xxxxx for comments)');
    }

    console.error(`✏️ Editing ${thingId}...`);

    // Normalize dashes in edit text
    const normalizedText = normalizeDashes(args.text);

    const response = await client.editPostOrComment({
      thingId: thingId,
      text: normalizedText,
    });

    const jsonData = response.json;
    
    if (jsonData.errors && jsonData.errors.length > 0) {
      throw new Error(`Reddit API errors: ${JSON.stringify(jsonData.errors)}`);
    }

    const result = {
      success: true,
      thing_id: thingId,
      text: normalizedText,
    };

    console.error(`✅ Successfully edited ${thingId}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error editing post/comment:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Delete a post or comment
 */
const deletePostOrComment = async (args: {
  thing_id: string; // Post ID (t3_xxxxx) or comment ID (t1_xxxxx)
}) => {
  try {
    const client = getRedditClient();

    // Ensure thing_id has the correct prefix
    let thingId = args.thing_id;
    if (!thingId.startsWith('t3_') && !thingId.startsWith('t1_')) {
      throw new Error('thing_id must be a fullname (t3_xxxxx for posts, t1_xxxxx for comments)');
    }

    console.error(`🗑️ Deleting ${thingId}...`);

    await client.deletePostOrComment(thingId);

    const result = {
      success: true,
      thing_id: thingId,
      deleted: true,
    };

    console.error(`✅ Successfully deleted ${thingId}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error deleting post/comment:`, error.message);
    return formatErrorResult(error.message);
  }
};

/**
 * Vote on a post or comment
 */
const vote = async (args: {
  thing_id: string; // Post ID (t3_xxxxx) or comment ID (t1_xxxxx)
  direction: 'upvote' | 'downvote' | 'remove';
}) => {
  try {
    const client = getRedditClient();

    // Ensure thing_id has the correct prefix
    let thingId = args.thing_id;
    if (!thingId.startsWith('t3_') && !thingId.startsWith('t1_')) {
      // If no prefix, assume it's a post ID
      thingId = `t3_${thingId}`;
    }

    // Map direction to Reddit API format
    const directionMap: Record<string, 1 | -1 | 0> = {
      upvote: 1,
      downvote: -1,
      remove: 0,
    };

    const dir = directionMap[args.direction];
    if (dir === undefined) {
      throw new Error('direction must be "upvote", "downvote", or "remove"');
    }

    const action = args.direction === 'remove' ? 'removing vote from' : `${args.direction}ing`;
    console.error(`👍 ${action} ${thingId}...`);

    await client.vote(thingId, dir);

    const result = {
      success: true,
      thing_id: thingId,
      direction: args.direction,
      action: args.direction === 'remove' ? 'vote_removed' : `vote_${args.direction}d`,
    };

    console.error(`✅ Successfully ${action} ${thingId}`);

    return formatTextResult(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(`❌ Error voting:`, error.message);
    return formatErrorResult(error.message);
  }
};

// Tool definitions
export const postingTools: MCPToolDefinition[] = [
  {
    name: 'reddit_upload_image',
    description:
      'Upload an image to Reddit\'s native servers (i.redd.it) for inline display in posts. IMPORTANT: Before uploading and posting images, use reddit_get_subreddit_rules to check if images are allowed and comply with the subreddit rules. Accepts image URLs (will download) or local file paths. Returns a Reddit-hosted URL (i.redd.it) that can be used in submit_post with kind="link". Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD).',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL of the image to upload (will be downloaded and uploaded to Reddit)',
        },
        image_path: {
          type: 'string',
          description: 'Local file path of the image to upload',
        },
      },
      required: [],
    },
    handler: async (args: { image_url?: string; image_path?: string }) => {
      try {
        const client = getRedditClient();
        const fs = require('fs');
        const path = require('path');

        if (!args.image_url && !args.image_path) {
          throw new Error('Either image_url or image_path is required');
        }

        let imageBuffer: Buffer;
        let filename: string;
        let mimeType: string;

        // Get image data
        if (args.image_path) {
          // Read from file
          imageBuffer = fs.readFileSync(args.image_path);
          filename = path.basename(args.image_path);
          const ext = path.extname(args.image_path).toLowerCase();
          mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                     ext === '.gif' ? 'image/gif' : 
                     ext === '.webp' ? 'image/webp' : 'image/png';
        } else if (args.image_url) {
          // Download from URL
          console.error(`📥 Downloading image from ${args.image_url}...`);
          const response = await axios.get(args.image_url, {
            responseType: 'arraybuffer',
            maxContentLength: 20 * 1024 * 1024, // 20MB limit
          });
          imageBuffer = Buffer.from(response.data);
          
          // Extract filename from URL or use default
          const urlPath = new URL(args.image_url).pathname;
          filename = path.basename(urlPath) || 'image.png';
          
          // Determine mime type from content-type header or filename
          const contentType = response.headers['content-type'];
          if (contentType && contentType.startsWith('image/')) {
            mimeType = contentType;
          } else {
            const ext = path.extname(filename).toLowerCase();
            mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                       ext === '.gif' ? 'image/gif' : 
                       ext === '.webp' ? 'image/webp' : 'image/png';
          }
        } else {
          throw new Error('Either image_url or image_path is required');
        }

        console.error(`📤 Uploading image to Reddit (native)...`);
        const redditUrl = await client.uploadImageToReddit(imageBuffer, filename, mimeType);

        const result = {
          success: true,
          url: redditUrl,
          message: 'Image uploaded to Reddit. Use this URL in submit_post with kind="link" - Reddit-hosted images (i.redd.it) will display inline automatically.',
        };

        console.error(`✅ Image uploaded successfully: ${redditUrl}`);
        return formatTextResult(JSON.stringify(result, null, 2));
      } catch (error: any) {
        console.error(`❌ Error uploading image:`, error.message);
        return formatErrorResult(error.message);
      }
    },
  },
  {
    name: 'reddit_submit_post',
    description:
      'Submit a new post to a subreddit. IMPORTANT: Before posting, always use reddit_get_subreddit_rules to check the subreddit rules to ensure your content complies with community guidelines. This prevents post removal and potential bans. Supports link posts (with URL) and self/text posts (with text content). For image posts, use upload_image first to get a Reddit-hosted URL (i.redd.it), then use that URL here with kind="link" - Reddit-hosted images will display inline automatically. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). Can optionally mark posts as NSFW, spoiler, set flair, and control reply notifications.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: {
          type: 'string',
          description: 'Subreddit name (e.g., "programming" or "r/programming")',
        },
        title: {
          type: 'string',
          description: 'Post title (required, max 300 characters)',
        },
        kind: {
          type: 'string',
          enum: ['link', 'self'],
          description: 'Type of post: "link" for URL posts (including images - use upload_image first for Reddit-hosted images), "self" for text posts',
        },
        text: {
          type: 'string',
          description: 'Text content for self posts (required if kind is "self")',
        },
        url: {
          type: 'string',
          description: 'URL for link posts (required if kind is "link"). For images, use upload_image first to get a Reddit-hosted URL (i.redd.it) - Reddit-hosted images will display inline automatically.',
        },
        sendreplies: {
          type: 'boolean',
          description: 'Whether to send reply notifications (default: true)',
          default: true,
        },
        nsfw: {
          type: 'boolean',
          description: 'Mark post as NSFW (default: false)',
          default: false,
        },
        spoiler: {
          type: 'boolean',
          description: 'Mark post as spoiler (default: false)',
          default: false,
        },
        flair_id: {
          type: 'string',
          description: 'Flair template ID (optional, max 36 characters)',
        },
        flair_text: {
          type: 'string',
          description: 'Flair text (optional, max 64 characters)',
        },
      },
      required: ['subreddit', 'title', 'kind'],
    },
    handler: submitPost,
  },
  {
    name: 'reddit_submit_comment',
    description:
      'Submit a comment or reply to a post or comment. IMPORTANT: Before commenting, consider using reddit_get_subreddit_rules to check the subreddit rules to ensure your comment complies with community guidelines. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). The parent_id should be a post ID (t3_xxxxx) for top-level comments or a comment ID (t1_xxxxx) for replies.',
    inputSchema: {
      type: 'object',
      properties: {
        parent_id: {
          type: 'string',
          description: 'Post ID (t3_xxxxx) or comment ID (t1_xxxxx) to reply to',
        },
        text: {
          type: 'string',
          description: 'Comment text (required, markdown supported)',
        },
      },
      required: ['parent_id', 'text'],
    },
    handler: submitComment,
  },
  {
    name: 'reddit_edit_post_or_comment',
    description:
      'Edit the text content of a post or comment. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). Can only edit your own posts/comments. The thing_id must be a fullname (t3_xxxxx for posts, t1_xxxxx for comments).',
    inputSchema: {
      type: 'object',
      properties: {
        thing_id: {
          type: 'string',
          description: 'Post ID (t3_xxxxx) or comment ID (t1_xxxxx) to edit',
        },
        text: {
          type: 'string',
          description: 'New text content (required, markdown supported)',
        },
      },
      required: ['thing_id', 'text'],
    },
    handler: editPostOrComment,
  },
  {
    name: 'reddit_delete_post_or_comment',
    description:
      'Delete a post or comment. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). Can only delete your own posts/comments. The thing_id must be a fullname (t3_xxxxx for posts, t1_xxxxx for comments).',
    inputSchema: {
      type: 'object',
      properties: {
        thing_id: {
          type: 'string',
          description: 'Post ID (t3_xxxxx) or comment ID (t1_xxxxx) to delete',
        },
      },
      required: ['thing_id'],
    },
    handler: deletePostOrComment,
  },
  {
    name: 'reddit_vote',
    description:
      'Vote on a post or comment (upvote, downvote, or remove vote). Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). The thing_id should be a fullname (t3_xxxxx for posts, t1_xxxxx for comments), but can also be a short ID (will be treated as a post). Note: Reddit requires votes to be cast by humans, not automated bots.',
    inputSchema: {
      type: 'object',
      properties: {
        thing_id: {
          type: 'string',
          description: 'Post ID (t3_xxxxx) or comment ID (t1_xxxxx) to vote on. Can also be a short ID (will be treated as a post).',
        },
        direction: {
          type: 'string',
          enum: ['upvote', 'downvote', 'remove'],
          description: 'Vote direction: "upvote" to upvote, "downvote" to downvote, "remove" to remove an existing vote',
        },
      },
      required: ['thing_id', 'direction'],
    },
    handler: vote,
  },
];


