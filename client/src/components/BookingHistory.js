'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function BookingHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    setIsLoading(true);
    console.log('Fetching booking history');
    console.log('authToken:', authToken);
    axios
      .get('http://localhost:5000/api/booking-history', {
        headers: { Authorization: authToken },
      })
      .then((response) => {
        setHistory(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch booking history', err);
        setError('Failed to fetch booking history. Please try again later.');
        setIsLoading(false);
      });
  }, [authToken]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-gray-700"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-red-600"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2
        className="text-3xl font-bold mb-6 text-center text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Booking History
      </motion.h2>
      <motion.div
        className="bg-white shadow-md rounded-lg overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((booking, index) => (
              <motion.tr
                key={booking.booking_id}
                variants={itemVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.facility_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.booking_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.cost.toFixed(2)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      {history.length === 0 && (
        <motion.p
          className="text-center text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          No booking history found.
        </motion.p>
      )}
    </div>
  );
}

export default BookingHistory;

