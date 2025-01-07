import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Forms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/api/forms');
        setForms(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch forms. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">IITRPR FORMS</h1>
        
        <div className="mb-12 rounded-lg overflow-hidden shadow-xl">
          <img
            src="/assets/forms.jpg"
            alt="IITRPR Forms"
            className="w-full object-cover h-64 sm:h-80 md:h-96"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Form Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Facility</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.form_name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{form.form_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{form.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{form.facility_name}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <a href={form.form_link} className="text-blue-600 hover:text-blue-800 transition-colors">
                        Form Link
                      </a>
                      <a href={form.facility_link} className="text-green-600 hover:text-green-800 transition-colors flex items-center">
                        Facility 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Forms;

