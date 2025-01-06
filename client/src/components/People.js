import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './People.css';
import Footer from './Footer';

const People = () => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get('http://localhost:5000/api/members')
      .then((response) => {
        console.log('Fetched members:', response.data);
        setMembers(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching members:', error);
        setError('Failed to fetch members. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const chairman = members.find(
    (member) => member.designation.toLowerCase() === 'chairman'
  );
  const viceChairman = members.find(
    (member) => member.designation.toLowerCase() === 'vice chairman'
  );
  const others = members.filter(
    (member) =>
      member.designation.toLowerCase() !== 'chairman' &&
      member.designation.toLowerCase() !== 'vice chairman'
  );

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

  const PersonCard = ({ member, isChairman = false }) => (
    <motion.div
      className="person-card"
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="person-image">
        {member.image_path ? (
          <motion.img
            src={getImageUrl(member.image_path)}
            alt={member.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="placeholder">No Image Available</div>
        )}
      </div>
      <motion.div
        className="person-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3>{member.name}</h3>
        <p>{member.designation}</p>
        {member.profile_link && (
          <motion.a
            href={member.profile_link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            View Profile
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      className="people-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Core Committee Members
      </motion.h1>
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="loading"
        >
          <div className="spinner"></div>
          <p>Loading members...</p>
        </motion.div>
      ) : error ? (
        <motion.p
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      ) : (
        <motion.div className="hierarchy" variants={containerVariants}>
          {chairman && (
            <motion.div className="chairman" variants={itemVariants}>
              <h2>Chairman</h2>
              <PersonCard member={chairman} isChairman={true} />
            </motion.div>
          )}

          {viceChairman && (
            <motion.div className="vice-chairman" variants={itemVariants}>
              <h2>Vice Chairman</h2>
              <PersonCard member={viceChairman} />
            </motion.div>
          )}

          {others.length > 0 && (
            <motion.div className="other-members" variants={itemVariants}>
              <h2>Other Members</h2>
              <motion.div className="people-list" variants={containerVariants}>
                {others.map((member) => (
                  <PersonCard key={member.id} member={member} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}

      <Footer />
    </motion.div>
  );
};

export default People;

