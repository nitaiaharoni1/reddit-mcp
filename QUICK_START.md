# Quick Start Guide

## ✅ Testing Results

All tests passed successfully! Your Reddit MCP server is working correctly.

## 🔑 Setting Up Reddit Credentials

**⚠️ IMPORTANT: Never commit your Reddit credentials to git!**

Get your credentials from https://www.reddit.com/prefs/apps and set them as environment variables:

```bash
export REDDIT_CLIENT_ID="your_client_id_here"
export REDDIT_CLIENT_SECRET="your_client_secret_here"
export REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)"
export REDDIT_USERNAME="your_username"  # Optional
export REDDIT_PASSWORD="your_password"  # Optional
```

## 🧪 Test Commands

### Test Reddit API Client Directly
```bash
REDDIT_CLIENT_ID="your_client_id" \
REDDIT_CLIENT_SECRET="your_client_secret" \
REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)" \
npx ts-node test-reddit.ts
```

### Test MCP Server Tools
```bash
REDDIT_CLIENT_ID="your_client_id" \
REDDIT_CLIENT_SECRET="your_client_secret" \
REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)" \
npx ts-node test-mcp-server.ts
```

## 🚀 Running the MCP Server

### Development Mode
```bash
REDDIT_CLIENT_ID="your_client_id_here" \
REDDIT_CLIENT_SECRET="your_client_secret_here" \
REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)" \
npm run dev
```

### Production Build
```bash
npm run build
node dist/server.js
```

## 📋 Available Tools

Your MCP server provides 8 tools:

1. **get_subreddit_posts** - Get posts from a subreddit
2. **get_subreddit_info** - Get subreddit information
3. **get_post** - Get post details
4. **get_post_comments** - Get comments for a post
5. **search_reddit** - Search Reddit
6. **get_user_info** - Get user information
7. **get_user_posts** - Get user's posts
8. **get_user_comments** - Get user's comments

## 🔧 Claude Desktop Configuration

Add this to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "reddit-mcp": {
      "command": "npx",
      "args": ["reddit-mcp"],
      "env": {
        "REDDIT_CLIENT_ID": "your_client_id_here",
        "REDDIT_CLIENT_SECRET": "your_client_secret_here",
        "REDDIT_USER_AGENT": "reddit-mcp:1.0.0 (by /u/yourusername)"
      }
    }
  }
}
```

Config file locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## ✅ Test Results Summary

- ✅ Reddit API authentication working
- ✅ Subreddit info retrieval working
- ✅ Post fetching working
- ✅ Search functionality working
- ✅ User info retrieval working
- ✅ All 8 MCP tools registered correctly
- ✅ MCP protocol implementation working

Your Reddit MCP server is ready to use! 🎉

