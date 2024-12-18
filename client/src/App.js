import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Hero from "./components/Hero";
import About from "./components/About";
import People from "./components/People";
import Facilities from "./components/Facilities";
import Booking from "./components/Booking";
import Forms from "./components/Forms";
import Publications from "./components/Publications";
import ContactUs from "./components/ContactUs";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Main Navbar */}
        <nav className="navbar">
          <div className="navbar-logo">
            <img src="/assets/logo.jpg" alt="College Logo" className="navbar-logo-img" />
            <h1> IIT Ropar Central Research Facility</h1>
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

        {/* Routes for each page */}
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/people" element={<People />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
   
  );
};

export default App;
