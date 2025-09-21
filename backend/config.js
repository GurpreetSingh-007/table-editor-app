// Database and Redis connection configuration
module.exports = {
  pg: {
    // Use DATABASE_URL for production (Railway/Heroku style) or individual env vars for development
    connectionString: process.env.DATABASE_URL,
    // Fallback to individual env vars for local development
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'table_editor',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    // SSL configuration for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    url: process.env.REDIS_URL
  }
};
