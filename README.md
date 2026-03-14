# reddit-cli

A command-line interface for the Reddit API. Browse subreddits, posts, comments, users, and search — or perform write operations — directly from your terminal.

## Installation

```bash
npm install -g reddit-cli
```

Or run without installing:

```bash
npx reddit-cli <command>
```

## Authentication

Create a Reddit app at <https://www.reddit.com/prefs/apps> (choose **script** type), then set the following environment variables (or add them to a `.env` file in your working directory):

| Variable | Required | Purpose |
|---|---|---|
| `REDDIT_CLIENT_ID` | Yes | OAuth app Client ID |
| `REDDIT_CLIENT_SECRET` | Yes | OAuth app Client Secret |
| `REDDIT_USER_AGENT` | Yes | User-Agent string, e.g. `my-cli/1.0 by u/username` |
| `REDDIT_USERNAME` | For write ops | Your Reddit username |
| `REDDIT_PASSWORD` | For write ops | Your Reddit password |

Read-only commands (browsing, searching) only require the first three variables. Write operations (post, comment, vote, edit, delete, upload) additionally require `REDDIT_USERNAME` and `REDDIT_PASSWORD`.

## Commands

All commands output JSON to stdout. Progress/status messages are printed to stderr so they can be silenced or piped independently.

### Subreddits

```bash
# Get posts from a subreddit
reddit-cli posts <subreddit> [--sort hot|new|top|rising|controversial] [--limit N] [--after <token>] [--time hour|day|week|month|year|all]

# Get subreddit info
reddit-cli subreddit <name>

# Get subreddit rules
reddit-cli rules <subreddit>
```

### Posts

```bash
# Get a specific post by ID
reddit-cli post <post_id> --subreddit <sub>

# Get comments for a post
reddit-cli comments <post_id> --subreddit <sub> [--sort confidence|top|new|controversial|old|random|qa|live] [--limit N]
```

### Search

```bash
# Search across all of Reddit
reddit-cli search <query> [--sort relevance|hot|top|new|comments] [--time hour|day|week|month|year|all] [--limit N] [--after <token>]

# Search within a subreddit
reddit-cli search <query> --subreddit <sub>
```

### Users

```bash
reddit-cli user info <username>
reddit-cli user posts <username>     [--sort hot|new|top|controversial] [--limit N] [--time ...]
reddit-cli user comments <username>  [--sort hot|new|top|controversial] [--limit N] [--time ...]
reddit-cli user overview <username>  [--sort hot|new|top|controversial] [--limit N] [--time ...]
```

Use `me` as the username to target the currently authenticated user.

### Front Page

```bash
reddit-cli front-page [--sort best|hot|new|top|rising|controversial] [--limit N] [--after <token>] [--time ...]
```

### Subreddit Discovery

```bash
reddit-cli subreddits popular  [--limit N] [--after <token>]
reddit-cli subreddits new      [--limit N] [--after <token>]
reddit-cli subreddits search <query> [--limit N] [--after <token>]
```

### Write Operations (require auth)

```bash
# Submit a text post
reddit-cli submit post <subreddit> <title> --text "body text"

# Submit a link post
reddit-cli submit post <subreddit> <title> --url https://example.com

# Additional flags for submit post
#   --nsfw          Mark as NSFW
#   --spoiler       Mark as spoiler
#   --no-replies    Disable reply notifications
#   --flair-id <id>
#   --flair-text <text>

# Comment on a post (t3_xxxxx) or reply to a comment (t1_xxxxx)
reddit-cli submit comment <parent_id> "comment text"

# Edit a post or comment
reddit-cli edit <thing_id> "new text"

# Delete a post or comment
reddit-cli delete <thing_id>

# Vote on a post or comment
reddit-cli vote <thing_id> upvote|downvote|remove

# Upload an image to Reddit (returns i.redd.it URL)
reddit-cli upload-image --url https://example.com/image.png
reddit-cli upload-image --path /path/to/image.png
```

## Examples

```bash
# Browse top posts from r/programming this week
reddit-cli posts programming --sort top --time week --limit 10

# Search for TypeScript posts with 50 results
reddit-cli search TypeScript --sort relevance --limit 50

# Get comments for a post
reddit-cli comments abc123 --subreddit programming --sort top

# Submit a text post
reddit-cli submit post AskReddit "What is your favourite CLI tool?" --text "Mine is jq."

# Upvote a post
reddit-cli vote t3_abc123 upvote

# Pipe output through jq
reddit-cli posts javascript --limit 5 | jq '.[0:5] | .posts[].title'
```

## Output

All commands output pretty-printed JSON. Use [jq](https://stedolan.github.io/jq/) to filter, transform, or extract fields:

```bash
# List post titles and scores
reddit-cli posts programming | jq '.posts[] | {title, score}'

# Get subscriber count for a subreddit
reddit-cli subreddit rust | jq '.subscribers'
```

## License

MIT
