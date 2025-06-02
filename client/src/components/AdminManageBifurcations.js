import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASED_URL } from '../config';
import { useNavigate } from 'react-router-dom';

function AdminManageBifurcations() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [bifurcations, setBifurcations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userPosition = localStorage.getItem('userPosition');
    
    if (!token || userPosition !== 'Admin') {
      console.log('Authentication failed:', { token: !!token, position: userPosition });
      return;
    }
    
    console.log('Authentication successful, fetching facilities...');
    fetchFacilities();
  }, [navigate]);

  // Form state for adding/editing bifurcation
  const [formData, setFormData] = useState({
    bifurcation_name: '',
    pricing_type: 'slot',
    price_internal: '',
    price_internal_consultancy: '',
    price_external: '',
    price_industry: ''
  });

  // Fetch all facilities
  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get(`${API_BASED_URL}api/facilities`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Facilities response:', response.data);
      setFacilities(response.data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.error || 'Failed to fetch facilities');
    }
  };

  // Fetch bifurcations when facility is selected
  useEffect(() => {
    if (selectedFacility) {
      console.log('Selected facility changed, fetching bifurcations...');
      fetchBifurcations(selectedFacility);
    } else {
      setBifurcations([]);
    }
  }, [selectedFacility]);

  const fetchBifurcations = async (facilityId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get(`${API_BASED_URL}api/facility/${facilityId}/bifurcations`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Bifurcations response:', response.data);
      setBifurcations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bifurcations:', err);
      setError(err.response?.data?.error || 'Failed to fetch bifurcations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilityChange = (e) => {
    setSelectedFacility(e.target.value);
    setFormData({
      bifurcation_name: '',
      pricing_type: 'slot',
      price_internal: '',
      price_internal_consultancy: '',
      price_external: '',
      price_industry: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) {
      setError('Please select a facility');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const url = formData.id 
        ? `${API_BASED_URL}api/facility/bifurcations/${formData.id}`
        : `${API_BASED_URL}api/facility/${selectedFacility}/bifurcations`;

      const method = formData.id ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: {
          ...formData,
          facility_id: selectedFacility
        },
        headers: {
          Authorization: token
        }
      });

      setSuccessMessage(formData.id ? 'Bifurcation updated successfully' : 'Bifurcation added successfully');
      fetchBifurcations(selectedFacility);
      setFormData({
        bifurcation_name: '',
        pricing_type: 'slot',
        price_internal: '',
        price_internal_consultancy: '',
        price_external: '',
        price_industry: ''
      });
    } catch (err) {
      console.error('Error submitting bifurcation:', err);
      setError(err.response?.data?.error || 'Failed to save bifurcation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bifurcationId) => {
    if (!window.confirm('Are you sure you want to delete this bifurcation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.delete(`${API_BASED_URL}api/facility/bifurcations/${bifurcationId}`, {
        headers: {
          Authorization: token
        }
      });
      setSuccessMessage('Bifurcation deleted successfully');
      fetchBifurcations(selectedFacility);
    } catch (err) {
      console.error('Error deleting bifurcation:', err);
      setError(err.response?.data?.error || 'Failed to delete bifurcation');
    }
  };

  const handleEdit = (bifurcation) => {
    setFormData({
      id: bifurcation.id,
      bifurcation_name: bifurcation.bifurcation_name,
      pricing_type: bifurcation.pricing_type,
      price_internal: bifurcation.price_internal,
      price_internal_consultancy: bifurcation.price_internal_consultancy,
      price_external: bifurcation.price_external,
      price_industry: bifurcation.price_industry
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Facility Bifurcations</h2>

          {/* Debug Information */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Debug Info:</p>
            <p className="text-sm text-gray-600">Facilities loaded: {facilities.length}</p>
            <p className="text-sm text-gray-600">Selected facility: {selectedFacility || 'None'}</p>
            <p className="text-sm text-gray-600">Bifurcations loaded: {bifurcations.length}</p>
            {error && <p className="text-sm text-red-600">Error: {error}</p>}
          </div>

          {/* Facility Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Facility
            </label>
            <select
              value={selectedFacility}
              onChange={handleFacilityChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a facility</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add/Edit Bifurcation Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add/Edit Bifurcation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bifurcation Name
                </label>
                <input
                  type="text"
                  name="bifurcation_name"
                  value={formData.bifurcation_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Type
                </label>
                <select
                  name="pricing_type"
                  value={formData.pricing_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="slot">Slot</option>
                  <option value="hour">Hour</option>
                  <option value="half-hour">Half Hour</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Price
                  </label>
                  <input
                    type="number"
                    name="price_internal"
                    value={formData.price_internal}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Consultancy Price
                  </label>
                  <input
                    type="number"
                    name="price_internal_consultancy"
                    value={formData.price_internal_consultancy}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External Price
                  </label>
                  <input
                    type="number"
                    name="price_external"
                    value={formData.price_external}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry Price
                  </label>
                  <input
                    type="number"
                    name="price_industry"
                    value={formData.price_industry}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Add Bifurcation'}
              </button>
            </form>
          </div>

          {/* Existing Bifurcations */}
          {selectedFacility && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Existing Bifurcations</h3>
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              ) : bifurcations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bifurcations found for this facility</p>
              ) : (
                <div className="space-y-4">
                  {bifurcations.map(bifurcation => (
                    <div
                      key={bifurcation.id}
                      className="bg-white border border-gray-200 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{bifurcation.bifurcation_name}</h4>
                          <p className="text-sm text-gray-600">
                            Pricing Type: {bifurcation.pricing_type}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-700">Internal: ₹{bifurcation.price_internal}</p>
                            <p className="text-gray-700">Internal Consultancy: ₹{bifurcation.price_internal_consultancy}</p>
                            <p className="text-gray-700">External: ₹{bifurcation.price_external}</p>
                            <p className="text-gray-700">Industry: ₹{bifurcation.price_industry}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(bifurcation)}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(bifurcation.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageBifurcations; 