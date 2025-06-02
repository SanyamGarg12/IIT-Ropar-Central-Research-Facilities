import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUserPubs = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // toast.success('Toast system working!');
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASED_URL}api/admin/publications`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch publications');
      }
      
      const data = await response.json();
      setPublications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (filePath) => {
    try {
      const response = await fetch(`${API_BASED_URL}uploads/${filePath}`);
      // console.log(response);
      if (!response.ok) {
        throw new Error('File not found or corrupted');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
      toast.error('File is either corrupted or not uploaded properly!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">User Publications</h2>
        
        <div className="space-y-6">
          {publications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No publications found</p>
          ) : (
            publications.map((pub, index) => (
              <motion.div
                key={pub.publication_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {pub.title_of_paper}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Author:</span> {pub.author_name}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Submitted by:</span> {pub.user_email}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {pub.journal_name && (
                        <span>
                          <span className="font-medium">Journal:</span> {pub.journal_name}
                        </span>
                      )}
                      {pub.volume_number && (
                        <span>
                          <span className="font-medium">Volume:</span> {pub.volume_number}
                        </span>
                      )}
                      {pub.year && (
                        <span>
                          <span className="font-medium">Year:</span> {pub.year}
                        </span>
                      )}
                      {pub.page_number && (
                        <span>
                          <span className="font-medium">Pages:</span> {pub.page_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {pub.file_path ? (
                      <button
                        onClick={() => handleDownload(pub.file_path)}
                        className="text-white-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Publication
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        No file uploaded
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPubs;