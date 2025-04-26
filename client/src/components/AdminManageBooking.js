import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Eye, Download } from 'lucide-react';
import UserHistoryModal from './UserHistoryModal';
import {API_BASED_URL} from '../config.js';

const AdminManageBooking = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [expandedOperator, setExpandedOperator] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  const authToken = localStorage.getItem('userToken');

  useEffect(() => {
    fetchOperatorsAndBookings();
  }, []);

  const fetchOperatorsAndBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching operators and bookings...');
      const response = await axios.get(`${API_BASED_URL}api/admin/operators-bookings`, {
        headers: { Authorization: `${authToken}` }
      });
      
      // Sort bookings for each operator by date (newest first)
      const sortedOperators = response.data.map(operator => {
        const sortedBookings = [...operator.bookings].sort((a, b) => {
          const dateA = new Date(a.booking_date);
          const dateB = new Date(b.booking_date);
          return dateB - dateA;
        });
        
        return {
          ...operator,
          bookings: sortedBookings
        };
      });
      
      setOperators(sortedOperators);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch operators and bookings. Please try again later.');
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action, operatorEmail) => {
    try {
      await axios.post(`${API_BASED_URL}api/handle-booking`, {
        bookingId,
        action,
        operatorEmail
      }, {
        headers: { Authorization: `${authToken}` }
      });
      
      setOperators(operators.map(operator => ({
        ...operator,
        bookings: operator.bookings.map(booking => 
          String(booking.booking_id) === String(bookingId)
            ? { ...booking, status: action }
            : booking
        )
      })));
      
      setSuccessMessage(`Booking ${action.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} booking. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleStatusChange = async (bookingId, newStatus, operatorEmail) => {
    try {
      await axios.post(`${API_BASED_URL}api/change-booking-status`, {
        bookingId,
        newStatus
      }, {
        headers: { Authorization: `${authToken}` }
      });
      
      setOperators(operators.map(operator => ({
        ...operator,
        bookings: operator.bookings.map(booking => 
          String(booking.booking_id) === String(bookingId)
            ? { ...booking, status: newStatus }
            : booking
        )
      })));
      
      setSuccessMessage(`Booking status changed to ${newStatus.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to change booking status. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewUserHistory = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setIsHistoryModalOpen(true);
  };

  const toggleOperator = (operatorEmail) => {
    setExpandedOperator(expandedOperator === operatorEmail ? null : operatorEmail);
  };

  const downloadReceipt = async (bookingId, receiptPath) => {
    if (!receiptPath) {
      setError('No receipt available for this booking');
      return;
    }

    try {
      setDownloadingReceipt(bookingId);
      const downloadResponse = await axios.get(`${API_BASED_URL}uploads${receiptPath}`, {
        headers: { Authorization: `${authToken}` },
        responseType: 'blob' // Important for file download
      });
  
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError('Error downloading receipt. Please try again.');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Manage All Bookings</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">View and manage bookings across all operators.</p>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md"
              role="alert"
            >
              <div className="flex items-center">
                <XCircle className="w-6 h-6 mr-2" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-md"
              role="alert"
            >
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                <p>{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {operators.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <p className="text-2xl text-gray-500">No operators found.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {operators.map((operator) => (
              <motion.div
                key={operator.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleOperator(operator.email)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {operator.name}
                    </h2>
                    <p className="text-gray-600">Email: {operator.email}</p>
                  </div>
                  <p className="text-gray-600 mt-2">
                    Total Bookings: {operator.bookings.length}
                  </p>
                </div>

                <AnimatePresence>
                  {expandedOperator === operator.email && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6">
                        {operator.bookings.length === 0 ? (
                          <p className="text-gray-500 text-center">No bookings for this operator.</p>
                        ) : (
                          <ul className="space-y-4">
                            {operator.bookings.map((booking) => (
                              <motion.li
                                key={booking.booking_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-600">
                                      <span className="font-medium">User:</span> {booking.user_name}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">Facility:</span> {booking.facility_name}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">Date:</span> {booking.booking_date}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">Cost:</span> {booking.cost} Rs.
                                    </p>
                                    
                                    {/* Receipt Download */}
                                    <div className="mt-2">
                                      {booking.receipt_path ? (
                                        <button
                                          onClick={() => downloadReceipt(booking.booking_id, booking.receipt_path)}
                                          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 flex items-center"
                                          disabled={downloadingReceipt === booking.booking_id}
                                        >
                                          {downloadingReceipt === booking.booking_id ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                              Downloading...
                                            </>
                                          ) : (
                                            <>
                                              <Download className="w-4 h-4 mr-1" />
                                              View Receipt
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <span className="text-amber-500 font-medium flex items-center text-sm">
                                          <XCircle className="w-4 h-4 mr-1" />
                                          No receipt uploaded
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="text-gray-600">
                                      <span className="font-medium">Status:</span> {booking.status}
                                    </p>
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        onClick={() => handleViewUserHistory(booking.user_id, booking.user_name)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center"
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View History
                                      </button>
                                      {booking.status === 'Pending' && (
                                        <>
                                          <button
                                            onClick={() => handleBookingAction(booking.booking_id, 'Approved', operator.email)}
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            onClick={() => handleBookingAction(booking.booking_id, 'Cancelled', operator.email)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                          >
                                            Decline
                                          </button>
                                        </>
                                      )}
                                      {booking.status !== 'Pending' && (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleStatusChange(booking.booking_id, 'Approved', operator.email)}
                                            className={`${booking.status === 'Approved' ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                                            disabled={booking.status === 'Approved'}
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleStatusChange(booking.booking_id, 'Cancelled', operator.email)}
                                            className={`${booking.status === 'Cancelled' ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
                                            disabled={booking.status === 'Cancelled'}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={selectedUser?.id}
        userName={selectedUser?.name}
      />
    </div>
  );
};

export default AdminManageBooking;