/**
 * Database Factory Unit Tests
 * Tests for database type detection and factory functionality
 */

import DatabaseFactory from '../src/database/factory';
import PostgreSQLDatabase from '../src/database/postgresql';
import MySQLDatabase from '../src/database/mysql';
import SQLiteDatabase from '../src/database/sqlite';
import SnowflakeDatabase from '../src/database/snowflake';

describe('DatabaseFactory', () => {
  describe('detectDatabaseType', () => {
    test('should detect PostgreSQL connection strings', () => {
      const postgresUrls = [
        'postgresql://user:pass@localhost:5432/mydb',
        'postgres://user:pass@host:5432/db',
        'postgresql://user@localhost/db',
      ];

      postgresUrls.forEach((url) => {
        expect(DatabaseFactory.detectDatabaseType(url)).toBe('postgresql');
      });
    });

    test('should detect MySQL connection strings', () => {
      const mysqlUrls = [
        'mysql://user:pass@localhost:3306/mydb',
        'mysql://user@localhost/db',
      ];

      mysqlUrls.forEach((url) => {
        expect(DatabaseFactory.detectDatabaseType(url)).toBe('mysql');
      });
    });

    test('should detect SQLite connection strings', () => {
      const sqliteUrls = [
        'sqlite:///path/to/db.sqlite',
        'sqlite://./database.db',
        './database.sqlite',
        '/absolute/path/to/db.sqlite3',
        '../relative/path/db.db',
      ];

      sqliteUrls.forEach((url) => {
        expect(DatabaseFactory.detectDatabaseType(url)).toBe('sqlite');
      });
    });

    test('should detect Snowflake connection strings', () => {
      const snowflakeUrls = [
        'snowflake://user:pass@account.snowflakecomputing.com/db/schema',
        'snowflake://user:pass@account.us-east-1.snowflakecomputing.com/db',
        'https://account.snowflakecomputing.com',
      ];

      snowflakeUrls.forEach((url) => {
        expect(DatabaseFactory.detectDatabaseType(url)).toBe('snowflake');
      });
    });

    test('should throw error for unknown connection strings', () => {
      const invalidUrls = ['unknown://user@host/db', 'invalid-string', ''];

      invalidUrls.forEach((url) => {
        expect(() => DatabaseFactory.detectDatabaseType(url)).toThrow();
      });
    });
  });

  describe('create', () => {
    test('should create PostgreSQL database instance', () => {
      const db = DatabaseFactory.create(
        'postgresql://user:pass@localhost:5432/db',
      );
      expect(db).toBeInstanceOf(PostgreSQLDatabase);
    });

    test('should create MySQL database instance', () => {
      const db = DatabaseFactory.create('mysql://user:pass@localhost:3306/db');
      expect(db).toBeInstanceOf(MySQLDatabase);
    });

    test('should create SQLite database instance', () => {
      const db = DatabaseFactory.create('sqlite:///path/to/db.sqlite');
      expect(db).toBeInstanceOf(SQLiteDatabase);
    });

    test('should create Snowflake database instance', () => {
      const db = DatabaseFactory.create(
        'snowflake://user:pass@account.snowflakecomputing.com/db',
      );
      expect(db).toBeInstanceOf(SnowflakeDatabase);
    });

    test('should throw error for unsupported database type', () => {
      expect(() =>
        DatabaseFactory.create('unsupported://connection'),
      ).toThrow();
    });
  });

  describe('validateConnectionString', () => {
    test('should validate PostgreSQL connection strings', () => {
      const validPostgres = 'postgresql://user:pass@localhost:5432/mydb';
      const result = DatabaseFactory.validateConnectionString(validPostgres);

      expect(result.isValid).toBe(true);
      expect(result.type).toBe('postgresql');
      expect(result.errors).toHaveLength(0);
    });

    test('should validate MySQL connection strings', () => {
      const validMysql = 'mysql://user:pass@localhost:3306/mydb';
      const result = DatabaseFactory.validateConnectionString(validMysql);

      expect(result.isValid).toBe(true);
      expect(result.type).toBe('mysql');
      expect(result.errors).toHaveLength(0);
    });

    test('should validate SQLite connection strings', () => {
      const validSqlite = './database.sqlite';
      const result = DatabaseFactory.validateConnectionString(validSqlite);

      expect(result.isValid).toBe(true);
      expect(result.type).toBe('sqlite');
      expect(result.errors).toHaveLength(0);
    });

    test('should validate Snowflake connection strings', () => {
      const validSnowflake =
        'snowflake://user:pass@account.snowflakecomputing.com/db';
      const result = DatabaseFactory.validateConnectionString(validSnowflake);

      expect(result.isValid).toBe(true);
      expect(result.type).toBe('snowflake');
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty connection strings', () => {
      const result = DatabaseFactory.validateConnectionString('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Connection string is required');
    });

    test('should reject malformed PostgreSQL connection strings', () => {
      const invalidPostgres = 'postgresql://localhost'; // missing username and database
      const result = DatabaseFactory.validateConnectionString(invalidPostgres);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject malformed Snowflake connection strings', () => {
      const invalidSnowflake = 'snowflake://account.snowflakecomputing.com'; // missing username and password
      const result = DatabaseFactory.validateConnectionString(invalidSnowflake);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('utility methods', () => {
    test('getSupportedTypes should return all supported database types', () => {
      const types = DatabaseFactory.getSupportedTypes();

      expect(types).toContain('postgresql');
      expect(types).toContain('mysql');
      expect(types).toContain('sqlite');
      expect(types).toContain('snowflake');
      expect(types).toHaveLength(4);
    });

    test('getDisplayName should return proper display names', () => {
      expect(DatabaseFactory.getDisplayName('postgresql')).toBe('PostgreSQL');
      expect(DatabaseFactory.getDisplayName('mysql')).toBe('MySQL');
      expect(DatabaseFactory.getDisplayName('sqlite')).toBe('SQLite');
      expect(DatabaseFactory.getDisplayName('snowflake')).toBe('Snowflake');
    });

    test('getConnectionStringExamples should return example connection strings', () => {
      const examples = DatabaseFactory.getConnectionStringExamples();

      expect(examples).toHaveProperty('postgresql');
      expect(examples).toHaveProperty('mysql');
      expect(examples).toHaveProperty('sqlite');
      expect(examples).toHaveProperty('snowflake');

      expect(Array.isArray(examples.postgresql)).toBe(true);
      expect(Array.isArray(examples.mysql)).toBe(true);
      expect(Array.isArray(examples.sqlite)).toBe(true);
      expect(Array.isArray(examples.snowflake)).toBe(true);

      expect(examples.postgresql.length).toBeGreaterThan(0);
      expect(examples.mysql.length).toBeGreaterThan(0);
      expect(examples.sqlite.length).toBeGreaterThan(0);
      expect(examples.snowflake.length).toBeGreaterThan(0);
    });
  });
});
