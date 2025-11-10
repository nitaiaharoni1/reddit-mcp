# Reddit MCP Server - API Assessment

## Current Tools (8 total)

### Subreddits (2)
- ✅ `get_subreddit_posts` - Get posts (hot, new, top, rising)
- ✅ `get_subreddit_info` - Get subreddit metadata

### Posts (2)
- ✅ `get_post` - Get single post details
- ✅ `get_post_comments` - Get comments for a post

### Search (1)
- ✅ `search_reddit` - Search posts across Reddit or in a subreddit

### Users (3)
- ✅ `get_user_info` - Get user profile info
- ✅ `get_user_posts` - Get user's submitted posts
- ✅ `get_user_comments` - Get user's comments

---

## Missing Important Tools

### 🔴 HIGH PRIORITY (Most Commonly Used)

#### 1. **Front Page Listings** ⭐⭐⭐
**Why:** These are the most common ways users browse Reddit
- `/best` - Best posts across all subreddits
- `/hot` - Hot posts (front page)
- `/new` - New posts (front page)  
- `/top` - Top posts (front page)
- `/rising` - Rising posts (front page)
- `/controversial` - Controversial posts (front page)

**Suggested Tool:** `get_front_page_posts`
```typescript
{
  sort: 'best' | 'hot' | 'new' | 'top' | 'rising' | 'controversial',
  limit?: number,
  after?: string,
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
}
```

#### 2. **Subreddit Discovery** ⭐⭐⭐
**Why:** Essential for finding new communities
- `/subreddits/popular` - Popular subreddits
- `/subreddits/new` - Newly created subreddits
- `/subreddits/search` - Search subreddits by name/description
- `/subreddits/default` - Default subreddits

**Suggested Tools:** 
- `get_popular_subreddits`
- `get_new_subreddits`
- `search_subreddits` (query-based)

#### 3. **Controversial Sort for Subreddits** ⭐⭐
**Why:** Currently missing from `get_subreddit_posts`
- Add `'controversial'` to the sort enum
- Requires `time` parameter like `top`

#### 4. **User Overview** ⭐⭐
**Why:** Shows all user activity (posts + comments) in one feed
- `/user/username/overview` - Combined posts and comments

**Suggested Tool:** `get_user_overview`

#### 5. **Current User Info** ⭐⭐
**Why:** Get info about authenticated user (we have `getMe()` but no tool)
- `/api/v1/me` - Current user identity
- `/api/v1/me/karma` - Karma breakdown by subreddit
- `/api/v1/me/trophies` - User trophies

**Suggested Tools:**
- `get_current_user` (if authenticated)
- `get_current_user_karma` (if authenticated)

---

### 🟡 MEDIUM PRIORITY (Nice to Have)

#### 6. **User Saved/Gilded Content** ⭐
**Why:** Useful for finding quality content
- `/user/username/saved` - Saved posts/comments (requires auth for own account)
- `/user/username/gilded` - Gilded posts/comments

**Suggested Tools:**
- `get_user_saved` (works for any user's public saved, requires auth for own)
- `get_user_gilded`

#### 7. **Search Subreddits by Name** ⭐
**Why:** Find subreddits when you don't know exact name
- `/api/search_subreddits` - Search subreddits
- `/api/search_reddit_names` - Autocomplete subreddit names

**Suggested Tool:** `search_subreddit_names`

#### 8. **Get Multiple Posts by ID** ⭐
**Why:** Efficiently fetch multiple specific posts
- `/by_id/names` - Get posts by fullname IDs

**Suggested Tool:** `get_posts_by_id`

---

### 🟢 LOW PRIORITY (Requires Auth or Less Common)

#### 9. **Write Operations** (Requires User Authentication)
- `/api/vote` - Upvote/downvote posts/comments
- `/api/save` / `/api/unsave` - Save/unsave posts
- `/api/subscribe` / `/api/unsubscribe` - Subscribe to subreddits
- `/api/comment` - Post comments
- `/api/submit` - Submit new posts

**Note:** These require user authentication (username/password) and appropriate OAuth scopes. Consider adding these in a future "write operations" module if user auth is configured.

#### 10. **Moderation Tools** (Requires Mod Permissions)
- Various moderation endpoints for mods
- **Note:** Very specific use case, probably not needed for general MCP server

---

## Recommended Implementation Order

### Phase 1: High Priority (Do First)
1. ✅ Add `controversial` sort to `get_subreddit_posts`
2. ✅ Implement `get_front_page_posts` tool
3. ✅ Implement `get_popular_subreddits` tool
4. ✅ Implement `search_subreddits` tool
5. ✅ Implement `get_user_overview` tool

### Phase 2: Medium Priority (Do Next)
6. ✅ Implement `get_user_gilded` tool
7. ✅ Implement `search_subreddit_names` tool
8. ✅ Implement `get_posts_by_id` tool

### Phase 3: Authentication-Dependent (Future)
9. ⏳ Implement `get_current_user` tool (if authenticated)
10. ⏳ Consider write operations if user auth is added

---

## Summary

**Total Missing High Priority Tools:** 5
**Total Missing Medium Priority Tools:** 3
**Total Missing Low Priority Tools:** 2+

**Recommendation:** Implement Phase 1 (5 tools) to significantly improve the MCP server's usefulness. These cover the most common Reddit browsing patterns.

