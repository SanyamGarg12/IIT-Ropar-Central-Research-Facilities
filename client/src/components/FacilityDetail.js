import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrinterIcon as Printer3d, Info, Settings, User, Mail, Phone, ExternalLink, Facebook, Twitter, Instagram, BookOpen } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${API_BASED_URL}uploads/${imagePath}`;
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Card = ({ children, className }) => (
  <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-800">
    {children}
  </h3>
);

const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// New component for displaying specifications
const SpecificationsDisplay = ({ specifications }) => {
  if (!specifications) return <p>No specifications available</p>;
  
  // Helper function to determine if text is a heading
  const isHeading = (text) => {
    const headingPatterns = [
      /^[A-Z][a-zA-Z\s]+:$/,                // Words ending with colon
      /^[A-Z][a-zA-Z\s]+\s{2,}$/,           // Words ending with multiple spaces
      /^[A-Z][A-Z\s]+$/,                    // ALL CAPS text
      /^\s*[A-Z][a-zA-Z\s]+(system|detector|voltage|current|lens|stage|movement|holders|exchange|functions|modes|LCD|gun|chamber|pressure)s?\s*$/i // Common spec headings
    ];
    return headingPatterns.some(pattern => pattern.test(text));
  };
  
  // Parse specifications into structured format
  const parseSpecifications = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const parsedSpecs = [];
    let currentHeading = null;
    let currentItems = [];
    
    lines.forEach(line => {
      if (isHeading(line)) {
        // If we have a previous heading with items, add it to the result
        if (currentHeading) {
          parsedSpecs.push({ heading: currentHeading, items: currentItems });
          currentItems = [];
        }
        currentHeading = line.trim().replace(/\s+$/, '').replace(/:$/, '');
      } else {
        // Add the line as an item under the current heading
        currentItems.push(line);
      }
    });
    
    // Add the last heading and its items
    if (currentHeading && currentItems.length > 0) {
      parsedSpecs.push({ heading: currentHeading, items: currentItems });
    }
    
    // If no structure was detected, return the original text in a single section
    if (parsedSpecs.length === 0 && lines.length > 0) {
      parsedSpecs.push({ heading: 'Specifications', items: lines });
    }
    
    return parsedSpecs;
  };
  
  const specSections = parseSpecifications(specifications);
  
  return (
    <div className="specifications-container space-y-4">
      {specSections.map((section, index) => (
        <div key={index} className="spec-section">
          <h4 className="text-md font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">
            {section.heading}
          </h4>
          <ul className="pl-4">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-600 mb-1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default function FacilityDetail() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await fetch(`${API_BASED_URL}api/facility/${id}`);
        const data = await response.json();
        console.log(data);
        if (data) {
          setFacility(data);
        } else {
          alert('Facility not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching facility details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-semibold text-gray-600">No facility data available.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.header className="mb-12 text-center" {...fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{facility.name}</h1>
          <p className="text-xl text-gray-600">{facility.category_name}</p>
        </motion.header>

        {/* Special Note Section - Added at the top */}
        {facility.special_note && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-red-800 mb-1">Important Notice</h3>
                  <p className="text-red-700">{facility.special_note}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className="grid md:grid-cols-2 gap-8 mb-12" {...fadeInUp}>
          <motion.img
            src={getImageUrl(facility.image_url)}
            alt={facility.name}
            className="w-full h-80 object-cover rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Printer3d className="text-blue-600 w-6 h-6" />
                <span className="font-semibold">Model:</span> {facility.model}
              </motion.div>
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Info className="text-blue-600 w-6 h-6" />
                <span className="font-semibold">Make Year:</span> {facility.make_year}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specifications Section */}
        <motion.div className="mb-12" {...fadeInUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="text-blue-600 w-6 h-6" />
                <CardTitle>Specifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <SpecificationsDisplay specifications={facility.specifications} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-8 mb-12" {...fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{facility.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{facility.usage_details}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-8 mb-12" {...fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Faculty In-Charge</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <User className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.faculty_in_charge}</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Mail className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.faculty_email}</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Phone className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.faculty_contact}</span>
              </motion.div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Operator Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <User className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.operator_name}</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Phone className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.operator_contact}</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Mail className="text-blue-600 w-6 h-6" />
                <span className="text-gray-700">{facility.operator_email}</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Publications Section */}
        {facility.publications && facility.publications.length > 0 && (
          <motion.div className="mb-12" {...fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-blue-600 w-6 h-6" />
                  <CardTitle>Publications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facility.publications.map((publication, index) => (
                    <a
                      key={index}
                      href={publication.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <h4 className="font-medium text-blue-600 hover:text-blue-700">
                        {publication.title}
                      </h4>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/facilities')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Facilities
          </button>
        </motion.div>
      </div>

      <motion.footer
        className="bg-gray-800 text-white py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-gray-300 transition-colors duration-200">Home</a></li>
                <li><a href="/about" className="hover:text-gray-300 transition-colors duration-200">About</a></li>
                <li><a href="/contact-us" className="hover:text-gray-300 transition-colors duration-200">Contact Us</a></li>
                <li><a href="/publications" className="hover:text-gray-300 transition-colors duration-200">Publications</a></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p>Email: info@iiitd.ac.in</p>
              <p>Phone: +91-12345-67890</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-400 transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}

