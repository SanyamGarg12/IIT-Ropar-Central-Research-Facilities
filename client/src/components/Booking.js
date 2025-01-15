import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import BookingHistory from "./BookingHistory";
import UserPublications from "./UserPublications";
import BookingFacility from "./BookingFacility";
import Logout from "./Logout";

function Booking() {
  const authToken = localStorage.getItem("authToken");
  const [activeOption, setActiveOption] = useState("Booking History");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (authToken) {
      try {
        const tokenPayload = JSON.parse(atob(authToken.split(".")[1]));
        setUserType(tokenPayload.userType || "Unknown");
        setUserId(tokenPayload.userId || "Unknown");
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [authToken]);

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  const navItems = ["Booking History", "Publications", "Booking Facility"];

  const renderActiveSection = () => {
    switch (activeOption) {
      case "Booking History":
        return <BookingHistory />;
      case "Publications":
        return <UserPublications />;
      case "Booking Facility":
        return <BookingFacility />;
      case "User Profile":
        return <UserProfile />;
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
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-end items-center">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setActiveOption("User Profile");
                      setIsUserMenuOpen(false);
                    }}
                  >
                    User Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setActiveOption("Change Password");
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Change Password
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setActiveOption("Logout");
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Booking;

