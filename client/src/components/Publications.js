"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Footer from './Footer'

const Publications = () => {
  const [publications, setPublications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/publications')
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
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 md:h-96 overflow-hidden"
      >
        <img
          src="/assets/forms.jpg"
          alt="Publications Header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
            Our Publications
          </h1>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-12">
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
      </main>

      <Footer />
    </div>
  )
}

export default Publications

