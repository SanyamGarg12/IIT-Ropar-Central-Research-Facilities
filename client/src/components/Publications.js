import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Publications.css';

const Publications = () => {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    // Fetch publications from the backend
    axios.get('http://localhost:5000/api/publications')
      .then((response) => {
        console.log(response.data); // Log the response for debugging
        setPublications(response.data); // Update the state with the fetched data
      })
      .catch((error) => {
        console.error('Error fetching publications:', error);
      });
  }, []);

  return (
    <div className="publications-container">
      <h1>Publications</h1>
      {publications.length > 0 ? (
        <ul className="publications-list">
          {publications.map((publication) => (
            <li key={publication.id}>
              <a href={publication.link} target="_blank" rel="noopener noreferrer">
                {publication.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No publications available at the moment.</p>
      )}
    </div>
  );
};

export default Publications;
