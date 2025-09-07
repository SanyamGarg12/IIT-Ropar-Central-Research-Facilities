import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, Users, ChevronDown, RefreshCw } from 'lucide-react';
import { API_BASED_URL } from '../config.js';

const FacilityPlanner = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch facilities on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch bookings when facility or date changes
  useEffect(() => {
    if (selectedFacility) {
      fetchPlannerData();
    }
  }, [selectedFacility, selectedDate]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${API_BASED_URL}api/facilities`);
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('Failed to fetch facilities');
    }
  };

  const fetchPlannerData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASED_URL}api/facility-planner?facility_id=${selectedFacility}&date=${selectedDate}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setTimeSlots(data.timeSlots || []);
      } else {
        setError('Failed to fetch planner data');
      }
    } catch (error) {
      console.error('Error fetching planner data:', error);
      setError('Failed to fetch planner data');
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (slot) => {
    const booking = bookings.find(b => {
      if (!b.schedule_ids) return false;
      
      // Handle both single ID and comma-separated IDs
      const scheduleIds = b.schedule_ids.toString().split(',').map(id => id.trim());
      const slotId = slot.schedule_id.toString();
      
      return scheduleIds.includes(slotId);
    });
    
    if (booking) {
      return {
        status: 'booked',
        booking: booking,
        color: 'bg-blue-500 text-white',
        borderColor: 'border-blue-600'
      };
    }
    
    return {
      status: 'available',
      booking: null,
      color: 'bg-gray-100 text-gray-600',
      borderColor: 'border-gray-300'
    };
  };

  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const selectedFacilityName = facilities.find(f => f.id === parseInt(selectedFacility))?.name || '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Facility Planner</h1>
                <p className="text-gray-600 mt-1">Daily booking schedule visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Building2 className="w-6 h-6" />
              <span className="font-medium">IIT Ropar CRF</span>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Facility Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Facility
              </label>
              <div className="relative">
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">Choose a facility...</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchPlannerData}
                disabled={!selectedFacility || loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Planner Chart */}
        {selectedFacility && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedFacilityName} - {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Unavailable (Booked)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading schedule...</span>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {timeSlots.map((slot) => {
                  const slotInfo = getSlotStatus(slot);
                  return (
                    <div
                      key={slot.schedule_id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${slotInfo.color} ${slotInfo.borderColor}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                      </div>
                      
                      {slotInfo.status === 'booked' && slotInfo.booking ? (
                        <div className="text-center py-3">
                          <span className="text-sm font-semibold">
                            Booking #{slotInfo.booking.booking_id}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-center py-2 font-medium">
                          Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : selectedFacility ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No time slots found for this facility</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date or facility</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Select a facility to view the planner</p>
                <p className="text-gray-400 text-sm mt-2">Choose a facility from the dropdown above</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityPlanner;
