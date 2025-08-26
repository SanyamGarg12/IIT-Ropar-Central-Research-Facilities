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
import SupervisorVerify from "./components/SupervisorVerify";
import SupervisorBookingApproval from "./components/SupervisorBookingApproval";
import AdminManageBifurcations from './components/AdminManageBifurcations';
import AdminManageSpecialNotes from './components/AdminManageSpecialNotes';
import AdminUserPubs from './components/AdminUserPubs';
import ViewFacilitySlots from './components/ViewFacilitySlots';
import ManageQrCode from './components/ManageQrCode';
import AdminManageSlots from './components/AdminManageSlots';
import ManageSupervisors from './components/ManageSupervisors';
import ManageCategories from './components/ManageCategories';
import ManageFooter from './components/ManageFooter';

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

  const AdminProtectedRoute = ({ children }) => {
    const userPosition = localStorage.getItem("userPosition");
    const userToken = localStorage.getItem("userToken");

    if (!userToken || userPosition !== "Admin") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
            <p className="text-gray-600 mb-4">You do not have permission to access this page. Only administrators can access this area.</p>
            <Link 
              to="/" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      );
    }

    return children;
  };

  const OperatorProtectedRoute = ({ children }) => {
    const userPosition = localStorage.getItem("userPosition");
    const userToken = localStorage.getItem("userToken");

    if (!userToken || userPosition !== "Operator") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
            <p className="text-gray-600 mb-4">You do not have permission to access this page. Only operators can access this area.</p>
            <Link 
              to="/" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      );
    }

    return children;
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
                  <div className="container mx-auto px-4 py-6">
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
                      <Route path="/supervisor-verify" element={<SupervisorVerify />} />
                      <Route path="/supervisor-booking-approval" element={<SupervisorBookingApproval />} />
                      <Route
                        path="/view-facility-slots"
                        element={
                          <ProtectedRoute>
                            <ViewFacilitySlots />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </div>
                </main>
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
                  <div className="container mx-auto px-4 py-6">
                    <Routes>
                      <Route path="/" element={<AdminPanel />} />
                      <Route path="/members" element={
                        <AdminProtectedRoute>
                          <ManageMembers />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/facilities" element={
                        <AdminProtectedRoute>
                          <ManageFacilities />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/categories" element={
                        <AdminProtectedRoute>
                          <ManageCategories />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/forms" element={
                        <AdminProtectedRoute>
                          <ManageForms />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/publications" element={
                        <AdminProtectedRoute>
                          <ManagePublications />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/about" element={
                        <AdminProtectedRoute>
                          <ManageAbout />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/hero" element={
                        <AdminProtectedRoute>
                          <ManageHero />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/booking" element={
                        <OperatorProtectedRoute>
                          <ManageBooking />
                        </OperatorProtectedRoute>
                      } />
                      <Route path="/opfacilities" element={
                        <AdminProtectedRoute>
                          <ManageLimFacilities />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/addoperator" element={
                        <AdminProtectedRoute>
                          <AddOperator />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/deleteoperator" element={
                        <AdminProtectedRoute>
                          <DeleteOperator />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/opchangepass" element={
                        <OperatorProtectedRoute>
                          <OperatorChangePassword />
                        </OperatorProtectedRoute>
                      } />
                      <Route path="/modpass" element={
                        <AdminProtectedRoute>
                          <ModPassword />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/approveUsers" element={
                        <AdminProtectedRoute>
                          <UsersRequests />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/addslots" element={
                        <OperatorProtectedRoute>
                          <AddSlots />
                        </OperatorProtectedRoute>
                      } />
                      <Route path="/adminManageBooking" element={
                        <AdminProtectedRoute>
                          <AdminManageBooking />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/adminUserPubs" element={
                        <AdminProtectedRoute>
                          <AdminUserPubs />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/adminManageBifurcations" element={
                        <AdminProtectedRoute>
                          <AdminManageBifurcations />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/adminManageSpecialNotes" element={
                        <AdminProtectedRoute>
                          <AdminManageSpecialNotes />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/qr-code" element={
                        <AdminProtectedRoute>
                          <ManageQrCode />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/manage-slots" element={
                        <AdminProtectedRoute>
                          <AdminManageSlots />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/supervisors" element={
                        <AdminProtectedRoute>
                          <ManageSupervisors />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/footer" element={
                        <AdminProtectedRoute>
                          <ManageFooter />
                        </AdminProtectedRoute>
                      } />
                    </Routes>
                  </div>
                </main>

                {/* Admin Footer */}
                <footer className="bg-white shadow-md mt-auto">
                  <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-gray-500 text-sm">
                      © 2025 IIT Ropar Central Research Facility Admin Panel. All rights reserved.
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