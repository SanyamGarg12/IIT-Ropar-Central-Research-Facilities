import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import {API_BASED_URL} from '../config.js';

const DeleteOperator = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingOperator, setDeletingOperator] = useState(null);

  const authToken = localStorage.getItem('userToken');

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASED_URL}api/admin/operators-bookings`, {
        headers: { Authorization: `${authToken}` }
      });
      setOperators(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch operators. Please try again later.');
      setLoading(false);
    }
  };

  const handleDeleteOperator = async (email) => {
    if (!window.confirm('Are you sure you want to delete this operator? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingOperator(email);
      await axios.delete(`${API_BASED_URL}api/admin/operators/${email}`, {
        headers: { Authorization: `${authToken}` }
      });
      
      setOperators(operators.filter(op => op.email !== email));
      setSuccessMessage('Operator deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete operator. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingOperator(null);
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Delete Operators</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">Manage and remove operators from the system.</p>
        
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
            <p className="text-gray-500">No operators found.</p>
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
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {operator.name}
                      </h2>
                      <p className="text-gray-600">Email: {operator.email}</p>
                      <p className="text-gray-600 mt-2">
                        Total Bookings: {operator.bookings.length}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOperator(operator.email)}
                      disabled={deletingOperator === operator.email}
                      className={`${
                        deletingOperator === operator.email
                          ? 'bg-gray-400'
                          : 'bg-red-500 hover:bg-red-600'
                      } text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center`}
                    >
                      {deletingOperator === operator.email ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 mr-2" />
                      )}
                      Delete Operator
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteOperator; 