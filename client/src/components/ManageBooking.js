import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';

const ManageBooking = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const operatorEmail = localStorage.getItem('userEmail');
  const authToken = localStorage.getItem('userToken');
 
  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/booking-requests', {
        params: { operatorEmail },
        headers: { Authorization: `${authToken}` }
      });
      setBookingRequests(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch booking requests. Please try again later.');
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await axios.post('http://localhost:5000/api/handle-booking', {
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
    // formData.append('userId', userId);
    formData.append('bookingId', bookingId);
    formData.append('resultDate', new Date());

    try {
      setUploadingId(bookingId);
      await axios.post('http://localhost:5000/api/upload-results', formData, {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Operator Panel</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">Welcome to the Operator Panel. Here you can manage booking requests for your facilities.</p>
        
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
        
        {bookingRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <p className="text-2xl text-gray-500">No pending booking requests.</p>
          </motion.div>
        ) : (
          <ul className="space-y-6">
            <AnimatePresence>
              {bookingRequests.map((request) => (
                <motion.li
                  key={request.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{request.facilityName}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <p className="text-gray-600"><span className="font-medium">User:</span> {request.user_name}</p>
                      <p className="text-gray-600"><span className="font-medium">Date:</span> {request.booking_date}</p>
                      <p className="text-gray-600"><span className="font-medium">Facility Name:</span> {request.facility_name}</p>
                      <p className="text-gray-600"><span className="font-medium">Cost:</span> {request.cost}</p>
                      <p className="text-gray-600"><span className="font-medium">Status:</span> {request.status}</p>
                    </div>
                    <div className="flex flex-wrap justify-end space-x-4 space-y-2">
                      <button
                        onClick={() => handleBookingAction(request.booking_id, 'Approved')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(request.booking_id, 'Cancelled')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      >
                        Decline
                      </button>
                      {request.status === 'Approved' && !request.resultsUploaded && (
                        <div className="relative">
                          <input
                            type="file"
                            id={`file-upload-${request.booking_id}`}
                            className="hidden"
                            accept=".zip"
                            onChange={(e) => handleFileUpload(request.booking_id, e.target.files[0], request.user_id)}
                          />
                          <label
                            htmlFor={`file-upload-${request.booking_id}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer flex items-center"
                          >
                            {uploadingId === request.booking_id ? (
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-5 h-5 mr-2" />
                            )}
                            Choose ZIP File
                          </label>
                        </div>
                      )}
                      {request.status === 'Approved' && request.resultsUploaded && (
                        <p className="text-green-600 font-medium">Results Uploaded</p>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;

