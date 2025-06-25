import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import Footer from './Footer'
import { Loader2 } from 'lucide-react'
import {API_BASED_URL} from '../config.js'; 

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function Forms() {
  const [forms, setForms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/api/forms')
        setForms(response.data)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch forms. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchForms()
  }, [])

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-8 text-red-600 bg-red-100 p-4 rounded-lg shadow"
      >
        {error}
      </motion.div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero/Header Section */}
      <header className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img
          src="/assets/forms.png"
          alt="Forms Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">OUR FACILITIES FORMS</h1>
          <p className="mt-2 text-lg md:text-xl text-blue-100 font-medium">Download forms for all our research facilities</p>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="overflow-x-auto"
          >
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Form Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Facility</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forms.map((form, index) => (
                  <motion.tr
                    key={form.form_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{form.form_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{form.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{form.facility_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-4">
                        {form.form_link ? (
                          <a
                            href={getFileUrl(form.form_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Form
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No form available
                          </span>
                        )}
                        <a
                          href={form.facility_link}
                          className="text-green-600 hover:text-green-800 transition-colors flex items-center hover:underline"
                        >
                          Facility
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Forms

