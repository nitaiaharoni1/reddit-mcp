# Reddit MCP Server

[![GitHub stars](https://img.shields.io/github/stars/nitaiaharoni1/mcp-reddit?style=social)](https://github.com/nitaiaharoni1/mcp-reddit/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/nitaiaharoni1/mcp-reddit?style=social)](https://github.com/nitaiaharoni1/mcp-reddit/network/members)

A Model Context Protocol (MCP) server that provides AI assistants with direct access to Reddit's API. This server enables natural language interactions with Reddit data including subreddits, posts, comments, users, and search functionality.

## 🚀 Quick Install

### NPX (Recommended - No Installation Required)
```bash
# Run directly with npx (no installation needed)
npx mcp-reddit
```

### Global Installation
```bash
# Install globally for repeated use
npm install -g mcp-reddit
mcp-reddit
```

Restart Claude Desktop after setup.

**✨ New:** Use with NPX - no installation required! Just run `npx mcp-reddit` directly.

## ✨ Features

### 🔍 **Reddit API Integration**
- **Subreddit Access** - Browse posts from any subreddit
- **Post Details** - Get full post information and metadata
- **Comments** - Retrieve comments with sorting options
- **User Profiles** - View user information, posts, and comments
- **Search** - Search Reddit or specific subreddits

### 🔐 **OAuth Authentication**
- **Secure Access** - Uses Reddit's OAuth2 API
- **Token Management** - Automatic token refresh
- **User-Agent Compliance** - Follows Reddit's API requirements

### 📊 **Comprehensive Reddit Tools**
- **Subreddit Operations** - Get posts, subreddit info
- **Post Operations** - Get post details and comments
- **Search Operations** - Search across Reddit
- **User Operations** - Get user info, posts, and comments

### ⚡ **Developer Experience**
- **Easy setup** - Simple environment variable configuration
- **TypeScript** - Full type safety and excellent IDE support
- **CLI tools** - Command-line utilities for configuration

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- Claude Desktop or any MCP-compatible AI client
- Reddit API credentials (Client ID and Client Secret)

### Quick Setup

1. **Get Reddit API Credentials:**
   - Go to https://www.reddit.com/prefs/apps
   - Click "create another app..." or "create app"
   - Choose "script" as the app type
   - Note your Client ID and Client Secret

2. **Set Environment Variables:**
   ```bash
   export REDDIT_CLIENT_ID="your_client_id"
   export REDDIT_CLIENT_SECRET="your_client_secret"
   export REDDIT_USER_AGENT="mcp-reddit:1.0.0 (by /u/yourusername)"
   ```

   Optional (for user-specific features):
   ```bash
   export REDDIT_USERNAME="your_username"
   export REDDIT_PASSWORD="your_password"
   ```

3. **Configure Claude Desktop:**
   Add to your Claude Desktop config file:
   ```json
   {
     "mcpServers": {
       "mcp-reddit": {
         "command": "npx",
         "args": ["mcp-reddit"],
         "env": {
           "REDDIT_CLIENT_ID": "your_client_id",
           "REDDIT_CLIENT_SECRET": "your_client_secret",
           "REDDIT_USER_AGENT": "mcp-reddit:1.0.0 (by /u/yourusername)"
         }
       }
     }
   }
   ```

   Config file locations:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

4. **Restart Claude Desktop** and you're ready!

## 🎯 Available Tools

The Reddit MCP server provides 12 powerful tools for Reddit interaction:

### Subreddit Tools
- **`get_subreddit_posts`** - Get posts from a subreddit with sorting options (hot, new, top, rising)
- **`get_subreddit_info`** - Get subreddit information and metadata

### Post Tools
- **`get_post`** - Get detailed information about a specific post
- **`get_post_comments`** - Get comments for a post with sorting options

### Posting Tools (Requires User Authentication)
- **`upload_image`** - Upload an image to Reddit's native servers (i.redd.it) for inline display in posts
- **`submit_post`** - Submit a new post to a subreddit (link or self/text post). For images, upload first then use kind="link"
- **`submit_comment`** - Submit a comment or reply to a post or comment
- **`edit_post_or_comment`** - Edit the text content of a post or comment
- **`delete_post_or_comment`** - Delete a post or comment

### Search Tools
- **`search_reddit`** - Search Reddit or specific subreddits

### User Tools
- **`get_user_info`** - Get user profile information and karma
- **`get_user_posts`** - Get posts submitted by a user
- **`get_user_comments`** - Get comments made by a user

## 💡 Usage Examples

### Basic Reddit Exploration
```
"What are the top posts in r/programming?"
"Show me the latest posts from r/technology"
"Get information about the r/learnprogramming subreddit"
```

### Post and Comment Analysis
```
"Get the comments for this post: [post_id] in r/programming"
"Show me details about post [post_id]"
"What are the top comments on this post?"
```

### User Research
```
"Get information about user [username]"
"Show me posts by user [username]"
"What comments has user [username] made recently?"
```

### Search Functionality
```
"Search Reddit for 'TypeScript tutorials'"
"Search r/programming for 'React hooks'"
"Find the top posts about 'machine learning' from this week"
```

### Posting and Interaction (Requires REDDIT_USERNAME and REDDIT_PASSWORD)
```
"Submit a post to r/programming with title 'My New Project' and text 'Check out this cool thing I built'"
"Upload an image from https://example.com/image.png and then post it to r/pics with title 'My Photo'"
"Comment on post t3_xxxxx with text 'Great post! Thanks for sharing.'"
"Edit my comment t1_xxxxx with new text 'Updated: Fixed typo'"
"Delete my post t3_xxxxx"
```

### Image Posts
To post images to Reddit with inline display:
1. First, upload the image using `upload_image` with an image URL or local file path
2. Then use the returned Reddit-hosted URL (i.redd.it) in `submit_post` with `kind: "link"`

**Important:** Reddit's API does NOT support `kind="image"`. Use `kind="link"` with Reddit-hosted image URLs (i.redd.it) - they will display inline automatically.

Example workflow:
```
1. "Upload image from https://example.com/screenshot.png"
2. "Post the uploaded image to r/programming with title 'My Project Screenshot' and kind 'link'"
```

**Note:** Image uploads require user authentication (REDDIT_USERNAME and REDDIT_PASSWORD). Images are uploaded to Reddit's native servers (i.redd.it) and will display inline when used with `kind="link"`.

## 🔧 Configuration

### Environment Variables

- **`REDDIT_CLIENT_ID`** - Your Reddit app Client ID (required)
- **`REDDIT_CLIENT_SECRET`** - Your Reddit app Client Secret (required)
- **`REDDIT_USER_AGENT`** - User-Agent string (required, format: `app:client_id:version (by /u/username)`)
- **`REDDIT_USERNAME`** - Your Reddit username (optional, for user-specific features)
- **`REDDIT_PASSWORD`** - Your Reddit password (optional, for user-specific features)

### User-Agent Format

Reddit requires a specific User-Agent format:
```
<platform>:<app ID>:<version string> (by /u/<reddit username>)
```

Example:
```
mcp-reddit:1.0.0 (by /u/yourusername)
```

## 📋 Rate Limits

Reddit API has rate limits:
- **100 queries per minute (QPM)** per OAuth client ID
- Rate limits are averaged over a 10-minute window to support bursting

The server automatically handles rate limiting and token refresh.

## 🧪 Testing

### Running Tests

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Locally

You can test the Reddit API client directly using the test scripts (not committed to git):

```bash
# Test Reddit API Client
REDDIT_CLIENT_ID="your_client_id" \
REDDIT_CLIENT_SECRET="your_client_secret" \
REDDIT_USER_AGENT="mcp-reddit:1.0.0 (by /u/yourusername)" \
npx ts-node test-reddit.ts

# Test MCP Server Tools
REDDIT_CLIENT_ID="your_client_id" \
REDDIT_CLIENT_SECRET="your_client_secret" \
REDDIT_USER_AGENT="mcp-reddit:1.0.0 (by /u/yourusername)" \
npx ts-node test-mcp-server.ts
```

**Note**: Test files (`test-reddit.ts`, `test-mcp-server.ts`) are in `.gitignore` and use environment variables for credentials.

## 🏗️ Development

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nitaiaharoni1/mcp-reddit.git
   cd mcp-reddit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Reddit credentials
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Development Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode
- `npm run start` - Run production build
- `npm run clean` - Clean build artifacts

## 📦 Publishing

### Prerequisites

1. **NPM Account**: Make sure you have an NPM account and are logged in
   ```bash
   npm login
   ```

2. **Version Update**: Update the version in `package.json` if needed
   ```bash
   npm version patch  # or minor/major
   ```

### Publishing Steps

1. **Pre-publish Check:**
   ```bash
   npm run publish:check
   ```
   This will clean, build, and show what files will be included.

2. **Publish to NPM:**
   ```bash
   npm run publish:public
   ```

3. **Verify Publication:**
   ```bash
   npx mcp-reddit --version
   ```

### Benefits of NPX Approach

- ✅ **No installation required** - Users can run immediately
- ✅ **Always latest version** - NPX fetches the newest version
- ✅ **No global pollution** - Doesn't install packages globally
- ✅ **Cross-platform** - Works on Windows, macOS, Linux
- ✅ **Easy updates** - Users automatically get updates

## 🔒 Security

### ⚠️ Important: Never Commit Credentials

**Never commit your Reddit API credentials to git!**

### Best Practices

✅ **DO:**
- Use environment variables for all secrets
- Add `.env` files to `.gitignore`
- Use `.env.example` with placeholder values
- Never commit actual credentials
- Test files are in `.gitignore` - they won't be committed

❌ **DON'T:**
- Hardcode secrets in source files
- Commit test files with real credentials
- Share credentials in documentation
- Store secrets in version control

### Environment Variables

Always set credentials via environment variables:

```bash
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USER_AGENT="mcp-reddit:1.0.0 (by /u/yourusername)"
```

### Credential Rotation

If you've accidentally committed credentials:
1. Go to https://www.reddit.com/prefs/apps
2. Delete the old app or regenerate the client secret
3. Create a new app with new credentials
4. Update your environment variables

## 📄 License

**MIT License** - See the [LICENSE](LICENSE) file for complete terms and conditions.

## 🙋‍♂️ Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/nitaiaharoni1/mcp-reddit/issues)
- **Documentation**: This README and inline code documentation
- **Community**: Contributions and discussions welcome!

## ⚠️ Important Notes

- **Reddit API Terms**: Please review Reddit's [API Terms](https://www.reddit.com/wiki/api) and [Developer Terms](https://www.reddit.com/wiki/api/terms)
- **Rate Limits**: Be mindful of Reddit's rate limits (100 QPM)
- **User-Agent**: Always use a descriptive User-Agent string
- **OAuth Required**: Reddit requires OAuth authentication for API access

---

**Made with ❤️ for the AI and Reddit community**
