import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Upload, Eye, Download, Calendar, Clock, DollarSign, Mail, User, Tag } from 'lucide-react';
import UserHistoryModal from './UserHistoryModal';
import {API_BASED_URL} from '../config.js'; 

const ManageBooking = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const operatorEmail = localStorage.getItem('userEmail');
  const authToken = localStorage.getItem('userToken');
 
  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASED_URL}api/booking-requests`, {
        params: { operatorEmail },
        headers: { Authorization: `${authToken}` }
      });
      
      // Sort booking requests by date (newest first)
      const sortedRequests = [...response.data].sort((a, b) => {
        const dateA = new Date(a.booking_date);
        const dateB = new Date(b.booking_date);
        return dateB - dateA;
      });
      
      setBookingRequests(sortedRequests);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch booking requests. Please try again later.');
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await axios.post(`${API_BASED_URL}api/handle-booking`, {
        bookingId,
        action,
        operatorEmail
      }, {
        headers: { Authorization: `${authToken}` }
      });
      setBookingRequests(bookingRequests.map(request => 
        String(request.booking_id) === String(bookingId) 
          ? { ...request, status: action } 
          : request
      ));
      setSuccessMessage(`Booking ${action.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} booking. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileUpload = async (bookingId, file) => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      setError('Please upload a zip file only.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('resultDate', new Date());

    try {
      setUploadingId(bookingId);
      await axios.post(`${API_BASED_URL}api/upload-results`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `${authToken}`
        }
      });
      setSuccessMessage('Results uploaded successfully.');
      setBookingRequests(bookingRequests.map(request => 
        String(request.booking_id) === String(bookingId) 
          ? { ...request, resultsUploaded: true } 
          : request
      ));
    } catch (err) {
      setError('Failed to upload results. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleViewUserHistory = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setIsHistoryModalOpen(true);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // If it's already in HH:MM format, return as is
      if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
      
      // If it contains time with seconds (HH:MM:SS)
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  // Filter requests based on active tab
  const filteredRequests = bookingRequests.filter(request => {
    if (activeTab === 'pending') return request.status === 'Pending';
    if (activeTab === 'approved') return request.status === 'Approved';
    if (activeTab === 'cancelled') return request.status === 'Cancelled';
    return true;
  });

  // Count requests by status
  const pendingCount = bookingRequests.filter(req => req.status === 'Pending').length;
  const approvedCount = bookingRequests.filter(req => req.status === 'Approved').length;
  const cancelledCount = bookingRequests.filter(req => req.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return (
          <span className="px-3 py-1 inline-flex items-center rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="px-3 py-1 inline-flex items-center rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 inline-flex items-center rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex items-center rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operator Panel</h1>
          <p className="text-gray-600">Manage booking requests for your facilities.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'pending' 
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              New Requests
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                {pendingCount}
              </span>
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'approved' 
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('approved')}
            >
              Approved
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {approvedCount}
              </span>
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'cancelled' 
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {cancelledCount}
              </span>
            </button>
          </div>
        </div>
        
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
        
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <div className="flex flex-col items-center">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-2xl text-gray-500 mb-2">No {activeTab} requests</p>
              <p className="text-gray-400">
                {activeTab === 'pending' && "You don't have any new booking requests."}
                {activeTab === 'approved' && "You haven't approved any bookings yet."}
                {activeTab === 'cancelled' && "You don't have any cancelled bookings."}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredRequests.map((request) => (
                <motion.div
                  key={request.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{request.facility_name}</h2>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">User</p>
                            <p className="font-medium text-gray-900">{request.user_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Booking Date</p>
                            <p className="font-medium text-gray-900">{formatDate(request.booking_date)}</p>
                          </div>
                        </div>
                        
                        {request.slot && (
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Time Slot</p>
                              <p className="font-medium text-gray-900">{request.slot}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Tag className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Booking ID</p>
                            <p className="font-medium text-gray-900">#{request.booking_id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Cost</p>
                            <p className="font-medium text-gray-900">{request.cost} Rs.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">User Email</p>
                            <p className="font-medium text-gray-900 text-sm">{request.user_email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Receipt Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Receipt</h3>
                      {request.receipt_path ? (
                        <button
                          onClick={() => downloadReceipt(request.booking_id, request.receipt_path)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                          disabled={downloadingReceipt === request.booking_id}
                        >
                          {downloadingReceipt === request.booking_id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Payment Receipt
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-amber-500 font-medium flex items-center">
                          <XCircle className="w-5 h-5 mr-2" />
                          No receipt uploaded
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Section */}
                    <div className="flex flex-wrap gap-3 justify-between items-center">
                      <button
                        onClick={() => handleViewUserHistory(request.user_id, request.user_name)}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View User History
                      </button>
                      
                      <div className="flex gap-3">
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(request.booking_id, 'Approved')}
                              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                            >
                              Accept Booking
                            </button>
                            <button
                              onClick={() => handleBookingAction(request.booking_id, 'Cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                            >
                              Decline Booking
                            </button>
                          </>
                        )}
                        
                        {request.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(request.booking_id, 'Cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                            >
                              Cancel Booking
                            </button>
                            {!request.resultsUploaded ? (
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`file-upload-${request.booking_id}`}
                                  className="hidden"
                                  accept=".zip"
                                  onChange={(e) => handleFileUpload(request.booking_id, e.target.files[0])}
                                />
                                <label
                                  htmlFor={`file-upload-${request.booking_id}`}
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out cursor-pointer flex items-center"
                                >
                                  {uploadingId === request.booking_id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Uploading Results...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Results (ZIP)
                                    </>
                                  )}
                                </label>
                              </div>
                            ) : (
                              <div className="bg-green-100 text-green-700 py-2 px-4 rounded-lg flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Results Uploaded
                              </div>
                            )}
                          </>
                        )}
                        
                        {request.status === 'Cancelled' && (
                          <button
                            onClick={() => handleBookingAction(request.booking_id, 'Approved')}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                          >
                            Approve Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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

export default ManageBooking;
