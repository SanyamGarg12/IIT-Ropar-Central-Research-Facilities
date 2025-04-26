import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 

const UserHistoryModal = ({ isOpen, onClose, userId, userName }) => {
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserHistory();
    }
  }, [isOpen, userId]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASED_URL}api/user-history/${userId}`, {
        headers: { Authorization: `${localStorage.getItem('userToken')}` }
      });
      
      // Sort booking history by date (newest first)
      const sortedHistory = [...response.data].sort((a, b) => {
        const dateA = new Date(a.booking_date);
        const dateB = new Date(b.booking_date);
        return dateB - dateA;
      });
      
      setUserHistory(sortedHistory);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user history. Please try again later.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // Handle different time formats
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
        // It's already in HH:MM or HH:MM:SS format
        const parts = timeString.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      
      // Try to extract time from ISO date if it's a full datetime
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return (
          <span className="px-2 py-1 inline-flex items-center rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2 py-1 inline-flex items-center rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2 py-1 inline-flex items-center rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex items-center rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Booking History for {userName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 hover:bg-gray-100 rounded-full transition duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Loading booking history...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : userHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg mb-1">No booking history found</p>
                <p className="text-gray-400 text-sm">This user has not made any bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 gap-4">
                  {userHistory.map((booking) => (
                    <div 
                      key={booking.id || booking.booking_id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{booking.facility_name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Booking Date</p>
                            <p className="font-medium text-gray-800">{formatDate(booking.booking_date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Time Slot</p>
                            <p className="font-medium text-gray-800">
                              {booking.start_time && booking.end_time ? (
                                `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
                              ) : booking.slot || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {booking.cost && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">Cost</p>
                            <p className="font-medium text-gray-800">{booking.cost} Rs.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserHistoryModal;

