import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Videos from "./Videos";
import { Facebook, Twitter, Instagram, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import Footer from "./Footer";
import { Link } from 'react-router-dom';
import {API_BASED_URL} from '../config.js'; 

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${API_BASED_URL}uploads/${imagePath}`;
};
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [thought, setThought] = useState('');
  const [newsFeed, setNewsFeed] = useState([]);

  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await fetch('/api/getsliderimages');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching slider images:', error);
      }
    };

    const fetchThought = async () => {
      try {
        const response = await fetch('/api/getthought');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setThought(data[0].thought_text || '');
      } catch (error) {
        console.error('Error fetching thought:', error);
        setThought('');
      }
    };

    const fetchNews = async () => {
      try {
        const response = await fetch('/api/getnews');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNewsFeed(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchSliderImages();
    fetchThought();
    fetchNews();
  }, []);

  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }
  };
  return (
    <motion.div
      className="bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Slider Section */}
      <div className="relative h-96 overflow-hidden">
        <motion.button
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => handleScroll("left")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </motion.button>

        <AnimatePresence initial={false} custom={currentIndex}>
          {images.length > 0 && (
            <motion.div
              key={currentIndex}
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={getImageUrl(images[currentIndex].imagepath)}
                alt={`Slide ${currentIndex + 1}`}
                className="object-cover w-full h-full"
              />
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-white text-3xl font-bold">{images[currentIndex].title}</h2>
                <p className="text-white text-xl">{images[currentIndex].subtitle}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => handleScroll("right")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </motion.button>
      </div>

      {/* Thought of the Day Section */}
      <motion.div
        className="bg-blue-100 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-blue-800 mb-2">Thought of the Day</h3>
          {thought ? (
            <p className="text-lg text-blue-600 italic">&quot;{thought}&quot;</p>
          ) : (
            <p className="text-lg text-blue-600">No thought available for today.</p>
          )}
        </div>
      </motion.div>

      {/* News Feed Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Latest News and Events</h2>
          <Link 
            to="/archived-news" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <Archive className="w-5 h-5" />
            <span className="font-medium">View Archived News</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsFeed.map((news, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <img src={getImageUrl(news.imagepath)} alt={news.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{news.title}</h3>
                <p className="text-gray-600">{news.summary}</p>
                <a href={news.link} className="mt-4 inline-block text-blue-600 hover:underline">Read more</a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Section */}
      <Footer />
    </motion.div>
  );
};

export default Hero;

