import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'
import { jwtDecode } from "jwt-decode";
import {API_BASED_URL} from '../App.js'; 

export default function BookingHistory() {
  const [history, setHistory] = useState([])
  const [results, setResults] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [loadingResults, setLoadingResults] = useState({})

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const userId = authToken ? jwtDecode(authToken).userId : null

  useEffect(() => {
    if (authToken && userId) {
      fetchBookingHistory()
    } else {
      setError('Authentication token is missing or invalid.')
      setIsLoading(false)
    }
  }, [authToken, userId])

  const fetchBookingHistory = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/booking-history', {
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

  const fetchResults = async (bookingId) => {
    setLoadingResults(prev => ({ ...prev, [bookingId]: true }))
    try {
      const response = await axios.get(`http://localhost:5000/api/results/${userId}/${bookingId}`, {
        headers: { Authorization: `${authToken}` },
      })
      setResults(prevResults => ({
        ...prevResults,
        [bookingId]: response.data
      }))
    } catch (err) {
      console.error(`Failed to fetch results for booking ${bookingId}`, err)
      setResults(prevResults => ({
        ...prevResults,
        [bookingId]: null
      }))
    } finally {
      setLoadingResults(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const downloadResults = async (bookingId) => {
    try {
      // First, get the file path from the API
      const filePathResponse = await axios.get(`http://localhost:5000/api/results/${userId}/${bookingId}`, {
        headers: { Authorization: `${authToken}` },
      });
      
      const filePath = filePathResponse.data.result_file_path;
  
      if (!filePath) {
        console.error('File path not found in the API response');
        return;
      }
      
      // Now, download the file using the obtained file path
      const downloadResponse = await axios.get(`http://localhost:5000/uploads/${filePath}`, {
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
      <BookingTable
        history={history}
        expandedBooking={expandedBooking}
        toggleExpand={toggleExpand}
        results={results}
        loadingResults={loadingResults}
        downloadResults={downloadResults}
      />
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
        className="text-2xl font-semibold text-gray-700"
      >
        Loading...
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
        className="text-2xl font-semibold text-red-600"
      >
        {message}
      </motion.div>
    </div>
  )
}

function BookingTable({ history, expandedBooking, toggleExpand, results, loadingResults, downloadResults }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

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
  }

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto"
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((booking, index) => (
            <React.Fragment key={booking.booking_id}>
              <BookingRow
                booking={booking}
                index={index}
                expandedBooking={expandedBooking}
                toggleExpand={toggleExpand}
                results={results}
                loadingResults={loadingResults}
                downloadResults={downloadResults}
                itemVariants={itemVariants}
              />
              <BookingDetails
                booking={booking}
                expandedBooking={expandedBooking}
                results={results}
                loadingResults={loadingResults}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

function BookingRow({ booking, index, expandedBooking, toggleExpand, results, loadingResults, downloadResults, itemVariants }) {
  return (
    <motion.tr
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.cost}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.operator_email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button
            onClick={() => toggleExpand(booking.booking_id)}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            {expandedBooking === booking.booking_id ? 'Hide Details' : 'Show Details'}
          </button>
          {results[booking.booking_id] && (
            <button
              onClick={() => downloadResults(booking.booking_id)}
              className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

function BookingDetails({ booking, expandedBooking, results, loadingResults }) {
  return (
    <AnimatePresence>
      {expandedBooking === booking.booking_id && (
        <motion.tr
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <td colSpan={6} className="px-6 py-4">
            {loadingResults[booking.booking_id] ? (
              <div className="text-sm text-gray-500">Loading results...</div>
            ) : results[booking.booking_id] ? (
              <div className="text-sm text-gray-900">
                <p><strong>Latest Result Uploaded Date:</strong> {new Date(results[booking.booking_id].result_date).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No results available.</div>
            )}
          </td>
        </motion.tr>
      )}
    </AnimatePresence>
  )
}

