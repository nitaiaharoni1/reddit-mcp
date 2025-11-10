# Testing Guide

This project uses **Jest** as the testing framework with TypeScript support for comprehensive testing of the Multi-Database MCP Server.

## Test Structure

### Test Types

1. **Unit Tests** - Test individual components in isolation
   - `tests/database-factory.test.ts` - Database factory and type detection
   - `tests/query-builder.test.ts` - Query building utilities
   - `tests/tools.unit.test.ts` - MCP tool definitions and schemas

2. **Integration Tests** - Test full functionality with database connections
   - `tests/database.integration.test.ts` - End-to-end MCP tool testing

### Test Setup

- **Configuration**: `jest.config.js`
- **Setup File**: `tests/setup.ts` - Global test configuration and custom matchers
- **TypeScript Support**: Configured with `ts-jest` preset
- **Timeout**: 30 seconds for database operations

## Available Test Commands

### Run All Tests
```bash
npm test
```

### Run Tests by Type
```bash
# Unit tests only (fast, no database required)
npm run test:unit

# Integration tests only (requires DATABASE_URL)
npm run test:integration

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

### Coverage Reports
```bash
# Generate test coverage report
npm run test:coverage
```

### Legacy Test Runner
```bash
# Run the original test.ts file (for comparison)
npm run test:legacy:dev
npm run test:legacy
```

## Custom Jest Matchers

### `toBeValidDatabaseResult()`
Validates that a result object has the expected database result structure:
```typescript
expect(result).toBeValidDatabaseResult();
// Checks for: rows array, rowCount number
```

### `toHaveValidQueryStructure()`
Validates MCP query response structure:
```typescript
expect(result).toHaveValidQueryStructure();
// Checks for: content array property
```

## Test Environment Setup

### Environment Variables
Tests require the following environment variables:
- `DATABASE_URL` - PostgreSQL connection string (for integration tests)
- `NODE_TLS_REJECT_UNAUTHORIZED=0` - Automatically set for cloud databases

### SSL Certificate Handling
The test setup automatically handles SSL certificate issues common with cloud database providers.

## Test Categories

### Database Factory Tests
- Connection string detection (PostgreSQL, MySQL, SQLite)
- Database instance creation
- Connection string validation
- Utility methods

### Query Builder Tests
- Database-specific query building
- Identifier escaping
- EXPLAIN query generation
- Column statistics queries
- Error handling for unsupported databases

### Tools Tests
- MCP tool registration
- Input schema validation
- Tool definition completeness
- Unique tool names

### Integration Tests
- Database connection establishment
- All 13 MCP tools functionality
- Query execution and validation
- Schema introspection
- Analysis tools
- Discovery tools
- Error handling

## Coverage Goals

Current coverage focuses on:
- ✅ Core utilities (Query Builder: 94.87%)
- ✅ Database factory (82.85%)
- ✅ Type definitions and tool schemas
- 🔄 Database implementations (need more unit tests)
- 🔄 MCP tool handlers (tested via integration)

## Running Tests in Development

### Watch Mode
```bash
npm run test:watch
```
This will:
- Automatically re-run tests when files change
- Show only tests related to changed files
- Provide interactive options for test filtering

### Debugging Tests
1. Use Jest's `--verbose` flag for detailed output
2. Add `console.log` statements in tests
3. Use VS Code Jest extension for debugging
4. Set breakpoints in TypeScript test files

## Adding New Tests

### Unit Test Template
```typescript
/**
 * Component Unit Tests
 */

import { ComponentToTest } from '../src/path/to/component';

describe('ComponentToTest', () => {
  describe('methodName', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = ComponentToTest.methodName(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Integration Test Template
```typescript
import { initializeDatabase, closeDatabase } from '../src/database';

describe('Feature Integration Tests', () => {
  beforeAll(async () => {
    await initializeDatabase(process.env.DATABASE_URL!);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test('should test complete workflow', async () => {
    // Test implementation
  });
});
```

## Best Practices

1. **Isolation**: Unit tests should not depend on external resources
2. **Descriptive Names**: Test names should clearly describe the behavior being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
4. **Mock External Dependencies**: Use Jest mocks for external services in unit tests
5. **Test Edge Cases**: Include tests for error conditions and boundary cases
6. **Fast Feedback**: Keep unit tests fast, use integration tests sparingly

## Continuous Integration

Tests are designed to run in CI environments:
- Unit tests run without external dependencies
- Integration tests require database access
- Coverage reports can be generated for code quality metrics
- Build fails if TypeScript compilation or tests fail 