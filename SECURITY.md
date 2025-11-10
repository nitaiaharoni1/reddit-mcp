# Security Notice

## ⚠️ Important: Credentials in Git History

**If you've committed Reddit API credentials to this repository, they are still in the git history even after removal.**

### What to Do

1. **Rotate Your Reddit API Credentials Immediately**
   - Go to https://www.reddit.com/prefs/apps
   - Delete the old app or regenerate the client secret
   - Create a new app with new credentials

2. **Remove Secrets from Git History** (if this is a public repo or you want to clean history)
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner to remove secrets
   # Example with git filter-branch:
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch test-reddit.ts test-mcp-server.ts QUICK_START.md" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force Push** (⚠️ Only if you're sure - this rewrites history)
   ```bash
   git push origin --force --all
   ```

### Best Practices Going Forward

✅ **DO:**
- Use environment variables for all secrets
- Add `.env` files to `.gitignore`
- Use `.env.example` with placeholder values
- Never commit actual credentials

❌ **DON'T:**
- Hardcode secrets in source files
- Commit test files with real credentials
- Share credentials in documentation
- Store secrets in version control

### Current Protection

- ✅ Test files are now in `.gitignore`
- ✅ All test files use environment variables
- ✅ `.env.example` uses placeholder values
- ✅ Documentation uses placeholder values

### Environment Variables

Always set credentials via environment variables:

```bash
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/yourusername)"
```

