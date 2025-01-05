import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import Footer from './Footer';

const Facilities = () => {
  const [facilitiesByCategory, setFacilitiesByCategory] = useState({});
  const [error, setError] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/facilities')
      .then((response) => {
        const facilities = response.data;
        const groupedFacilities = facilities.reduce((grouped, facility) => {
          const categoryName = facility.category_name;
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          grouped[categoryName].push(facility);
          return grouped;
        }, {});
        setFacilitiesByCategory(groupedFacilities);
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching facilities.');
      });
  }, []);

  const toggleCategory = (categoryName) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="container mx-auto px-4 py-10 mt-10">
      <img
        src="/assets/sample.jpeg"
        alt="Facilities Header"
        className="w-full h-64 object-cover rounded-lg mb-8"
      />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Facilities</h2>
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </p>
      )}
      {Object.keys(facilitiesByCategory).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(facilitiesByCategory).map(([categoryName, facilities]) => (
            <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out"
                onClick={() => toggleCategory(categoryName)}
              >
                <h3 className="text-xl font-semibold text-gray-700">{categoryName}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                    openCategory === categoryName ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openCategory === categoryName && (
                <div className="p-4 bg-white">
                  <p className="text-gray-600 mb-4">{facilities[0].category_description}</p>
                  <ul className="space-y-2">
                    {facilities.map((facility) => (
                      <li key={facility.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                        <Link
                          to={`/facility/${facility.id}`}
                          className="block p-4 hover:bg-gray-50 transition duration-150 ease-in-out"
                        >
                          <h4 className="text-lg font-medium text-gray-800 mb-2">{facility.name}</h4>
                          <p className="text-gray-600 text-sm">{facility.description}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No facilities available.</p>
      )}

      <Footer />
    </div>
  );
};

export default Facilities;
