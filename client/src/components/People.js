import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaBuilding, FaGraduationCap } from 'react-icons/fa';
import Footer from './Footer';
import {API_BASED_URL} from '../App.js'; 

const People = () => {
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      axios.get('http://localhost:5000/api/members'),
      axios.get('http://localhost:5000/api/staff')
    ])
      .then(([membersResponse, staffResponse]) => {
        setMembers(membersResponse.data);
        setStaff(staffResponse.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const chairman = members.find(
    (member) => member.designation.toLowerCase() === 'chairman'
  );
  const viceChairman = members.find(
    (member) => member.designation.toLowerCase() === 'vice chairman'
  );
  const otherMembers = members.filter(
    (member) =>
      member.designation.toLowerCase() !== 'chairman' &&
      member.designation.toLowerCase() !== 'vice chairman'
  );

  const staffOrder = [
    'technical officer',
    'technical superintendent',
    'junior technical superintendent',
    'operator'
  ];

  const sortedStaff = staff.sort((a, b) => {
    const aIndex = staffOrder.indexOf(a.designation.toLowerCase());
    const bIndex = staffOrder.indexOf(b.designation.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

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

  const PersonCard = ({ person, isStaff = false }) => (
    <motion.div
      className={`bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg ${
        isStaff ? 'staff-card' : ''
      }`}
      variants={itemVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-32 h-32 mx-auto mt-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {(isStaff ? person.image_name : person.image_path) ? (
          <motion.img
            src={getImageUrl(isStaff ? person.image_name : person.image_path)}
            alt={person.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="text-4xl font-bold text-white bg-blue-500 w-full h-full flex items-center justify-center">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
      <motion.div
        className="p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{person.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{person.designation}</p>
        {isStaff && (
          <div className="space-y-2 text-sm text-left">
            <p className="flex items-center text-gray-700">
              <FaPhone className="mr-2 text-blue-500" /> {person.phone || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaEnvelope className="mr-2 text-blue-500" /> {person.email || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaBuilding className="mr-2 text-blue-500" /> {person.office_address || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaGraduationCap className="mr-2 text-blue-500" /> {person.qualification || 'Unavailable'}
            </p>
          </div>
        )}
        {person.profile_link && (
          <motion.a
            href={person.profile_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-md text-sm transition-colors duration-300 hover:bg-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Profile
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-4xl font-light text-center text-gray-800 mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Core Committee Members
      </motion.h1>
      {isLoading ? (
        <motion.div
          className="flex flex-col items-center justify-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </motion.div>
      ) : error ? (
        <motion.p
          className="text-center text-red-500 text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      ) : (
        <>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants}>
            {chairman && (
              <motion.div variants={itemVariants} className="col-span-full">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Chairman</h2>
                <PersonCard person={chairman} />
              </motion.div>
            )}

            {viceChairman && (
              <motion.div variants={itemVariants} className="col-span-full md:col-span-1 lg:col-span-3">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Vice Chairman</h2>
                <PersonCard person={viceChairman} />
              </motion.div>
            )}

            {otherMembers.length > 0 && (
              <motion.div variants={itemVariants} className="col-span-full">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Other Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherMembers.map((member) => (
                    <PersonCard key={member.id} person={member} />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.h1
            className="text-4xl font-light text-center text-gray-800 my-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Staff Members
          </motion.h1>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants}>
            {sortedStaff.map((staffMember) => (
              <motion.div key={staffMember.id} variants={itemVariants} className="col-span-1">
                <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">{staffMember.designation}</h2>
                <PersonCard person={staffMember} isStaff={true} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      <Footer />
    </motion.div>
  );
};

export default People;

