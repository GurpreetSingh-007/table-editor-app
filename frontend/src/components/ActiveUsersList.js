import React from 'react';

function ActiveUsersList({ activeUsers, currentUser }) {
  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{
      width: '233px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      padding: '1rem',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #007bff'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👥 Active Users
          <span style={{
            background: activeUsers.length > 0 ? '#28a745' : '#6c757d',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 'normal',
            animation: activeUsers.length > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {activeUsers.length}
          </span>
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginTop: '4px'
        }}>
          Updates every 3 seconds
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeUsers.length === 0 ? (
          <div style={{
            color: '#6c757d',
            fontSize: '14px',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '1rem'
          }}>
            No active users
          </div>
        ) : (
          activeUsers.map((user, index) => {
            const username = user.username || user;
            const isCurrentUser = username === currentUser;
            
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: isCurrentUser ? '#e3f2fd' : 'white',
                  border: `1px solid ${isCurrentUser ? '#2196f3' : '#dee2e6'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#28a745',
                  flexShrink: 0,
                  animation: 'pulse 2s infinite'
                }}></div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: isCurrentUser ? 'bold' : 'normal',
                    color: isCurrentUser ? '#1976d2' : '#495057'
                  }}>
                    {username}
                    {isCurrentUser && ' (You)'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    Online now
                  </div>
                </div>

                {isCurrentUser && (
                  <div style={{
                    fontSize: '12px',
                    color: '#1976d2',
                    fontWeight: 'bold'
                  }}>
                    ★
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActiveUsersList;