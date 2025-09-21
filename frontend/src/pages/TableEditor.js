import React, { useState, useEffect } from 'react';
import InteractiveTable from '../components/InteractiveTable';
import ActiveUsersList from '../components/ActiveUsersList';
import { useActiveUsers } from '../hooks/useActiveUsers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function TableEditor({ user, onLogout }) {
  console.log('TableEditor received user:', user);
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const { activeUsers, updateCellCursor } = useActiveUsers(user?.username);

  console.log('Active users state:', activeUsers);

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/create-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: newTableName, parentTableId: null })
      });
      
      if (response.ok) {
        setNewTableName('');
        // Refresh tables list
        fetchTables();
      } else {
        const errorData = await response.json();
        console.error('Error creating table:', errorData);
      }
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE}/get-tables`);
      const data = await response.json();
      if (data.success) {
        setTables(data.tables || []);
      } else {
        console.error('Failed to fetch tables:', data.error);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateNestedTable = async (parentTableId, rowIndex, colIndex) => {
    // Nested tables are now handled directly within InteractiveTable component
    // No need for backend API call since tables are created inline within cells
    console.log(`Nested table created in cell [${rowIndex}, ${colIndex}] of table ${parentTableId}`);
  };

  const handleDeleteTable = async (tableId) => {
    try {
      const response = await fetch(`${API_BASE}/delete-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId })
      });
      
      if (response.ok) {
        fetchTables(); // Refresh the table list
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const handleSaveTableData = async (tableId, tableData) => {
    try {
      const response = await fetch(`${API_BASE}/save-table-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, data: tableData })
      });
      
      if (response.ok) {
        console.log('Table data saved successfully');
      }
    } catch (error) {
      console.error('Error saving table data:', error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Active Users Sidebar */}
      <ActiveUsersList 
        activeUsers={activeUsers} 
        currentUser={user?.username}
      />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: '250px', 
        padding: '2rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Table Editor - Welcome {user?.username || 'User'}</h2>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} online • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Create New Table</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Table name"
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              style={{ 
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button 
              onClick={handleCreateTable}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Create Table
            </button>
          </div>
        </div>

        <div>
          <h3>Your Tables</h3>
          {tables.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>No tables yet</h4>
              <p style={{ margin: 0 }}>Create your first table above to get started!</p>
            </div>
          ) : (
            <div>
              {tables.map(table => (
                <InteractiveTable
                  key={table.id}
                  tableData={{
                    id: table.id,
                    name: table.name,
                    rows: [
                      [{ content: '', type: 'text' }, { content: '', type: 'text' }, { content: '', type: 'text' }],
                      [{ content: '', type: 'text' }, { content: '', type: 'text' }, { content: '', type: 'text' }],
                      [{ content: '', type: 'text' }, { content: '', type: 'text' }, { content: '', type: 'text' }]
                    ]
                  }}
                  onCreateNestedTable={handleCreateNestedTable}
                  onDeleteTable={handleDeleteTable}
                  onSaveTableData={handleSaveTableData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TableEditor;
