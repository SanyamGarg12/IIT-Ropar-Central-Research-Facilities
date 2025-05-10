import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASED_URL } from '../config.js';

const SupervisorVerify = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get('token');
    setToken(t);
    if (t) {
      axios.get(`${API_BASED_URL}api/supervisor-verify-info?token=${t}`)
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.error || 'Invalid or expired link.');
          setLoading(false);
        });
    } else {
      setError('Invalid verification link.');
      setLoading(false);
    }
  }, []);

  const handleVerify = async () => {
    setStatus('');
    setError('');
    try {
      await axios.post(`${API_BASED_URL}api/supervisor-verify`, { token });
      setStatus('User has been successfully verified!');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (status) return <div style={{ color: 'green' }}>{status}</div>;
  if (!user) return null;

  return (
    <div className="supervisor-verify-container" style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2>Verify Internal User</h2>
      <p><b>Name:</b> {user.full_name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>User Type:</b> {user.user_type}</p>
      <p><b>Organization:</b> {user.org_name}</p>
      <p><b>Contact:</b> {user.contact_number}</p>
      <button onClick={handleVerify} style={{ marginTop: 16, padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Verify User</button>
    </div>
  );
};

export default SupervisorVerify; 