import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';
import { API_BASED_URL } from '../config.js';
import { 
  sanitizeInput, 
  secureFetch,
  createRateLimiter,
  escapeHtml 
} from '../utils/security';

const ManageSupervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_name: ''
  });

  // Create rate limiter for form submissions
  const rateLimiter = createRateLimiter(2000, 60 * 1000); // 1 submission per 2 seconds

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const response = await secureFetch(`${API_BASED_URL}api/all-supervisors`);
      if (response.ok) {
        const data = await response.json();
        setSupervisors(data);
      } else {
        setError('Failed to fetch supervisors');
      }
    } catch (error) {
      setError('Error fetching supervisors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department_name: ''
    });
    setEditingSupervisor(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limit
    if (!rateLimiter.check('form_submission')) {
      setError("Please wait a moment before submitting again.");
      return;
    }

    const { name, email, department_name } = formData;
    
    if (!name.trim() || !email.trim() || !department_name.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const url = editingSupervisor 
        ? `${API_BASED_URL}api/update-supervisor/${editingSupervisor.id}`
        : `${API_BASED_URL}api/add-supervisor`;
      
      const method = editingSupervisor ? 'PUT' : 'POST';
      
             const response = await secureFetch(url, {
         method,
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           name: escapeHtml(sanitizeInput(name)),
           email: sanitizeInput(email).toLowerCase(),
           department_name: escapeHtml(sanitizeInput(department_name))
         })
       });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        resetForm();
        fetchSupervisors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Operation failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      department_name: supervisor.department_name
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supervisor?')) {
      return;
    }

    try {
      const response = await secureFetch(`${API_BASED_URL}api/delete-supervisor/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        fetchSupervisors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete supervisor');
      }
    } catch (error) {
      setError('An error occurred while deleting the supervisor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supervisors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaUserTie className="text-white text-2xl mr-3" />
                <h1 className="text-2xl font-bold text-white">Manage Supervisors</h1>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Supervisor
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-6 mt-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mx-6 mt-4">
              {success}
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter supervisor name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department_name"
                      value={formData.department_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter department name"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    {editingSupervisor ? 'Update Supervisor' : 'Add Supervisor'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Supervisors List */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Current Supervisors ({supervisors.length})
            </h3>
            {supervisors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaUserTie className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>No supervisors found. Add your first supervisor to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supervisors.map((supervisor) => (
                      <tr key={supervisor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {escapeHtml(supervisor.name)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supervisor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {escapeHtml(supervisor.department_name)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(supervisor)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                              title="Edit supervisor"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(supervisor.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Delete supervisor"
                            >
                              <FaTrash />
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
        </div>
      </div>
    </div>
  );
};

export default ManageSupervisors;
