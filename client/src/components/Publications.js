import { API_BASED_URL } from '../config.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Footer from './Footer';

const Publications = () => {
  const [publications, setPublications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${API_BASED_URL}api/publications`)
        setPublications(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching publications:', error)
        setError('Failed to fetch publications. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchPublications()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero/Header Section */}
      <header className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img
          src="/assets/pub.jpg"
          alt="Publications Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">OUR PUBLICATIONS</h1>
          <p className="mt-2 text-lg md:text-xl text-blue-100 font-medium">Explore our research output and scholarly work</p>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow"
            >
              {error}
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {publications.length > 0 ? (
                <ul className="space-y-6">
                  {publications.map((publication, index) => (
                    <motion.li
                      key={publication.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <a
                        href={publication.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-6 hover:bg-gray-50 transition-colors duration-300"
                      >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{publication.title}</h2>
                        <p className="text-gray-600">{publication.authors}</p>
                        <p className="text-sm text-gray-500 mt-2">{publication.journal}, {publication.year}</p>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-600 text-lg">
                  No publications available at the moment.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Publications

