import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrinterIcon as Printer3d, Info, Settings, User, Mail, Phone, ExternalLink, Facebook, Twitter, Instagram, BookOpen } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 
import Footer from './Footer';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
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

// Component for displaying specifications with HTML support
const SpecificationsDisplay = ({ specifications }) => {
  if (!specifications) return <p>No specifications available</p>;
  
  return (
    <div 
      className="specifications-container text-gray-700 leading-relaxed rich-text-content"
      dangerouslySetInnerHTML={{ __html: specifications }}
    />
  );
};

export default function FacilityDetail() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
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
          <div className="relative w-full h-80">
            {facility.image_url ? (
              <motion.img
                src={getImageUrl(facility.image_url)}
                alt={facility.name}
                className="w-full h-full object-cover rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Failed to load image</span>
              </div>
            )}
          </div>
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
                <span className="font-semibold">Manufacturer:</span> {facility.manufacturer}
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
              <div 
                className="text-gray-700 leading-relaxed rich-text-content"
                dangerouslySetInnerHTML={{ __html: facility.description || '' }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-gray-700 leading-relaxed rich-text-content"
                dangerouslySetInnerHTML={{ __html: facility.usage_details || '' }}
              />
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

      <Footer />
    </motion.div>
  );
}

