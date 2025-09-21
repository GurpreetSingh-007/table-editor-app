// Table management logic (no external libraries)
// This module provides basic CRUD operations for tables in PostgreSQL
const { pgSend } = require('./pg');

// Create a new table
function createTable(tableName, parentTableId, callback) {
  // For now, use a default user_id of 1, and empty data object
  // In a real app, you'd get user_id from authentication
  const sql = `INSERT INTO tables (user_id, name, data) VALUES (1, '${tableName}', '{}') RETURNING *;`;
  pgSend(sql, callback);
}

// Edit table name
function editTableName(tableId, newName, callback) {
  const sql = `UPDATE tables SET name = '${newName}', updated_at = CURRENT_TIMESTAMP WHERE id = ${tableId};`;
  pgSend(sql, callback);
}

// Delete table
function deleteTable(tableId, callback) {
  const sql = `DELETE FROM tables WHERE id = ${tableId};`;
  pgSend(sql, callback);
}

// Get table by ID
function getTable(tableId, callback) {
  const sql = `SELECT * FROM tables WHERE id = ${tableId};`;
  pgSend(sql, callback);
}

module.exports = { createTable, editTableName, deleteTable, getTable };
