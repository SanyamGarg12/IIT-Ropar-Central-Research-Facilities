import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Linkedin, Youtube } from 'lucide-react';
import { escapeHtml } from '../utils/security';
import { API_BASED_URL } from '../config.js';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerContent, setFooterContent] = useState({
    quickLinks: [],
    contactInfo: [],
    socialLinks: []
  });

  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const response = await fetch(`${API_BASED_URL}api/footer-content`);
        if (response.ok) {
          const data = await response.json();
          setFooterContent(data);
        }
      } catch (error) {
        console.error('Failed to load footer content:', error);
      }
    };

    loadFooterContent();
  }, []);

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      default: return Facebook;
    }
  };

  const getContactIcon = (type) => {
    switch (type) {
      case 'phone': return Phone;
      case 'email': return Mail;
      case 'address': return MapPin;
      default: return Mail;
    }
  };

  const enabledSocialLinks = footerContent.socialLinks
    .filter(social => social.enabled && social.href)
    .map(social => ({
      icon: getSocialIcon(social.platform),
      href: social.href,
      label: social.platform
    }));

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
              {footerContent.quickLinks.map((link, index) => (
                <li key={index}>
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
              {footerContent.contactInfo.map((item, index) => {
                const IconComponent = getContactIcon(item.type);
                return (
                  <li key={index} className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-400" />
                    <a 
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {escapeHtml(item.text)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {enabledSocialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
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

