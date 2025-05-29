import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  secureFetch,
  createRateLimiter,
  escapeHtml 
} from '../utils/security';

const UserHistoryModal = ({ isOpen, onClose, userId, userName }) => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Create rate limiter for fetch operations
  const rateLimiter = createRateLimiter(1000, 60 * 1000); // 10 fetches per minute

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserHistory();
    }
  }, [isOpen, userId, currentPage]);

  const fetchUserHistory = async () => {
    // Check rate limit
    if (!rateLimiter.check('fetch_history')) {
      setError("Too many requests. Please wait a moment.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const authToken = localStorage.getItem('userToken');
      if (!authToken) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await secureFetch(
        `${API_BASED_URL}api/user-history/${userId}?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: authToken
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Sanitize all user-facing data
        const sanitizedHistory = data.map(booking => ({
          ...booking,
          facility_name: escapeHtml(booking.facility_name),
          slot: `${booking.start_time} - ${booking.end_time}`
        }));
        
        setBookingHistory(sanitizedHistory);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch user history');
      }
    } catch (err) {
      setError('Error fetching user history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Rejected': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Booking History for {escapeHtml(userName)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : bookingHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No booking history found
            </div>
          ) : (
            <div className="space-y-6">
              {bookingHistory.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.facility_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking ID: #{booking.booking_id}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p className="font-medium">{booking.slot}</p>
                    </div>
                  </div>

                  {booking.purpose && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Purpose</p>
                      <p className="text-gray-700">{booking.purpose}</p>
                    </div>
                  )}

                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                    {/* <div>
                      <p className="text-sm text-gray-500">Cost</p>
                      <p className="font-medium">₹{booking.cost}</p>
                    </div> */}
                    {/* <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium">{booking.participants}</p>
                    </div> */}
                  {/* </div> */}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;

