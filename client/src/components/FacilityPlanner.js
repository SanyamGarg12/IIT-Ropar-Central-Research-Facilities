import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Building2, Users, ChevronDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASED_URL } from '../config.js';

const FacilityPlanner = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('weekly');
  const [weekData, setWeekData] = useState({});

  // Fetch facilities on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch when selection changes
  useEffect(() => {
    if (!selectedFacility) return;
    if (viewMode === 'daily') {
      fetchPlannerData();
    } else {
      fetchWeeklyPlannerData();
    }
  }, [selectedFacility, selectedDate, viewMode]);

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

  // Week helpers
  const startOfWeek = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as start
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return monday;
  }, [selectedDate]);

  const getWeekDates = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dt = new Date(startOfWeek);
      dt.setDate(startOfWeek.getDate() + i);
      return dt.toISOString().split('T')[0];
    });
  };

  const shiftWeek = (delta) => {
    const base = new Date(startOfWeek);
    base.setDate(base.getDate() + delta * 7);
    setSelectedDate(base.toISOString().split('T')[0]);
  };

  const fetchWeeklyPlannerData = async () => {
    setLoading(true);
    setError('');
    try {
      const dates = getWeekDates();
      const results = await Promise.all(
        dates.map(async (dateStr) => {
          const res = await fetch(`${API_BASED_URL}api/facility-planner?facility_id=${selectedFacility}&date=${dateStr}`);
          if (!res.ok) return { dateStr, bookings: [], timeSlots: [] };
          const data = await res.json();
          return { dateStr, bookings: data.bookings || [], timeSlots: data.timeSlots || [] };
        })
      );
      const map = {};
      results.forEach(r => { map[r.dateStr] = { bookings: r.bookings, timeSlots: r.timeSlots }; });
      setWeekData(map);
    } catch (err) {
      console.error('Error fetching weekly planner:', err);
      setError('Failed to fetch weekly planner data');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1a3365] to-[#3b82f6] px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Facility Planner</h1>
                  <p className="text-blue-100 mt-1">Advanced scheduling and booking management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">IIT Ropar CRF</span>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Facility Selector */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Facility
                </label>
                <div className="relative">
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] appearance-none bg-white text-gray-700 font-medium transition-all duration-200 hover:border-gray-300"
                  >
                    <option value="">Choose a facility...</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Navigation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Week Navigation
                </label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => shiftWeek(-1)} 
                    className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                    title="Previous week"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-center font-medium transition-all duration-200"
                  />
                  <button 
                    onClick={() => shiftWeek(1)} 
                    className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                    title="Next week"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                  </button>
                </div>
              </div>

              {/* View Toggle & Refresh */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  View Mode
                </label>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setViewMode('daily')} 
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      viewMode==='daily' 
                        ? 'bg-[#2B4B8C] text-white shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setViewMode('weekly')} 
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      viewMode==='weekly' 
                        ? 'bg-[#2B4B8C] text-white shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
                <button
                  onClick={viewMode==='daily' ? fetchPlannerData : fetchWeeklyPlannerData}
                  disabled={!selectedFacility || loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#2B4B8C] to-[#3b82f6] text-white rounded-xl hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Planner Content */}
        {selectedFacility && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header with facility info and legend */}
            <div className="bg-gradient-to-r from-[#f1f5ff] to-[#e6f0ff] px-8 py-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#e0e8ff] p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-[#2B4B8C]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFacilityName}</h2>
                    <p className="text-gray-600 mt-1">
                      {viewMode === 'daily' 
                        ? new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      }
                    </p>
                  </div>
                </div>
                
                {/* Status Legend */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">No Slots</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading schedule...</p>
                  </div>
                </div>
              ) : viewMode === 'daily' ? (
                timeSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {timeSlots.map((slot) => {
                      const slotInfo = getSlotStatus(slot);
                      return (
                        <div
                          key={slot.schedule_id}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${slotInfo.color} ${slotInfo.borderColor}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5" />
                              <span className="font-semibold text-lg">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </div>
                          </div>
                          {slotInfo.status === 'booked' && slotInfo.booking ? (
                            <div className="text-center py-4">
                              <div className="bg-white/20 rounded-lg p-3">
                                <span className="text-lg font-bold">Booking #{slotInfo.booking.booking_id}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="bg-white/20 rounded-lg p-3">
                                <span className="text-lg font-semibold">Available</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No time slots found</h3>
                    <p className="text-gray-400">Try selecting a different date or facility</p>
                  </div>
                )
              ) : (
                // Weekly Calendar View
                Object.keys(weekData).length > 0 ? (
                  <div className="space-y-6">
                    {/* Week Header */}
                    <div className="grid grid-cols-7 gap-4">
                      {getWeekDates().map(dateStr => {
                        const date = new Date(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        return (
                          <div key={dateStr} className="text-center">
                            <div className={`text-sm font-medium text-gray-500 mb-1 ${isToday ? 'text-[#3b82f6]' : ''}`}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                            </div>
                            <div className={`text-2xl font-bold ${isToday ? 'text-[#3b82f6] bg-[#e0f2fe] rounded-full w-12 h-12 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
                              {date.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Week Grid */}
                    <div className="grid grid-cols-7 gap-4">
                      {getWeekDates().map(dateStr => {
                        const dayLabel = new Date(dateStr).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        });
                        const dayData = weekData[dateStr] || { bookings: [], timeSlots: [] };
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        
                        return (
                          <div 
                            key={dateStr} 
                            className={`border-2 rounded-2xl p-4 min-h-[200px] transition-all duration-200 hover:shadow-md ${
                              isToday 
                                ? 'border-blue-300 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="mb-4">
                              <div className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                                {dayLabel}
                              </div>
                            </div>
                            
                            {dayData.timeSlots.length === 0 ? (
                              <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                  <p className="text-xs text-gray-500 font-medium">No slots</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {dayData.timeSlots.map(slot => {
                                  const booking = (dayData.bookings || []).find(x => {
                                    if (!x.schedule_ids) return false;
                                    const ids = x.schedule_ids.toString().split(',').map(s => s.trim());
                                    return ids.includes(slot.schedule_id.toString());
                                  });
                                  const isBooked = !!booking;
                                  
                                  return (
                                    <div 
                                      key={`${dateStr}-${slot.schedule_id}`} 
                                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                                        isBooked 
                                          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                        </span>
                                        {isBooked && (
                                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                                            #{booking.booking_id}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 text-xs opacity-75">
                                        {isBooked ? 'Booked' : 'Available'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No data for this week</h3>
                    <p className="text-gray-400">Try another week or facility</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityPlanner;
