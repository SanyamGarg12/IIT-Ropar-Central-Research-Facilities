const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const JWT_SECRET = 'abcd';
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

app.post('/api/facilities', (req, res) => {
  const { name, description, specifications, usage_details, category_id, image_url } = req.body;
  
  const query = `
    INSERT INTO Facilities (name, description, specifications, usage_details, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.query(query, [name, description, specifications, usage_details, category_id, image_url], (err, result) => {
    if (err) {
      console.error('Error adding facility:', err);
      res.status(500).send('Error adding facility');
    } else {
      res.json({ message: 'Facility added successfully' });
    }
  });
});

app.delete('/api/facilities/:id', (req, res) => {
  const facilityId = req.params.id;

  const query = `DELETE FROM Facilities WHERE id = ?`;

  db.query(query, [facilityId], (err, result) => {
    if (err) {
      console.error('Error deleting facility:', err);
      res.status(500).send('Error deleting facility');
    } else {
      res.json({ message: 'Facility deleted successfully' });
    }
  });
});

// Helper function to authenticate user
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Invalid Token');
      req.user = user;
      next();
  });
}

app.post('/api/register', async (req, res) => {
  const { fullName, email, password, userType, contactNumber } = req.body;

  // Input validation
  if (!fullName || !email || !password || !userType) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // SQL query for inserting a new user
    const query = `INSERT INTO Users (full_name, email, password_hash, user_type, contact_number) VALUES (?, ?, ?, ?, ?)`;

    // Execute the query
    db.query(query, [fullName, email, passwordHash, userType, contactNumber || null], (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists.' });
        }
        return res.status(500).json({ message: 'Registration failed.' });
      }

      res.status(201).json({ message: 'User registered successfully.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});


app.post("/login", (req, res) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "SELECT * FROM Users WHERE email = ? AND user_type = ?";
  db.query(query, [email, userType], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials or user type." });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.user_id, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  });
});


app.post('/api/booking', authenticateToken, (req, res) => {
  const { facility, date, time } = req.body;
  const userId = req.user.userId;

  const query = `INSERT INTO booking_history (user_id, facility, date, time) VALUES (?, ?, ?, ?)`;
  db.query(query, [userId, facility, date, time], (err, result) => {
    if (err) return res.status(500).json({ message: 'Booking failed' });
    res.json({ message: 'Booking successful' });
  });
});

// Get booking history
app.get('/booking-history', authenticateToken, (req, res) => {
  db.query(
      `SELECT * FROM BookingHistory WHERE user_id = ?`,
      [req.user.userId],
      (err, results) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error fetching booking history.');
          }
          res.status(200).json(results);
      }
  );
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});
const upload = multer({ storage });

app.get('/api/members', (req, res) => {
  const query = `
    SELECT 
      id,
      name,
      designation,
      profile_link,
      image_path
    FROM 
      Members
    ORDER BY 
      name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err);
      res.status(500).send('Error fetching members');
    } else {
      // Transform image path to direct link if necessary
      const members = results.map((member) => {
        if (member.image_path) {
          // Assuming the images are stored in a publicly accessible directory
          member.image_url = `http://localhost:5000/uploads/${member.image_path}`;
        } else {
          member.image_url = null; // Handle missing images gracefully
        }
        delete member.image_path; // Remove the raw path for cleaner response
        return member;
      });
      res.json(members); // Send the transformed data
    }
  });
});

app.post('/api/members', (req, res) => {
  const { name, designation, imageLink } = req.body;

  // Extract the Google Drive image ID from the provided URL
  const regex = /\/d\/(.*?)\//;
  const match = imageLink.match(regex);
  const imageId = match ? match[1] : null;

  if (imageId) {
    const query = 'INSERT INTO Members (name, designation, image_path) VALUES (?, ?, ?)';
    db.query(query, [name, designation, imageId], (err, results) => {
      if (err) {
        console.error('Error adding member:', err);
        res.status(500).send('Error adding member');
      } else {
        res.status(200).send('Member added successfully');
      }
    });
  } else {
    res.status(400).send('Invalid Google Drive image URL');
  }
});

app.delete('/api/members/:id', (req, res) => {
  const memberId = req.params.id;

  const query = 'DELETE FROM Members WHERE id = ?';
  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error('Error deleting member:', err);
      res.status(500).send('Error deleting member');
    } else {
      res.status(200).send('Member deleted successfully');
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
