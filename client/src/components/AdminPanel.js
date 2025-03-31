import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {API_BASED_URL} from '../config.js'; 

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const position = localStorage.getItem("userPosition");
    if (token && position) {
      setIsLoggedIn(true);
      setUserPosition(position);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userPosition", data.position);
        localStorage.setItem('userEmail', data.email);
        setIsLoggedIn(true);
        setUserPosition(data.position);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userPosition");
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserPosition("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-md">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Admin Dashboard</h1>
          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Login
              </button>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
          ) : (
            <div>
              <p className="text-xl font-semibold text-center text-gray-800 mb-6">
                Welcome, {userPosition}!
              </p>
              <nav className="mb-6">
                <ul className="space-y-2">
                  {userPosition === "Admin" ? (
                    <>
                      <AdminLinks />
                    </>
                  ) : (
                    <>
                      <OperatorLinks />
                    </>
                  )}
                </ul>
              </nav>
              <button 
                onClick={handleLogout}
                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminLinks = () => {
  const links = [
    { to: "/admin/members", text: "Manage Members" },
    { to: "/admin/facilities", text: "Manage Facilities" },
    { to: "/admin/forms", text: "Manage Forms" },
    { to: "/admin/publications", text: "Manage Publications" },
    { to: "/admin/about", text: "Manage About Page" },
    { to: "/admin/hero", text: "Manage Home Page" },
    { to: "/admin/addoperator", text: "Add Operator" },
    { to: "/admin/modpass", text: "Change Operator Password" },
    { to: "/admin/approveUsers", text: "Approve New User Registration Requests" },
  ];

  return (
    <>
      {links.map((link, index) => (
        <li key={index}>
          <Link
            to={link.to}
            className="block text-indigo-600 hover:text-indigo-900 transition duration-300 ease-in-out transform hover:translate-x-1"
          >
            {link.text}
          </Link>
        </li>
      ))}
    </>
  );
};

const OperatorLinks = () => {
  const links = [
    { to: "/admin/booking", text: "Manage Bookings" },
    { to: "/admin/opchangepass", text: "Change Password" },
    { to: "/admin/addslots", text: "Modify Facility Slots" },
  ];

  return (
    <>
      {links.map((link, index) => (
        <li key={index}>
          <Link
            to={link.to}
            className="block text-indigo-600 hover:text-indigo-900 transition duration-300 ease-in-out transform hover:translate-x-1"
          >
            {link.text}
          </Link>
        </li>
      ))}
    </>
  );
};

export default AdminDashboard;

