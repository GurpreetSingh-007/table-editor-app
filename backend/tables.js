// Table management logic (no external libraries)
// This module provides basic CRUD operations for tables in PostgreSQL
const { pgSend } = require('./pg');

// Create a new table
function createTable(tableName, parentTableId, callback) {
  // parentTableId is null for top-level tables
  const sql = `INSERT INTO tables (name, parent_id) VALUES ('${tableName}', ${parentTableId ? parentTableId : 'NULL'});`;
  pgSend(sql, callback);
}

// Edit table name
function editTableName(tableId, newName, callback) {
  const sql = `UPDATE tables SET name = '${newName}' WHERE id = ${tableId};`;
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
