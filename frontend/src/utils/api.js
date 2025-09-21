// API utility functions for backend communication
// Utility for backend API calls (no external libraries)

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  // User authentication
  login: async (username) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Table management
  createTable: async (tableName, parentTableId = null) => {
    const response = await fetch(`${API_BASE}/create-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, parentTableId })
    });
    return response.json();
  },

  editTableName: async (tableId, newName) => {
    const response = await fetch(`${API_BASE}/edit-table-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, newName })
    });
    return response.json();
  },

  deleteTable: async (tableId) => {
    const response = await fetch(`${API_BASE}/delete-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId })
    });
    return response.json();
  },

  getTable: async (tableId) => {
    const response = await fetch(`${API_BASE}/get-table?tableId=${tableId}`);
    return response.json();
  },

  // Active users
  getActiveUsers: async () => {
    const response = await fetch(`${API_BASE}/active-users`);
    return response.json();
  }
};