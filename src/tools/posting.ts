/**
 * Posting-related MCP tools (create, edit, delete posts and comments)
 */

import axios from 'axios';
import { getRedditClient } from '../reddit';
import { MCPToolDefinition, MCPResult } from '../types/mcp';
import { formatErrorResult, formatTextResult } from '../utils/result-formatter';

/**
 * Submit a new post to a subreddit
 */
const submitPost = async (args: {
  subreddit: string;
  title: string;
  kind: 'link' | 'self' | 'image';
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

    if (args.kind === 'image' && !args.url) {
      throw new Error('URL is required for image posts (should be a Reddit-hosted or Imgur image URL)');
    }

    if (args.kind === 'self' && !args.text) {
      throw new Error('Text is required for self posts');
    }

    console.error(`📝 Submitting ${args.kind} post to r/${subreddit}...`);

    const response = await client.submitPost({
      subreddit,
      title: args.title,
      kind: args.kind,
      text: args.text,
      url: args.url,
      sendreplies: args.sendreplies ?? true,
      nsfw: args.nsfw ?? false,
      spoiler: args.spoiler ?? false,
      flairId: args.flair_id,
      flairText: args.flair_text,
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
      title: args.title,
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

    const response = await client.submitComment({
      parentId: parentId,
      text: args.text,
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
      text: args.text,
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

    const response = await client.editPostOrComment({
      thingId: thingId,
      text: args.text,
    });

    const jsonData = response.json;
    
    if (jsonData.errors && jsonData.errors.length > 0) {
      throw new Error(`Reddit API errors: ${JSON.stringify(jsonData.errors)}`);
    }

    const result = {
      success: true,
      thing_id: thingId,
      text: args.text,
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

// Tool definitions
export const postingTools: MCPToolDefinition[] = [
  {
    name: 'upload_image',
    description:
      'Upload an image to Imgur and return the URL. Use this to upload images before posting them to Reddit. Accepts image URLs (will download and re-upload) or base64-encoded images. Returns an Imgur URL that can be used in Reddit posts.',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL of the image to upload (will be downloaded and uploaded to Imgur)',
        },
        image_base64: {
          type: 'string',
          description: 'Base64-encoded image data (alternative to image_url)',
        },
      },
      required: [],
    },
    handler: async (args: { image_url?: string; image_base64?: string }) => {
      try {
        const client = getRedditClient();

        if (!args.image_url && !args.image_base64) {
          throw new Error('Either image_url or image_base64 is required');
        }

        let imgurUrl: string;

        if (args.image_url) {
          console.error(`📤 Uploading image from ${args.image_url} to Imgur...`);
          imgurUrl = await client.uploadImageToImgur(args.image_url);
        } else if (args.image_base64) {
          // For base64, we need to upload directly to Imgur
          const uploadResponse = await axios.post(
            'https://api.imgur.com/3/image',
            {
              image: args.image_base64,
              type: 'base64',
            },
            {
              headers: {
                'Authorization': 'Client-ID 546c25a59c58ad7',
                'Content-Type': 'application/json',
              },
            }
          );

          if (uploadResponse.data.success && uploadResponse.data.data?.link) {
            imgurUrl = uploadResponse.data.data.link;
          } else {
            throw new Error(`Imgur upload failed: ${uploadResponse.data.data?.error || 'Unknown error'}`);
          }
        } else {
          throw new Error('Either image_url or image_base64 is required');
        }

        const result = {
          success: true,
          imgur_url: imgurUrl,
          message: 'Image uploaded successfully. Use this URL in a Reddit post with kind="link" or kind="image".',
        };

        console.error(`✅ Image uploaded successfully: ${imgurUrl}`);
        return formatTextResult(JSON.stringify(result, null, 2));
      } catch (error: any) {
        console.error(`❌ Error uploading image:`, error.message);
        return formatErrorResult(error.message);
      }
    },
  },
  {
    name: 'submit_post',
    description:
      'Submit a new post to a subreddit. Supports link posts (with URL), self/text posts (with text content), and image posts (with image URL). For image posts, use upload_image first to get an Imgur URL, then use that URL here. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). Can optionally mark posts as NSFW, spoiler, set flair, and control reply notifications.',
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
          enum: ['link', 'self', 'image'],
          description: 'Type of post: "link" for URL posts, "self" for text posts, "image" for image posts (requires image URL)',
        },
        text: {
          type: 'string',
          description: 'Text content for self posts (required if kind is "self")',
        },
        url: {
          type: 'string',
          description: 'URL for link or image posts (required if kind is "link" or "image"). For images, use upload_image first to get an Imgur URL.',
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
    name: 'submit_comment',
    description:
      'Submit a comment or reply to a post or comment. Requires user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). The parent_id should be a post ID (t3_xxxxx) for top-level comments or a comment ID (t1_xxxxx) for replies.',
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
    name: 'edit_post_or_comment',
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
    name: 'delete_post_or_comment',
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
];


