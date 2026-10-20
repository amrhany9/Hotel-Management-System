process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_PATH = ':memory:';
process.env.JWT_KEY = 'test_only_jwt_signing_key_that_is_at_least_32_bytes';
process.env.LOG_LEVEL = 'error';
