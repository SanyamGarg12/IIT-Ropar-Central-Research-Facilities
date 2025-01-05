import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="footer-links">
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-gray-300 transition-colors duration-300">Home</a></li>
              <li><a href="/about" className="hover:text-gray-300 transition-colors duration-300">About</a></li>
              <li><a href="/contact-us" className="hover:text-gray-300 transition-colors duration-300">Contact Us</a></li>
              <li><a href="/publications" className="hover:text-gray-300 transition-colors duration-300">Publications</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
            <p className="mb-2">Email: info@iitrpr.ac.in</p>
            <p>Phone: +91-12345-67890</p>
          </div>
          <div className="footer-social">
            <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-300">
                <Facebook size={24} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-300">
                <Twitter size={24} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors duration-300">
                <Instagram size={24} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} IIT Ropar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

