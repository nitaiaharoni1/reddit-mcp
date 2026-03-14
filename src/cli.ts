import 'dotenv/config';
import { Command } from 'commander';
import { initializeReddit } from './reddit';
import { allTools } from './tools';

declare const __PACKAGE_VERSION__: string;

const version = typeof __PACKAGE_VERSION__ !== 'undefined' ? __PACKAGE_VERSION__ : '1.0.0';

function getHandler(toolName: string) {
  const tool = allTools.find((t) => t.name === toolName);
  if (!tool) throw new Error(`Unknown tool: ${toolName}`);
  return tool.handler;
}

async function run(toolName: string, args: Record<string, any>) {
  try {
    initializeReddit();
  } catch (err: any) {
    // Non-fatal — client initialises lazily on first call
  }

  const handler = getHandler(toolName);
  const result = await handler(args);

  if (result.isError) {
    const item = result.content[0];
    const text = item?.type === 'text' ? item.text : 'Unknown error';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
    console.error(typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed);
    process.exit(1);
  }

  const item = result.content[0];
  const text = item?.type === 'text' ? item.text : '';
  console.log(text);
}

const program = new Command();
program.name('reddit-cli').description('A command-line interface for the Reddit API').version(version);

// ── Subreddit commands ─────────────────────────────────────────────────────

program
  .command('posts <subreddit>')
  .description('Get posts from a subreddit')
  .option('--sort <sort>', 'Sort order: hot, new, top, rising, controversial', 'hot')
  .option('--limit <n>', 'Number of posts (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .option('--time <time>', 'Time filter for top/controversial: hour, day, week, month, year, all')
  .action(async (subreddit: string, opts) => {
    await run('reddit_get_subreddit_posts', {
      subreddit,
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
      time: opts.time,
    });
  });

program
  .command('subreddit <name>')
  .description('Get info about a subreddit')
  .action(async (name: string) => {
    await run('reddit_get_subreddit_info', { subreddit: name });
  });

program
  .command('rules <subreddit>')
  .description('Get rules for a subreddit')
  .action(async (subreddit: string) => {
    await run('reddit_get_subreddit_rules', { subreddit });
  });

// ── Post commands ──────────────────────────────────────────────────────────

program
  .command('post <post_id>')
  .description('Get a specific post by ID')
  .requiredOption('--subreddit <sub>', 'Subreddit the post belongs to')
  .action(async (post_id: string, opts) => {
    await run('reddit_get_post', { subreddit: opts.subreddit, post_id });
  });

program
  .command('comments <post_id>')
  .description('Get comments for a post')
  .requiredOption('--subreddit <sub>', 'Subreddit the post belongs to')
  .option('--sort <sort>', 'Sort order: confidence, top, new, controversial, old, random, qa, live', 'top')
  .option('--limit <n>', 'Number of comments (1-100)', '25')
  .action(async (post_id: string, opts) => {
    await run('reddit_get_post_comments', {
      subreddit: opts.subreddit,
      post_id,
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
    });
  });

// ── Search commands ────────────────────────────────────────────────────────

program
  .command('search <query>')
  .description('Search Reddit for posts')
  .option('--subreddit <sub>', 'Limit search to a specific subreddit')
  .option('--sort <sort>', 'Sort order: relevance, hot, top, new, comments', 'relevance')
  .option('--time <time>', 'Time filter: hour, day, week, month, year, all')
  .option('--limit <n>', 'Number of results (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .action(async (query: string, opts) => {
    await run('reddit_search_reddit', {
      query,
      subreddit: opts.subreddit,
      sort: opts.sort,
      time: opts.time,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
    });
  });

// ── User commands ──────────────────────────────────────────────────────────

const userCmd = program.command('user').description('User-related commands');

userCmd
  .command('info <username>')
  .description('Get info about a Reddit user')
  .action(async (username: string) => {
    await run('reddit_get_user_info', { username });
  });

userCmd
  .command('posts <username>')
  .description('Get posts submitted by a user (use "me" for authenticated user)')
  .option('--sort <sort>', 'Sort order: hot, new, top, controversial', 'new')
  .option('--limit <n>', 'Number of posts (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .option('--time <time>', 'Time filter for top/controversial: hour, day, week, month, year, all')
  .action(async (username: string, opts) => {
    await run('reddit_get_user_posts', {
      username,
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
      time: opts.time,
    });
  });

userCmd
  .command('comments <username>')
  .description('Get comments made by a user')
  .option('--sort <sort>', 'Sort order: hot, new, top, controversial', 'new')
  .option('--limit <n>', 'Number of comments (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .option('--time <time>', 'Time filter for top/controversial: hour, day, week, month, year, all')
  .action(async (username: string, opts) => {
    await run('reddit_get_user_comments', {
      username,
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
      time: opts.time,
    });
  });

userCmd
  .command('overview <username>')
  .description('Get combined posts and comments for a user')
  .option('--sort <sort>', 'Sort order: hot, new, top, controversial', 'new')
  .option('--limit <n>', 'Number of items (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .option('--time <time>', 'Time filter for top/controversial: hour, day, week, month, year, all')
  .action(async (username: string, opts) => {
    await run('reddit_get_user_overview', {
      username,
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
      time: opts.time,
    });
  });

// ── Front page ─────────────────────────────────────────────────────────────

program
  .command('front-page')
  .description('Get Reddit front page posts')
  .option('--sort <sort>', 'Sort order: best, hot, new, top, rising, controversial', 'hot')
  .option('--limit <n>', 'Number of posts (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .option('--time <time>', 'Time filter for top/controversial: hour, day, week, month, year, all')
  .action(async (opts) => {
    await run('reddit_get_front_page_posts', {
      sort: opts.sort,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
      time: opts.time,
    });
  });

// ── Subreddit discovery commands ───────────────────────────────────────────

const subredditsCmd = program.command('subreddits').description('Subreddit discovery commands');

subredditsCmd
  .command('popular')
  .description('Get popular subreddits')
  .option('--limit <n>', 'Number of subreddits (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .action(async (opts) => {
    await run('reddit_get_popular_subreddits', {
      limit: parseInt(opts.limit, 10),
      after: opts.after,
    });
  });

subredditsCmd
  .command('new')
  .description('Get newly created subreddits')
  .option('--limit <n>', 'Number of subreddits (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .action(async (opts) => {
    await run('reddit_get_new_subreddits', {
      limit: parseInt(opts.limit, 10),
      after: opts.after,
    });
  });

subredditsCmd
  .command('search <query>')
  .description('Search for subreddits by name or description')
  .option('--limit <n>', 'Number of results (1-100)', '25')
  .option('--after <token>', 'Pagination token for next page')
  .action(async (query: string, opts) => {
    await run('reddit_search_subreddits', {
      query,
      limit: parseInt(opts.limit, 10),
      after: opts.after,
    });
  });

// ── Write commands (require auth) ──────────────────────────────────────────

const submitCmd = program.command('submit').description('Submit posts or comments (requires auth)');

submitCmd
  .command('post <subreddit> <title>')
  .description('Submit a new post to a subreddit')
  .option('--text <body>', 'Text content for a self/text post')
  .option('--url <url>', 'URL for a link post')
  .option('--nsfw', 'Mark post as NSFW', false)
  .option('--spoiler', 'Mark post as spoiler', false)
  .option('--no-replies', 'Disable reply notifications')
  .option('--flair-id <id>', 'Flair template ID')
  .option('--flair-text <text>', 'Flair text')
  .action(async (subreddit: string, title: string, opts) => {
    if (!opts.text && !opts.url) {
      console.error('Error: Either --text or --url is required');
      process.exit(1);
    }
    const kind = opts.url ? 'link' : 'self';
    await run('reddit_submit_post', {
      subreddit,
      title,
      kind,
      text: opts.text,
      url: opts.url,
      sendreplies: opts.replies !== false,
      nsfw: !!opts.nsfw,
      spoiler: !!opts.spoiler,
      flair_id: opts.flairId,
      flair_text: opts.flairText,
    });
  });

submitCmd
  .command('comment <parent_id> <text>')
  .description('Submit a comment or reply (parent_id: t3_xxxxx for posts, t1_xxxxx for comments)')
  .action(async (parent_id: string, text: string) => {
    await run('reddit_submit_comment', { parent_id, text });
  });

program
  .command('edit <thing_id> <text>')
  .description('Edit a post or comment (thing_id: t3_xxxxx or t1_xxxxx)')
  .action(async (thing_id: string, text: string) => {
    await run('reddit_edit_post_or_comment', { thing_id, text });
  });

program
  .command('delete <thing_id>')
  .description('Delete a post or comment (thing_id: t3_xxxxx or t1_xxxxx)')
  .action(async (thing_id: string) => {
    await run('reddit_delete_post_or_comment', { thing_id });
  });

program
  .command('vote <thing_id> <direction>')
  .description('Vote on a post or comment. direction: upvote, downvote, remove')
  .action(async (thing_id: string, direction: string) => {
    if (!['upvote', 'downvote', 'remove'].includes(direction)) {
      console.error('Error: direction must be upvote, downvote, or remove');
      process.exit(1);
    }
    await run('reddit_vote', { thing_id, direction });
  });

program
  .command('upload-image')
  .description('Upload an image to Reddit (i.redd.it) for use in posts')
  .option('--url <url>', 'URL of the image to download and upload')
  .option('--path <path>', 'Local file path of the image to upload')
  .action(async (opts) => {
    if (!opts.url && !opts.path) {
      console.error('Error: Either --url or --path is required');
      process.exit(1);
    }
    await run('reddit_upload_image', { image_url: opts.url, image_path: opts.path });
  });

program.parseAsync(process.argv).catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
