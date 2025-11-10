# Reddit MCP Server

[![GitHub stars](https://img.shields.io/github/stars/nitaiaharoni1/reddit-mcp?style=social)](https://github.com/nitaiaharoni1/reddit-mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/nitaiaharoni1/reddit-mcp?style=social)](https://github.com/nitaiaharoni1/reddit-mcp/network/members)

A Model Context Protocol (MCP) server that provides AI assistants with direct access to Reddit's API. This server enables natural language interactions with Reddit data including subreddits, posts, comments, users, and search functionality.

## 🚀 Quick Install

### NPX (Recommended - No Installation Required)
```bash
# Run directly with npx (no installation needed)
npx reddit-mcp
```

### Global Installation
```bash
# Install globally for repeated use
npm install -g reddit-mcp
reddit-mcp
```

Restart Claude Desktop after setup.

**✨ New:** Use with NPX - no installation required! Just run `npx reddit-mcp` directly.

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
   export REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)"
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
       "reddit-mcp": {
         "command": "npx",
         "args": ["reddit-mcp"],
         "env": {
           "REDDIT_CLIENT_ID": "your_client_id",
           "REDDIT_CLIENT_SECRET": "your_client_secret",
           "REDDIT_USER_AGENT": "reddit-mcp:1.0.0 (by /u/yourusername)"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** and you're ready!

## 🎯 Available Tools

The Reddit MCP server provides 8 powerful tools for Reddit interaction:

### Subreddit Tools
- **`get_subreddit_posts`** - Get posts from a subreddit with sorting options
- **`get_subreddit_info`** - Get subreddit information and metadata

### Post Tools
- **`get_post`** - Get detailed information about a specific post
- **`get_post_comments`** - Get comments for a post with sorting options

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
reddit-mcp:1.0.0 (by /u/yourusername)
```

## 📋 Rate Limits

Reddit API has rate limits:
- **100 queries per minute (QPM)** per OAuth client ID
- Rate limits are averaged over a 10-minute window to support bursting

The server automatically handles rate limiting and token refresh.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Development

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nitaiaharoni1/reddit-mcp.git
   cd reddit-mcp
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

5. **Test locally:**
   ```bash
   npm run dev
   ```

## 📄 License

**MIT License** - See the [LICENSE](LICENSE) file for complete terms and conditions.

## 🙋‍♂️ Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/nitaiaharoni1/reddit-mcp/issues)
- **Documentation**: This README and inline code documentation
- **Community**: Contributions and discussions welcome!

## ⚠️ Important Notes

- **Reddit API Terms**: Please review Reddit's [API Terms](https://www.reddit.com/wiki/api) and [Developer Terms](https://www.reddit.com/wiki/api/terms)
- **Rate Limits**: Be mindful of Reddit's rate limits (100 QPM)
- **User-Agent**: Always use a descriptive User-Agent string
- **OAuth Required**: Reddit requires OAuth authentication for API access

---

**Made with ❤️ for the AI and Reddit community**
