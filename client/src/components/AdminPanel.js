import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaUserCheck, FaUserPlus, FaUserMinus, FaKey, FaBuilding, FaLayerGroup, FaStickyNote, FaCalendarCheck, FaQrcode, FaWpforms, FaBook, FaInfoCircle, FaHome, FaUserEdit, FaUserTie, FaTags, FaLink, FaEnvelope, FaListUl, FaWallet, FaUserShield } from 'react-icons/fa';
import { API_BASED_URL } from '../config.js';

const groupedAdminLinks = [
  {
    group: "User Management",
    links: [
      { to: "/admin/members", text: "Manage Members", icon: <FaUsers /> },
      { to: "/admin/approveUsers", text: "Approve New User Registration Requests", icon: <FaUserCheck /> },
      { to: "/admin/supervisors", text: "Manage Supervisors", icon: <FaUserTie /> },
      { to: "/admin/addoperator", text: "Add Operator", icon: <FaUserPlus /> },
      { to: "/admin/deleteoperator", text: "Delete Operator", icon: <FaUserMinus /> },
      { to: "/admin/modpass", text: "Change Operator Password", icon: <FaKey /> },
    ],
  },
  {
    group: "Facility Management",
    links: [
      { to: "/admin/facilities", text: "Manage Facilities", icon: <FaBuilding /> },
      { to: "/admin/categories", text: "Manage Categories", icon: <FaTags /> },
      { to: "/admin/adminManageBifurcations", text: "Manage Facility Bifurcations", icon: <FaLayerGroup /> },
      { to: "/admin/adminManageSpecialNotes", text: "Manage Facility Special Notes", icon: <FaStickyNote /> },
      { to: "/admin/adminManageBooking", text: "Manage Bookings", icon: <FaCalendarCheck /> },
      { to: "/admin/manage-slots", text: "Manage Facility Slots", icon: <FaCalendarCheck /> },
      { to: "/admin/facility-limits", text: "Manage Booking Limits", icon: <FaWallet /> },
      { to: "/admin/qr-code", text: "Manage QR Code", icon: <FaQrcode /> },
    ],
  },
  {
    group: "Content Management",
    links: [
      { to: "/admin/forms", text: "Manage Forms", icon: <FaWpforms /> },
      { to: "/admin/publications", text: "Manage Publications", icon: <FaBook /> },
      { to: "/admin/about", text: "Manage About Page", icon: <FaInfoCircle /> },
      { to: "/admin/hero", text: "Manage Home Page", icon: <FaHome /> },
      { to: "/admin/contact", text: "Manage Contact Page", icon: <FaEnvelope /> },
      { to: "/admin/footer", text: "Manage Footer", icon: <FaLink /> },
      { to: "/admin/adminUserPubs", text: "View Users' Uploaded Publications", icon: <FaUserEdit /> },
    ],
  },
];

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        // Redirect supervisors to their panel entry to avoid admin-only routes
        if (data.position === 'Supervisor') {
          navigate('/supervisor-verify');
        }
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
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-5xl mx-auto">
        <div className="p-10">
          <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-tight">Admin Dashboard</h1>
          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
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
              <p className="text-2xl font-semibold text-center text-gray-800 mb-10">
                Welcome, {userPosition}!
              </p>
              {userPosition === 'Supervisor' ? (
                <SupervisorLinks />
              ) : (
                <div className="space-y-12">
                  {userPosition === "Admin" && groupedAdminLinks.map((section, idx) => (
                    <div key={section.group}>
                      <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b pb-2">{section.group}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {section.links.filter(link => !link.adminOnly || userPosition === "Admin").map((link, i) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-200 rounded-xl shadow-md p-8 hover:bg-indigo-100 hover:shadow-xl transition-all duration-300 ease-in-out group text-center min-h-[140px]"
                          >
                            <span className="text-3xl mb-3 text-indigo-600 group-hover:text-indigo-800">{link.icon}</span>
                            <span className="text-lg font-semibold text-indigo-900 group-hover:text-indigo-700">{link.text}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  {userPosition !== "Admin" && <OperatorLinks />}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full mt-12 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Logout
              </button>
              <div className="mt-10 flex flex-col items-center justify-center">
                <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center gap-4 shadow-sm">
                  <span className="text-2xl text-blue-500"><FaInfoCircle /></span>
                  <div>
                    <div className="font-semibold text-blue-800 mb-1">Need Help?</div>
                    <div className="text-blue-700 text-sm">For technical issues or support related to the CRF website, please email <a href="mailto:sanyam22448@iiitd.ac.in" className="underline hover:text-blue-900">Sanyam Garg</a> at sanyam22448@iiitd.ac.in.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OperatorLinks = () => {
  const links = [
    { to: "/admin/booking", text: "Manage Bookings" },
    { to: "/admin/opchangepass", text: "Change Password" },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b pb-2">Operator Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {links.map((link, index) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-200 rounded-xl shadow-md p-8 hover:bg-indigo-100 hover:shadow-xl transition-all duration-300 ease-in-out group text-center min-h-[140px]"
          >
            <span className="text-3xl mb-3 text-indigo-600 group-hover:text-indigo-800">🔗</span>
            <span className="text-lg font-semibold text-indigo-900 group-hover:text-indigo-700">{link.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const SupervisorLinks = () => {
  const links = [
    { to: "/supervisor/bookings", text: "Manage Bookings", icon: <FaCalendarCheck /> },
    { to: "/supervisor-verify", text: "Verify Users", icon: <FaListUl /> },
    { to: "/supervisor/pending-superusers", text: "Pending Superuser Requests", icon: <FaUserShield /> },
    { to: "/supervisor/manage-superusers", text: "Manage Current Superusers", icon: <FaUserShield /> },
    { to: "/supervisor/profile", text: "My Profile & Wallet", icon: <FaUserTie /> },
    { to: "/supervisor/change-password", text: "Change Password", icon: <FaKey /> },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b pb-2">Supervisor Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-200 rounded-xl shadow-md p-8 hover:bg-indigo-100 hover:shadow-xl transition-all duration-300 ease-in-out group text-center min-h-[140px]"
          >
            <span className="text-3xl mb-3 text-indigo-600 group-hover:text-indigo-800">{link.icon}</span>
            <span className="text-lg font-semibold text-indigo-900 group-hover:text-indigo-700">{link.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

