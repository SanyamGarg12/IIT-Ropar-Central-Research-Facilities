import React, { useState } from 'react';

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newMembers, setNewMembers] = useState('');

  const handleLogin = () => {
    // Dummy login credentials
    const adminUsername = 'admin';
    const adminPassword = 'password123';

    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSubmit = () => {
    const updatedMembers = JSON.parse(newMembers);
    fetch('/api/members/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedMembers }),
    })
      .then((res) => res.json())
      .then((data) => alert('Members Updated Successfully'))
      .catch((err) => console.error('Update Error:', err));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel - Update Committee Members</h2>
      <textarea
        rows="10"
        cols="50"
        placeholder="Paste JSON data here..."
        value={newMembers}
        onChange={(e) => setNewMembers(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Update Members</button>
    </div>
  );
}

export default AdminPanel;
