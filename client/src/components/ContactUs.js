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
                <a href="mailto:info@iiitd.ac.in" className="hover:underline">info@iiitd.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Academic</div>
                <a href="mailto:admin-academic@iiitd.ac.in" className="hover:underline">admin-academic@iiitd.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Placement</div>
                <a href="mailto:admin-placement@iiitd.ac.in" className="hover:underline">admin-placement@iiitd.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Website</div>
                <a href="mailto:admin-web@iiitd.ac.in" className="hover:underline">admin-web@iiitd.ac.in</a>
              </div>
              <div>
                <div className="font-medium">Student Verification</div>
                <div className="space-y-2">
                  <div>For UG: <a href="mailto:admin-btech@iiitd.ac.in" className="hover:underline">admin-btech@iiitd.ac.in</a></div>
                  <div>For PG: <a href="mailto:admin-mtech@iiitd.ac.in" className="hover:underline">admin-mtech@iiitd.ac.in</a></div>
                  <div>For Ph.D.: <a href="mailto:admin-phd@iiitd.ac.in" className="hover:underline">admin-phd@iiitd.ac.in</a></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Directions Section */}
          <motion.div 
            variants={fadeInUp}
            className="bg-[#003B4C] rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Direction to Campus</h2>
            </div>
            <p className="mb-4">To reach the campus, coming from Nehru Place on outer ring road, follow these directions:</p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>After about half KM, turn Right from under the first flyover (it is oneway).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>After about 300 m, turn Left from under the Govind Puri Metro station (there is a IIITD sign at this turn).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>After about 300 m, there will be a 'Y' - take the left road of the 'Y'.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Follow signs for IIIT-D - the main gate is after about 500 m.</span>
              </li>
            </ul>
          </motion.div>
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
              <p>You can travel from New Delhi IGI Airport to any destination within the city via the following options. Delhi Airport has two main terminals, Terminal 3 is international and Terminal 1 is domestic.</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0">•</span>
                  <span>Pre-paid taxis: There are official "pre-paid taxi" counters inside the airport before you leave the Terminal building, where you can book and pre-pay for a taxi. The rates are fixed, so the taxi driver can not overcharge you. You should book a "Meru cab" - an AC Taxi. Follow the signs to find the pick-up point.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0">•</span>
                  <span>Uber/Ola: Uber works as expected in Delhi and Ola is another taxi aggregator service in India just like Uber. Both Uber and Ola offer airport transfers in a variety of sizes of cars. They can be booked the usual way, from your phone. If your phone is not connected to a data network, Uber/Ola can also be booked at counters inside both the Terminals and also near their pick up points in the parking lot. Follow signs carefully, Ola and Uber have specific designated pick up points.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0">•</span>
                  <span>Airport transfer arranged by your hotel: Your hotel may arrange airport transfers for you. Check directly with your hotel.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* From Railway Station Section */}
          <div className="bg-[#003B4C] rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Train className="h-6 w-6" />
              <h2 className="text-2xl font-bold">From Railway Station</h2>
            </div>
            <p>There are three long-distance train terminals where you can get down (if you are coming by train) to reach IIIT-Delhi. These are: New Delhi Railway Station, Old Delhi Railway Station and Nizamuddin Railway Station. The nearest railways station is Okhla Station, but not all the trains stop there. Even if you are coming by train you can always book Ola/Uber cabs to reach IIIT-Delhi from the respective terminal stations.</p>
          </div>
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.1452150291296!2d76.52410821558745!3d30.971846581540684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390feef5fc360c9b%3A0x8b50e17f40f3cd16!2sIIT%20Ropar!5e0!3m2!1sen!2sin!4v1701947546015!5m2!1sen!2sin"
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
                src="https://www.youtube.com/embed/videoseries?list=PLhHpVNxs_HqZHXHUc_y1_kLDJxRGVBbZH"
                title="IIITD Campus Tour"
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
                src="https://www.youtube.com/embed/zGJ5BlbKfLM"
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
      <Footer />
    </div>
  );
};

export default ContactUs;

