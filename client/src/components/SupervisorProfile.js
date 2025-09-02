import React, { useEffect, useState } from 'react';
import { API_BASED_URL } from '../config.js';

const SupervisorProfile = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASED_URL}api/supervisor/me`, {
          headers: { Authorization: token }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load');
        setData(json);
      } catch (e) {
        setError(e.message);
      }
    };
    fetchMe();
  }, [token]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      <div className="space-y-2">
        <div><span className="font-medium">Name:</span> {data.name}</div>
        <div><span className="font-medium">Email:</span> {data.email}</div>
        <div><span className="font-medium">Department:</span> {data.department_name}</div>
        <div><span className="font-medium">Wallet Balance:</span> ₹{Number(data.wallet_balance || 0).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default SupervisorProfile;
