import React, { useState } from "react";
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
import ManageAbout from "./components/ManageAbout";
import ManageHero from "./components/ManageHero";

const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
  };

  const ProtectedRoute = ({ children }) => {
    return authToken ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Main Website Routes */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                {/* Main Navbar */}
                <nav className="bg-white shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <img
                            className="h-8 w-auto"
                            src="/assets/logo.jpg"
                            alt="College Logo"
                          />
                          <h1 className="ml-2 text-xl font-bold text-gray-800">
                            IIT Ropar Central Research Facility
                          </h1>
                        </div>
                      </div>
                      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Home
                        </Link>
                        <Link to="/about" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          About
                        </Link>
                        <Link to="/people" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          People
                        </Link>
                        <Link to="/facilities" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Facilities
                        </Link>
                        <Link to="/booking" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Booking
                        </Link>
                        <Link to="/forms" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Forms
                        </Link>
                        <Link to="/publications" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Publications
                        </Link>
                        <Link to="/contact-us" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Contact Us
                        </Link>
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Main Website Content */}
                <main className="flex-grow">
                  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                </main>

                {/* Footer */}
                <footer className="bg-white shadow-md mt-auto">
                  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                      © 2023 IIT Ropar Central Research Facility. All rights reserved.
                    </p>
                  </div>
                </footer>
              </div>
            }
          />

          {/* Admin Panel Routes */}
          <Route
            path="/admin/*"
            element={
              <div className="flex flex-col min-h-screen bg-gray-100">
                {/* Admin Panel Navbar */}
                <nav className="bg-white shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <h1 className="text-xl font-bold text-gray-800">
                            Admin Panel
                          </h1>
                        </div>
                      </div>
                      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <Link to="/admin/members" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage Members
                        </Link>
                        <Link to="/admin/facilities" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage Facilities
                        </Link>
                        <Link to="/admin/forms" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage Forms
                        </Link>
                        <Link to="/admin/publications" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage Publications
                        </Link>
                        <Link to="/admin/about" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage About
                        </Link>
                        <Link to="/admin/hero" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 text-sm font-medium">
                          Manage Home Page
                        </Link>
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Admin Panel Content */}
                <main className="flex-grow">
                  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                      <Route path="/" element={<AdminPanel />} />
                      <Route path="/members" element={<ManageMembers />} />
                      <Route path="/facilities" element={<ManageFacilities />} />
                      <Route path="/forms" element={<ManageForms />} />
                      <Route path="/publications" element={<ManagePublications />} />
                      <Route path="/about" element={<ManageAbout />} />
                      <Route path="/hero" element={<ManageHero />} />
                    </Routes>
                  </div>
                </main>

                {/* Admin Footer */}
                <footer className="bg-white shadow-md mt-auto">
                  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                      © 2023 IIT Ropar Central Research Facility Admin Panel. All rights reserved.
                    </p>
                  </div>
                </footer>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

