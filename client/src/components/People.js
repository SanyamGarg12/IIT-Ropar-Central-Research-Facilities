import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaBuilding, FaGraduationCap } from 'react-icons/fa';
import Footer from './Footer';
import {API_BASED_URL} from '../config.js'; 

const People = () => {
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    // console.log("Fetching on people.js");
    setIsLoading(true);
    Promise.all([
      axios.get(`${API_BASED_URL}api/members`),
      axios.get(`${API_BASED_URL}api/staff`)
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

  const handleImageError = (id, imageUrl) => {
    console.log(imageUrl);
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

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

  // Define the hierarchy order for staff members
  const staffHierarchy = [
    'consultant',
    'senior technical officer',
    'technical officer',
    'technical superintendent',
    'junior technical superintendent',
    'senior lab assistant',
    'junior lab assistant',
    'operator'
  ];

  // Group staff members by their designation hierarchy
  const groupStaffByHierarchy = (staffList) => {
    const grouped = {};
    
    // Initialize all hierarchy levels
    staffHierarchy.forEach(level => {
      grouped[level] = [];
    });

    // Group staff members by their designation
    staffList.forEach(member => {
      const designation = member.designation.toLowerCase();
      console.log('Processing designation:', designation);
      
      // More specific matching logic to avoid false positives
      if (designation.includes('consultant')) {
        grouped['consultant'].push(member);
        console.log('Added to consultant:', member.name);
      } else if (designation.includes('junior technical supritendent') || designation.includes('junior technical superintendent')) {
        grouped['junior technical superintendent'].push(member);
        console.log('Added to junior technical superintendent:', member.name);
      } else if (designation.includes('senior technical officer')) {
        grouped['senior technical officer'].push(member);
        console.log('Added to senior technical officer:', member.name);
      } else if (designation.includes('technical officer')) {
        grouped['technical officer'].push(member);
        console.log('Added to technical officer:', member.name);
      } else if (designation.includes('technical supritendent') || designation.includes('technical superintendent')) {
        grouped['technical superintendent'].push(member);
        console.log('Added to technical superintendent:', member.name);
      } else if (designation.includes('senior lab assistant')) {
        grouped['senior lab assistant'].push(member);
        console.log('Added to senior lab assistant:', member.name);
      } else if (designation.includes('junior lab assistant')) {
        grouped['junior lab assistant'].push(member);
        console.log('Added to junior lab assistant:', member.name);
      } else if (designation.includes('operator')) {
        grouped['operator'].push(member);
        console.log('Added to operator:', member.name);
      } else {
        // Default to operator if no match found
        grouped['operator'].push(member);
        console.log('Defaulted to operator:', member.name, 'with designation:', designation);
      }
    });

    return grouped;
  };

  const groupedStaff = groupStaffByHierarchy(staff);

  const getImageUrl = (imagePath) => {
    // return null;
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\/+/, '');
    // console.log(imagePath);
    return `${API_BASED_URL}uploads/${cleanPath}`;
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
      className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border border-gray-100 ${
        isStaff ? 'staff-card' : ''
      }`}
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-40 h-40 mx-auto mt-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-blue-50">
        {(isStaff ? person.image_name : person.image_path) ? (
          <motion.img
            src={getImageUrl(isStaff ? person.image_name : person.image_path)}
            alt={person.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onError={() => handleImageError((person.id),getImageUrl(isStaff ? person.image_name : person.image_path))}
          />
        ) : (
          <div className="text-4xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 w-full h-full flex items-center justify-center">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        {imageErrors[person.id] && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Failed to load</span>
          </div>
        )}
      </div>
      <motion.div
        className="p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{person.name}</h3>
        <p className="text-base text-blue-600 font-medium mb-6">{person.designation}</p>
        {isStaff && (
          <div className="space-y-3 text-sm text-left bg-gray-50 p-4 rounded-lg">
            <p className="flex items-center text-gray-700">
              <FaPhone className="mr-3 text-blue-500" /> {person.phone || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaEnvelope className="mr-3 text-blue-500" /> {person.email || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaBuilding className="mr-3 text-blue-500" /> {person.office_address || 'Unavailable'}
            </p>
            <p className="flex items-center text-gray-700">
              <FaGraduationCap className="mr-3 text-blue-500" /> {person.qualification || 'Unavailable'}
            </p>
          </div>
        )}
        {person.profile_link && (
          <motion.a
            href={person.profile_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
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
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          className="text-5xl font-light text-center text-gray-800 mb-16"
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
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading data...</p>
          </motion.div>
        ) : error ? (
          <motion.p
            className="text-center text-red-500 text-xl bg-red-50 p-4 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        ) : (
          <>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" variants={containerVariants}>
              {chairman && (
                <motion.div variants={itemVariants} className="col-span-full">
                  <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">Chairman</h2>
                  <PersonCard person={chairman} />
                </motion.div>
              )}

              {viceChairman && (
                <motion.div variants={itemVariants} className="col-span-full md:col-span-1 lg:col-span-3">
                  <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">Vice Chairman</h2>
                  <PersonCard person={viceChairman} />
                </motion.div>
              )}

              {otherMembers.length > 0 && (
                <motion.div variants={itemVariants} className="col-span-full">
                  <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">Other Members</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {otherMembers.map((member) => (
                      <PersonCard key={member.id} person={member} />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.h1
              className="text-5xl font-light text-center text-gray-800 my-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Staff Members
            </motion.h1>
            
            <motion.div className="space-y-16" variants={containerVariants}>
              {staffHierarchy.map((hierarchyLevel) => {
                const staffInLevel = groupedStaff[hierarchyLevel];
                if (staffInLevel.length === 0) return null;

                                 return (
                   <motion.div key={hierarchyLevel} variants={itemVariants}>
                     <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8 capitalize">
                       {hierarchyLevel === 'operator' ? 'Instrument InCharge' : hierarchyLevel.replace(/([A-Z])/g, ' $1').trim()}
                     </h2>
                     <div className={`grid gap-12 ${
                       staffInLevel.length === 1 
                         ? 'grid-cols-1 justify-items-center' 
                         : staffInLevel.length === 2 
                         ? 'grid-cols-1 md:grid-cols-2 justify-items-center' 
                         : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                     }`}>
                       {staffInLevel.map((staffMember) => (
                         <PersonCard key={staffMember.id} person={staffMember} isStaff={true} />
                       ))}
                     </div>
                   </motion.div>
                 );
              })}
            </motion.div>
          </>
        )}
      </div>
      <div className="mt-24">
        <Footer />
      </div>
    </motion.div>
  );
};

export default People;

