import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {API_BASED_URL} from '../App.js'; 

function UserPublications() {
  const [formData, setFormData] = useState({
    author_name: '',
    title_of_paper: '',
    journal_name: '',
    volume_number: '',
    year: '',
    page_number: '',
    file: null,
    userId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken && decodedToken.userId) {
          setFormData(prevState => ({
            ...prevState,
            userId: decodedToken.userId
          }));
          fetchPublications(decodedToken.userId);
        } else {
          console.error('Token does not contain userId');
          setMessage('Invalid authentication token. Please log in again.');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setMessage('Error authenticating user. Please log in again.');
      }
    } else {
      setMessage('User not authenticated. Please log in.');
    }
  }, []);

  const fetchPublications = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/get-publications/${userId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch publications');
      }
      const data = await response.json();
      setPublications(data);
    } catch (error) {
      console.error('Error fetching publications:', error);
      setError('Failed to load publications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      if (files[0]) {
        const validZipTypes = [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/octet-stream'
        ];
        if (validZipTypes.includes(files[0].type) || files[0].name.toLowerCase().endsWith('.zip')) {
          setFormData(prevState => ({
            ...prevState,
            [name]: files[0]
          }));
        } else {
          setMessage('Please upload a valid zip file.');
        }
      }
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('User not authenticated. Please log in.');
      return;
    }
    setIsSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const response = await fetch('/api/add-publication', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit publication');
      }

      const result = await response.json();
      setMessage('Publication submitted successfully!');
      setFormData(prevState => ({
        ...prevState,
        author_name: '',
        title_of_paper: '',
        journal_name: '',
        volume_number: '',
        year: '',
        page_number: '',
        file: null,
      }));
      // Refresh the publications list after successful submission
      fetchPublications(formData.userId);
    } catch (error) {
      console.error('Submission error:', error);
      setMessage(`Error submitting publication: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (publicationId) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/delete-publication/${publicationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete publication');
        }

        setMessage('Publication deleted successfully!');
        // Refresh the publications list after successful deletion
        fetchPublications(formData.userId);
      } catch (error) {
        console.error('Delete error:', error);
        setMessage(`Error deleting publication: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-12 animate-fade-in-down">
          User Publications
        </h1>
        
        {/* Publications List */}
        <div className="mb-12 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105">
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : publications.length > 0 ? (
              <ul className="space-y-6">
                {publications.map((pub) => (
                  <li key={pub.publication_id} className="bg-indigo-50 rounded-lg p-4 shadow transition-all duration-300 ease-in-out hover:shadow-md">
                    <h3 className="font-bold text-lg text-indigo-900 mb-2">{pub.title_of_paper}</h3>
                    <p className="text-indigo-700"><span className="font-semibold">Author:</span> {pub.author_name}</p>
                    <p className="text-indigo-700"><span className="font-semibold">Journal:</span> {pub.journal_name}</p>
                    <p className="text-indigo-700"><span className="font-semibold">Year:</span> {pub.year}</p>
                    <button
                      onClick={() => handleDelete(pub.publication_id)}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-indigo-700">You don't have any publications, please fill the form below to add one</p>
            )}
          </div>
        </div>

        {/* Publication Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 transition-all duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-2xl font-bold text-indigo-800 mb-6">Submit New Publication</h2>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="author_name">
              Author Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="author_name"
              type="text"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="title_of_paper">
              Title of Paper
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="title_of_paper"
              type="text"
              name="title_of_paper"
              value={formData.title_of_paper}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="journal_name">
              Journal Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="journal_name"
              type="text"
              name="journal_name"
              value={formData.journal_name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="volume_number">
              Volume Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="volume_number"
              type="number"
              name="volume_number"
              value={formData.volume_number}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="year">
              Year
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="page_number">
              Page Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="page_number"
              type="text"
              name="page_number"
              value={formData.page_number}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-indigo-700 text-sm font-bold mb-2" htmlFor="file">
              Upload Zip File
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              id="file"
              type="file"
              name="file"
              accept=".zip,.zipx,.rar,.7z"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Publication'
              )}
            </button>
          </div>
        </form>
        {message && (
          <div className={`text-center p-4 rounded-lg transition-all duration-300 ease-in-out ${
            message.includes('Error') || message.includes('not authenticated')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPublications;

