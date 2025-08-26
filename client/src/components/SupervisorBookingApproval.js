import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASED_URL } from '../config.js';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, User, Building2, Wallet } from 'lucide-react';

const SupervisorBookingApproval = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    const token = urlParams.get('token');
    
    console.log('URL params:', { 
      bookingId, 
      bookingId_type: typeof bookingId,
      bookingId_value: bookingId,
      token, 
      token_type: typeof token,
      token_value: token,
      full_url: window.location.href
    });
    
    if (!bookingId || !token) {
      setError('Invalid approval link. Missing booking ID or token.');
      setLoading(false);
      return;
    }

    // Fetch booking details
    console.log('Making request to:', `${API_BASED_URL}api/supervisor-booking-info`);
    console.log('Request params:', { booking_id: bookingId, token });
    axios.get(`${API_BASED_URL}api/supervisor-booking-info`, {
      params: { booking_id: bookingId, token }
    })
    .then(res => {
      setBooking(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to load booking information.');
      setLoading(false);
    });
  }, []);

  const handleApproval = async (action) => {
    if (!booking) return;
    
    setProcessing(true);
    setStatus('');
    setError('');
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('Sending approval request:', {
      booking_id: booking.booking_id,
      booking_id_type: typeof booking.booking_id,
      booking_id_value: booking.booking_id,
      token,
      token_type: typeof token,
      token_value: token,
      action
    });
    
    try {
      const response = await axios.post(`${API_BASED_URL}api/supervisor-booking-approval`, {
        booking_id: booking.booking_id,
        token,
        action
      });
      
      setStatus(response.data.message);
      if (action === 'approve' && response.data.new_wallet_balance !== undefined) {
        setBooking(prev => ({
          ...prev,
          wallet_balance: response.data.new_wallet_balance,
          status: 'Approved'
        }));
      } else if (action === 'reject') {
        setBooking(prev => ({
          ...prev,
          status: 'Cancelled'
        }));
      }
    } catch (err) {
      console.log('Approval error:', err.response?.data);
      console.log('Error status:', err.response?.status);
      setError(err.response?.data?.error || 'Failed to process approval.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Success</h2>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600">The requested booking could not be found or you are not authorized to view it.</p>
        </div>
      </div>
    );
  }

  const hasSufficientFunds = Number(booking.wallet_balance) >= Number(booking.cost);
  const isAlreadyProcessed = booking.status !== 'Pending';

  console.log('Booking data for approval decision:', {
    wallet_balance: booking.wallet_balance,
    cost: booking.cost,
    wallet_balance_number: Number(booking.wallet_balance),
    cost_number: Number(booking.cost),
    hasSufficientFunds,
    isAlreadyProcessed,
    status: booking.status
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Booking Approval Request</h1>
            <p className="text-blue-100 mt-1">Review and approve internal user booking</p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">User Information</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Name:</span> {booking.user_name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span> {booking.user_email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {booking.user_type}
                </p>
              </div>

              {/* Facility Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Building2 className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Facility Information</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Facility:</span> {booking.facility_name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Date:</span> {new Date(booking.booking_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Cost and Wallet Information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Cost & Wallet Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Booking Cost:</span>
                  </p>
                  <p className="text-2xl font-bold text-blue-600">₹{booking.cost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Your Wallet Balance:</span>
                  </p>
                  <p className={`text-2xl font-bold ${hasSufficientFunds ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{booking.wallet_balance}
                  </p>
                </div>
              </div>
              
              {!hasSufficientFunds && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">
                      Insufficient funds in wallet. You need ₹{booking.cost - booking.wallet_balance} more to approve this booking.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isAlreadyProcessed ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleApproval('approve')}
                  disabled={!hasSufficientFunds || processing}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition duration-200 ${
                    hasSufficientFunds
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  Approve Booking
                </button>
                
                <button
                  onClick={() => handleApproval('reject')}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition duration-200"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  Reject Booking
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  This booking has already been {booking.status.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorBookingApproval;
