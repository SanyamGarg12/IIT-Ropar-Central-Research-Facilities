import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Hero from "./components/Hero";
import About from "./components/About";
import People from "./components/People";
import Facilities from "./components/Facilities";
import Booking from "./components/Booking";
import Forms from "./components/Forms";
import Publications from "./components/Publications";
import ContactUs from "./components/ContactUs";
import AdminPanel from "./components/AdminPanel";
import ManageMembers from "./components/ManageMembers";
import ManageFacilities from "./components/ManageFacilities";
import ManageForms from "./components/ManageForms";
import ManagePublications from "./components/ManagePublications";
import FacilityDetail from "./components/FacilityDetail";
import Register from "./components/Register";
import Login from "./components/Login";  
import "./App.css";

const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  // Function to handle token storage
  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
  };

  // Protect booking route
  const ProtectedRoute = ({ children }) => {
    return authToken ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Main Website Routes */}
        <Route
          path="/*"
          element={
            <div className="app-container">
              {/* Main Navbar */}
              <nav className="navbar">
                <div className="navbar-logo">
                  <img src="/assets/logo.jpg" alt="College Logo" className="navbar-logo-img" />
                  <h1>IIT Ropar Central Research Facility</h1>
                </div>
                <ul className="nav-links">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/about">About</Link>
                  </li>
                  <li>
                    <Link to="/people">People</Link>
                  </li>
                  <li>
                    <Link to="/facilities">Facilities</Link>
                  </li>
                  <li>
                    <Link to="/booking">Booking</Link>
                  </li>
                  <li>
                    <Link to="/forms">Forms</Link>
                  </li>
                  <li>
                    <Link to="/publications">Publications</Link>
                  </li>
                  <li>
                    <Link to="/contact-us">Contact Us</Link>
                  </li>
                </ul>
              </nav>

              {/* Main Website Content */}
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/about" element={<About />} />
                <Route path="/people" element={<People />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  }
                />
                <Route path="/forms" element={<Forms />} />
                <Route path="/publications" element={<Publications />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/facility/:id" element={<FacilityDetail />} />
                <Route path="/register" element={<Register onRegister={handleLogin} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
              </Routes>
            </div>
          }
        />

        {/* Admin Panel Routes */}
        <Route
          path="/admin/*"
          element={
            <div className="admin-container">
              {/* Admin Panel Content */}
              <Routes>
                <Route path="/" element={<AdminPanel />} />
                <Route path="/members" element={<ManageMembers />} />
                <Route path="/facilities" element={<ManageFacilities />} />
                <Route path="/forms" element={<ManageForms />} />
                <Route path="/publications" element={<ManagePublications />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
