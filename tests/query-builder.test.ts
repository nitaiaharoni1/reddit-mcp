/**
 * Query Builder Unit Tests
 * Tests for database-agnostic query building utilities
 */

import { QueryBuilder, ExplainResultParser } from '../src/utils/query-builder';

describe('QueryBuilder', () => {
  describe('buildExplainQuery', () => {
    test('should build PostgreSQL EXPLAIN queries', () => {
      const query = 'SELECT * FROM users';

      const explain = QueryBuilder.buildExplainQuery(
        'postgresql',
        query,
        false,
      );
      expect(explain).toBe('EXPLAIN (FORMAT JSON) SELECT * FROM users');

      const explainAnalyze = QueryBuilder.buildExplainQuery(
        'postgresql',
        query,
        true,
      );
      expect(explainAnalyze).toBe(
        'EXPLAIN (ANALYZE, FORMAT JSON) SELECT * FROM users',
      );
    });

    test('should build MySQL EXPLAIN queries', () => {
      const query = 'SELECT * FROM users';

      const explain = QueryBuilder.buildExplainQuery('mysql', query, false);
      expect(explain).toBe('EXPLAIN FORMAT=JSON SELECT * FROM users');

      const explainAnalyze = QueryBuilder.buildExplainQuery(
        'mysql',
        query,
        true,
      );
      expect(explainAnalyze).toBe('EXPLAIN ANALYZE SELECT * FROM users');
    });

    test('should build SQLite EXPLAIN queries', () => {
      const query = 'SELECT * FROM users';

      const explain = QueryBuilder.buildExplainQuery('sqlite', query, false);
      expect(explain).toBe('EXPLAIN QUERY PLAN SELECT * FROM users');

      // SQLite doesn't support ANALYZE in EXPLAIN
      const explainAnalyze = QueryBuilder.buildExplainQuery(
        'sqlite',
        query,
        true,
      );
      expect(explainAnalyze).toBe('EXPLAIN QUERY PLAN SELECT * FROM users');
    });

    test('should build Snowflake EXPLAIN queries', () => {
      const query = 'SELECT * FROM users';

      const explain = QueryBuilder.buildExplainQuery('snowflake', query, false);
      expect(explain).toBe('EXPLAIN SELECT * FROM users');

      const explainAnalyze = QueryBuilder.buildExplainQuery(
        'snowflake',
        query,
        true,
      );
      expect(explainAnalyze).toBe('EXPLAIN SELECT * FROM users');
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        QueryBuilder.buildExplainQuery('unsupported' as any, 'SELECT 1', false);
      }).toThrow('Unsupported database type for EXPLAIN');
    });
  });

  describe('buildColumnStatsQuery', () => {
    test('should build PostgreSQL column stats query', () => {
      const query = QueryBuilder.buildColumnStatsQuery(
        'postgresql',
        'users',
        'email',
      );

      expect(query).toContain('COUNT(*)');
      expect(query).toContain('COUNT("email")');
      expect(query).toContain('COUNT(DISTINCT "email")');
      expect(query).toContain('"users"');
      expect(query).toContain('::text');
    });

    test('should build MySQL column stats query', () => {
      const query = QueryBuilder.buildColumnStatsQuery(
        'mysql',
        'users',
        'email',
      );

      expect(query).toContain('COUNT(*)');
      expect(query).toContain('COUNT(`email`)');
      expect(query).toContain('COUNT(DISTINCT `email`)');
      expect(query).toContain('`users`');
      expect(query).toContain('CAST');
    });

    test('should build SQLite column stats query', () => {
      const query = QueryBuilder.buildColumnStatsQuery(
        'sqlite',
        'users',
        'email',
      );

      expect(query).toContain('COUNT(*)');
      expect(query).toContain('COUNT("email")');
      expect(query).toContain('COUNT(DISTINCT "email")');
      expect(query).toContain('"users"');
    });

    test('should build Snowflake column stats query', () => {
      const query = QueryBuilder.buildColumnStatsQuery(
        'snowflake',
        'users',
        'email',
      );

      expect(query).toContain('COUNT(*)');
      expect(query).toContain('COUNT("email")');
      expect(query).toContain('COUNT(DISTINCT "email")');
      expect(query).toContain('"users"');
      expect(query).toContain('TO_VARCHAR');
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        QueryBuilder.buildColumnStatsQuery(
          'unsupported' as any,
          'table',
          'column',
        );
      }).toThrow('Unsupported database type for identifier escaping');
    });
  });

  describe('buildMostCommonValuesQuery', () => {
    test('should build PostgreSQL most common values query', () => {
      const query = QueryBuilder.buildMostCommonValuesQuery(
        'postgresql',
        'users',
        'status',
        5,
      );

      expect(query).toContain('SELECT "status"');
      expect(query).toContain('COUNT(*) as frequency');
      expect(query).toContain('FROM "users"');
      expect(query).toContain('GROUP BY "status"');
      expect(query).toContain('ORDER BY frequency DESC');
      expect(query).toContain('LIMIT 5');
    });

    test('should build MySQL most common values query', () => {
      const query = QueryBuilder.buildMostCommonValuesQuery(
        'mysql',
        'users',
        'status',
        10,
      );

      expect(query).toContain('SELECT `status`');
      expect(query).toContain('COUNT(*) as frequency');
      expect(query).toContain('FROM `users`');
      expect(query).toContain('GROUP BY `status`');
      expect(query).toContain('ORDER BY frequency DESC');
      expect(query).toContain('LIMIT 10');
    });

    test('should build SQLite most common values query', () => {
      const query = QueryBuilder.buildMostCommonValuesQuery(
        'sqlite',
        'users',
        'status',
      );

      expect(query).toContain('SELECT "status"');
      expect(query).toContain('COUNT(*) as frequency');
      expect(query).toContain('FROM "users"');
      expect(query).toContain('GROUP BY "status"');
      expect(query).toContain('ORDER BY frequency DESC');
      expect(query).toContain('LIMIT 10'); // default limit
    });

    test('should build Snowflake most common values query', () => {
      const query = QueryBuilder.buildMostCommonValuesQuery(
        'snowflake',
        'users',
        'status',
        5,
      );

      expect(query).toContain('SELECT "status"');
      expect(query).toContain('COUNT(*) as frequency');
      expect(query).toContain('FROM "users"');
      expect(query).toContain('GROUP BY "status"');
      expect(query).toContain('ORDER BY frequency DESC');
      expect(query).toContain('LIMIT 5');
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        QueryBuilder.buildMostCommonValuesQuery(
          'unsupported' as any,
          'table',
          'column',
        );
      }).toThrow('Unsupported database type for identifier escaping');
    });
  });

  describe('escapeIdentifier', () => {
    test('should escape PostgreSQL identifiers', () => {
      expect(QueryBuilder.escapeIdentifier('postgresql', 'table')).toBe(
        '"table"',
      );
      expect(QueryBuilder.escapeIdentifier('postgresql', 'user"name')).toBe(
        '"user""name"',
      );
    });

    test('should escape MySQL identifiers', () => {
      expect(QueryBuilder.escapeIdentifier('mysql', 'table')).toBe('`table`');
      expect(QueryBuilder.escapeIdentifier('mysql', 'user`name')).toBe(
        '`user``name`',
      );
    });

    test('should escape SQLite identifiers', () => {
      expect(QueryBuilder.escapeIdentifier('sqlite', 'table')).toBe('"table"');
      expect(QueryBuilder.escapeIdentifier('sqlite', 'user"name')).toBe(
        '"user""name"',
      );
    });

    test('should escape Snowflake identifiers', () => {
      expect(QueryBuilder.escapeIdentifier('snowflake', 'table')).toBe(
        '"table"',
      );
      expect(QueryBuilder.escapeIdentifier('snowflake', 'user"name')).toBe(
        '"user""name"',
      );
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        QueryBuilder.escapeIdentifier('unsupported' as any, 'identifier');
      }).toThrow('Unsupported database type for identifier escaping');
    });
  });

  describe('buildTableFilter', () => {
    test('should build PostgreSQL table filter', () => {
      expect(QueryBuilder.buildTableFilter('postgresql', 'users')).toBe(
        'table_name = $1',
      );
      expect(QueryBuilder.buildTableFilter('postgresql', 'users', 3)).toBe(
        'table_name = $3',
      );
    });

    test('should build MySQL table filter', () => {
      expect(QueryBuilder.buildTableFilter('mysql', 'users')).toBe(
        'table_name = ?',
      );
      expect(QueryBuilder.buildTableFilter('mysql', 'users', 2)).toBe(
        'table_name = ?',
      );
    });

    test('should build SQLite table filter', () => {
      expect(QueryBuilder.buildTableFilter('sqlite', 'users')).toBe('name = ?');
    });

    test('should build Snowflake table filter', () => {
      expect(QueryBuilder.buildTableFilter('snowflake', 'users')).toBe(
        'table_name = ?',
      );
      expect(QueryBuilder.buildTableFilter('snowflake', 'users', 2)).toBe(
        'table_name = ?',
      );
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        QueryBuilder.buildTableFilter('unsupported' as any, 'table');
      }).toThrow('Unsupported database type for table filter');
    });
  });
});

describe('ExplainResultParser', () => {
  describe('parseExplainResult', () => {
    test('should parse PostgreSQL EXPLAIN results', () => {
      const rows = [
        { 'QUERY PLAN': { 'Node Type': 'Seq Scan', 'Relation Name': 'users' } },
      ];

      const result = ExplainResultParser.parseExplainResult('postgresql', rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        'Node Type': 'Seq Scan',
        'Relation Name': 'users',
      });
    });

    test('should parse MySQL EXPLAIN results', () => {
      const rows = [{ EXPLAIN: '{"query_block": {"select_id": 1}}' }];

      const result = ExplainResultParser.parseExplainResult('mysql', rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ query_block: { select_id: 1 } });
    });

    test('should parse MySQL EXPLAIN results without JSON', () => {
      const rows = [{ id: 1, select_type: 'SIMPLE', table: 'users' }];

      const result = ExplainResultParser.parseExplainResult('mysql', rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        select_type: 'SIMPLE',
        table: 'users',
      });
    });

    test('should parse SQLite EXPLAIN results', () => {
      const rows = [
        { id: 1, parent: 0, notused: 0, detail: 'SCAN TABLE users' },
      ];

      const result = ExplainResultParser.parseExplainResult('sqlite', rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        parent: 0,
        notused: 0,
        detail: 'SCAN TABLE users',
      });
    });

    test('should parse Snowflake EXPLAIN results', () => {
      const rows = [{ step: 1, operation: 'TableScan', object: 'USERS' }];

      const result = ExplainResultParser.parseExplainResult('snowflake', rows);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        step: 1,
        operation: 'TableScan',
        object: 'USERS',
      });
    });

    test('should throw error for unsupported database type', () => {
      expect(() => {
        ExplainResultParser.parseExplainResult('unsupported' as any, []);
      }).toThrow('Unsupported database type for EXPLAIN parsing');
    });
  });
});
