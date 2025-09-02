import React, { useEffect, useState } from 'react';
import { API_BASED_URL } from '../config.js';

const SupervisorVerify = () => {
  const [pending, setPending] = useState([]);
  const [managed, setManaged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('userToken');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [pRes, mRes] = await Promise.all([
        fetch(`${API_BASED_URL}api/supervisor/pending-internal-users`, { headers: { Authorization: token } }),
        fetch(`${API_BASED_URL}api/supervisor/managed-internal-users`, { headers: { Authorization: token } })
      ]);
      const [pJson, mJson] = await Promise.all([pRes.json(), mRes.json()]);
      if (!pRes.ok) throw new Error(pJson.message || 'Failed to load pending');
      if (!mRes.ok) throw new Error(mJson.message || 'Failed to load managed');
      setPending(pJson);
      setManaged(mJson);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); // eslint-disable-next-line
  }, []);

  const approve = async (user_id) => {
    try {
      const res = await fetch(`${API_BASED_URL}api/supervisor/approve-internal-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ user_id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to approve');
      await loadData();
    } catch (e) { setError(e.message); }
  };

  const removeUser = async (user_id) => {
    if (!window.confirm('Remove this user from your supervision?')) return;
    try {
      const res = await fetch(`${API_BASED_URL}api/supervisor/internal-user/${user_id}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to remove');
      await loadData();
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Pending Internal User Requests</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow divide-y">
        {pending.length === 0 ? (
          <div className="p-4 text-gray-500">No pending requests.</div>
        ) : pending.map(u => (
          <div key={u.user_id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.full_name}</div>
              <div className="text-sm text-gray-600">{u.email} • {u.department_name}</div>
            </div>
            <button onClick={() => approve(u.user_id)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Managed Internal Users</h2>
      <div className="bg-white rounded-xl shadow divide-y">
        {managed.length === 0 ? (
          <div className="p-4 text-gray-500">No managed users.</div>
        ) : managed.map(u => (
          <div key={u.user_id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.full_name}</div>
              <div className="text-sm text-gray-600">{u.email} • {u.department_name}</div>
            </div>
            <button onClick={() => removeUser(u.user_id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisorVerify; 