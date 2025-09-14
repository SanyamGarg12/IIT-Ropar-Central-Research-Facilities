import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';

const SupervisorPendingSuperusers = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASED_URL}api/supervisor/pending-superusers`, {
        headers: { Authorization: token }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPendingRequests(data);
      } else {
        setError(data.message || 'Failed to load pending requests');
      }
    } catch (err) {
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    const actionText = action === 'approve' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} this superuser request?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const endpoint = action === 'approve' 
        ? `${API_BASED_URL}api/supervisor/approve-superuser/${userId}`
        : `${API_BASED_URL}api/supervisor/reject-superuser/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: token }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        await fetchPendingRequests(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || `Failed to ${action} superuser request`);
      }
    } catch (err) {
      setError(`Failed to ${action} superuser request`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Pending Superuser Requests</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending superuser requests found
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.department_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.facility_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleAction(request.user_id, 'approve')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.user_id, 'reject')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                    </div>
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

export default SupervisorPendingSuperusers;
