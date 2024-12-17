import React from 'react';
import './Videos.css';

function Videos() {
  return (
    <section className="videos">
      <h2>Sample Videos</h2>
      <div className="video-container">
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID_1"
          title="Sample Video 1"
          allowFullScreen
        ></iframe>
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID_2"
          title="Sample Video 2"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}

export default Videos;
