import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from './Footer';
import {API_BASED_URL} from '../config.js'; 
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function About() {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASED_URL}api/aboutContent`)
      .then((response) => {
        setAboutContent(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching about content:', error);
        setError('Failed to load about content');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-2xl font-semibold">Loading...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-screen text-2xl font-semibold text-red-600">{error}</div>;
  }
  
  if (!aboutContent) {
    return <div className="flex justify-center items-center h-screen text-2xl font-semibold">No content available</div>;
  }

  return (
    <section className="about bg-gray-100">
      <div className="container mx-auto px-4 py-12">

        {/* Department Introduction */}
        <section className="mb-16">
          <h3 className="text-3xl font-semibold mb-8 text-gray-800">{aboutContent.departmentIntro.title}</h3>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <p className="text-lg text-gray-700 leading-relaxed">{aboutContent.departmentIntro.content}</p>
            </div>
            <div className="md:w-1/2 relative">
              {aboutContent.departmentIntro.image ? (
                <img 
                  src={getImageUrl(aboutContent.departmentIntro.image)} 
                  alt="Department Building" 
                  className="rounded-lg shadow-lg object-cover h-64 md:h-auto w-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="bg-gray-200 rounded-lg shadow-lg h-64 md:h-auto w-full flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Failed to load image</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Objectives of the Lab */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-3xl font-semibold mb-8 text-gray-800">{aboutContent.labObjectives.title}</h3>
          <ul className="list-disc list-inside space-y-4">
            {aboutContent.labObjectives.items.map((item, index) => (
              <li key={index} className="text-lg text-gray-700">{item}</li>
            ))}
          </ul>
        </section>

        {/* Vision and Mission */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Vision</h3>
            <p className="text-lg text-gray-700 leading-relaxed">{aboutContent.visionMission.vision}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Mission</h3>
            <p className="text-lg text-gray-700 leading-relaxed">{aboutContent.visionMission.mission}</p>
          </div>
        </section>
      </div>

      <Footer />
    </section>
  );
}

export default About;

