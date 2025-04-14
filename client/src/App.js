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
import Header from "./components/Header";
import ManageBooking from "./components/ManageBooking";
import ManageLimFacilities from "./components/ManageLimFacilities";
import AddOperator from "./components/AddOperator";
import DeleteOperator from "./components/DeleteOperator";
import OperatorChangePassword from "./components/operatorChangePassword";
import ModPassword from "./components/ModPassword";
import AddSlots from "./components/AddSlots"; 
import UsersRequests from "./components/UsersRequests";
import AdminManageBooking from "./components/AdminManageBooking";
import ArchivedNews from './components/ArchivedNews';
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
                <Header />
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
                      <Route path="/archived-news" element={<ArchivedNews />} />
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
                      <Route path="/booking" element={<ManageBooking />} />
                      <Route path="/opfacilities" element={<ManageLimFacilities />} />
                      <Route path="/addoperator" element={<AddOperator />} />
                      <Route path="/deleteoperator" element={<DeleteOperator />} />
                      <Route path="/opchangepass" element={<OperatorChangePassword />} />
                      <Route path="/modpass" element={<ModPassword />} />
                      <Route path="/approveUsers" element={<UsersRequests />} />
                      <Route path="/addslots" element={<AddSlots />} />
                      <Route path="/adminManageBooking" element={<AdminManageBooking />} />
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