import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASED_URL } from '../config.js';
import { Calendar, Clock, Building2 } from 'lucide-react';

function ViewFacilitySlots() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [weeklySlots, setWeeklySlots] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${API_BASED_URL}api/facilities`);
        setFacilities(response.data);
        if (response.data.length > 0) {
          setSelectedFacility(response.data[0].id);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch facilities. Please refresh the page.");
      }
    };
    fetchFacilities();
  }, []);

  const fetchWeeklySlots = async () => {
    if (!selectedFacility) {
      alert("Please select a facility first.");
      return;
    }
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.get(
        `${API_BASED_URL}api/weekly-slots?facilityId=${selectedFacility}`,
      );
      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        return;
      }
      setWeeklySlots(response.data.facility);
    } catch (err) {
      alert("Failed to fetch weekly slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-blue-500" />
              Facility Slots Schedule
            </h2>
          </div>

          <div className="space-y-6">
            {/* Facility Selection */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-lg font-semibold text-gray-700 mb-3">Select Facility</label>
              <select
                className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out bg-white"
                value={selectedFacility}
                onChange={(e) => {
                  setSelectedFacility(e.target.value);
                  setWeeklySlots(null);
                }}
                required
              >
                <option value="">Choose a facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekly Slots Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Weekly Schedule
                </h3>
                <button
                  onClick={fetchWeeklySlots}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition duration-300 ease-in-out transform hover:scale-105 flex items-center ${
                    weeklySlots 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  disabled={isLoading}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {isLoading ? 'Loading...' : weeklySlots ? 'Refresh Schedule' : 'View Weekly Schedule'}
                </button>
              </div>

              {weeklySlots && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                    {weeklySlots.name}
                  </h4>
                  {Object.entries(weeklySlots.slots).map(([day, slots]) => (
                    <div key={day} className="mb-6">
                      <h5 className="font-semibold text-lg text-gray-700 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        {day}
                      </h5>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {slots.map((slot, index) => (
                          <div
                            key={`${day}-${index}`}
                            className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-600 shadow-sm hover:shadow-md transition duration-300 ease-in-out"
                          >
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewFacilitySlots; 