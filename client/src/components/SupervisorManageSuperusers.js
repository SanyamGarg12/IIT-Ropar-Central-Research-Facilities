import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';

const SupervisorManageSuperusers = () => {
  const [superusers, setSuperusers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    fetchSuperusers();
  }, []);

  const fetchSuperusers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASED_URL}api/supervisor/current-superusers`, {
        headers: { Authorization: token }
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuperusers(data);
      } else {
        setError(data.message || 'Failed to load superusers');
      }
    } catch (err) {
      setError('Failed to load superusers');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to remove superuser status for this user? This will change their status from "Y" to "N" but keep all other data intact.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await fetch(`${API_BASED_URL}api/supervisor/remove-superuser/${userId}`, {
        method: 'POST',
        headers: { Authorization: token }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        await fetchSuperusers(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to remove superuser status');
      }
    } catch (err) {
      setError('Failed to remove superuser status');
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
      <h2 className="text-2xl font-semibold mb-4">Manage Current Superusers</h2>
      
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

            {superusers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No current superusers found
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {superusers.map((superuser) => (
                                <tr key={superuser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {superuser.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {superuser.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {superuser.department_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {superuser.facility_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleAction(superuser.user_id, 'remove')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove Superuser
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

export default SupervisorManageSuperusers;
