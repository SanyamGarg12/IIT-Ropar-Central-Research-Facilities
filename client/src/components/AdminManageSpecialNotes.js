import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';
import { sanitizeInput, secureFetch } from '../utils/security';

const AdminManageSpecialNotes = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [specialNote, setSpecialNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASED_URL}api/facilities`);
      const data = await response.json();
      setFacilities(data);
      if (data.length > 0) {
        setSelectedFacility(data[0]);
        setSpecialNote(data[0].special_note || '');
      } else {
        setSelectedFacility(null);
        setSpecialNote('');
      }
    } catch (error) {
      setError('Error loading facilities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setSpecialNote(facility.special_note || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await secureFetch(`${API_BASED_URL}api/facilities/${selectedFacility.id}/special-note`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ special_note: sanitizeInput(specialNote) }),
      });

      if (response.ok) {
        setSuccess('Special note updated successfully');
        // Update the facility in the list
        setFacilities(facilities.map(f => 
          f.id === selectedFacility.id 
            ? { ...f, special_note: specialNote }
            : f
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update special note');
      }
    } catch (error) {
      setError('Error updating special note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Manage Facility Special Notes</h2>
        
        <div className="space-y-6">
          {/* Facility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Facility
            </label>
            <select
              value={selectedFacility?.id || ''}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === parseInt(e.target.value));
                if (facility) handleFacilitySelect(facility);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
              disabled={isLoading}
            >
              {facilities.length === 0 ? (
                <option value="">No facilities available</option>
              ) : (
                facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Special Note Form */}
          {selectedFacility && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Special Note for {selectedFacility.name}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    className="w-full h-32 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                    placeholder="Enter special note for this facility..."
                  />
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Special Note'
                  )}
                </button>
              </form>
            </div>
          )}

          {!selectedFacility && facilities.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No facilities available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageSpecialNotes; 