import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageBooking = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const operatorEmail = localStorage.getItem('operatorEmail');
  const authToken = localStorage.getItem('authToken');

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
      setBookingRequests(bookingRequests.filter(request => request.id !== bookingId));
    } catch (err) {
      setError(`Failed to ${action} booking. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Operator Panel</h1>
      <p className="mb-8 text-gray-600">Welcome to the Operator Panel. Here you can manage booking requests for your facilities.</p>
      
      {bookingRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-500">No pending booking requests.</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {bookingRequests.map((request) => (
            <li key={request.id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">{request.facilityName}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <p className="text-gray-600"><span className="font-medium">User:</span> {request.userName}</p>
                  <p className="text-gray-600"><span className="font-medium">Date:</span> {request.date}</p>
                  <p className="text-gray-600"><span className="font-medium">Time:</span> {request.time}</p>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => handleBookingAction(request.id, 'accept')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleBookingAction(request.id, 'decline')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageBooking;

