
// Import required modules at the top
const http = require('http');
const { createTable, editTableName, deleteTable, getTable } = require('./tables');
const { addActiveUser, removeActiveUser, getActiveUsers } = require('./redis');
const { addUserToPG, getUserFromPG } = require('./pg');

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Starting server in ${NODE_ENV} mode`);
console.log(`CORS Origin: ${CORS_ORIGIN}`);
console.log(`Port: ${PORT}`);

const server = http.createServer((req, res) => {
  // Set CORS headers for all requests - now using environment variable
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Table creation endpoint
  if (req.method === 'POST' && req.url === '/create-table') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      console.log('Raw body received:', body);
      try {
        const parsedData = JSON.parse(body);
        console.log('Parsed data:', parsedData);
        const { tableName, parentTableId } = parsedData;
        
        if (!tableName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'tableName is required' }));
          return;
        }
        
        createTable(tableName, parentTableId, (err, reply) => {
          if (err) {
            console.error('PostgreSQL error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'PostgreSQL error' }));
            return;
          }
          console.log('Table created successfully:', reply);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        console.error('JSON parsing error:', e);
        console.error('Raw body was:', body);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request', details: e.message }));
      }
    });
    return;
  }

  // Edit table name endpoint
  if (req.method === 'POST' && req.url === '/edit-table-name') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { tableId, newName } = JSON.parse(body);
        editTableName(tableId, newName, (err, reply) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'PostgreSQL error' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Delete table endpoint
  if (req.method === 'POST' && req.url === '/delete-table') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { tableId } = JSON.parse(body);
        deleteTable(tableId, (err, reply) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'PostgreSQL error' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Save table data endpoint
  if (req.method === 'POST' && req.url === '/save-table-data') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { tableId, data } = JSON.parse(body);
        console.log('Saving table data:', tableId, data);
        
        // For now, just return success - you can extend this to save to PostgreSQL
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        console.error('Error saving table data:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Get all tables endpoint
  if (req.method === 'GET' && req.url === '/get-tables') {
    const sql = 'SELECT * FROM tables ORDER BY id';
    const { pgSend } = require('./pg');
    pgSend(sql, (err, result) => {
      if (err) {
        console.error('Error fetching tables:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, tables: result.rows }));
    });
    return;
  }

  // Get table by ID endpoint
  if (req.method === 'GET' && req.url.startsWith('/get-table')) {
    const urlParts = req.url.split('?');
    const params = new URLSearchParams(urlParts[1] || '');
    const tableId = params.get('id');
    getTable(tableId, (err, reply) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'PostgreSQL error' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, table: reply }));
    });
    return;
  }

  // Add active user endpoint
  if (req.method === 'POST' && req.url === '/add-active-user') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username } = JSON.parse(body);
        addActiveUser(username, (err, reply) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Remove active user endpoint
  if (req.method === 'POST' && req.url === '/remove-active-user') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username } = JSON.parse(body);
        removeActiveUser(username, (err, reply) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Update cursor position endpoint
  if (req.method === 'POST' && req.url === '/update-cursor') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const cursorData = JSON.parse(body);
        console.log('Cursor update:', cursorData);
        // For now, just acknowledge - you can extend this to broadcast to other users
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Login endpoint
  if (req.method === 'POST' && req.url === '/login') {
  // Removed stray debug log
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username } = JSON.parse(body);
        if (!username || typeof username !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid username' }));
          return;
        }
        // Add user to PostgreSQL
        addUserToPG(username, (pgErr, pgReply) => {
          console.log('Login addUserToPG callback:', pgErr, pgReply);
          if (pgErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'PostgreSQL error' }));
            return;
          }
          // Add user to Redis set
          addActiveUser(username, (err, reply) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Redis error' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, user: { username } }));
          });
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Logout endpoint
  if (req.method === 'POST' && req.url === '/logout') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username } = JSON.parse(body);
        removeActiveUser(username, (err, reply) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Redis error' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // Active users endpoint
  if (req.method === 'GET' && req.url === '/active-users') {
    getActiveUsers((err, users) => {
      if (err) {
        console.error('Error getting active users:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Redis error' }));
        return;
      }
      console.log('Returning active users:', users);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, users: users }));
    });
    return;
  }

  // Database setup endpoint (for production initialization)
  if (req.method === 'POST' && req.url === '/setup-database') {
    const { setupDatabase } = require('./setup-database');
    setupDatabase()
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Database initialized successfully' }));
      })
      .catch((error) => {
        console.error('Database setup error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database setup failed', details: error.message }));
      });
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Table Editor Backend Running');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Backend is ready. Use curl or browser to test endpoints.');
});

// TODO: Implement authentication, real-time collaboration, PostgreSQL and Redis integration
