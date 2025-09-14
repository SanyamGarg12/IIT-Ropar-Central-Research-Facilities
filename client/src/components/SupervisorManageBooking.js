import React, { useEffect, useState } from 'react';
import { API_BASED_URL } from '../config.js';

const SupervisorManageBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('userToken');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await fetch(`${API_BASED_URL}api/supervisor/bookings?${params.toString()}`, { headers: { Authorization: token } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load');
      setBookings(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  const act = async (booking_id, action) => {
    if (action !== 'approve' && !window.confirm(`Confirm ${action} booking #${booking_id}?`)) return;
    try {
      const res = await fetch(`${API_BASED_URL}api/supervisor/bookings/${booking_id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update');
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Bookings</h2>
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="border rounded px-3 py-2" />
        <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="border rounded px-3 py-2" />
        <button onClick={load} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2">Apply</button>
        <button onClick={()=>{setStatus('');setFrom('');setTo('');load();}} className="border rounded px-4 py-2">Reset</button>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Facility</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Selected Slots</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(b => (
                <tr key={b.booking_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{b.booking_id}</td>
                  <td className="px-4 py-2">{b.full_name} ({b.email})</td>
                  <td className="px-4 py-2">{b.facility_name}</td>
                  <td className="px-4 py-2">{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="text-sm">
                      {b.created_at ? (
                        <span className="text-gray-600">
                          {new Date(b.created_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-sm">
                      {b.selected_slots ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {b.selected_slots}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">No slots info</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">₹{b.cost}</td>
                  <td className="px-4 py-2">{b.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {/* Show approve/reject buttons for all statuses */}
                    <button 
                      onClick={()=>act(b.booking_id,'approve')} 
                      className={`px-3 py-1 rounded text-white hover:opacity-90 ${
                        b.status === 'Approved' 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      disabled={b.status === 'Approved'}
                    >
                      {b.status === 'Approved' ? 'Approved' : 'Approve'}
                    </button>
                    <button 
                      onClick={()=>act(b.booking_id,'reject')} 
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={()=>act(b.booking_id,'cancel')} 
                      className="px-3 py-1 rounded border hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupervisorManageBooking;
