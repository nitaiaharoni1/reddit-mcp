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
npx database-mcp --version
```

## Usage After Publishing

Users can now use your package with NPX without installation:

```bash
# Setup database connection
npx database-mcp init "postgresql://user:pass@host:port/db"

# Check status
npx database-mcp status

# Show help
npx database-mcp --help
```

## Claude Desktop Configuration

After running `npx database-mcp init`, users will have this configuration in their Claude Desktop config:

```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "npx",
      "args": ["database-mcp"],
      "env": {
        "DATABASE_URL": "their_connection_string"
      }
    }
  }
}
```

Instead of the old local path:
```json
{
  "mcpServers": {
    "database": {
      "command": "node",
      "args": ["/Users/nitaiaharoni/REPOS/database-mcp/dist/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://..."
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
3. Check their DATABASE_URL format
4. Ensure Claude Desktop is restarted after configuration 