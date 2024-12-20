// facilities.js

import React, { useState } from 'react';
import './Facilities.css';

const facilitiesData = [
    {
        category: "Structural Techniques",
        facilities: [
            { name: "ISGXRD", description: "In-Situ Grazing X-Ray Diffraction", image: "/assets/sample.jpeg" },
            { name: "PXRD", description: "Powder X-Ray Diffraction", image: "/assets/sample.jpeg" }
        ]
    },
    {
        category: "Microscopic Techniques",
        facilities: [
            { name: "SEM", description: "Scanning Electron Microscope", image: "/assets/sample.jpeg" },
            { name: "FESEM", description: "Field Emission Scanning Electron Microscope", image: "/assets/sample.jpeg" },
            { name: "TEM 120", description: "Transmission Electron Microscope 120kV", image: "/assets/sample.jpeg" },
            { name: "TEM 300", description: "Transmission Electron Microscope 300kV", image: "/assets/sample.jpeg" },
            { name: "SPM", description: "Scanning Probe Microscope", image: "/assets/sample.jpeg" },
            { name: "LSCM", description: "Laser Scanning Confocal Microscope", image: "/assets/sample.jpeg" }
        ]
    },
    {
        category: "Spectroscopic Techniques",
        facilities: [
            { name: "XPS", description: "X-Ray Photoelectron Spectroscopy", image: "/assets/sample.jpeg" }
        ]
    },
    {
        category: "Miscellaneous",
        facilities: [
            { name: "HRMS", description: "High Resolution Mass Spectrometry", image: "/assets/sample.jpeg" },
            { name: "NMR 400", description: "Nuclear Magnetic Resonance Spectroscopy 400 MHz", image: "/assets/sample.jpeg" },
            { name: "NMR 600", description: "Nuclear Magnetic Resonance Spectroscopy 600 MHz", image: "/assets/sample.jpeg" },
            { name: "UV VIS", description: "Ultraviolet-Visible Spectroscopy", image: "/assets/sample.jpeg" },
            { name: "Raman", description: "Raman Spectroscopy", image: "/assets/raman.jpg" },
            { name: "Nano Indenter", description: "Nano Indentation Tester", image: "/assets/sample.jpeg" },
            { name: "3-D Printer", description: "Three-Dimensional Printer", image: "/assets/" }
        ]
    }
];
const Facilities = () => {
  const [selectedFacility, setSelectedFacility] = useState(null);

  const handleFacilityHover = (facility) => {
      setSelectedFacility(facility);
  };

  return (
      <section className="facilities">
          <h1>Facilities Available</h1>
          <div className="facilities-content">
              {facilitiesData.map((cat) => (
                  <div key={cat.category} className="facility-category">
                      <h2>{cat.category}</h2>
                      <ul>
                          {cat.facilities.map((facility) => (
                              <li 
                                  key={facility.name} 
                                  onMouseEnter={() => handleFacilityHover(facility)} 
                                  onMouseLeave={() => setSelectedFacility(null)}
                                  className="facility-item"
                              >
                                  {facility.name}
                                  {selectedFacility === facility && (
                                      <div className="facility-details-popup">
                                          <h3>{facility.name}</h3>
                                          <p>{facility.description}</p>
                                          <img src={facility.image} alt={facility.name} />
                                      </div>
                                  )}
                              </li>
                          ))}
                      </ul>
                  </div>
              ))}
          </div>
      </section>
  );
};

export default Facilities;
