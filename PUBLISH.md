# Publishing Guide

## Prerequisites

1. **NPM Account**: Make sure you have an NPM account and are logged in
   ```bash
   npm login
   ```

2. **Version Update**: Update the version in `package.json` if needed
   ```bash
   npm version patch  # or minor/major
   ```

## Publishing Steps

### 1. Pre-publish Check
```bash
npm run publish:check
```
This will:
- Clean and build the project
- Run unit tests
- Show what files will be included in the package

### 2. Publish to NPM
```bash
npm run publish:public
```

### 3. Verify Publication
```bash
npx reddit-mcp --version
```

## Usage After Publishing

Users can now use your package with NPX without installation:

```bash
# Show help
npx reddit-mcp --help

# Show version
npx reddit-mcp --version
```

## Claude Desktop Configuration

Users need to configure Reddit credentials in their Claude Desktop config:

```json
{
  "mcpServers": {
    "reddit-mcp": {
      "command": "npx",
      "args": ["reddit-mcp"],
      "env": {
        "REDDIT_CLIENT_ID": "their_client_id",
        "REDDIT_CLIENT_SECRET": "their_client_secret",
        "REDDIT_USER_AGENT": "reddit-mcp:1.0.0 (by /u/theirusername)"
      }
    }
  }
}
```

Or for local development:
```json
{
  "mcpServers": {
    "reddit-mcp": {
      "command": "node",
      "args": ["/path/to/reddit-mcp/dist/server.js"],
      "env": {
        "REDDIT_CLIENT_ID": "their_client_id",
        "REDDIT_CLIENT_SECRET": "their_client_secret",
        "REDDIT_USER_AGENT": "reddit-mcp:1.0.0 (by /u/theirusername)"
      }
    }
  }
}
```

## Benefits of NPX Approach

- ✅ **No installation required** - Users can run immediately
- ✅ **Always latest version** - NPX fetches the newest version
- ✅ **No global pollution** - Doesn't install packages globally
- ✅ **Cross-platform** - Works on Windows, macOS, Linux
- ✅ **Easy updates** - Users automatically get updates
- ✅ **Simple sharing** - Just share the `npx` command

## Troubleshooting

If users have issues:
1. Check if they have Node.js installed (`node --version`)
2. Verify NPX is available (`npx --version`)
3. Verify Reddit API credentials are set correctly
4. Check that REDDIT_USER_AGENT follows the required format
5. Ensure Claude Desktop is restarted after configuration
6. Get Reddit API credentials from https://www.reddit.com/prefs/apps 