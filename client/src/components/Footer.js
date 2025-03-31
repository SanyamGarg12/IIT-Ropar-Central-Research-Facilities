import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import {API_BASED_URL} from '../App.js'; 

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div className="footer-links" variants={itemVariants}>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <a href="/" className="hover:text-gray-300 transition-colors duration-300">Home</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <a href="/about" className="hover:text-gray-300 transition-colors duration-300">About</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <a href="/contact-us" className="hover:text-gray-300 transition-colors duration-300">Contact Us</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <a href="/publications" className="hover:text-gray-300 transition-colors duration-300">Publications</a>
              </motion.li>
            </ul>
          </motion.div>
          <motion.div className="footer-contact" variants={itemVariants}>
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
            <p className="mb-2">Email: info@iitrpr.ac.in</p>
            <p>Phone: +91-12345-67890</p>
          </motion.div>
          <motion.div className="footer-social" variants={itemVariants}>
            <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook size={24} />
                <span className="sr-only">Facebook</span>
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={24} />
                <span className="sr-only">Twitter</span>
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-400 transition-colors duration-300"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={24} />
                <span className="sr-only">Instagram</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="mt-8 pt-8 border-t border-gray-700 text-center text-sm"
          variants={itemVariants}
        >
          <p>&copy; {new Date().getFullYear()} IIT Ropar. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;

