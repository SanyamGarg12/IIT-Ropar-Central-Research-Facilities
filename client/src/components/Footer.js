import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { escapeHtml } from '../utils/security';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/iitropar', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/iitropar', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/iitropar', label: 'Instagram' }
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Bookings', path: '/login' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact-us' }
  ];

  const contactInfo = [
    { icon: Phone, text: '+91 1234567890', href: 'tel:+911234567890' },
    { icon: Mail, text: 'info@iitrpr.ac.in', href: 'mailto:info@iitrpr.ac.in' },
    { icon: MapPin, text: 'Rupnagar, Punjab 140001', href: 'https://maps.google.com/?q=IIT+Ropar' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About IIT Ropar</h3>
            <p className="text-gray-400">
              {escapeHtml('Indian Institute of Technology Ropar is one of the eight new IITs established by the Ministry of Human Resource Development (MHRD), Government of India, to expand the reach and enhance the quality of technical education in the country.')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {escapeHtml(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <a 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {escapeHtml(item.text)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={`Follow us on ${social.label}`}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            © {currentYear} {escapeHtml('Indian Institute of Technology Ropar')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

