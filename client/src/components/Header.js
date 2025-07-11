import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {API_BASED_URL} from '../config.js'; 

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
        <div className="flex items-center py-4 px-4">
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
          <div className="ml-auto flex flex-col items-end justify-center pr-6">
            <span
              className="font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-wide leading-tight relative"
              style={{
                fontFamily: 'Poppins, Montserrat, Arial, sans-serif',
                background: 'linear-gradient(90deg, #1a3365 60%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 8px rgba(59,130,246,0.10)'
              }}
            >
              Central Research Facilities{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #3b82f6 60%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                  display: 'inline-block'
                }}
                className="crf-gradient relative"
              >
                (CRF)
                <span className="block absolute left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mt-1" style={{width: '100%', bottom: '-8px'}}></span>
              </span>
              <span className="inline-block align-middle ml-2">
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-[#2B4B8C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "text-white px-3 py-4 text-sm font-medium hover:bg-blue-900 transition-colors duration-200" +
                    (isActive ? " bg-blue-900 font-bold" : "")
                  }
                  end={link.to === "/"}
                >
                  {link.text}
                </NavLink>
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
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "text-white block px-3 py-2 text-base font-medium hover:bg-blue-900 transition-colors duration-200" +
                  (isActive ? " bg-blue-900 font-bold" : "")
                }
                end={link.to === "/"}
                onClick={() => setIsOpen(false)}
              >
                {link.text}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
