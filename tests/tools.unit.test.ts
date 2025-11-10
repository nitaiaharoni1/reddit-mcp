/**
 * Tools Unit Tests
 * Tests for MCP tool registration and handling (without database dependencies)
 */

import { getToolDefinitions } from '../src/tools/index';

describe('Tools Module', () => {
  describe('getToolDefinitions', () => {
    test('should return all available tool definitions', () => {
      const tools = getToolDefinitions();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Check that all tools have required properties
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');

        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    test('should include all expected tool categories', () => {
      const tools = getToolDefinitions();
      const toolNames = tools.map((tool) => tool.name);

      // Query tools
      expect(toolNames).toContain('query_database');
      expect(toolNames).toContain('explain_query');

      // Schema tools
      expect(toolNames).toContain('list_tables');
      expect(toolNames).toContain('describe_table');
      expect(toolNames).toContain('list_schemas');
      expect(toolNames).toContain('list_indexes');
      expect(toolNames).toContain('get_foreign_keys');
      expect(toolNames).toContain('list_functions');

      // Analysis tools
      expect(toolNames).toContain('get_table_stats');
      expect(toolNames).toContain('analyze_column');
      expect(toolNames).toContain('get_database_info');

      // Discovery tools
      expect(toolNames).toContain('search_tables');
    });

    test('should have valid input schemas for all tools', () => {
      const tools = getToolDefinitions();

      tools.forEach((tool) => {
        const schema = tool.inputSchema;

        expect(schema.type).toBe('object');
        expect(schema).toHaveProperty('properties');
        expect(typeof schema.properties).toBe('object');

        // If required array exists, it should be an array
        if (schema.required) {
          expect(Array.isArray(schema.required)).toBe(true);
        }

        // Check that all required properties exist in properties
        if (schema.required) {
          schema.required.forEach((reqProp) => {
            expect(schema.properties).toHaveProperty(reqProp);
          });
        }
      });
    });

    test('should have unique tool names', () => {
      const tools = getToolDefinitions();
      const toolNames = tools.map((tool) => tool.name);
      const uniqueNames = new Set(toolNames);

      expect(uniqueNames.size).toBe(toolNames.length);
    });

    test('should have non-empty descriptions for all tools', () => {
      const tools = getToolDefinitions();

      tools.forEach((tool) => {
        expect(tool.description.trim().length).toBeGreaterThan(0);
        expect(tool.description).toMatch(/\w/); // Contains at least one word character
      });
    });

    test('should include database type information in descriptions', () => {
      const tools = getToolDefinitions();

      tools.forEach((tool) => {
        // Most tools should mention supported databases or PostgreSQL specifically
        const description = tool.description.toLowerCase();
        const mentionsDatabase =
          description.includes('postgresql') ||
          description.includes('mysql') ||
          description.includes('sqlite') ||
          description.includes('database') ||
          description.includes('sql') ||
          tool.name.includes('postgres'); // PostgreSQL-specific tools

        expect(mentionsDatabase).toBe(true);
      });
    });
  });

  describe('Tool Input Schema Validation', () => {
    test('query_database should have correct schema', () => {
      const tools = getToolDefinitions();
      const queryTool = tools.find((tool) => tool.name === 'query_database');

      expect(queryTool).toBeDefined();
      expect(queryTool!.inputSchema.required).toContain('query');
      expect(queryTool!.inputSchema.properties).toHaveProperty('query');
      expect(queryTool!.inputSchema.properties.query.type).toBe('string');
    });

    test('describe_table should have correct schema', () => {
      const tools = getToolDefinitions();
      const describeTool = tools.find((tool) => tool.name === 'describe_table');

      expect(describeTool).toBeDefined();
      expect(describeTool!.inputSchema.required).toContain('table_name');
      expect(describeTool!.inputSchema.properties).toHaveProperty('table_name');
      expect(describeTool!.inputSchema.properties.table_name.type).toBe(
        'string',
      );
    });

    test('analyze_column should have correct schema', () => {
      const tools = getToolDefinitions();
      const analyzeTool = tools.find((tool) => tool.name === 'analyze_column');

      expect(analyzeTool).toBeDefined();
      expect(analyzeTool!.inputSchema.required).toContain('table_name');
      expect(analyzeTool!.inputSchema.required).toContain('column_name');
      expect(analyzeTool!.inputSchema.properties).toHaveProperty('table_name');
      expect(analyzeTool!.inputSchema.properties).toHaveProperty('column_name');
    });

    test('search_tables should have correct schema', () => {
      const tools = getToolDefinitions();
      const searchTool = tools.find((tool) => tool.name === 'search_tables');

      expect(searchTool).toBeDefined();
      expect(searchTool!.inputSchema.required).toContain('search_term');
      expect(searchTool!.inputSchema.properties).toHaveProperty('search_term');
      expect(searchTool!.inputSchema.properties).toHaveProperty('limit');
      expect(searchTool!.inputSchema.properties.limit.type).toBe('number');
    });

    test('explain_query should have correct schema', () => {
      const tools = getToolDefinitions();
      const explainTool = tools.find((tool) => tool.name === 'explain_query');

      expect(explainTool).toBeDefined();
      expect(explainTool!.inputSchema.required).toContain('query');
      expect(explainTool!.inputSchema.properties).toHaveProperty('query');
      expect(explainTool!.inputSchema.properties).toHaveProperty('analyze');
      expect(explainTool!.inputSchema.properties.analyze.type).toBe('boolean');
    });
  });
});
