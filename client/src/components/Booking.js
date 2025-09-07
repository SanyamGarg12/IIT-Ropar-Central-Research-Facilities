import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import BookingHistory from "./BookingHistory";
import UserPublications from "./UserPublications";
import BookingFacility from "./BookingFacility";
import Logout from "./Logout";
import ViewFacilitySlots from "./ViewFacilitySlots";
import { User, ChevronDown } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 

// Add axios interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("ClientUserId");
      
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function Booking() {
  const authToken = localStorage.getItem("authToken");
  const [activeOption, setActiveOption] = useState("User Profile");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        setUserType(decoded.userType || "Unknown");
        setUserId(decoded.userId || "Unknown");
        
        // Fetch user's full name using userId
        const fetchUserName = async () => {
          try {
            const clientUserId = localStorage.getItem("ClientUserId");
            if (clientUserId) {
              const response = await fetch(`${API_BASED_URL}api/UserProfile/${clientUserId}`);
              if (response.ok) {
                const userData = await response.json();
                setUserName(userData.full_name || userData.name || "User");
              } else {
                setUserName("User");
              }
            } else {
              setUserName("User");
            }
          } catch (error) {
            console.error("Error fetching user name:", error);
            setUserName("User");
          }
        };
        
        fetchUserName();
      } catch (error) {
        console.error("Invalid token:", error);
        // Clear local storage and redirect to login if token is invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("ClientUserId");
        window.location.href = "/login";
      }
    }
  }, [authToken]);

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  const navItems = ["User Profile", "Booking History", "Publications", "Booking Facility", "View Facilities Slots"];

  const renderActiveSection = () => {
    switch (activeOption) {
      case "User Profile":
        return <UserProfile />;
      case "Booking History":
        return <BookingHistory />;
      case "Publications":
        return <UserPublications />;
      case "Booking Facility":
        return <BookingFacility authToken={authToken} />;
      case "View Facilities Slots":
        return <ViewFacilitySlots authToken={authToken} />;
      case "Change Password":
        return <ChangePassword />;
      case "Logout":
        return <Logout />;
      default:
        return <div>No content available</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        setActiveOption={setActiveOption}
        activeOption={activeOption}
        navItems={navItems}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <motion.h1 
              className="text-2xl font-semibold text-gray-900"
              key={activeOption}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeOption}
            </motion.h1>
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full bg-gray-200 px-4 py-2 shadow-sm hover:bg-gray-300 transition duration-150 ease-in-out ${isUserMenuOpen ? "ring-2 ring-indigo-500 bg-gray-300" : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-6 w-6" />
                {userName && (
                  <span className="text-sm font-medium">Hi, {userName}!</span>
                )}
                <motion.div
                  animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    {["User Profile", "Change Password", "Logout"].map((item) => (
                      <motion.a
                        key={item}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setActiveOption(item);
                          setIsUserMenuOpen(false);
                        }}
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeOption}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Booking;

