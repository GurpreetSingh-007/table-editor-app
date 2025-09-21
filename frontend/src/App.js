
import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TableEditor from './pages/TableEditor';
import { Router, navigate } from './routes/Router';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('tableEditorUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Loaded user from localStorage:', userData);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('tableEditorUser');
      }
    }
  }, []);

  // Cleanup on page close/refresh
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.username) {
        // Use sendBeacon for reliable cleanup on page close
        navigator.sendBeacon(`${API_BASE}/remove-active-user`, 
          JSON.stringify({ username: user.username })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const handleLogin = (data) => {
    console.log('App handleLogin received data:', data);
    const userData = data.user || {};
    setUser(userData);
    localStorage.setItem('tableEditorUser', JSON.stringify(userData));
    console.log('Setting user to:', userData);
    navigate('/editor');
  };

  const handleLogout = async () => {
    // Remove user from active users list before logout
    if (user?.username) {
      try {
        await fetch(`${API_BASE}/remove-active-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username })
        });
        console.log('User removed from active users list:', user.username);
      } catch (error) {
        console.error('Error removing user from active users:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('tableEditorUser');
    navigate('/login');
  };

  const routes = {
    '/login': () => <LoginForm onLogin={handleLogin} />,
    '/editor': () => <TableEditor user={user} onLogout={handleLogout} />,
    '*': () => <LoginForm onLogin={handleLogin} />
  };

  return (
    <div className="App">
      <Router routes={routes} />
    </div>
  );
}

export default App;
