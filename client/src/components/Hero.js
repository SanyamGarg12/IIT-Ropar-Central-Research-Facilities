import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Videos from "./Videos";
import { Facebook, Twitter, Instagram, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import Footer from "./Footer";
import { Link, useNavigate } from 'react-router-dom';
import {API_BASED_URL} from '../config.js'; 
import { 
  sanitizeInput, 
  secureFetch,
  createRateLimiter,
  escapeHtml 
} from '../utils/security';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}uploads/${cleanPath}`;
};

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [thought, setThought] = useState('');
  const [newsFeed, setNewsFeed] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  // Create rate limiter for search operations
  const rateLimiter = createRateLimiter(1000, 60 * 1000); // 20 searches per minute

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

    const fetchFacilities = async () => {
      try {
        setIsLoading(true);
        const response = await secureFetch(`${API_BASED_URL}api/facilities`);
        if (response.ok) {
          const data = await response.json();
          setFacilities(data);
        } else {
          setErrorMessage("Failed to fetch facilities");
        }
      } catch (error) {
        setErrorMessage("Error fetching facilities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderImages();
    fetchThought();
    fetchNews();
    fetchFacilities();
  }, []);

  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Check rate limit
    if (!rateLimiter.check('search_operation')) {
      setErrorMessage("Too many searches. Please wait a moment.");
      return;
    }

    const sanitizedQuery = sanitizeInput(searchQuery);
    navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
  };

  const handleFacilityClick = (facilityId) => {
    navigate(`/facility/${facilityId}`);
  };

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  return (
    <motion.div
      className="bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Slider Section */}
      <div className="relative w-full flex flex-col items-center justify-center bg-white">
        <motion.button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-blue-600 hover:text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 hover:border-blue-600"
          onClick={() => handleScroll("left")}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-7 h-7" />
        </motion.button>

        <AnimatePresence initial={false} custom={currentIndex}>
          {images.length > 0 && (
            <motion.div
              key={currentIndex}
              className="relative w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={getImageUrl(images[currentIndex].imagepath)}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-[70vh] object-cover"
                onError={() => handleImageError(images[currentIndex].id)}
              />
              {imageErrors[images[currentIndex].id] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Failed to load image</span>
                </div>
              )}
              <motion.div
                className="absolute inset-0 flex flex-col justify-end items-start p-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="backdrop-blur-sm bg-black/40 rounded-lg px-4 py-3 mb-4 max-w-lg">
                  <h2 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">{images[currentIndex].title}</h2>
                  <p className="text-white text-sm md:text-base drop-shadow-lg">{images[currentIndex].subtitle}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-blue-600 hover:text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 hover:border-blue-600"
          onClick={() => handleScroll("right")}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-7 h-7" />
        </motion.button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                idx === currentIndex
                  ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg'
                  : 'bg-white border-blue-200 hover:bg-blue-200'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: 'none' }}
            />
          ))}
        </div>
      </div>

      {/* Thought of the Day Section */}
      <motion.div
        className="flex justify-center items-center py-10 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl px-12 py-8 max-w-4xl w-full border-l-8 border-blue-400">
          <h3 className="text-3xl font-bold text-blue-800 mb-4 text-center tracking-wide" style={{fontFamily: 'Poppins, Montserrat, Arial, sans-serif'}}>
            Thought of the Day
          </h3>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 7h.01M15 7h.01M8 13h8m-4 4h.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {thought ? (
              <p className="text-xl italic text-blue-700 text-center font-medium" style={{fontFamily: 'Georgia, serif'}}>
                &quot;{thought}&quot;
              </p>
            ) : (
              <p className="text-lg text-blue-600">No thought available for today.</p>
            )}
          </div>
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
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{news.news_title}</h3>
                <p className="text-gray-600 mb-4">{news.summary}</p>
                <img 
                  src={getImageUrl(news.imagepath)} 
                  alt={news.news_title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Facilities Section */}
      <motion.div
        className="bg-gray-100 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.slice(0, 3).map((facility) => (
              <motion.div
                key={facility.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * facility.id, duration: 0.5 }}
              >
                <div
                  className="h-48 overflow-hidden rounded-t-lg"
                  style={{ backgroundImage: `url(${facility.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="h-full flex items-end p-4">
                    <div className="w-full bg-black bg-opacity-50 rounded-lg px-4 py-2">
                      <h3 className="text-white text-lg font-semibold">{escapeHtml(facility.name)}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{escapeHtml(facility.description?.substring(0, 100) + '...')}</p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleFacilityClick(facility.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Facility
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/facilities')}
              className="text-blue-600 hover:text-blue-800"
            >
              View All Facilities
            </button>
          </div>
        </div> */}
      </motion.div>

      {/* Footer Section */}
      <Footer />
    </motion.div>
  );
};

export default Hero;

