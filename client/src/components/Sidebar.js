import React from "react";
import { motion } from "framer-motion";
import { Clock, FileText, Calendar, User } from 'lucide-react';
import {API_BASED_URL} from '../config.js'; 

function Sidebar({ setActiveOption, activeOption, navItems }) {
  const getIcon = (item) => {
    switch (item) {
      case "User Profile":
        return <User className="h-5 w-5" />;
      case "Booking History":
        return <Clock className="h-5 w-5" />;
      case "Publications":
        return <FileText className="h-5 w-5" />;
      case "Booking Facility":
        return <Calendar className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-gray-800 text-white w-64 flex-shrink-0"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4">
        <motion.h2 
          className="text-2xl font-semibold"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Dashboard
        </motion.h2>
      </div>
      <nav className="mt-5">
        {navItems.map((item, index) => (
          <motion.a
            key={item}
            href="#"
            className={`flex items-center px-4 py-2 mt-2 text-sm ${
              activeOption === item
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
            onClick={() => setActiveOption(item)}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {getIcon(item)}
            <span className="ml-3">{item}</span>
          </motion.a>
        ))}
      </nav>
    </motion.div>
  );
}

export default Sidebar;

