const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');

// Create the app
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'sanyam_iitrpr',
  password: 'new_password', // Update with your actual MySQL password
  database: 'iitrpr', // Update with your actual database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Configure multer with file size limits and file type validation
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Route to fetch all members from the database
app.get('/members', (req, res) => {
  const query = 'SELECT id, name, description FROM members'; // Don't send image in list view
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching members:', err);
      res.status(500).json({ error: 'Error fetching members' });
    } else {
      res.json(result);
    }
  });
});

// Route to get a specific member's image
app.get('/members/image/:id', (req, res) => {
  const query = 'SELECT image, image_type FROM members WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching image:', err);
      res.status(500).json({ error: 'Error fetching image' });
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Member not found' });
    } else if (!result[0].image) {
      res.status(404).json({ error: 'Image not found' });
    } else {
      const image = result[0].image;
      const imageType = result[0].image_type;
      res.setHeader('Content-Type', imageType); // Set the correct content type
      res.send(image); // Send the binary image data
    }
  });
});

// Route to add a new member with image
app.post('/members', upload.single('image'), (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Check if image was provided
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const image = req.file.buffer;
    const imageType = req.file.mimetype; // Store MIME type (e.g., image/jpeg, image/png)

    const query = 'INSERT INTO members (name, description, image, image_type) VALUES (?, ?, ?, ?)';
    db.query(query, [name, description, image, imageType], (err, result) => {
      if (err) {
        console.error('Error inserting new member:', err);
        res.status(500).json({ error: 'Error inserting member' });
      } else {
        res.status(201).json({
          message: 'Member added successfully',
          memberId: result.insertId,
        });
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update a member's details and image
app.put('/members/:id', upload.single('image'), (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  let image = null;
  let imageType = null;

  // If image is provided, set it to the buffer from the upload
  if (req.file) {
    image = req.file.buffer;
    imageType = req.file.mimetype; // Store the MIME type of the uploaded image
  }

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  let query = 'UPDATE members SET name = ?, description = ?';
  const params = [name, description];

  if (image) {
    query += ', image = ?, image_type = ?'; // Update image and image_type
    params.push(image, imageType);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating member:', err);
      return res.status(500).json({ error: 'Error updating member' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member updated successfully' });
  });
});

// Route to delete a member
app.delete('/members/:id', (req, res) => {
  const query = 'DELETE FROM members WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting member:', err);
      return res.status(500).json({ error: 'Error deleting member' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
