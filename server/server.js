const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for cross-origin requests
app.use(cors());

// Create a connection pool to the MySQL database
const db = mysql.createPool({
  host: 'localhost', // Replace with your MySQL host
  user: 'sanyam_iitrpr', // Replace with your MySQL username
  password: 'new_password', // Replace with your MySQL password
  database: 'iitrpr', // Replace with your database name
});

// Test the database connection
db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to the MySQL database');
  }
});

// Middleware to parse JSON request bodies
app.use(express.json());

// API endpoint to get all facilities
app.get('/api/facilities', (req, res) => {
  const query = `
    SELECT 
      f.id AS facility_id,
      f.name AS facility_name,
      f.description,
      f.specifications,
      f.usage_details,
      f.image_url,
      c.name AS category_name
    FROM 
      Facilities f
    JOIN 
      Categories c ON f.category_id = c.id
    ORDER BY 
      c.name, f.name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching facilities:', err);
      res.status(500).send('Error fetching facilities');
    } else {
      const facilities = {};

      // Group facilities by category
      results.forEach((facility) => {
        if (!facilities[facility.category_name]) {
          facilities[facility.category_name] = [];
        }

        // Convert Google Drive link to direct image URL
        if (facility.image_url) {
          const imageIdMatch = facility.image_url.match(/\/d\/(.*?)\//);
          if (imageIdMatch) {
            const transformedUrl = `https://drive.google.com/uc?export=view&id=${imageIdMatch[1]}`;
            // console.log('Transformed Image URL:', transformedUrl);  // Log the transformed URL
            facility.image_url = transformedUrl;
          }
        }

        facilities[facility.category_name].push(facility);
      });

      res.json(facilities);
    }
  });
});

// API endpoint to get details of a single facility
app.get('/api/facility/:id', (req, res) => {
  const facilityId = req.params.id;

  const query = `
    SELECT 
      f.id AS facility_id,
      f.name AS facility_name,
      f.description,
      f.specifications,
      f.usage_details,
      f.image_url,
      c.name AS category_name
    FROM 
      Facilities f
    JOIN 
      Categories c ON f.category_id = c.id
    WHERE 
      f.id = ?;
  `;

  db.query(query, [facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching facility details:', err);
      res.status(500).send('Error fetching facility details');
    } else {
      res.json(results); // Send back a single facility's data
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
