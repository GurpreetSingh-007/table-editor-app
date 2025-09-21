
// PostgreSQL helper functions using pg library
const { Pool } = require('pg');
const config = require('./config');

// Create pool with either DATABASE_URL or individual config
const poolConfig = config.pg.connectionString 
  ? { connectionString: config.pg.connectionString, ssl: config.pg.ssl }
  : {
      host: config.pg.host,
      port: config.pg.port,
      database: config.pg.database,
      user: config.pg.user,
      password: config.pg.password,
      ssl: config.pg.ssl
    };

console.log('PostgreSQL pool config:', { 
  ...poolConfig, 
  connectionString: poolConfig.connectionString ? '[REDACTED]' : undefined 
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
