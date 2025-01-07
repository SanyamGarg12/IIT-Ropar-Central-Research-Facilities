import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Videos from "./Videos";
import { Facebook, Twitter, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [thought, setThought] = useState('');
  const [newsFeed, setNewsFeed] = useState([]);
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/getsliderimages');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { sliderImages, Thought, NewsFeed } = await response.json();
  
        // Update states
        setImages(sliderImages);
        setThought(Thought);
        setNewsFeed(NewsFeed);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
  
    fetchContent();
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
                src={images[currentIndex].src}
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
          <p className="text-lg text-blue-600 italic">&quot;{thought}&quot;</p>
        </div>
      </motion.div>

      {/* News Feed Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsFeed.map((news, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <img src={news.image} alt={news.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{news.title}</h3>
                <p className="text-gray-600">{news.summary}</p>
                <a href={news.link} className="mt-4 inline-block text-blue-600 hover:underline">Read more</a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Videos Section */}
      <motion.div
        className="bg-gray-200 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Videos</h2>
          <Videos />
        </div>
      </motion.div>

      {/* Recent Publications Section */}
      <motion.div
        className="bg-white py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Publications</h2>
          <motion.ul className="space-y-4">
            {[1, 2, 3].map((index) => (
              <motion.li
                key={index}
                className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <a href="#" className="text-lg text-blue-600 hover:underline">
                  Title of Publication {index}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* Footer Section */}
      <motion.footer
        className="bg-gray-800 text-white py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-gray-300 transition-colors duration-200">Home</a></li>
                <li><a href="/about" className="hover:text-gray-300 transition-colors duration-200">About</a></li>
                <li><a href="/contact-us" className="hover:text-gray-300 transition-colors duration-200">Contact Us</a></li>
                <li><a href="/publications" className="hover:text-gray-300 transition-colors duration-200">Publications</a></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p>Email: info@iiitd.ac.in</p>
              <p>Phone: +91-12345-67890</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Hero;

