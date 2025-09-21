import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Custom hook for managing active users and real-time collaboration
export function useActiveUsers(username) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (!username) {
      console.log('useActiveUsers: No username provided');
      return;
    }

    console.log('useActiveUsers: Setting up for username:', username);

    // Add user to active list on login
    const addToActiveUsers = async () => {
      try {
        await fetch(`${API_BASE}/add-active-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
      } catch (error) {
        console.error('Error adding active user:', error);
      }
    };

    // Remove user from active list on logout/disconnect
    const removeFromActiveUsers = async () => {
      try {
        await fetch(`${API_BASE}/remove-active-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
      } catch (error) {
        console.error('Error removing active user:', error);
      }
    };

    // Fetch active users periodically
    const fetchActiveUsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/active-users`);
        const data = await response.json();
        console.log('Fetched active users response:', data);
        if (data.success) {
          setActiveUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    };

    // Update cursor position
    const updateCursorPosition = async (x, y, tableId, cellPosition) => {
      try {
        await fetch(`${API_BASE}/update-cursor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            x, 
            y, 
            tableId, 
            cellPosition,
            timestamp: Date.now()
          })
        });
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    };

    // Add user and start polling
    addToActiveUsers();
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 3000); // Reduced frequency to 3 seconds to avoid spam

    // Mouse move handler for cursor tracking
    const handleMouseMove = (e) => {
      updateCursorPosition(e.clientX, e.clientY, null, null);
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousemove', handleMouseMove);
      removeFromActiveUsers();
    };
  }, [username]);

  const updateCellCursor = async (tableId, row, col) => {
    try {
      await fetch(`${API_BASE}/update-cursor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          tableId, 
          cellPosition: { row, col },
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Error updating cell cursor:', error);
    }
  };

  return { 
    activeUsers, 
    cursors, 
    updateCellCursor 
  };
}