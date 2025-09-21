
// Mock Redis logic for demo purposes
// In-memory store to simulate Redis behavior
let activeUsersSet = new Set();

function redisSend(command, callback) {
  // Parse the command and simulate Redis behavior
  const parts = command.split(' ');
  const action = parts[0];
  
  if (action === 'SADD' && parts[1] === 'active_users') {
    const username = parts.slice(2).join(' ');
    activeUsersSet.add(username);
    setTimeout(() => callback(null, 'OK'), 50);
  } else if (action === 'SREM' && parts[1] === 'active_users') {
    const username = parts.slice(2).join(' ');
    activeUsersSet.delete(username);
    setTimeout(() => callback(null, 'OK'), 50);
  } else if (action === 'SMEMBERS' && parts[1] === 'active_users') {
    const users = Array.from(activeUsersSet);
    setTimeout(() => callback(null, users), 50);
  } else {
    setTimeout(() => callback(null, 'OK'), 50);
  }
}

function addActiveUser(username, callback) {
  console.log('Adding active user:', username);
  redisSend(`SADD active_users ${username}`, (error, reply) => {
    if (error) return callback(error);
    callback(null, reply);
  });
}

function removeActiveUser(username, callback) {
  console.log('Removing active user:', username);
  redisSend(`SREM active_users ${username}`, callback);
}

function getActiveUsers(callback) {
  console.log('Getting active users...');
  redisSend('SMEMBERS active_users', (err, users) => {
    if (err) return callback(err);
    console.log('Active users found:', users);
    callback(null, users);
  });
}


module.exports = { addActiveUser, removeActiveUser, getActiveUsers };
