import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

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
        // console.log("userId: ", userId);
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/user-history/${userId}`, {
            headers: { Authorization: `${localStorage.getItem('userToken')}` }
          });          
        setUserHistory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user history. Please try again later.');
      setLoading(false);
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
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Booking History for {userName}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : userHistory.length === 0 ? (
              <p className="text-gray-500 text-center">No booking history found for this user.</p>
            ) : (
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Booking</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userHistory.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.facility_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.start_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.end_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.booking_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserHistoryModal;

