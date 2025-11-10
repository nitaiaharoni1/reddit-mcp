# Testing Guide

This project uses **Jest** as the testing framework with TypeScript support for comprehensive testing of the Reddit MCP Server.

## Test Structure

### Test Types

1. **Unit Tests** - Test individual components in isolation
   - `tests/tools.unit.test.ts` - MCP tool definitions and schemas
   - `tests/cli.test.ts` - CLI command handling

2. **Integration Tests** - Test full functionality with Reddit API
   - `tests/server-cli-integration.test.ts` - End-to-end MCP tool testing

### Test Setup

- **Configuration**: `jest.config.js`
- **Setup File**: `tests/setup.ts` - Global test configuration and custom matchers
- **TypeScript Support**: Configured with `ts-jest` preset
- **Timeout**: 30 seconds for API operations

## Available Test Commands

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

## Environment Setup for Testing

To run integration tests, you'll need Reddit API credentials:

```bash
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USER_AGENT="reddit-mcp:1.0.0 (by /u/testuser)"
```

**Note**: Integration tests make real API calls to Reddit. Be mindful of rate limits.

## Writing Tests

### Example Unit Test

```typescript
import { getToolDefinitions } from '../src/tools';

describe('Reddit MCP Tools', () => {
  it('should export all tool definitions', () => {
    const tools = getToolDefinitions();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0]).toHaveProperty('name');
    expect(tools[0]).toHaveProperty('description');
    expect(tools[0]).toHaveProperty('inputSchema');
  });
});
```

### Example Integration Test

```typescript
import { getRedditClient } from '../src/reddit';

describe('Reddit API Integration', () => {
  it('should fetch subreddit posts', async () => {
    const client = getRedditClient();
    const response = await client.getSubredditPosts('programming', 'hot', 5);
    expect(response.data.children.length).toBeGreaterThan(0);
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for all tool handlers
- **Integration Tests**: Cover all major Reddit API endpoints
- **Error Handling**: Test all error scenarios

## Mocking Reddit API

For unit tests, you may want to mock Reddit API responses:

```typescript
jest.mock('../src/reddit/client', () => ({
  RedditClient: jest.fn().mockImplementation(() => ({
    getSubredditPosts: jest.fn().mockResolvedValue({
      data: {
        children: [{ data: { id: 'test', title: 'Test Post' } }],
        after: null,
        before: null,
      },
    }),
  })),
}));
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before publishing to npm

Make sure all tests pass before submitting PRs.
