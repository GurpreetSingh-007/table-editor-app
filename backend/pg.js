
// PostgreSQL helper functions using pg library
const { Pool } = require('pg');

// Create pool configuration
let poolConfig;

if (process.env.DATABASE_URL) {
  // Production mode - use DATABASE_URL with SSL
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };
} else {
  // Development mode - use individual env vars
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'table_editor',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false
  };
}

console.log('PostgreSQL pool config:', { 
  ...poolConfig, 
  connectionString: poolConfig.connectionString ? '[REDACTED]' : undefined,
  password: poolConfig.password ? '[REDACTED]' : undefined
});

const pool = new Pool(poolConfig);

function addUserToPG(username, callback) {
  pool.query('INSERT INTO users (username) VALUES ($1) ON CONFLICT DO NOTHING', [username], (err, res) => {
    console.log('addUserToPG result:', err, res);
    if (err) return callback(err);
    callback(null, res);
  });
}

function getUserFromPG(username, callback) {
  pool.query('SELECT * FROM users WHERE username = $1', [username], (err, res) => {
    if (err) return callback(err);
    callback(null, res.rows);
  });
}

// Generic function for executing SQL queries
function pgSend(sql, callback) {
  console.log('Executing SQL:', sql);
  pool.query(sql, (err, res) => {
    console.log('SQL result:', err, res);
    if (err) return callback(err);
    callback(null, res);
  });
}

module.exports = { addUserToPG, getUserFromPG, pgSend };
