import React, { useState } from "react";
import { Link } from "react-router-dom";
import {API_BASED_URL} from '../App.js'; 

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About" },
    { to: "/people", text: "People" },
    { to: "/facilities", text: "Facilities" },
    { to: "/booking", text: "Booking" },
    { to: "/forms", text: "Forms" },
    { to: "/publications", text: "Publications" },
    { to: "/contact-us", text: "Contact Us" },
  ];

  return (
    <header className="w-full">
      {/* Top utility bar */}

      {/* Main header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo and title section */}
            <div className="flex items-center">
              <img
                src="/assets/logo.jpg"
                alt="IIT Ropar Logo"
                className="h-16 w-auto"
              />
              <div className="ml-4">
                <div className="text-sm text-gray-600">ਭਾਰਤੀ ਤਕਨਾਲੋਜੀ ਸੰਸਥਾ ਰੋਪੜ</div>
                <div className="text-sm text-gray-600">भारतीय प्रौद्योगिकी संस्थान रोपड़</div>
                <div className="text-lg font-semibold text-gray-900">
                  Indian Institute of Technology Ropar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-[#2B4B8C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-900 transition-colors duration-200"
                >
                  {link.text}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-gray-300 p-2"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white block px-3 py-2 text-base font-medium hover:bg-blue-900 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
