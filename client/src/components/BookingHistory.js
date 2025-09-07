import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Calendar, DollarSign, Mail, FileText, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import { jwtDecode } from "jwt-decode";
import {API_BASED_URL} from '../config.js'; 

export default function BookingHistory() {
  const [history, setHistory] = useState([])
  const [results, setResults] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [loadingResults, setLoadingResults] = useState({})
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const userId = authToken ? jwtDecode(authToken).userId : null
  const userType = authToken ? jwtDecode(authToken).userType : null
  const isInternalUser = userType === 'Internal'

  useEffect(() => {
    if (authToken && userId) {
      fetchBookingHistory()
    } else {
      setError('Authentication token is missing or invalid.')
      setIsLoading(false)
    }
  }, [authToken, userId])

  // Fetch results for all approved bookings
  useEffect(() => {
    const fetchAllResults = async () => {
      const approvedBookings = history.filter(booking => booking.status === 'Approved');
      
      // Create an object to track loading state for all bookings
      const newLoadingState = {};
      approvedBookings.forEach(booking => {
        newLoadingState[booking.booking_id] = true;
      });
      
      if (approvedBookings.length > 0) {
        setLoadingResults(newLoadingState);
        
        // Fetch results for each approved booking
        const resultsPromises = approvedBookings.map(booking => 
          fetchResults(booking.booking_id, false) // Pass false to not update loading state here
        );
        
        await Promise.all(resultsPromises);
        
        // Reset loading state for all bookings
        const completedLoadingState = {};
        approvedBookings.forEach(booking => {
          completedLoadingState[booking.booking_id] = false;
        });
        setLoadingResults(completedLoadingState);
      }
    };
    
    if (history.length > 0) {
      fetchAllResults();
    }
  }, [history]);

  const fetchBookingHistory = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASED_URL}api/booking-history`, {
        headers: { Authorization: `${authToken}` },
      })
      setHistory(response.data)
    } catch (err) {
      console.error('Failed to fetch booking history', err)
      setError('Failed to fetch booking history. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchResults = async (bookingId, updateLoadingState = true) => {
    if (updateLoadingState) {
      setLoadingResults(prev => ({ ...prev, [bookingId]: true }))
  }
    
    try {
      const response = await axios.get(`${API_BASED_URL}api/results/${userId}/${bookingId}`, {
        headers: { Authorization: `${authToken}` },
      })
      setResults(prevResults => ({
        ...prevResults,
        [bookingId]: response.data
      }))
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch results for booking ${bookingId}`, err)
      setResults(prevResults => ({
        ...prevResults,
        [bookingId]: null
      }))
      return null;
    } finally {
      if (updateLoadingState) {
        setLoadingResults(prev => ({ ...prev, [bookingId]: false }))
      }
    }
  }

  const downloadResults = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      // First, get the file path from the API
      const filePathResponse = await axios.get(`${API_BASED_URL}api/results/${userId}/${bookingId}`, {
        headers: { Authorization: `${authToken}` },
      });
      
      const filePath = filePathResponse.data.result_file_path;
  
      if (!filePath) {
        console.error('File path not found in the API response');
        return;
      }
      
      // Now, download the file using the obtained file path
      const downloadResponse = await axios.get(`${API_BASED_URL}uploads/${filePath}`, {
        headers: { Authorization: `${authToken}` },
        responseType: 'blob', // Important for file download
      });
  
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filePath.split('/').pop()); // Use the original filename
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
      // You might want to show an error message to the user here
    } finally {
      setDownloadingId(null);
    }
  }

  const downloadReceipt = async (bookingId, receiptPath) => {
    if (!receiptPath) {
      alert('No receipt available for this booking');
      return;
    }

    try {
      setDownloadingReceiptId(bookingId);
      const downloadResponse = await axios.get(`${API_BASED_URL}uploads${receiptPath}`, {
        headers: { Authorization: `${authToken}` },
        responseType: 'blob', // Important for file download
      });
  
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Error downloading receipt. Please try again.');
    } finally {
      setDownloadingReceiptId(null);
    }
  }

  const toggleExpand = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null)
    } else {
      setExpandedBooking(bookingId)
      if (!results[bookingId] && !loadingResults[bookingId]) {
        fetchResults(bookingId)
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  // Sort bookings by date (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>
        <div className="text-sm text-gray-500">
          {sortedHistory.length} {sortedHistory.length === 1 ? 'booking' : 'bookings'} found
        </div>
      </motion.div>

      {sortedHistory.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl shadow-md p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">You haven't made any facility bookings yet.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sortedHistory.map((booking, index) => (
            <BookingCard
              key={booking.booking_id}
              booking={booking}
              index={index}
              expanded={expandedBooking === booking.booking_id}
              toggleExpand={() => toggleExpand(booking.booking_id)}
              result={results[booking.booking_id]}
              loadingResult={loadingResults[booking.booking_id]}
              downloadResult={() => downloadResults(booking.booking_id)}
              downloadReceipt={() => downloadReceipt(booking.booking_id, booking.receipt_path)}
              isDownloading={downloadingId === booking.booking_id}
              isDownloadingReceipt={downloadingReceiptId === booking.booking_id}
              isInternalUser={isInternalUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-xl text-gray-600">Loading your bookings...</p>
      </motion.div>
    </div>
  )
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-md max-w-md w-full"
      >
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700 text-center mb-2">Error</h3>
        <p className="text-red-600 text-center">{message}</p>
      </motion.div>
    </div>
  )
}

function BookingCard({ 
  booking, 
  index, 
  expanded, 
  toggleExpand, 
  result, 
  loadingResult, 
  downloadResult, 
  downloadReceipt,
  isDownloading,
  isDownloadingReceipt,
  isInternalUser
}) {
  // Format date properly
  const formattedDate = new Date(booking.booking_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get time slot if available
  const timeSlot = booking.slot || 'N/A';
  const hasMultipleSlots = booking.slots && booking.slots.length > 1;

  const statusClasses = {
    Approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-500 mr-2" />,
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800'
    },
    Pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <Clock className="w-5 h-5 text-yellow-500 mr-2" />,
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    Cancelled: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-500 mr-2" />,
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800'
    }
  };

  const statusStyle = statusClasses[booking.status] || statusClasses.Pending;

  return (
    <motion.div
      className={`rounded-xl shadow-md overflow-hidden border ${statusStyle.border} ${statusStyle.bg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{booking.facility_name}</h3>
          <span className={`px-3 py-1 inline-flex items-center rounded-full text-xs font-medium ${statusStyle.badge}`}>
            {statusStyle.icon}
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <div className="font-medium">{formattedDate}</div>
              <div className="text-sm text-gray-500">{timeSlot}</div>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <div className="font-medium">{booking.cost} Rs.</div>
              <div className="text-sm text-gray-500">Booking Fee</div>
            </div>
          </div>

          {/* Operator */}
          <div className="flex items-center text-gray-600">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <div className="font-medium truncate max-w-xs">{booking.operator_email}</div>
              <div className="text-sm text-gray-500">Operator</div>
            </div>
          </div>

          {/* Receipt - Only show for non-Internal users */}
          {!isInternalUser && (
            <div className="flex items-center text-gray-600">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <button
                  onClick={downloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                >
                  {isDownloadingReceipt ? (
                    <>
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Download Receipt
                    </>
                  )}
                </button>
                <div className="text-sm text-gray-500">Payment Proof</div>
              </div>
            </div>
          )}
          
          {/* Status Message for Internal Users */}
          {isInternalUser && (
            <div className="flex items-center text-gray-600">
              <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <div className="font-medium text-gray-800">
                  {booking.status === 'Pending' && 'Pending Supervisor Approval'}
                  {booking.status === 'Approved' && 'Approved by Supervisor'}
                  {booking.status === 'Cancelled' && 'Cancelled by Supervisor'}
                </div>
                <div className="text-sm text-gray-500">Booking Status</div>
              </div>
            </div>
          )}
        </div>

        {/* Time Slots Section - Show detailed slots if multiple */}
        {hasMultipleSlots && booking.slots && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Time Slots:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {booking.slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{slot.timeSlot}</p>
                    </div>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Total: {booking.slots.length} consecutive slots
            </div>
          </div>
        )}

        {/* Bifurcations Section */}
        {booking.bifurcations && booking.bifurcations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Options:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {booking.bifurcations.map((bifurcation, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{bifurcation.bifurcation_name}</p>
                      <p className="text-sm text-gray-500">
                        {bifurcation.sample_count} {bifurcation.sample_count === 1 ? 'sample' : 'samples'}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {bifurcation.pricing_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Notice for Internal Users with Pending Bookings */}
        {isInternalUser && booking.status === 'Pending' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Awaiting Supervisor Approval</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your booking request has been sent to your supervisor for approval. 
                  The amount will be deducted from your supervisor's wallet upon approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {booking.status === 'Approved' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            {result ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    {isInternalUser ? 'Results Available' : 'Results Available'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Uploaded on {new Date(result.result_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={downloadResult}
                  disabled={isDownloading}
                  className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      {isInternalUser ? 'Check Results' : 'Download Results'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-sm text-blue-700">
                {loadingResult ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                    {isInternalUser ? 'Checking for results...' : 'Checking for results...'}
                  </div>
                ) : (
                  isInternalUser ? "No results have been uploaded for this booking yet." : "No results have been uploaded for this booking yet."
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={toggleExpand}
            className="text-sm flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Booking ID:</span> #{booking.booking_id}
                </div>
                {booking.slot && (
                  <div>
                    <span className="font-semibold">Time Slot:</span> {booking.slot}
                  </div>
                )}
                {booking.schedule_id && (
                  <div>
                    <span className="font-semibold">Schedule ID:</span> {booking.schedule_id}
                  </div>
                )}
                {result && (
                  <div>
                    <span className="font-semibold">Results Upload Date:</span> {new Date(result.result_date).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <span className="font-semibold">User ID:</span> {booking.user_id}
                </div>
                <div>
                  <span className="font-semibold">Status Notes:</span> {getStatusMessage(booking.status, isInternalUser)}
                </div>
                
                {/* Billing Information for Non-Internal Users */}
                {!isInternalUser && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Billing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-medium text-gray-600">Billing Address:</span>
                        <p className="text-gray-800 mt-1">
                          {booking.billing_address || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">GST Number:</span>
                        <p className="text-gray-800 mt-1">
                          {booking.gst_number || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">UTR Number:</span>
                        <p className="text-gray-800 mt-1">
                          {booking.utr_number || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Transaction Date:</span>
                        <p className="text-gray-800 mt-1">
                          {booking.transaction_date ? new Date(booking.transaction_date).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function getStatusMessage(status, isInternalUser = false) {
  switch (status) {
    case 'Approved':
      return isInternalUser 
        ? 'Your booking has been approved by your supervisor. The facility is reserved for you on the specified date and time.'
        : 'Your booking has been approved by the facility operator. The facility is reserved for you on the specified date and time.';
    case 'Pending':
      return isInternalUser 
        ? 'Your booking is awaiting approval from your supervisor. You will be notified once it is approved.'
        : 'Your booking is awaiting approval from the facility operator. You will be notified once it is approved.';
    case 'Cancelled':
      return isInternalUser 
        ? 'This booking has been cancelled by your supervisor and is no longer valid.'
        : 'This booking has been cancelled and is no longer valid.';
    default:
      return 'No additional information available.';
  }
}

