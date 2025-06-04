import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASED_URL } from '../config.js';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}uploads/${cleanPath}`;
};

const ArchivedNews = () => {
  const [archivedNews, setArchivedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchArchivedNews = async () => {
      try {
        const response = await fetch('/api/archived-news');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArchivedNews(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching archived news:', error);
        setError('Failed to load archived news');
        setIsLoading(false);
      }
    };

    fetchArchivedNews();
  }, []);

  const handleImageError = (newsId) => {
    setImageErrors(prev => ({
      ...prev,
      [newsId]: true
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Archived News and Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedNews.map((news, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <div className="relative h-48">
              {news.imagepath && !imageErrors[news.id] ? (
                <img 
                  src={getImageUrl(news.imagepath)} 
                  alt={news.news_title} 
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(news.id)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{news.news_title}</h3>
              <p className="text-gray-600">{news.summary}</p>
              <a href={news.link} className="mt-4 inline-block text-blue-600 hover:underline">Read more</a>
              <p className="text-sm text-gray-500 mt-2">
                Archived on: {new Date(news.archived_date).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ArchivedNews; 