import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from './Footer';
import { Mail, MapPin, Plane, Train } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 
import { useNavigate } from 'react-router-dom';
import './ContactUs.css';
import { sanitizeInput, validateEmail, validatePhone } from '../utils/security';

const ContactUs = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    query: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate email
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Validate phone number if provided
    if (formData.contactNumber && !validatePhone(formData.contactNumber)) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASED_URL}api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Thank you for your feedback! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          contactNumber: '',
          query: ''
        });
      } else {
        setErrorMessage(data.message || 'Failed to send feedback. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax Effect */}
      <motion.div 
        className="relative h-[60vh] w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('/assets/IITRPR.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold text-white tracking-tight drop-shadow-lg">
              Contact Us
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {/* Email Addresses and Directions Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Email Addresses Section */}
          <motion.div 
            variants={fadeInUp}
            className="bg-[#F0B400] rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Email Addresses</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium">General Information</div>
                <a href="mailto:info@iitrpr.ac.in" className="hover:underline">info@iitrpr.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Academic</div>
                <a href="mailto:academics@iitrpr.ac.in" className="hover:underline">academics@iitrpr.ac.in</a>
                <div className="text-sm mt-1">
                  UG: <a href="mailto:deanug@iitrpr.ac.in" className="hover:underline">deanug@iitrpr.ac.in</a> &nbsp;|&nbsp; PG: <a href="mailto:deanpg@iitrpr.ac.in" className="hover:underline">deanpg@iitrpr.ac.in</a>
                </div>
              </div>
              <div>
                <div className="font-medium">Placement</div>
                <a href="mailto:info@iitrpr.ac.in" className="hover:underline">info@iitrpr.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Website</div>
                <a href="mailto:info@iitrpr.ac.in" className="hover:underline">info@iitrpr.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Student Verification</div>
                <div className="space-y-2">
                  <div>For UG: <a href="mailto:ugsection1@iitrpr.ac.in" className="hover:underline">ugsection1@iitrpr.ac.in</a></div>
                  <div>For PG: <a href="mailto:office-academics-pg3@iitrpr.ac.in" className="hover:underline">office-academics-pg3@iitrpr.ac.in</a></div>
                  <div>For Ph.D.: <a href="mailto:office-academics-pg1@iitrpr.ac.in" className="hover:underline">office-academics-pg1@iitrpr.ac.in</a></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transportation Sections */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* From Airport Section */}
            <div className="bg-[#003B4C] rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="h-6 w-6" />
                <h2 className="text-2xl font-bold">From Airport</h2>
              </div>
              <div className="space-y-4">
              <span className="font-semibold">From Chandigarh International Airport</span>
                  <ul className="list-disc ml-6 mt-2 space-y-2">
                    <li>By Taxi/Car: Hire a taxi from the airport directly to IIT Ropar (approx. 60 km, 1.5 hours).</li>
                    <li>By Bus: Take a taxi/auto to ISBT Sector 43, Chandigarh. From there, take a bus to Rupnagar (Ropar) Bus Stand. From the bus stand, hire an auto-rickshaw or take a local bus to IIT Ropar main campus (approx. 6-7 km).</li>
                    <li>By Train: Take a taxi/auto to Chandigarh Railway Station, then board a train to Rupnagar Railway Station (if available). From there, follow the directions below.</li>
                  </ul>
              </div>
            </div>

            {/* From Railway Station Section */}
            <div className="bg-[#003B4C] rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Train className="h-6 w-6" />
                <h2 className="text-2xl font-bold">From Railway Station</h2>
              </div>
              <span className="font-semibold">From Rupnagar (Ropar) Railway Station (Closest Railway Station):</span>
                  <ul className="list-disc ml-6 mt-2 space-y-2">
                    <li>By Auto-Rickshaw: The main campus is about 6-7 km from the station. Auto-rickshaws are available outside and will take you directly to IIT Ropar main campus (approx. ₹150).</li>
                    <li>By Bus: Local and institute buses are available from the bus stand (adjacent to the railway station) to IIT Ropar main campus. Check the institute bus schedule for timings.</li>
                  </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Map and Campus Details Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Map */}
          <motion.div 
            className="h-[500px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={fadeInUp}
          >
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3440.0112643685266!2d76.4707301!3d30.9686169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905542fe45e58f7%3A0x5d16c2617cfdbdb8!2sIndian%20Institute%20Of%20Technology%E2%80%93Ropar%20(IIT%E2%80%93Ropar)!5e0!3m2!1sen!2sin!4v1719316312345!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="hover:opacity-95 transition-opacity duration-300"
            ></iframe>
          </motion.div>

          {/* Campus Details */}
          <motion.div 
            className="space-y-6"
            variants={fadeInUp}
          >
            {/* Address Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-[#002145] mb-4">Campus Address</h3>
              <p className="text-gray-600 leading-relaxed">
                Indian Institute of Technology Ropar<br />
                Rupnagar, Punjab - 140001<br />
                India
              </p>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-[#002145] mb-4">Contact Details</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Phone:</strong> +91-12345-67890</p>
                <p><strong>Fax:</strong> +91-12345-67891</p>
                <p><strong>Emergency Contact:</strong> +91-12345-67892</p>
              </div>
            </div>

            {/* Gates Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-[#002145] mb-4">Campus Gates</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[#002145]">Main Gate (Gate 1)</h4>
                  <p className="text-gray-600">24/7 access for vehicles and pedestrians</p>
                </div>
                <div>
                  <h4 className="font-medium text-[#002145]">Gate 2 (Residential Area)</h4>
                  <p className="text-gray-600">Open 6 AM to 10 PM for residents</p>
                </div>
                <div>
                  <h4 className="font-medium text-[#002145]">Gate 3 (Service Gate)</h4>
                  <p className="text-gray-600">Restricted access for service vehicles</p>
                </div>
              </div>
            </div>

            {/* Visiting Hours Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-[#002145] mb-4">Visiting Hours</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Administrative Office:</strong> Monday to Friday, 9 AM to 5 PM</p>
                <p><strong>Academic Block:</strong> Monday to Friday, 8 AM to 6 PM</p>
                <p><strong>Library:</strong> All days, 9 AM to 11 PM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tour Videos Section */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-medium text-gray-900 flex items-center">
            <div className="w-1 h-8 bg-[#00B6BD] mr-3"></div>
            Virtual Tours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <iframe
                src="https://www.youtube.com/embed/Tis7EuowoHo"
                title="IIT Ropar Campus Tour"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </motion.div>
            <motion.div 
              className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <iframe
                src="https://www.youtube.com/embed/grdSwnN4mqg"
                title="IIITD Campus Tour - Hostel"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        </motion.div>

        <div className="contact-container">
          <h2>Contact Us</h2>
          <p className="contact-intro">
            We value your feedback! Please fill out the form below to share your thoughts about our website or facilities.
          </p>
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number:</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="query">Your Feedback:</label>
              <textarea
                id="query"
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Please share your thoughts about our website or facilities..."
              />
            </div>

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-12 mb-4">
        <span className="text-gray-600 text-sm">
          Managed by{' '}
          <a
            href="mailto:sanyam22448@iiitd.ac.in"
            className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sanyam Garg
          </a>
        </span>
        <a
          href="https://github.com/SanyamGarg12"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center text-gray-600 hover:text-black transition"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 012.92-.39c.99.01 1.99.13 2.92.39 2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
          </svg>
          <span className="underline font-medium">My GitHub</span>
        </a>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;

