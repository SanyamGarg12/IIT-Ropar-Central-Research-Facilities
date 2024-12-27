const express = require('express');
const mysql = require('mysql2/promise'); // Use the promise version of mysql2
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const port = 5000;
const JWT_SECRET = 'abcd';

const router = express.Router();
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
db.getConnection()
  .then(() => {
    console.log('Connected to the MySQL database');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL database:', err);
  });

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads'); // Ensure this is the correct path
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// API endpoint to get all facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const [facilities] = await db.query('SELECT * FROM Facilities');
    res.json({ data: facilities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching facilities' });
  }
});

router.post('/api/facilities', upload.single('image'), async (req, res) => {
  const { name, description, specifications, usage_details, category_id } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save image URL in DB

  // Insert the facility into the database
  const query = `INSERT INTO facilities (name, description, specifications, usage_details, category_id, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(query, [name, description, specifications, usage_details, category_id, imageUrl]);
    const facilityId = result.insertId;

    // Associate publications if provided
    const publications = req.body.publications; // Assuming it's an array of publication IDs
    if (publications && publications.length > 0) {
      const publicationAssociations = publications.map(pubId => {
        return db.query(`INSERT INTO facility_publications (facility_id, publication_id) VALUES (?, ?)`, [facilityId, pubId]);
      });

      await Promise.all(publicationAssociations);
    }

    res.status(200).json({ facility_id: facilityId, name });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding facility.');
  }
});

app.delete('/api/facilities/:id', async (req, res) => {
  const facilityId = req.params.id;
  const query = `DELETE FROM Facilities WHERE id = ?`;

  try {
    await db.query(query, [facilityId]);
    res.json({ message: 'Facility deleted successfully' });
  } catch (err) {
    console.error('Error deleting facility:', err);
    res.status(500).send('Error deleting facility');
  }
});

app.get('/api/publications', async (req, res) => {
  const query = 'SELECT * FROM Publications'; // Adjust with your query
  try {
    const [result] = await db.query(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching publications' });
  }
});

// Helper function to authenticate user
function authenticateToken(req, res, next) {
  console.log(req.body)
  console.log(req.headers)
  const token = req.headers.authorization;
  console.log(token);
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
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log(req.body)
  const { facility, date, time } = req.body;
  const userId = req.user.userId;

  const query = `INSERT INTO bookinghistory (user_id, facility_name, booking_date, booking_time) VALUES (?, ?, ?, ?)`;
  try {
    db.query(query, [userId, facility, date, time], (err, result) => {
      console.log("result", result);
      console.log("err", err);
      if (err) return res.status(500).json({ message: "Booking failed" });
      res.json({ message: "Booking successful" });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Booking failed' });

  }

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

// app.get('/api/members', (req, res) => {
//   const query = `
//     SELECT 
//       id,
//       name,
//       designation,
//       profile_link,
//       image_path
//     FROM 
//       Members
//     ORDER BY 
//       name;
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching members:', err);
//       res.status(500).send('Error fetching members');
//     } else {
//       // Transform image path to direct link if necessary
//       const members = results.map((member) => {
//         if (member.image_path) {
//           // Assuming the images are stored in a publicly accessible directory
//           member.image_url = `http://localhost:5000/uploads/${member.image_path}`;
//         } else {
//           member.image_url = null; // Handle missing images gracefully
//         }
//         delete member.image_path; // Remove the raw path for cleaner response
//         return member;
//       });
//       res.json(members); // Send the transformed data
//     }
//   });
// });

app.get("/api/members", (req, res) => {
  db.query("SELECT * FROM Members", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/api/members", upload.single("image"), (req, res) => {
  const { name, designation, profileLink } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO Members (name, designation, profile_link, image_path) VALUES (?, ?, ?, ?)",
    [name, designation, profileLink, imagePath],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(201).send("Member added successfully.");
    }
  );
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
              f.make_year,
              f.model,
              f.faculty_in_charge,
              f.contact_person_contact,
              c.name AS category_name,
              p.title AS publication_title,
              p.link AS publication_link
              FROM 
              Facilities f
              LEFT JOIN 
              Categories c ON f.category_id = c.id
              LEFT JOIN 
              Publications p ON f.id = p.facility_id
              WHERE 
              f.id = ?;
              `;

  db.query(query, [facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching facility details:', err);
      res.status(500).send('Error fetching facility details');
    } else {
      if (results.length > 0) {
        const facility = results[0];

        // Convert Google Drive link to direct image URL
        if (facility.image_url) {
          const imageIdMatch = facility.image_url.match(/\/d\/(.*?)\//);
          if (imageIdMatch) {
            facility.image_url = `https://drive.google.com/uc?export=view&id=${imageIdMatch[1]}`;
          }
        }

        res.json(facility);
      } else {
        res.status(404).send('Facility not found');
      }
    }
  });
});

// API endpoint to fetch all publications
app.get('/api/publications', async (req, res) => {
  const query = `
              SELECT 
              id, title, link 
              FROM 
              Publications
              ORDER BY 
              id DESC;
              `;

  try {
    const [results] = await db.query(query);
    res.json(results); // Send the publications data
  } catch (err) {
    console.error('Error fetching publications:', err);
    res.status(500).send('Error fetching publications');
  }
});

app.get('/api/aboutContent', (req, res) => {
  const filePath = path.join(__dirname, 'aboutContent.json'); // Path to the aboutContent.json file

  // Read the JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading about content file:', err);
      res.status(500).json({ message: 'Error reading about content file' });
      return;
    }

    try {
      const aboutContent = JSON.parse(data); // Parse the JSON data
      res.json(aboutContent); // Send the JSON data as the response
    } catch (parseError) {
      console.error('Error parsing JSON content:', parseError);
      res.status(500).json({ message: 'Error parsing about content file' });
    }
  });
});

app.post('/api/saveAboutContent', (req, res) => {
  const filePath = path.join(__dirname, 'aboutContent.json');
  const updatedContent = req.body;

  fs.writeFile(filePath, JSON.stringify(updatedContent, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error saving about content:', err);
      res.status(500).json({ message: 'Error saving about content' });
      return;
    }
    res.json({ message: 'Content saved successfully' });
  });
});

module.exports = router;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
