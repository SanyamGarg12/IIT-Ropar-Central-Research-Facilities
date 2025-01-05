import React, { useState } from "react";
import Videos from "./Videos";
import {Facebook, Twitter, Instagram } from 'lucide-react';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      src: "/assets/sample.jpeg",
      title: "Dr. John Doe",
      subtitle: "Director of IITRPR",
    },
    {
      src: "/assets/sample.jpeg",
      title: "Prof. Jane Smith",
      subtitle: "Head of Research",
    },
    {
      src: "/assets/sample.jpeg",
      title: "Dr. Michael Lee",
      subtitle: "Dean of Facilities",
    },
  ];

  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Image Slider Section */}
      <div className="relative h-96 overflow-hidden">
        <button
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => handleScroll("left")}
        >
          {/* Replace with text or emoji */}
          <span className="text-xl text-gray-800">←</span>
        </button>

        <div className="h-full w-full">
          <img
            src={images[currentIndex].src}
            alt={`Slide ${currentIndex + 1}`}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl font-bold">{images[currentIndex].title}</h2>
            <p className="text-white text-xl">{images[currentIndex].subtitle}</p>
          </div>
        </div>

        <button
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => handleScroll("right")}
        >
          {/* Replace with text or emoji */}
          <span className="text-xl text-gray-800">→</span>
        </button>
      </div>

      {/* Videos Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Videos</h2>
        <Videos />
      </div>

      {/* Recent Publications Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Publications</h2>
          <ul className="space-y-4">
            <li className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <a href="example.com" className="text-lg text-blue-600 hover:underline">Title of Publication 1</a>
            </li>
            <li className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <a href="example.com" className="text-lg text-blue-600 hover:underline">Title of Publication 2</a>
            </li>
            <li className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <a href="example.com" className="text-lg text-blue-600 hover:underline">Title of Publication 3</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-gray-300 transition-colors duration-200">Home</a></li>
                <li><a href="/about" className="hover:text-gray-300 transition-colors duration-200">About</a></li>
                <li><a href="/contact-us" className="hover:text-gray-300 transition-colors duration-200">Contact Us</a></li>
                <li><a href="/publications" className="hover:text-gray-300 transition-colors duration-200">Publications</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p>Email: info@iiitd.ac.in</p>
              <p>Phone: +91-12345-67890</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-200">
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-200">
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors duration-200">
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;

