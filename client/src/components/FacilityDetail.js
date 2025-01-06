import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrinterIcon as Printer3d, Info, Settings, User, Mail, Phone, ExternalLink, Facebook, Twitter, Instagram } from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `http://localhost:5000/uploads/${imagePath}`;
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

export default function FacilityDetail() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/facility/${id}`);
        const data = await response.json();

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
              <motion.div className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Settings className="text-blue-600 w-6 h-6" />
                <span className="font-semibold">Specifications:</span> {facility.specifications}
              </motion.div>
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

        {facility.publications && facility.publications.length > 0 && (
          <motion.div {...fadeInUp}>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {facility.publications.map((publication, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <ExternalLink className="w-5 h-5 mr-3 text-blue-600" />
                      <a
                        href={publication.publication_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {publication.publication_title}
                      </a>
                    </motion.li>
                  ))}
                </ul>
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

