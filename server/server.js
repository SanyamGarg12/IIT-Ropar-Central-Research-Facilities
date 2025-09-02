const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const sharp = require('sharp');
require("dotenv").config();
const app = express();
app.set('trust proxy', 1); 
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sdfadfs';


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS for cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting configurations
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200, // 100 attempts per window
  message: 'Too many login attempts, please try again after 30 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200, // 100 requests per window
  message: 'Too many requests from this IP, please try again after 30 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200, // 100 uploads per 30 minutes
  message: 'Too many file uploads, please try again after 30 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Add a specific rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200, // 100 registration attempts per 30 minutes
  message: 'Too many registration attempts, please try again after 30 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific routes
app.use('/login', loginLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/register', registerLimiter); // Apply registration rate limiter
app.use('/api/', apiLimiter);

// Create a connection pool to the MySQL database
const db = mysql.createPool({
  host: process.env.DB_HOST, // Replace with your MySQL host
  user: process.env.DB_USER, // Replace with your MySQL username
  password: process.env.DB_PASSWORD, // Replace with your MySQL password
  database: process.env.DB_NAME, // Replace with your database name
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Check if upload directories exist, if not create them
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads/results'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads/publications'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads/receipts'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads/forms'), { recursive: true });

// Create a directory for temporary chunk storage
fs.mkdirSync(path.join(__dirname, 'uploads/temp'), { recursive: true });

// Configure multer storage for file uploads
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = Date.now();
    const originalExt = path.extname(file.originalname);
    cb(null, `${uniqueId}${originalExt}`);
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Handle file upload for registration
app.post('/api/upload-id-proof', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({ 
      success: true, 
      filePath: req.file.filename,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ 
      error: 'Failed to process file upload',
      details: error.message 
    });
  }
});

// Storage configuration for receipt uploads
const receiptStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const receiptPath = path.join(__dirname, 'uploads/receipts');
    cb(null, receiptPath); // Use absolute path to ensure directory is found
  },
  filename: function (req, file, cb) {
    // Use tempId for pre-booking uploads or bookingId for post-booking uploads
    const id = req.body.tempId || req.body.bookingId || 'temp';
    const uniqueId = `${Date.now()}_${id}`;
    cb(null, `${uniqueId}_receipt${path.extname(file.originalname)}`);
  }
});

// Create a multer upload instance specifically for receipts
const receiptUpload = multer({ 
  storage: receiptStorage,
  fileFilter: function (req, file, cb) {
    // Accept PDF files and common image formats as receipts
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files and images are allowed for receipts'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadsDir, 'temp');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer storage for chunk uploads
const chunkStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const fileId = req.body.fileId;
    const chunk = req.body.chunk;
    const originalExt = path.extname(file.originalname);
    cb(null, `${fileId}_chunk_${chunk}${originalExt}`);
  }
});

const uploadChunk = multer({ 
  storage: chunkStorage,
  limits: {
    fileSize: 1024 * 1024 // 1MB chunk size limit
  }
});

// API endpoint to get all facilities
app.get('/api/facilities', (req, res) => {
  const query = `
    SELECT 
      f.id, 
      f.name, 
      f.make_year, 
      f.model,
      f.manufacturer,
      f.faculty_in_charge, 
      f.faculty_contact,
      f.faculty_email,
      f.operator_name,
      f.operator_contact,
      f.operator_email,
      f.description, 
      f.specifications, 
      f.usage_details, 
      f.image_url, 
      f.category_id,
      c.name AS category_name, 
      c.description AS category_description
    FROM 
      Facilities f
    INNER JOIN 
      Categories c
    ON 
      f.category_id = c.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching facilities with categories' });
    } else {
      res.json(results);
    }
  });
});


app.put("/api/facilities/:id", upload.single("image"), (req, res) => {
  // console.log(req.body);
  const facilityId = req.params.id;
  const {
    name,
    manufacturer,
    make_year,
    model,
    faculty_in_charge,
    faculty_contact,
    faculty_email,
    operator_name,
    operator_contact,
    operator_email,
    description,
    specifications,
    usage_details,
    category_id,
    publications,
  } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !category_id) {
    return res.status(400).json({ error: "Missing required fields: name or category_id" });
  }

  const updateQuery = `
    UPDATE Facilities
    SET 
      name = ?, 
      manufacturer = ?,
      make_year = ?, 
      model = ?, 
      faculty_in_charge = ?, 
      faculty_contact = ?, 
      faculty_email = ?, 
      operator_name = ?, 
      operator_contact = ?, 
      operator_email = ?, 
      description = ?, 
      specifications = ?, 
      usage_details = ?, 
      image_url = COALESCE(?, image_url), 
      category_id = ?
    WHERE 
      id = ?
  `;

  const updateValues = [
    name,
    manufacturer,
    make_year,
    model,
    faculty_in_charge,
    faculty_contact,
    faculty_email,
    operator_name,
    operator_contact,
    operator_email,
    description,
    specifications,
    usage_details,
    image_url,
    category_id,
    facilityId,
  ];

  db.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating facility:', err);
      return res.status(500).json({ 
        error: 'Failed to update facility',
        message: err.message
      });
    }

    const deleteQuery = 'DELETE FROM facility_publications WHERE facility_id = ?';
    db.query(deleteQuery, [facilityId], (err) => {
      if (err) {
        console.error('Error deleting existing publications:', err);
        return res.status(500).json({ 
          error: 'Failed to update publications',
          message: err.message
        });
      }

      if (publications) {
        try {
          const pubIds = JSON.parse(publications);
          if (pubIds.length > 0) {
            const insertValues = pubIds.map(pubId => [facilityId, pubId]);
            const insertQuery = 'INSERT INTO facility_publications (facility_id, publication_id) VALUES ?';
            db.query(insertQuery, [insertValues], (err) => {
              if (err) {
                console.error('Error inserting publications:', err);
                return res.status(500).json({ 
                  error: 'Failed to update publications',
                  message: err.message
                });
              }

              res.json({ 
                message: 'Facility and publications updated successfully',
                image_url: image_url
              });
            });
          } else {
            res.json({ 
              message: 'Facility updated successfully',
              image_url: image_url
            });
          }
        } catch (error) {
          console.error('Error parsing publications:', error);
          return res.status(400).json({ 
            error: 'Invalid publications format',
            message: error.message
          });
        }
      } else {
        res.json({ 
          message: 'Facility updated successfully',
          image_url: image_url
        });
      }
    });
  });
});


app.post('/api/facilities', upload.single("image"), (req, res) => {
  // console.log('Received facility data:', req.body);
  // console.log('Received file:', req.file);

  const {
    name,
    make_year,
    model,
    manufacturer,
    faculty_in_charge,
    faculty_contact,
    faculty_email,
    operator_name,
    operator_contact,
    operator_email,
    description,
    specifications,
    usage_details,
    category_id,
    publications,
  } = req.body;

  // Validate required fields
  if (!name || !category_id) {
    console.log('Missing required fields:', { name, category_id });
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Name and category are required'
    });
  }

  // Get the uploaded image filename from req.file
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO Facilities (
      name, 
      make_year, 
      model, 
      manufacturer,
      faculty_in_charge, 
      faculty_contact,
      faculty_email,
      operator_name,
      operator_contact,
      operator_email,
      description, 
      specifications, 
      usage_details, 
      image_url, 
      category_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    make_year || null,
    model || null,
    manufacturer || null,
    faculty_in_charge || null,
    faculty_contact || null,
    faculty_email || null,
    operator_name || null,
    operator_contact || null,
    operator_email || null,
    description || null,
    specifications || null,
    usage_details || null,
    image_url,
    category_id
  ];

  console.log('Executing query with values:', values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding facility:', err);
      return res.status(500).json({ 
        error: 'Failed to add facility',
        message: err.message
      });
    }

    const facilityId = result.insertId;

    if (publications) {
      try {
        const pubIds = JSON.parse(publications);
        if (pubIds.length > 0) {
          const insertValues = pubIds.map(pubId => [facilityId, pubId]);
          const insertQuery = 'INSERT INTO facility_publications (facility_id, publication_id) VALUES ?';
          db.query(insertQuery, [insertValues], (err) => {
            if (err) {
              console.error('Error inserting publications:', err);
              return res.status(500).json({ 
                error: 'Failed to add publications',
                message: err.message
              });
            }

            res.status(201).json({ 
              message: 'Facility and publications added successfully',
              id: facilityId,
              image_url: image_url
            });
          });
        } else {
          res.status(201).json({ 
            message: 'Facility added successfully',
            id: facilityId,
            image_url: image_url
          });
        }
      } catch (error) {
        console.error('Error parsing publications:', error);
        return res.status(400).json({ 
          error: 'Invalid publications format',
          message: error.message
        });
      }
    } else {
      res.status(201).json({ 
        message: 'Facility added successfully',
        id: facilityId,
        image_url: image_url
      });
    }
  });
});

// Create archived news table if it doesn't exist
const createArchivedNewsTable = `
  CREATE TABLE IF NOT EXISTS archived_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_title VARCHAR(255) NOT NULL,
    summary TEXT,
    imagepath VARCHAR(255),
    link VARCHAR(255),
    archived_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createArchivedNewsTable, (err) => {
  if (err) {
    console.error('Error creating archived_news table:', err);
  } else {
    console.log('Archived news table created or already exists');
  }
});

// Modify the delete news endpoint to archive instead of delete
app.post('/api/homecontent', upload.single('image'), (req, res) => {
  const { action } = req.body;
  const imagePath = req.file ? req.file.filename : null;
  // console.log(imagePath);
  switch (action) {
    case 'updateThought': {
      const { thought } = req.body;
      if (!thought) {
        return res.status(400).json({ error: 'Thought text is required' });
      }

      db.query(`UPDATE thought SET thought_text = ? WHERE id = 1`, [thought], (error, results) => {
        if (error) {
          console.error('Error updating thought:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ message: 'Thought updated successfully' });
      });
      break;
    }

    case 'updateSlider': {
      const { title, subtitle } = req.body;
      if (!title || !subtitle || !imagePath) {
        return res.status(400).json({ error: 'Missing required fields for slider update' });
      }

      db.query(
        `INSERT INTO heroImages (imagepath, title, subtitle) VALUES (?, ?, ?)`,
        [imagePath, title, subtitle],
        (error, results) => {
          if (error) {
            console.error('Error updating slider:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          return res.json({ message: 'Slider updated successfully' });
        }
      );
      break;
    }

    case 'addNews': {
      const { title: newsTitle, summary, link } = req.body;
      if (!newsTitle || !summary || !imagePath) {
        return res.status(400).json({ error: 'Missing required fields for news addition' });
      }

      const defaultLink = 'https://iitrpr.ac.in';
      const newsLink = link || defaultLink;

      db.query(
        `INSERT INTO heroNews (news_title, summary, imagepath, link) VALUES (?, ?, ?, ?)`,
        [newsTitle, summary, imagePath, newsLink],
        (error, results) => {
          if (error) {
            console.error('Error adding news:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          return res.json({ message: 'News added successfully' });
        }
      );
      break;
    }

    case 'delete': {
      const { type, id } = req.body;
      if (!type || typeof id !== 'number') {
        return res.status(400).json({ error: 'Invalid delete parameters' });
      }

      if (type === 'NewsFeed') {
        // First get the news details
        db.query('SELECT * FROM heroNews WHERE id = ?', [id], (err, results) => {
          if (err) {
            console.error('Error fetching news for archiving:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: 'News not found' });
          }

          const news = results[0];
          
          // Insert into archived_news table
          db.query(
            'INSERT INTO archived_news (news_title, summary, imagepath, link) VALUES (?, ?, ?, ?)',
            [news.news_title, news.summary, news.imagepath, news.link],
            (err) => {
              if (err) {
                console.error('Error archiving news:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
              }

              // Now delete from heroNews
              db.query('DELETE FROM heroNews WHERE id = ?', [id], (err) => {
                if (err) {
                  console.error('Error deleting news:', err);
                  return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json({ message: 'News archived successfully' });
              });
            }
          );
        });
      } else if (type === 'sliderImages') {
        db.query('DELETE FROM heroImages WHERE id = ?', [id], (error, results) => {
          if (error) {
            console.error('Error deleting content:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          return res.json({ message: 'Content deleted successfully' });
        });
      } else {
        return res.status(400).json({ error: 'Invalid delete type' });
      }
      break;
    }

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
});

// Add new endpoint to get archived news
app.get('/api/archived-news', (req, res) => {
  const query = 'SELECT * FROM archived_news ORDER BY archived_date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching archived news:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

app.get('/api/forms', (req, res) => {
  const query = 'SELECT * FROM forms';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching forms' });
    } else {
      res.json(result);
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

app.get('/api/publications', (req, res) => {
  const query = 'SELECT * FROM Publications'; // Adjust with your query
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching publications' });
    } else {
      res.json(result);
    }
  });
});
// Helper function to authenticate user
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Access Denied");
  }

  const token = authHeader;

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // localStorage.clear();
      console.error("Token verification failed:", err);
      return res.status(403).send("Invalid Token");
    }
    req.user = user;
    next();
  });
}

app.post('/api/modifypassword', authenticateToken, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const query = 'UPDATE management_cred SET Pass = ? WHERE email = ?';
    db.query(query, [password, email], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Failed to update password' });
      }
      res.status(200).json({ message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
});

// app.post('/api/register', upload.single('idProof'), async (req, res) => {
//   console.log(req.body);
//   const { fullName, email, password, userType, contactNumber, orgName, department, supervisor_id, idProof} = req.body;
//   const uploadDir = path.join(__dirname, 'uploads');
//   let idProofPath = null;

//   // Handle file upload
//   if(idProof){
//     idProofPath = `uploads/${idProof}`; // Store relative path
//   }

//   if (!fullName || !email || !password || !userType) {
//     return res.status(400).json({ message: 'All required fields must be provided.' });
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);
    
//     // Log the values being inserted
//     console.log('Inserting user with values:', {
//       fullName,
//       email,
//       userType,
//       contactNumber,
//       orgName,
//       idProofPath
//     });

//     const query = `INSERT INTO Users (full_name, email, password_hash, user_type, contact_number, org_name, id_proof) 
//                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
//     db.query(query, [fullName, email, passwordHash, userType, contactNumber || null, orgName || null, idProofPath], (err, result) => {
//       if (err) {
//         console.error('Database error:', err);
//         if (err.code === 'ER_DUP_ENTRY') {
//           return res.status(400).json({ message: 'Email already exists.' });
//         }
//         return res.status(500).json({ message: 'Registration failed.' });
//       }

//       const user_id = result.insertId;
//       if (userType === 'Internal') {
//         // Insert into InternalUsers (no verification columns)
//         db.query('INSERT INTO InternalUsers (user_id, email, full_name, supervisor_id, department_name) VALUES (?, ?, ?, ?, ?)',
//           [user_id, email, fullName, supervisor_id, department], (err2) => {
//             if (err2) {
//               console.error('Error inserting internal user:', err2);
//               return res.status(500).json({ message: 'Internal user registration failed.' });
//             }
//             // Generate verification token and store in SupervisorVerifications
//             const verificationToken = crypto.randomBytes(32).toString('hex');
//             db.query('INSERT INTO SupervisorVerifications (user_id, token) VALUES (?, ?)', [user_id, verificationToken], (err3) => {
//               if (err3) {
//                 console.error('Error storing verification token:', err3);
//                 return res.status(500).json({ message: 'Failed to store verification token.' });
//               }
//               // Get supervisor email
//               db.query('SELECT email, name FROM Supervisor WHERE id = ?', [supervisor_id], (err4, supRes) => {
//                 if (err4 || !supRes.length) {
//                   return res.status(500).json({ message: 'Supervisor not found.' });
//                 }
//                 const supervisorEmail = supRes[0].email;
//                 const supervisorName = supRes[0].name;
//                 // Send verification email
//                 const transporter = nodemailer.createTransport({
//                   service: 'gmail',
//                   auth: {
//                     user: process.env.EMAIL_USER,
//                     pass: process.env.EMAIL_PASS
//                   }
//                 });
//                 const verifyUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/supervisor-verify?token=${verificationToken}`;
//                 const mailOptions = {
//                   from: process.env.EMAIL_USER,
//                   to: supervisorEmail,
//                   subject: 'Internal User Verification Request',
//                   html: `<p>Dear ${supervisorName},</p>
//                     <p>${fullName} (${email}) has registered as an internal user in the facility booking system under your supervision.</p>
//                     <p>Department: ${department}</p>
//                     <p>Please click the button below to verify this user:</p>
//                     <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">Verify User</a>
//                     <p>Thank you.</p>`
//                 };
//                 transporter.sendMail(mailOptions, (err5, info) => {
//                   if (err5) {
//                     console.error('Failed to send supervisor verification email:', err5);
//                     return res.status(500).json({ message: 'Failed to send verification email to supervisor.' });
//                   }
//                   res.status(201).json({ message: 'User registered successfully. Awaiting supervisor verification.' });
//                 });
//               });
//             });
//           });
//       } else {
//         res.status(201).json({ message: 'User registered successfully.' });
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'An error occurred during registration.' });
//   }
// });
app.post('/api/register', async (req, res) => {
  // console.log(req.body);
  const { fullName, email, password, userType, contactNumber, orgName, department, supervisor, idProof } = req.body;
  const supervisor_id = supervisor;

  const idProofPath = idProof ? `uploads/${idProof}` : null;

  if (!fullName || !email || !password || !userType) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Use a transaction to handle atomic inserts
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Connection error:', err);
        return res.status(500).json({ message: 'Database connection error.' });
      }

      connection.beginTransaction(async (txErr) => {
        if (txErr) {
          connection.release();
          return res.status(500).json({ message: 'Failed to start transaction.' });
        }

        const insertUserQuery = `INSERT INTO Users (full_name, email, password_hash, user_type, contact_number, org_name, id_proof) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

        connection.query(insertUserQuery, [fullName, email, passwordHash, userType, contactNumber || null, orgName || null, idProofPath], (err1, result) => {
          if (err1) {
            connection.rollback(() => {
              connection.release();
              if (err1.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists.' });
              }
              console.error('Insert user failed:', err1);
              return res.status(500).json({ message: 'User registration failed.' });
            });
            return;
          }

          const user_id = result.insertId;

          if (userType === 'Internal') {
            console.log(supervisor_id, department);
            if (!supervisor_id || !department) {
              connection.rollback(() => {
                connection.release();
                return res.status(400).json({ message: 'Supervisor and department required for internal users.' });
              });
              return;
            }

            const insertInternalUserQuery = `INSERT INTO InternalUsers (user_id, email, full_name, supervisor_id, department_name) 
                                             VALUES (?, ?, ?, ?, ?)`;
            connection.query(insertInternalUserQuery, [user_id, email, fullName, supervisor_id, department], (err2) => {
              if (err2) {
                connection.rollback(() => {
                  connection.release();
                  console.error('InternalUsers insert failed:', err2);
                  return res.status(500).json({ message: 'Internal user registration failed.' });
                });
                return;
              }

              const verificationToken = crypto.randomBytes(32).toString('hex');
              connection.query('INSERT INTO SupervisorVerifications (user_id, token) VALUES (?, ?)', [user_id, verificationToken], (err3) => {
                if (err3) {
                  connection.rollback(() => {
                    connection.release();
                    console.error('Verification token insert failed:', err3);
                    return res.status(500).json({ message: 'Failed to create verification token.' });
                  });
                  return;
                }

                connection.query('SELECT email, name FROM Supervisor WHERE id = ?', [supervisor_id], (err4, supRes) => {
                  if (err4 || !supRes.length) {
                    connection.rollback(() => {
                      connection.release();
                      console.error('Supervisor lookup failed:', err4);
                      return res.status(500).json({ message: 'Supervisor not found.' });
                    });
                    return;
                  }

                  const supervisorEmail = supRes[0].email;
                  const supervisorName = supRes[0].name;

                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: process.env.EMAIL_USER,
                      pass: process.env.EMAIL_PASS
                    }
                  });

                  const verifyUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/supervisor-verify?token=${verificationToken}`;
                  const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: supervisorEmail,
                    subject: 'Internal User Verification Request',
                    html: `<p>Dear ${supervisorName},</p>
                           <p>${fullName} (${email}) has registered as an internal user in the facility booking system under your supervision.</p>
                           <p>Department: ${department}</p>
                           <p>Please click the button below to verify this user:</p>
                           <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">Verify User</a>
                           <p>Thank you.</p>`
                  };

                  transporter.sendMail(mailOptions, (err5, info) => {
                    if (err5) {
                      connection.rollback(() => {
                        connection.release();
                        console.error('Failed to send email:', err5);
                        return res.status(500).json({ message: 'Failed to send verification email.' });
                      });
                      return;
                    }

                    // All succeeded — commit transaction
                    connection.commit((commitErr) => {
                      connection.release();
                      if (commitErr) {
                        return res.status(500).json({ message: 'Commit failed.' });
                      }
                      return res.status(201).json({ message: 'Internal user registered successfully. Awaiting supervisor verification.' });
                    });
                  });
                });
              });
            });
          } else {
            // External user — just commit and finish
            connection.commit((commitErr) => {
              connection.release();
              if (commitErr) {
                return res.status(500).json({ message: 'Commit failed.' });
              }
              return res.status(201).json({ message: 'User registered successfully.' });
            });
          }
        });
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});


app.get('/api/facility/:id', (req, res) => {
  const facilityId = req.params.id;
  const query = `
    SELECT 
      f.id,
      f.name,
      f.description,
      f.specifications,
      f.usage_details,
      f.image_url,
      f.make_year,
      f.model,
      f.manufacturer,
      f.faculty_in_charge,
      f.faculty_contact,
      f.faculty_email,
      f.operator_name,
      f.operator_contact,
      f.operator_email,
      f.special_note,
      c.name AS category_name,
      p.id AS publication_id,
      p.title AS publication_title,
      p.link AS publication_link
    FROM 
      Facilities f
    LEFT JOIN 
      Categories c ON f.category_id = c.id
    LEFT JOIN 
      facility_publications fp ON f.id = fp.facility_id
    LEFT JOIN 
      Publications p ON fp.publication_id = p.id
    WHERE 
      f.id = ?;
  `;

  db.query(query, [facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching facility details:', err);
      return res.status(500).send('Error fetching facility details');
    }

    if (results.length === 0) {
      return res.status(404).send('Facility not found');
    }

    const facility = results[0];
    // Filter out the rows with publication data and map them into an array
    const publications = results
      .filter(row => row.publication_title) // Filter rows where publication details exist
      .map(row => ({
        id: row.publication_id,
        title: row.publication_title,
        link: row.publication_link,
      }));

    facility.publications = publications;
    res.json(facility);
  });
});


app.post("/login", (req, res) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "SELECT * FROM Users WHERE email = ? AND user_type = ?";
  db.query(query, [email, userType], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error." });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or user type." });
    }

    const user = results[0];

    if (user.verified !== "YES") {
      return res.status(403).json({ message: "User email ID is not verified. If you have registered recently please wait for approval or contact the admin directly(if urgent)!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.user_id, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Log login event with timestamp
    const logQuery =
      "INSERT INTO LoginLogoutHistory (user_id, login_time) VALUES (?, NOW())";
    db.query(logQuery, [user.user_id], (err) => {
      if (err) {
        console.error("Failed to log login:", err);
      }
    });

    // Delete old records (older than 2 days)
    const deleteQuery =
      "DELETE FROM LoginLogoutHistory WHERE login_time < NOW() - INTERVAL 2 DAY";
    db.query(deleteQuery, (err) => {
      if (err) {
        console.error("Failed to delete old log entries:", err);
      }
    });

    res.status(200).json({ token });
  });
});

app.get("/api/users/not-verified", (req, res) => {
  const query = "SELECT * FROM Users WHERE verified = 'NO'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error." });
    res.status(200).json(results);
  });
});

app.post("/api/users/verify/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "UPDATE Users SET verified = 'YES' WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error." });
    res.status(200).json({ message: "User verified successfully." });
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // First try management_cred (Admin/Operator)
  const query = "SELECT * FROM management_cred WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length > 0) {
      const user = results[0];
      if (password !== user.Pass) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, position: user.Position, email: user.email });
    }

    // Fallback: check Supervisor table using bcrypt password_hash
    const supQuery = 'SELECT id, email, name, password_hash FROM Supervisor WHERE email = ?';
    db.query(supQuery, [email], async (supErr, supRows) => {
      if (supErr) {
        return res.status(500).json({ message: 'Server error.' });
      }
      if (!supRows || supRows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const sup = supRows[0];
      try {
        const ok = sup.password_hash ? await bcrypt.compare(String(password), sup.password_hash) : false;
        if (!ok) {
          return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ email: sup.email, supervisorId: sup.id }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, position: 'Supervisor', email: sup.email });
      } catch (e) {
        return res.status(500).json({ message: 'Server error.' });
      }
    });
  });
});

app.get("/api/UserProfile/:email", (req, res) => {
  const { email } = req.params;

  const query = `SELECT * FROM Users WHERE email = ?`;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result[0]);
  });
});

app.post('/api/logout', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const logQuery =
    "UPDATE LoginLogoutHistory SET logout_time = NOW() WHERE user_id = ? AND logout_time IS NULL";
  db.query(logQuery, [userId], (err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });

  const deleteQuery =
    "DELETE FROM LoginLogoutHistory WHERE login_time < NOW() - INTERVAL 2 DAY";
  db.query(deleteQuery, (err) => {
    if (err) {
      console.error("Failed to delete old log entries:", err);
    }
  });

});

// Configure multer storage for form uploads
const formStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const formPath = path.join(__dirname, 'uploads/forms');
    if (!fs.existsSync(formPath)) {
      fs.mkdirSync(formPath, { recursive: true });
    }
    cb(null, formPath);
  },
  filename: function (req, file, cb) {
    const uniqueId = Date.now();
    const originalExt = path.extname(file.originalname);
    cb(null, `form-${uniqueId}${originalExt}`);
  }
});

const formUpload = multer({
  storage: formStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for forms'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

app.post('/api/forms', authenticateToken, formUpload.single('form_file'), (req, res) => {
  const { form_name, description, facility_name, facility_link } = req.body;
  const formFilePath = req.file ? `/uploads/forms/${req.file.filename}` : null;
  
  if (!form_name || !description || !facility_name || !facility_link || !formFilePath) {
    return res.status(400).json({ error: 'All fields including form file are required' });
  }

  const query =
    'INSERT INTO forms (form_name, description, form_link, facility_name, facility_link) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [form_name, description, formFilePath, facility_name, facility_link], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database insertion error' });
    res.status(201).json({ 
      id: result.insertId, 
      form_name, 
      description, 
      form_link: formFilePath, 
      facility_name, 
      facility_link 
    });
  });
});

// Edit an existing form
app.put('/api/forms/:id', authenticateToken, formUpload.single('form_file'), (req, res) => {
  const { id } = req.params;
  const { form_name, description, facility_name, facility_link } = req.body;
  const formFilePath = req.file ? `/uploads/forms/${req.file.filename}` : null;

  let query, values;
  
  if (formFilePath) {
    // If a new file is uploaded, update the form_link
    query = 'UPDATE forms SET form_name = ?, description = ?, form_link = ?, facility_name = ?, facility_link = ? WHERE id = ?';
    values = [form_name, description, formFilePath, facility_name, facility_link, id];
  } else {
    // If no new file, keep the existing form_link
    query = 'UPDATE forms SET form_name = ?, description = ?, facility_name = ?, facility_link = ? WHERE id = ?';
    values = [form_name, description, facility_name, facility_link, id];
  }

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database update error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Form not found' });
    res.status(200).json({ message: 'Form updated successfully' });
  });
});

// Delete a form
app.delete('/api/forms/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // First get the form to find the file path
  db.query('SELECT form_link FROM forms WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Form not found' });
    
    const formLink = results[0].form_link;
    
    // Delete from database
    const deleteQuery = 'DELETE FROM forms WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database deletion error' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Form not found' });
      
      // Delete the file if it exists
      if (formLink && !formLink.startsWith('http')) {
        const filePath = path.join(__dirname, formLink);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(200).json({ message: 'Form deleted successfully' });
    });
  });
});

// Upload an image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'Image uploaded successfully', path: `/uploads/${req.file.filename}` });
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required." });
  }

  try {
    // Check if the user exists
    const query = "SELECT * FROM Users WHERE user_id = ?";
    db.query(query, [userId], async (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "An error occurred while searching for the user." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update the password in the database
      const updateQuery = "UPDATE Users SET password_hash = ? WHERE user_id = ?";
      db.query(updateQuery, [newPasswordHash, userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Failed to reset password." });
        }

        res.status(200).json({ message: "Password reset successfully." });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during password reset." });
  }
});

app.get('/api/admin/operators-bookings', authenticateToken, (req, res) => {
  console.log("Fetching operators and bookings...");
  
  // First set the group_concat_max_len to a larger value to accommodate more data
  db.query('SET SESSION group_concat_max_len = 1000000;', (err) => {
    if (err) {
      console.error('Error setting group_concat_max_len:', err);
      return res.status(500).send('Error configuring database settings.');
    }
    
    const query = `
      SELECT 
        mc.email,
        mc.Position,
        (
          SELECT f.operator_name 
          FROM Facilities f 
          WHERE f.operator_email = mc.email 
          LIMIT 1
        ) as operator_name,
        COALESCE(
          GROUP_CONCAT(
            JSON_OBJECT(
              'booking_id', bh.booking_id,
              'user_id', bh.user_id,
              'user_name', u.full_name,
              'user_type', u.user_type,
              'facility_id', bh.facility_id,
              'facility_name', f.name,
              'booking_date', bh.booking_date,
              'status', bh.status,
              'cost', bh.cost,
              'schedule_id', bh.schedule_id,
              'receipt_path', bh.receipt_path,
              'billing_address', bh.billing_address,
              'gst_number', bh.gst_number,
              'utr_number', bh.utr_number,
              'transaction_date', bh.transaction_date,
              'bifurcations', (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'bifurcation_name', fb.bifurcation_name,
                    'sample_count', bb.sample_count,
                    'pricing_type', fb.pricing_type
                  )
                )
                FROM BookingBifurcations bb
                JOIN facility_bifurcations fb ON bb.bifurcation_id = fb.id
                WHERE bb.booking_id = bh.booking_id
              )
            )
          ),
          ''
        ) as bookings
      FROM 
        management_cred mc
      LEFT JOIN 
        BookingHistory bh ON mc.email = bh.operator_email
      LEFT JOIN 
        Users u ON bh.user_id = u.user_id
      LEFT JOIN 
        Facilities f ON bh.facility_id = f.id
      WHERE 
        mc.Position = 'Operator'
      GROUP BY 
        mc.email, mc.Position
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching operators and bookings:', err);
        return res.status(500).send('Error fetching operators and bookings.');
      }

      try {
        // Parse the bookings JSON string into an array, handling empty bookings
        const formattedResults = results.map(operator => ({
          email: operator.email,
          name: operator.operator_name || operator.Position, // Use operator_name if available, fallback to Position
          bookings: operator.bookings ? JSON.parse(`[${operator.bookings}]`).filter(booking => booking.booking_id !== null) : []
        }));

        res.status(200).json(formattedResults);
      } catch (jsonErr) {
        console.error('Error parsing bookings JSON:', jsonErr);
        console.error('Raw bookings data:', results.map(op => op.bookings.substring(0, 500) + '...'));
        return res.status(500).send('Error processing booking data.');
      }
    });
  });
});

app.post('/api/op-change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword, userEmail } = req.body;

  // Validate input
  if (!oldPassword || !newPassword || !userEmail) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Query to find the operator in the management_cred table
  const findUserQuery = 'SELECT Pass FROM management_cred WHERE email = ?';

  db.query(findUserQuery, [userEmail], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the old password matches
    const storedPassword = results[0].Pass;
    if (storedPassword !== oldPassword) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    // Query to update the password
    const updatePasswordQuery = 'UPDATE management_cred SET Pass = ? WHERE email = ?';

    db.query(updatePasswordQuery, [newPassword, userEmail], (updateErr) => {
      if (updateErr) {
        console.error('Error updating password:', updateErr);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
      }

      res.status(200).json({ success: true, message: 'Password changed successfully' });
    });
  });
});

// API endpoint to upload facility booking receipt before booking is created
app.post('/api/upload-receipt-pre-booking', receiptUpload.single('receipt'), async (req, res) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log('Pre-booking receipt upload:', { 
      file: uploadedFile.filename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size
    });

    const relativeFilePath = `/receipts/${uploadedFile.filename}`;
    
    res.status(200).json({ 
      message: 'Receipt uploaded successfully.',
      path: relativeFilePath 
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return res.status(500).json({ error: 'Failed to upload receipt: ' + (error.message || 'Unknown error') });
  }
});

// API endpoint to upload/update receipt for an existing booking
app.post('/api/upload-receipt', receiptUpload.single('receipt'), async (req, res) => {
  try {
    const { bookingId } = req.body;
    const uploadedFile = req.file;

    if (!bookingId || !uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded or missing booking ID.' });
    }

    console.log('Receipt upload for existing booking:', { 
      bookingId, 
      file: uploadedFile.filename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size
    });

    const relativeFilePath = `/receipts/${uploadedFile.filename}`;

    // Update the booking with the receipt path
    const updateQuery = `UPDATE BookingHistory SET receipt_path = ? WHERE booking_id = ?`;
    db.query(updateQuery, [relativeFilePath, bookingId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update receipt information.' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      
      res.status(200).json({ 
        message: 'Receipt uploaded successfully.',
        path: relativeFilePath 
      });
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return res.status(500).json({ error: 'Failed to upload receipt: ' + (error.message || 'Unknown error') });
  }
});



// Get booking history
app.get('/api/booking-history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const query = `
  SELECT
    bh.booking_id,
    bh.user_id,
    bh.facility_id,
    bh.schedule_id,
    bh.booking_date,
    bh.status,
    bh.cost,
    bh.receipt_path,
    bh.operator_email,
    bh.billing_address,
    bh.gst_number,
    bh.utr_number,
    bh.transaction_date,
    f.name as facility_name,
    fs.start_time,
    fs.end_time,
    GROUP_CONCAT(
      JSON_OBJECT(
        'bifurcation_name', fb.bifurcation_name,
        'sample_count', bb.sample_count,
        'pricing_type', fb.pricing_type
      )
    ) as bifurcations
  FROM
    BookingHistory bh
  INNER JOIN
    Facilities f ON bh.facility_id = f.id
  INNER JOIN
    FacilitySchedule fs ON bh.schedule_id = fs.schedule_id
  LEFT JOIN
    BookingBifurcations bb ON bh.booking_id = bb.booking_id
  LEFT JOIN
    facility_bifurcations fb ON bb.bifurcation_id = fb.id
  WHERE
    bh.user_id = ?
  GROUP BY
    bh.booking_id
  ORDER BY 
    bh.booking_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching booking history.');
    }
    
    const formattedResults = results.map(booking => ({
      ...booking,
      facility_name: booking.facility_name,
      slot: `${booking.start_time} - ${booking.end_time}`,
      bifurcations: booking.bifurcations ? JSON.parse(`[${booking.bifurcations}]`) : []
    }));
    
    res.json(formattedResults);
  });
});


app.get('/api/booking-requests', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      bh.user_id,
      u.full_name AS user_name,
      u.user_type,
      u.email AS user_email,
      bh.facility_id,
      f.name AS facility_name,
      bh.booking_date,
      bh.status,
      bh.cost,
      bh.schedule_id,
      bh.booking_id,
      bh.receipt_path,
      bh.billing_address,
      bh.gst_number,
      bh.utr_number,
      bh.transaction_date,
      GROUP_CONCAT(
        JSON_OBJECT(
          'bifurcation_name', fb.bifurcation_name,
          'sample_count', bb.sample_count,
          'pricing_type', fb.pricing_type
        )
      ) as bifurcations
    FROM 
      BookingHistory bh
    JOIN 
      Users u ON bh.user_id = u.user_id
    JOIN 
      Facilities f ON bh.facility_id = f.id
    LEFT JOIN
      BookingBifurcations bb ON bh.booking_id = bb.booking_id
    LEFT JOIN
      facility_bifurcations fb ON bb.bifurcation_id = fb.id
    WHERE 
      bh.operator_email = ?
    GROUP BY
      bh.booking_id
  `;

  db.query(query, [req.query.operatorEmail], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching booking history.');
    }

    // Parse the bifurcations JSON string into an array
    const formattedResults = results.map(booking => ({
      ...booking,
      bifurcations: booking.bifurcations ? JSON.parse(`[${booking.bifurcations}]`) : []
    }));

    res.status(200).json(formattedResults);
  });
});

app.post('/api/handle-booking', authenticateToken, (req, res) => {
  const { bookingId, action } = req.body;
  
  // First, check if the booking belongs to an Internal user
  const checkUserQuery = `
    SELECT u.user_type 
    FROM BookingHistory bh 
    JOIN Users u ON bh.user_id = u.user_id 
    WHERE bh.booking_id = ?
  `;
  
  db.query(checkUserQuery, [bookingId], (err, userResult) => {
    if (err) {
      console.error('Error checking user type:', err);
      return res.status(500).json({ message: "Booking action failed" });
    }
    
    if (userResult.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const userType = userResult[0].user_type;
    
    // If user is Internal, prevent operator from accepting/declining
    if (userType === 'Internal') {
      return res.status(403).json({ 
        message: "Cannot modify booking status for Internal users. These bookings require supervisor approval." 
      });
    }
    
    // Proceed with normal booking action for non-Internal users
    const updateQuery = `UPDATE BookingHistory SET status = ? WHERE booking_id = ?`;
    db.query(updateQuery, [action, bookingId], (err, result) => {
      if (err) return res.status(500).json({ message: "Booking action failed" });
      res.json({ message: "Booking action successful" });
    });
  });
});

app.get('/api/getsliderimages', (req, res) => {
  const query = 'SELECT * FROM heroImages';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching slider images' });
    } else {
      res.json(result);
    }
  });
});

app.get('/api/getthought', (req, res) => {
  const query = 'SELECT * FROM Thought';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching thought' });
    } else {
      res.json(result);
    }
  });
});

app.get('/api/getnews', (req, res) => {
  const query = 'SELECT * FROM heroNews';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching news' });
    }
    res.json(result);
  });
});

app.get("/api/members", (req, res) => {
  db.query("SELECT * FROM Members", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/api/staff", (req, res) => {
  db.query("SELECT * FROM staff", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM Categories", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  db.query(
    "INSERT INTO Categories (name, description) VALUES (?, ?)",
    [name, description || ""],
    (err, results) => {
      if (err) {
        console.error('Error adding category:', err);
        return res.status(500).json({ error: "Error adding category" });
      }
      res.status(201).json({ 
        message: "Category added successfully",
        categoryId: results.insertId 
      });
    }
  );
});

app.put("/api/categories/:id", (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  db.query(
    "UPDATE Categories SET name = ?, description = ? WHERE id = ?",
    [name, description || "", categoryId],
    (err, results) => {
      if (err) {
        console.error('Error updating category:', err);
        return res.status(500).json({ error: "Error updating category" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json({ message: "Category updated successfully" });
    }
  );
});

app.delete("/api/categories/:id", (req, res) => {
  const categoryId = req.params.id;

  // Check if category is being used by any facilities
  db.query(
    "SELECT COUNT(*) as count FROM Facilities WHERE category_id = ?",
    [categoryId],
    (err, results) => {
      if (err) {
        console.error('Error checking category usage:', err);
        return res.status(500).json({ error: "Error checking category usage" });
      }
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          error: "Cannot delete category. It is being used by one or more facilities." 
        });
      }
      
      // If not used, proceed with deletion
      db.query(
        "DELETE FROM Categories WHERE id = ?",
        [categoryId],
        (err, results) => {
          if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: "Error deleting category" });
          }
          
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
          }
          
          res.json({ message: "Category deleted successfully" });
        }
      );
    }
  );
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

app.post("/api/staff", upload.single("image"), (req, res) => {
  const { name, designation, phone, email, office_address, qualification } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO staff (name, designation, phone, email, office_address, qualification, image_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, designation, phone, email, office_address, qualification, imagePath],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(201).send("New Staff Member added successfully.");
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

app.delete('/api/staff/:id', (req, res) => {
  const memberId = req.params.id;

  const query = 'DELETE FROM staff WHERE id = ?';
  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error('Error deleting staff member:', err);
      res.status(500).send('Error deleting staff member');
    } else {
      res.status(200).send('Staff member deleted successfully');
    }
  });
});

// PUT endpoint to update a member
app.put("/api/members/:id", upload.single("image"), (req, res) => {
  const memberId = req.params.id;
  const { name, designation, profileLink } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  let query, params;
  
  if (imagePath) {
    // If new image is uploaded, update with new image
    query = "UPDATE Members SET name = ?, designation = ?, profile_link = ?, image_path = ? WHERE id = ?";
    params = [name, designation, profileLink, imagePath, memberId];
  } else {
    // If no new image, keep existing image
    query = "UPDATE Members SET name = ?, designation = ?, profile_link = ? WHERE id = ?";
    params = [name, designation, profileLink, memberId];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error updating member:', err);
      return res.status(500).send('Error updating member');
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).send('Member not found');
    }
    
    res.status(200).send('Member updated successfully');
  });
});

// PUT endpoint to update a staff member
app.put("/api/staff/:id", upload.single("image"), (req, res) => {
  const staffId = req.params.id;
  const { name, designation, phone, email, office_address, qualification } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  let query, params;
  
  if (imagePath) {
    // If new image is uploaded, update with new image
    query = "UPDATE staff SET name = ?, designation = ?, phone = ?, email = ?, office_address = ?, qualification = ?, image_name = ? WHERE id = ?";
    params = [name, designation, phone, email, office_address, qualification, imagePath, staffId];
  } else {
    // If no new image, keep existing image
    query = "UPDATE staff SET name = ?, designation = ?, phone = ?, email = ?, office_address = ?, qualification = ? WHERE id = ?";
    params = [name, designation, phone, email, office_address, qualification, staffId];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error updating staff member:', err);
      return res.status(500).send('Error updating staff member');
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).send('Staff member not found');
    }
    
    res.status(200).send('Staff member updated successfully');
  });
});


// API endpoint to get details of a single facility
app.get('/api/facility/:id', (req, res) => {
  const facilityId = req.params.id;
  const query = `
    SELECT 
      f.id,
      f.name,
      f.description,
      f.specifications,
      f.usage_details,
      f.image_url,
      f.make_year,
      f.model,
      f.manufacturer,
      f.faculty_in_charge,
      f.faculty_contact,
      f.faculty_email,
      f.operator_name,
      f.operator_contact,
      f.operator_email,
      f.special_note,
      c.name AS category_name,
      p.id AS publication_id,
      p.title AS publication_title,
      p.link AS publication_link
    FROM 
      Facilities f
    LEFT JOIN 
      Categories c ON f.category_id = c.id
    LEFT JOIN 
      facility_publications fp ON f.id = fp.facility_id
    LEFT JOIN 
      Publications p ON fp.publication_id = p.id
    WHERE 
      f.id = ?;
  `;

  db.query(query, [facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching facility details:', err);
      return res.status(500).send('Error fetching facility details');
    }

    if (results.length === 0) {
      return res.status(404).send('Facility not found');
    }

    const facility = results[0];
    // Filter out the rows with publication data and map them into an array
    const publications = results
      .filter(row => row.publication_title) // Filter rows where publication details exist
      .map(row => ({
        id: row.publication_id,
        title: row.publication_title,
        link: row.publication_link,
      }));

    facility.publications = publications;
    res.json(facility);
  });
});

// API endpoint to fetch all publications
app.get('/api/publications', (req, res) => {
  const query = `
    SELECT 
      id, title, link 
    FROM 
      Publications
    ORDER BY 
      id DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching publications:', err);
      res.status(500).send('Error fetching publications');
    } else {
      res.json(results); // Send the publications data
    }
  });
});

app.get('/api/aboutContent', (req, res) => {
  res.sendFile(path.join(__dirname, 'aboutContent.json'));
});

// app.post('/api/saveAboutContent', (req, res) => {
//   const aboutContent = req.body;

//   // Save the updated about content to a JSON file
//   fs.writeFile(path.join(__dirname, 'aboutContent.json'), JSON.stringify(aboutContent, null, 2), (err) => {
//     if (err) {
//       console.error('Error saving about content:', err);
//       res.status(500).send('Error saving about content');
//     } else {
//       res.send('About content saved successfully');
//     }
//   });
// });

app.post('/api/saveAboutContent', upload.single('image'),authenticateToken,(req, res) => {
  try {
    // console.log(req.body);
    const content = JSON.parse(req.body.content); // parse JSON string

    // If a new image is uploaded, update the image path
    if (req.file) {
      content.departmentIntro.image = `/uploads/${req.file.filename}`;
    }

    const filePath = path.join(__dirname, 'aboutContent.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    
    return res.status(200).json({ message: 'Content saved successfully' });
  } catch (error) {
    console.error('Error saving about content:', error);
    return res.status(500).json({ message: 'Failed to save about content' });
  }
});
// get available slots for a facility on a particular date
function getWeekday(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

app.get("/api/slots", authenticateToken, async (req, res) => {
  const { facility_id, date } = req.query;
  
  // Get user type and user ID from JWT token (already decoded by authenticateToken middleware)
  const userType = req.user.userType;
  const userId = req.user.userId;

  // Check if the facility can be available on that weekday and find the number of slots
  const day = getWeekday(date);

  let checkSlotsQuery;
  let queryParams;

  // Special logic for internal users
  if (userType === 'Internal') {
    // Check if this user is a superuser for this specific facility
    const superuserCheckQuery = `
      SELECT isSuperUser, super_facility 
      FROM InternalUsers 
      WHERE user_id = ?
    `;
    
    try {
      const [superuserResult] = await db.promise().query(superuserCheckQuery, [userId]);
      
      if (superuserResult.length > 0) {
        const user = superuserResult[0];
        
        if (user.isSuperUser === 'Y' && user.super_facility == facility_id) {
          // Superuser: only show SuperUser slots for their facility
          checkSlotsQuery = `
            SELECT schedule_id, start_time, end_time, total_slots, user_type
            FROM facilityschedule 
            WHERE facility_id = ? AND weekday = ? AND user_type = 'SuperUser' AND status = 'Valid'
          `;
          queryParams = [facility_id, day];
        } else {
          // Regular internal user: show Internal slots for all facilities
          checkSlotsQuery = `
            SELECT schedule_id, start_time, end_time, total_slots, user_type
            FROM facilityschedule 
            WHERE facility_id = ? AND weekday = ? AND user_type = 'Internal' AND status = 'Valid'
          `;
          queryParams = [facility_id, day];
        }
      } else {
        // Regular internal user: show Internal slots for all facilities
        checkSlotsQuery = `
          SELECT schedule_id, start_time, end_time, total_slots, user_type
          FROM facilityschedule 
          WHERE facility_id = ? AND weekday = ? AND user_type = 'Internal'
        `;
        queryParams = [facility_id, day];
      }
    } catch (err) {
      console.error("Error checking superuser status:", err);
      return res.status(500).send("Error checking user status");
    }
  } else {
    // Non-internal users: use their user type as before
    checkSlotsQuery = `
      SELECT schedule_id, start_time, end_time, total_slots, user_type
      FROM facilityschedule 
      WHERE facility_id = ? AND weekday = ? AND user_type = ? AND status = 'Valid'
    `;
    queryParams = [facility_id, day, userType];
  }

  try {
    // Using await to fetch total slots for the appropriate user type
    const [totalSlots] = await db.promise().query(checkSlotsQuery, queryParams);

    // Check if any slots are already booked
    const checkBookedSlotsQuery = `
      SELECT schedule_id, status 
      FROM bookinghistory 
      WHERE facility_id = ? AND booking_date = ?
    `;

    // Using await to fetch booked slots
    const [bookedSlots] = await db
      .promise()
      .query(checkBookedSlotsQuery, [facility_id, date]);

    // Extract schedule_ids of booked slots
    const bookedSlotIds = bookedSlots
      .filter((slot) => slot.status === "Approved")
      .map((slot) => slot.schedule_id);

    // Add 'available' field to each slot, indicating whether the slot is available for booking
    const slotsWithAvailability = totalSlots.map((slot) => ({
      ...slot,
      available: !bookedSlotIds.includes(slot.schedule_id),
    }));

    // Return all slots with the 'available' field
    return res.status(200).json({ slots: slotsWithAvailability });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Error fetching slots");
  }
});


app.post("/api/publications", (req, res) => {
  const { title, link, facility_id } = req.body;
  if (!title || !link) {
    return res.status(400).json({ error: "Title and link are required" });
  }

  db.query(
    "INSERT INTO Publications (title, link, facility_id) VALUES (?, ?, ?)",
    [title, link, facility_id],
    (err, result) => {
      if (err) {
        console.error("Error adding publication:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ id: result.insertId, title, link, facility_id });
    }
  );
});

// Update a publication
app.put("/api/publications/:id", (req, res) => {
  const { id } = req.params;
  const { title, link, facility_id } = req.body;

  if (!title || !link) {
    return res.status(400).json({ error: "Title and link are required" });
  }

  db.query(
    "UPDATE Publications SET title = ?, link = ?, facility_id = ? WHERE id = ?",
    [title, link, facility_id, id],
    (err, result) => {
      if (err) {
        console.error("Error updating publication:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Publication not found" });
      }

      res.json({ message: "Publication updated successfully" });
    }
  );
});

// Delete a publication
app.delete("/api/publications/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Publications WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting publication:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Publication not found" });
    }

    res.status(204).send(); // No content
  });
});

const resultsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/results'); // Directory for result uploads
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Create a multer upload instance specifically for results
const resultsUpload = multer({ storage: resultsStorage });
app.post('/api/upload-results', authenticateToken, resultsUpload.single('file'), async (req, res) => {
  const { bookingId, resultDate } = req.body;
  // const resultFilePath = req.file ? req.file.path : null;
  const uploadedFile = req.file;
  // Validate inputs
  if (!bookingId || !resultDate || !uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded or missing required fields.' });
  }
  const relativeFilePath = `/results/${uploadedFile.filename}`;
  // Fetch user_id from BookingHistory using bookingId
  const fetchUserQuery = `SELECT user_id FROM BookingHistory WHERE booking_id = ?`;
  db.query(fetchUserQuery, [bookingId], (err, results) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).json({ error: 'Failed to fetch user ID.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No booking found with the provided booking ID.' });
    }

    const userId = results[0].user_id;

    // Insert into results table
    const insertResultQuery = `
        INSERT INTO results (user_id, booking_id, result_date, result_file_path)
        VALUES (?, ?, ?, ?)
      `;
    db.query(insertResultQuery, [userId, bookingId, resultDate, relativeFilePath], (err) => {
      if (err) {
        console.error('Error inserting result:', err);
        return res.status(500).json({ error: 'Failed to upload results.' });
      }

      res.status(200).json({ message: 'Results uploaded successfully.' });
    });
  });
});

app.get('/api/results/:userId/:bookingId', authenticateToken, (req, res) => {
  const { userId, bookingId } = req.params;
  const query = `
    SELECT 
      booking_id, 
      result_file_path, 
      result_date 
    FROM 
      results 
    WHERE 
      user_id = ? AND 
      booking_id = ? 
    ORDER BY 
      result_date DESC 
    LIMIT 1
  `;

  db.query(query, [userId, bookingId], (err, results) => {
    if (err) {
      console.error('Error fetching results:', err);
      return res.status(500).json({ error: 'Error fetching results' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }
    res.json(results[0]);
  });
});

const pubStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/publications'); // Directory for result uploads
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Create a multer upload instance specifically for results
const pubUploads = multer({ storage: pubStorage });

app.post('/api/add-publication', authenticateToken, pubUploads.single('file'), (req, res) => {
  const {
    author_name,
    title_of_paper,
    journal_name,
    volume_number,
    year,
    page_number,
    userId,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Publication file is required.' });
  }

  // Save relative path (e.g., publications/filename.zip) instead of absolute path
  const file_path = `publications/${req.file.filename}`;

  const query = `INSERT INTO User_Publications (author_name, title_of_paper, journal_name, volume_number, year, page_number, file_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [author_name, title_of_paper, journal_name, volume_number, year, page_number, file_path, userId];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error adding publication:', error);
      return res.status(500).json({ error: 'Failed to add publication.' });
    }

    res.status(201).json({ message: 'Publication added successfully' });
  });
});

app.delete('/api/delete-publication/:publicationId', authenticateToken, (req, res) => {
  const { publicationId } = req.params;

  const query = `DELETE FROM User_Publications WHERE publication_id = ?`;

  db.query(query, [publicationId], (error, result) => {
    if (error) {
      console.error('Error deleting publication:', error);
      return res.status(500).json({ error: 'Failed to delete publication.' });
    }

    res.json({ message: 'Publication deleted successfully' });
  });
});

app.get('/api/get-publications/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `SELECT * FROM User_Publications WHERE user_id = ?`;

  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching publications:', error);
      return res.status(500).json({ error: 'Failed to fetch publications.' });
    }

    res.json(results);
  });
});

app.post('/api/add-operator', authenticateToken, (req, res) => {
  const { operatorId, password } = req.body;
  const Position = 'Operator';
  // Validate input
  if (!operatorId || !password) {
    return res.status(400).json({ error: 'Operator ID and password are required' });
  }

  // SQL query to insert the operator into the table
  const sql = 'INSERT INTO management_cred (email, pass, Position) VALUES (?, ?, ?)';

  db.query(sql, [operatorId, password, Position], (err, result) => {
    if (err) {
      console.error('Error inserting operator into database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Operator added successfully', operatorId });
  });
});

app.get('/api/weekly-slots', authenticateToken, (req, res) => {
  const { facilityId } = req.query;  // Changed from operatorId to facilityId

  if (!facilityId) {
    return res.status(400).json({ message: 'Facility ID is required' });
  }

  // Get user type and user ID from JWT token (already decoded by authenticateToken middleware)
  const userType = req.user.userType;
  const userId = req.user.userId;

  // Query to fetch the selected facility
  db.query('SELECT id, name FROM facilities WHERE id = ?', [facilityId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch facility' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const facility = rows[0];  // Assuming only one facility is returned

    // Special logic for internal users
    if (userType === 'Internal') {
      // Check if this user is a superuser for this specific facility
      const superuserCheckQuery = `
        SELECT isSuperUser, super_facility 
        FROM InternalUsers 
        WHERE user_id = ?
      `;
      
      db.query(superuserCheckQuery, [userId], (err2, superuserResult) => {
        if (err2) {
          console.error("Error checking superuser status:", err2);
          return res.status(500).json({ message: 'Failed to check user status' });
        }
        
        let scheduleQuery;
        let queryParams;
        
        if (superuserResult.length > 0) {
          const user = superuserResult[0];
          
          if (user.isSuperUser === 'Y' && user.super_facility == facilityId) {
            // Superuser: only show SuperUser slots for their facility
            scheduleQuery = 'SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND user_type = "SuperUser" AND status = "Valid"';
            queryParams = [facility.id];
          } else {
            // Regular internal user: show Internal slots for all facilities
            scheduleQuery = 'SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND user_type = "Internal" AND status = "Valid"';
            queryParams = [facility.id];
          }
        } else {
          // Regular internal user: show Internal slots for all facilities
          scheduleQuery = 'SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND user_type = "Internal"';
          queryParams = [facility.id];
        }
        
        // Query to fetch the schedule for the selected facility and appropriate user type
        db.query(scheduleQuery, queryParams, (err3, schedule) => {
          if (err3) {
            console.error(err3);
            return res.status(500).json({ message: 'Failed to fetch schedule' });
          }

          const slots = schedule.reduce((acc, { weekday, start_time, end_time }) => {
            if (!acc[weekday]) acc[weekday] = [];
            acc[weekday].push({ start_time, end_time });
            return acc;
          }, {});

          // Return the facility with its corresponding slots
          res.json({
            facility: {
              id: facility.id,
              name: facility.name,
              slots: slots,
            },
          });
        });
      });
    } else {
      // Non-internal users: use their user type as before
      db.query('SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND user_type = ? AND status = "Valid"', [facility.id, userType], (err2, schedule) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: 'Failed to fetch schedule' });
        }

        const slots = schedule.reduce((acc, { weekday, start_time, end_time }) => {
          if (!acc[weekday]) acc[weekday] = [];
          acc[weekday].push({ start_time, end_time });
          return acc;
        }, {});

        // Return the facility with its corresponding slots
        res.json({
          facility: {
            id: facility.id,
            name: facility.name,
            slots: slots,
          },
        });
      });
    }
  });
});

// Fetch facilities and their slots for an operator
app.get('/facilities/slots', authenticateToken, (req, res) => {
  const { operatorId } = req.query;

  if (!operatorId) {
    return res.status(400).json({ message: 'Operator ID is required' });
  }

  db.query('SELECT id, name FROM facilities WHERE operator_email = ?', [operatorId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch facilities' });
    }

    const facilities = [];
    let pending = rows.length;

    if (pending === 0) {
      return res.json(facilities);
    }

    rows.forEach((facility) => {
      db.query('SELECT weekday, start_time, end_time FROM facilityschedule WHERE facility_id = ?', [facility.id], (err, schedule) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to fetch schedule' });
        }

        const slots = schedule.reduce((acc, { weekday, start_time, end_time }) => {
          if (!acc[weekday]) acc[weekday] = [];
          acc[weekday].push({ start_time, end_time });
          return acc;
        }, {});

        facilities.push({ ...facility, slots });

        if (--pending === 0) {
          res.json(facilities);
        }
      });
    });
  });
});

// Fetch facilities and their slots for admin with user type filtering
app.get('/admin/facilities/slots', authenticateToken, (req, res) => {
  db.query('SELECT id, name FROM facilities', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch facilities' });
    }

    const facilities = [];
    let pending = rows.length;

    if (pending === 0) {
      return res.json(facilities);
    }

    rows.forEach((facility) => {
      db.query('SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND status = "Valid"', [facility.id], (err, schedule) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to fetch schedule' });
        }

        const slots = schedule.reduce((acc, { weekday, start_time, end_time, user_type }) => {
          if (!acc[weekday]) acc[weekday] = [];
          acc[weekday].push({ start_time, end_time, user_type });
          return acc;
        }, {});

        facilities.push({ ...facility, slots });

        if (--pending === 0) {
          res.json(facilities);
        }
      });
    });
  });
});

// Fetch slots for a specific facility and user type
app.get('/admin/facilities/slots/:facilityId/:userType', authenticateToken, (req, res) => {
  const { facilityId, userType } = req.params;

  if (!facilityId || !userType) {
    return res.status(400).json({ message: 'Facility ID and user type are required' });
  }

  db.query('SELECT weekday, start_time, end_time, user_type FROM facilityschedule WHERE facility_id = ? AND user_type = ? AND status = "Valid"', [facilityId, userType], (err, schedule) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch schedule' });
    }

    const slots = schedule.reduce((acc, { weekday, start_time, end_time, user_type }) => {
      if (!acc[weekday]) acc[weekday] = [];
      acc[weekday].push({ start_time, end_time, user_type });
      return acc;
    }, {});

    res.json({ slots });
  });
});

// Add a new slot
app.post('/operator/slots', authenticateToken, (req, res) => {
  const { facilityId, weekday, start_time, end_time, operatorId } = req.body;

  if (!facilityId || !weekday || !start_time || !end_time || !operatorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.query('SELECT operator_email FROM facilities WHERE id = ?', [facilityId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to validate facility' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (rows[0].operator_email !== operatorId) {
      return res.status(403).json({ message: 'Unauthorized access to this facility' });
    }

    db.query(
      'INSERT INTO facilityschedule (facility_id, weekday, start_time, end_time, status) VALUES (?, ?, ?, ?, "Valid")',
      [facilityId, weekday, start_time, end_time],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to add slot' });
        }

        res.json({ message: 'Slot added successfully' });
      }
    );
  });
});

// Operator deprecate slot endpoint (marks slot as deprecated instead of deleting)
app.delete('/operator/slots', authenticateToken, (req, res) => {
  const { facilityId, weekday, slot, operatorId } = req.body;

  if (!facilityId || !weekday || !slot || !operatorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.query('SELECT operator_email FROM facilities WHERE id = ?', [facilityId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to validate facility' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    if (rows[0].operator_email !== operatorId) {
      return res.status(403).json({ message: 'Unauthorized access to this facility' });
    }

    db.query(
      'UPDATE facilityschedule SET status = "Deprecated" WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ?',
      [facilityId, weekday, slot.start_time, slot.end_time],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to deprecate slot' });
        }
        res.json({ message: 'Slot deprecated successfully' });
      }
    );
  });
});



// Admin add slot endpoint
app.post('/admin/slots', authenticateToken, (req, res) => {

  const { facilityId, weekday, start_time, end_time, user_type } = req.body;

  if (!facilityId || !weekday || !start_time || !end_time || !user_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate facility exists
  db.query('SELECT id FROM facilities WHERE id = ?', [facilityId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to validate facility' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check if slot already exists for this user type (only Valid slots)
    db.query(
      'SELECT schedule_id FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ? AND user_type = ? AND status = "Valid"',
      [facilityId, weekday, start_time, end_time, user_type],
      (err, existingSlots) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to check existing slots' });
        }

        if (existingSlots.length > 0) {
          return res.status(400).json({ message: 'Slot already exists for this time period and user type' });
        }

        // Add the new slot with Valid status
        db.query(
          'INSERT INTO facilityschedule (facility_id, weekday, start_time, end_time, user_type, status) VALUES (?, ?, ?, ?, ?, "Valid")',
          [facilityId, weekday, start_time, end_time, user_type],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Failed to add slot' });
            }

            res.json({ message: 'Slot added successfully' });
          }
        );
      }
    );
  });
});

// Admin deprecate slot endpoint (marks slot as deprecated instead of deleting)
app.delete('/admin/slots', authenticateToken, (req, res) => {

  const { facilityId, weekday, slot } = req.body;

  if (!facilityId || !weekday || !slot) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate facility exists
  db.query('SELECT id FROM facilities WHERE id = ?', [facilityId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to validate facility' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Get the slot details to find the user_type and mark as deprecated
    db.query(
      'SELECT user_type FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ? AND status = "Valid"',
      [facilityId, weekday, slot.start_time, slot.end_time],
      (err, slotResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to get slot details' });
        }

        if (slotResults.length === 0) {
          return res.status(404).json({ message: 'Slot not found' });
        }

        const userType = slotResults[0].user_type;

        // Mark the slot as deprecated instead of deleting
        // This preserves existing bookings while hiding the slot from users
        db.query(
          'UPDATE facilityschedule SET status = "Deprecated" WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ? AND user_type = ? AND status = "Valid"',
          [facilityId, weekday, slot.start_time, slot.end_time, userType],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Failed to deprecate slot' });
            }
            res.json({ message: 'Slot deprecated successfully' });
          }
        );
      }
    );
  });
});





app.get('/api/user-history/:userId', authenticateToken, (req, res) => {
  // console.log("Hellooo", req.params);
  const { userId } = req.params;

  // Query to fetch booking history along with facility name and schedule details
  const query = `
    SELECT 
      bh.booking_id,
      f.name AS facility_name,
      fs.start_time,
      fs.end_time,
      bh.status,
      bh.booking_date
    FROM bookinghistory bh
    JOIN facilities f ON bh.facility_id = f.id
    JOIN facilityschedule fs ON bh.schedule_id = fs.schedule_id
    WHERE bh.user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch booking history' });
    }

    res.json(results);
  });
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post('/api/change-booking-status', authenticateToken, (req, res) => {
  const { bookingId, newStatus } = req.body;
  
  // First check if the booking exists and has a non-Pending status
  const checkQuery = `SELECT status FROM BookingHistory WHERE booking_id = ?`;
  
  db.query(checkQuery, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error checking booking status" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const currentStatus = results[0].status;
    if (currentStatus === 'Pending') {
      return res.status(400).json({ message: "Cannot change status of pending bookings. Use handle-booking endpoint instead." });
    }
    
    // Update the booking status
    const updateQuery = `UPDATE BookingHistory SET status = ? WHERE booking_id = ?`;
    db.query(updateQuery, [newStatus, bookingId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error updating booking status" });
      }
      res.json({ message: "Booking status updated successfully" });
    });
  });
});

app.delete('/api/admin/operators/:email', authenticateToken, (req, res) => {
  const { email } = req.params;

  // First check if the operator has any active bookings
  const checkBookingsQuery = `
    SELECT COUNT(*) as bookingCount 
    FROM BookingHistory 
    WHERE operator_email = ? AND status = 'Approved'
  `;

  db.query(checkBookingsQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking bookings:', err);
      return res.status(500).json({ message: 'Error checking operator bookings' });
    }

    if (results[0].bookingCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete operator with active bookings. Please handle all bookings first.' 
      });
    }

    // If no active bookings, proceed with deletion
    const deleteQuery = 'DELETE FROM management_cred WHERE email = ? AND Position = "Operator"';
    
    db.query(deleteQuery, [email], (err, result) => {
      if (err) {
        console.error('Error deleting operator:', err);
        return res.status(500).json({ message: 'Error deleting operator' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Operator not found' });
      }

      res.json({ message: 'Operator deleted successfully' });
    });
  });
});

// API to get all unique departments from Supervisor table
app.get('/api/departments', (req, res) => {
  const query = 'SELECT DISTINCT department_name FROM supervisor ORDER BY department_name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }
    res.json(results.map(r => r.department_name));
  });
});

// API to get all supervisors for a department
app.get('/api/supervisors', (req, res) => {
  const { department } = req.query;
  if (!department) {
    return res.status(400).json({ error: 'Department is required' });
  }

  const query = 'SELECT id, name, email FROM Supervisor WHERE department_name = ? ORDER BY name';
  db.query(query, [department], (err, results) => {
    if (err) {
      console.error('Error fetching supervisors:', err);
      return res.status(500).json({ error: 'Failed to fetch supervisors' });
    }
    res.json(results);
  });
});

// Supervisor verification endpoint
app.get('/api/supervisor-verify', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Invalid verification link.');
  db.query('SELECT user_id FROM SupervisorVerifications WHERE token = ?', [token], (err, results) => {
    if (err || !results.length) return res.status(400).send('Invalid or expired verification link.');
    const user_id = results[0].user_id;
    db.query('UPDATE Users SET verified = "YES" WHERE user_id = ?', [user_id], (err2) => {
      if (err2) return res.status(500).send('Failed to verify user.');
      // Optionally, delete the token row
      db.query('DELETE FROM SupervisorVerifications WHERE token = ?', [token], (err3) => {
        if (err3) console.error('Failed to delete verification token:', err3);
        res.send('<h2>User has been successfully verified by supervisor.</h2>');
      });
    });
  });
});

// Get user info for supervisor verification (no verification yet)
app.get('/api/supervisor-verify-info', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Invalid verification link.' });
  db.query('SELECT user_id FROM SupervisorVerifications WHERE token = ?', [token], (err, results) => {
    if (err || !results.length) return res.status(400).json({ error: 'Invalid or expired verification link.' });
    const user_id = results[0].user_id;
    db.query('SELECT full_name, email, user_type, org_name, contact_number FROM Users WHERE user_id = ?', [user_id], (err2, userRes) => {
      if (err2 || !userRes.length) return res.status(400).json({ error: 'User not found.' });
      res.json({ ...userRes[0], user_id });
    });
  });
});

// Supervisor confirms verification (POST)
app.post('/api/supervisor-verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Invalid verification link.' });
  db.query('SELECT user_id FROM SupervisorVerifications WHERE token = ?', [token], (err, results) => {
    if (err || !results.length) return res.status(400).json({ error: 'Invalid or expired verification link.' });
    const user_id = results[0].user_id;
    db.query('UPDATE Users SET verified = ? WHERE user_id = ?', ['YES', user_id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to verify user.' });
      db.query('DELETE FROM SupervisorVerifications WHERE token = ?', [token], (err3) => {
        if (err3) console.error('Failed to delete verification token:', err3);
        res.json({ message: 'User has been successfully verified by supervisor.' });
      });
    });
  });
});

// Get booking details for supervisor approval
app.get('/api/supervisor-booking-info', (req, res) => {
  const { booking_id, token } = req.query;
  
  console.log('Supervisor booking info request:', { booking_id, token });
  
  if (!booking_id || !token) {
    return res.status(400).json({ error: 'Missing booking_id or token' });
  }
  
  try {
    const decodedToken = Buffer.from(token, 'base64').toString();
    const [bookingId, supervisorEmail] = decodedToken.split(':');
    
    console.log('Decoded token:', { 
      decodedToken, 
      bookingId, 
      supervisorEmail,
      bookingIdType: typeof bookingId,
      bookingIdValue: bookingId,
      requestBookingId: booking_id,
      requestBookingIdType: typeof booking_id,
      requestBookingIdValue: booking_id,
      strictEquality: bookingId === booking_id,
      looseEquality: bookingId == booking_id
    });
    
    // Convert both to strings for comparison to handle type mismatch
    if (String(bookingId) !== String(booking_id)) {
      console.log('Token booking ID mismatch:', { 
        tokenBookingId: bookingId, 
        requestBookingId: booking_id,
        tokenBookingIdType: typeof bookingId,
        requestBookingIdType: typeof booking_id
      });
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Get booking details with user and facility information
    const bookingQuery = `
      SELECT 
        bh.booking_id,
        bh.facility_id,
        bh.booking_date,
        bh.cost,
        u.user_type,
        bh.status,
        u.full_name as user_name,
        u.email as user_email,
        f.name as facility_name,
        s.name as supervisor_name,
        s.email as supervisor_email,
        s.wallet_balance
      FROM BookingHistory bh
      JOIN Users u ON bh.user_id = u.user_id
      JOIN Facilities f ON bh.facility_id = f.id
      JOIN InternalUsers iu ON u.user_id = iu.user_id
      JOIN Supervisor s ON iu.supervisor_id = s.id
      WHERE bh.booking_id = ? AND s.email = ?
    `;
    
    console.log('Querying booking with:', { booking_id, supervisorEmail });
    db.query(bookingQuery, [booking_id, supervisorEmail], (err, results) => {
      if (err) {
        console.error('Error fetching booking info:', err);
        return res.status(500).json({ error: 'Failed to fetch booking information' });
      }
      
      console.log('Booking query results:', results);
      
      if (!results.length) {
        return res.status(404).json({ error: 'Booking not found or unauthorized' });
      }
      
      const bookingData = results[0];
      console.log('Returning booking data:', {
        wallet_balance: bookingData.wallet_balance,
        cost: bookingData.cost,
        wallet_balance_type: typeof bookingData.wallet_balance,
        cost_type: typeof bookingData.cost
      });
      
      res.json(bookingData);
    });
  } catch (error) {
    console.error('Token decode error:', error);
    return res.status(400).json({ error: 'Invalid token format' });
  }
});

// Supervisor approves or rejects booking
app.post('/api/supervisor-booking-approval', (req, res) => {
  const { booking_id, token, action } = req.body;
  
  console.log('Supervisor booking approval request:', { booking_id, token, action });
  
  if (!booking_id || !token || !action) {
    console.log('Missing required parameters:', { booking_id, token, action });
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  if (!['approve', 'reject'].includes(action)) {
    console.log('Invalid action:', action);
    return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
  }
  
  try {
    const decodedToken = Buffer.from(token, 'base64').toString();
    const [bookingId, supervisorEmail] = decodedToken.split(':');
    
    console.log('Decoded token for approval:', { 
      decodedToken, 
      bookingId, 
      supervisorEmail,
      bookingIdType: typeof bookingId,
      bookingIdValue: bookingId,
      requestBookingId: booking_id,
      requestBookingIdType: typeof booking_id,
      requestBookingIdValue: booking_id,
      strictEquality: bookingId === booking_id,
      looseEquality: bookingId == booking_id
    });
    
    // Convert both to strings for comparison to handle type mismatch
    if (String(bookingId) !== String(booking_id)) {
      console.log('Token booking ID mismatch:', { 
        tokenBookingId: bookingId, 
        requestBookingId: booking_id,
        tokenBookingIdType: typeof bookingId,
        requestBookingIdType: typeof booking_id
      });
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Get booking and supervisor information
    const bookingQuery = `
      SELECT 
        bh.booking_id,
        bh.cost,
        bh.user_id,
        u.full_name as user_name,
        u.email as user_email,
        s.id as supervisor_id,
        s.name as supervisor_name,
        s.email as supervisor_email,
        s.wallet_balance
      FROM BookingHistory bh
      JOIN Users u ON bh.user_id = u.user_id
      JOIN InternalUsers iu ON u.user_id = iu.user_id
      JOIN Supervisor s ON iu.supervisor_id = s.id
      WHERE bh.booking_id = ? AND s.email = ?
    `;
    
    console.log('Querying booking for approval with:', { booking_id, supervisorEmail });
    
    db.query(bookingQuery, [booking_id, supervisorEmail], (err, results) => {
      if (err) {
        console.error('Error fetching booking for approval:', err);
        return res.status(500).json({ error: 'Failed to fetch booking information' });
      }
      
      console.log('Booking query results for approval:', results);
      
      if (!results.length) {
        console.log('No booking found for approval');
        return res.status(404).json({ error: 'Booking not found or unauthorized' });
      }
      
      const booking = results[0];
      
      if (action === 'approve') {
        // Check if supervisor has sufficient funds
        console.log('Checking wallet balance for approval:', {
          wallet_balance: booking.wallet_balance,
          cost: booking.cost,
          wallet_balance_type: typeof booking.wallet_balance,
          cost_type: typeof booking.cost,
          comparison: booking.wallet_balance < booking.cost
        });
        
        if (Number(booking.wallet_balance) < Number(booking.cost)) {
          return res.status(400).json({ error: 'Insufficient funds in wallet. Please add funds before approving.' });
        }
        
        // Update booking status and deduct from wallet
        const updateQueries = [
          'UPDATE BookingHistory SET status = "Approved" WHERE booking_id = ?',
          'UPDATE Supervisor SET wallet_balance = wallet_balance - ? WHERE id = ?'
        ];
        
        let completed = 0;
        let hasError = false;
        
        updateQueries.forEach((query, index) => {
          const params = index === 0 ? [booking_id] : [Number(booking.cost), booking.supervisor_id];
          db.query(query, params, (updateErr) => {
            if (updateErr) {
              console.error('Error updating booking/wallet:', updateErr);
              hasError = true;
            }
            completed++;
            
            if (completed === updateQueries.length) {
              if (hasError) {
                return res.status(500).json({ error: 'Failed to approve booking' });
              }
              
              // Send email to user about approval
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
                }
              });
              
              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: booking.user_email,
                subject: 'Your Facility Booking Has Been Approved',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Booking Approved!</h2>
                    <p>Dear ${booking.user_name},</p>
                    <p>Your facility booking request has been approved by your supervisor (${booking.supervisor_name}).</p>
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                      <h3 style="margin-top: 0; color: #10b981;">Booking Details:</h3>
                      <p><strong>Booking ID:</strong> ${booking_id}</p>
                      <p><strong>Cost:</strong> ₹${booking.cost}</p>
                      <p><strong>Status:</strong> Approved</p>
                    </div>
                    <p>The cost has been deducted from your supervisor's wallet balance.</p>
                    <p>Please contact the facility operator for any additional instructions.</p>
                  </div>
                `
              };
              
              transporter.sendMail(mailOptions, (emailErr) => {
                if (emailErr) {
                  console.error('Failed to send approval email:', emailErr);
                }
              });
              
              const newWalletBalance = Number(booking.wallet_balance) - Number(booking.cost);
              console.log('Wallet deduction calculation:', {
                old_balance: booking.wallet_balance,
                cost: booking.cost,
                new_balance: newWalletBalance
              });
              
              res.json({ 
                message: 'Booking approved successfully',
                new_wallet_balance: newWalletBalance
              });
            }
          });
        });
      } else {
        // Reject booking
        db.query('UPDATE BookingHistory SET status = "Cancelled" WHERE booking_id = ?', [booking_id], (updateErr) => {
          if (updateErr) {
            console.error('Error rejecting booking:', updateErr);
            return res.status(500).json({ error: 'Failed to reject booking' });
          }
          
          // Send email to user about rejection
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });
          
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.user_email,
            subject: 'Your Facility Booking Has Been Rejected',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Booking Rejected</h2>
                <p>Dear ${booking.user_name},</p>
                <p>Your facility booking request has been rejected by your supervisor (${booking.supervisor_name}).</p>
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #ef4444;">Booking Details:</h3>
                  <p><strong>Booking ID:</strong> ${booking_id}</p>
                  <p><strong>Cost:</strong> ₹${booking.cost}</p>
                  <p><strong>Status:</strong> Rejected</p>
                </div>
                <p>Please contact your supervisor for more information or submit a new booking request.</p>
              </div>
            `
          };
          
          transporter.sendMail(mailOptions, (emailErr) => {
            if (emailErr) {
              console.error('Failed to send rejection email:', emailErr);
            }
          });
          
          res.json({ message: 'Booking rejected successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Token decode error:', error);
    return res.status(400).json({ error: 'Invalid token format' });
  }
});

// Handle chunk uploads
app.post('/api/upload-chunk', uploadChunk.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.body.fileId || !req.body.chunk || !req.body.totalChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { fileId, chunk, totalChunks } = req.body;
    const originalExt = path.extname(req.file.originalname);
    const chunkPath = path.join(tempDir, `${fileId}_chunk_${chunk}${originalExt}`);
    
    // Ensure the chunk was saved successfully
    if (!fs.existsSync(req.file.path)) {
      throw new Error(`Failed to save chunk ${chunk}`);
    }

    // If this is the last chunk, combine all chunks
    if (parseInt(chunk) === parseInt(totalChunks) - 1) {
      const finalPath = path.join(uploadsDir, `${fileId}${originalExt}`);
      const writeStream = fs.createWriteStream(finalPath);
      
      // Combine all chunks
      for (let i = 0; i < totalChunks; i++) {
        const currentChunkPath = path.join(tempDir, `${fileId}_chunk_${i}${originalExt}`);
        if (!fs.existsSync(currentChunkPath)) {
          throw new Error(`Chunk ${i} not found. Please try uploading again.`);
        }
        const chunkData = fs.readFileSync(currentChunkPath);
        writeStream.write(chunkData);
        // Delete the chunk file after reading
        fs.unlinkSync(currentChunkPath);
      }
      
      writeStream.end();
      
      // Wait for the write stream to finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      res.json({ 
        success: true, 
        filePath: `${fileId}${originalExt}`,
        message: 'File upload completed successfully'
      });
    } else {
      // For non-final chunks, just acknowledge receipt
      res.json({ 
        success: true, 
        message: 'Chunk uploaded successfully' 
      });
    }
  } catch (error) {
    console.error('Error handling chunk upload:', error);
    // Clean up any temporary files if there's an error
    try {
      const { fileId } = req.body;
      if (fileId) {
        const originalExt = path.extname(req.file.originalname);
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          if (file.startsWith(`${fileId}_chunk_`)) {
            fs.unlinkSync(path.join(tempDir, file));
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
    
    res.status(500).json({ 
      error: 'Failed to process chunk upload',
      details: error.message 
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, contactNumber, query } = req.body;

    // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ContactUsAdminEmail,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact Number:</strong> ${contactNumber || 'Not provided'}</p>
        <p><strong>Query:</strong></p>
        <p>${query}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Error sending contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send feedback. Please try again.' 
    });
  }
});

// API endpoint to get facility bifurcations
app.get('/api/facility/:id/bifurcations', (req, res) => {
  const facilityId = req.params.id;
  const query = `
    SELECT 
      id,
      bifurcation_name,
      pricing_type,
      price_internal,
      price_internal_consultancy,
      price_external,
      price_industry
    FROM 
      facility_bifurcations
    WHERE 
      facility_id = ?
  `;

  db.query(query, [facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching facility bifurcations:', err);
      return res.status(500).json({ error: 'Error fetching facility bifurcations' });
    }
    res.json(results);
  });
});

// Add new endpoint to handle booking bifurcations
app.post('/api/booking-bifurcations', authenticateToken, (req, res) => {
  const { booking_id, bifurcations } = req.body;
  
  console.log('Received booking bifurcations request:', {
    booking_id,
    bifurcations
  });

  if (!booking_id) {
    console.error('Missing booking_id');
    return res.status(400).json({ message: 'Booking ID is required' });
  }

  if (!bifurcations || !Array.isArray(bifurcations)) {
    console.error('Invalid bifurcations data:', bifurcations);
    return res.status(400).json({ message: 'Bifurcations must be an array' });
  }

  if (bifurcations.length === 0) {
    console.error('Empty bifurcations array');
    return res.status(400).json({ message: 'At least one bifurcation is required' });
  }

  // Validate each bifurcation object
  for (const bifurcation of bifurcations) {
    if (!bifurcation.bifurcation_id || !bifurcation.sample_count) {
      console.error('Invalid bifurcation object:', bifurcation);
      return res.status(400).json({ 
        message: 'Each bifurcation must have bifurcation_id and sample_count',
        invalidBifurcation: bifurcation
      });
    }
  }

  // Insert each bifurcation selection
  const insertQuery = 'INSERT INTO BookingBifurcations (booking_id, bifurcation_id, sample_count) VALUES (?, ?, ?)';
  
  let completed = 0;
  let hasError = false;

  bifurcations.forEach(bifurcation => {
    db.query(insertQuery, [booking_id, bifurcation.bifurcation_id, bifurcation.sample_count], (err) => {
      if (err) {
        console.error('Error creating booking bifurcation:', err);
        hasError = true;
      }
      completed++;
      
      if (completed === bifurcations.length) {
        if (hasError) {
          return res.status(500).json({ message: 'Failed to create some booking bifurcations' });
        }
        res.json({ message: 'Booking bifurcations created successfully' });
      }
    });
  });
});

// Modify the existing booking endpoint
app.post('/api/booking', authenticateToken, (req, res) => {
  const { 
    facility_id, 
    date, 
    schedule_id, 
    user_id, 
    operator_email, 
    cost, 
    user_type, 
    receipt_path, 
    bifurcation_ids,
    billing_address,
    gst_number,
    utr_number,
    transaction_date
  } = req.body;
  
  // Check if user is internal (no payment required)
  const isInternalUser = user_type === 'Internal';
  
  // For internal users, receipt_path is not required
  if (!isInternalUser && !receipt_path) {
    return res.status(400).json({ message: "Receipt is required for non-internal users" });
  }
  
  // For non-internal users, validate required billing fields
  if (!isInternalUser) {
    if (!billing_address) {
      return res.status(400).json({ message: "Billing address is required for non-internal users" });
    }
    if (!utr_number) {
      return res.status(400).json({ message: "UTR number is required for non-internal users" });
    }
    if (!transaction_date) {
      return res.status(400).json({ message: "Transaction date is required for non-internal users" });
    }
  }
  
  // For internal users, set receipt_path and billing fields to null
  const finalReceiptPath = isInternalUser ? null : receipt_path;
  const finalBillingAddress = isInternalUser ? null : billing_address;
  const finalGstNumber = isInternalUser ? null : gst_number;
  const finalUtrNumber = isInternalUser ? null : utr_number;
  const finalTransactionDate = isInternalUser ? null : transaction_date;
  
  // First create the booking
  const bookingQuery = `
    INSERT INTO BookingHistory 
    (facility_id, booking_date, schedule_id, user_id, operator_email, cost, receipt_path, billing_address, gst_number, utr_number, transaction_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(bookingQuery, [
    facility_id, 
    date, 
    schedule_id, 
    user_id, 
    operator_email, 
    cost, 
    finalReceiptPath,
    finalBillingAddress,
    finalGstNumber,
    finalUtrNumber,
    finalTransactionDate
  ], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ message: 'Failed to create booking' });
    }

    const booking_id = result.insertId;
    console.log('Created booking with ID:', booking_id);

    // For internal users, check if they are a superuser for this facility
    if (isInternalUser) {
      // Check if this user is a superuser for this specific facility
      const superuserCheckQuery = `
        SELECT isSuperUser, super_facility 
        FROM InternalUsers 
        WHERE user_id = ?
      `;
      
      db.query(superuserCheckQuery, [user_id], (superuserErr, superuserResults) => {
        if (superuserErr || !superuserResults.length) {
          console.error('Error checking superuser status:', superuserErr);
          // Continue with regular supervisor approval process
          handleRegularInternalUserBooking();
        } else {
          const user = superuserResults[0];
          
          if (user.isSuperUser === 'Y' && user.super_facility == facility_id) {
            // Superuser booking their designated facility - auto-approve and deduct from supervisor wallet
            handleSuperuserBooking();
          } else {
            // Regular internal user - send to supervisor for approval
            handleRegularInternalUserBooking();
          }
        }
      });
      
      // Function to handle superuser booking (auto-approve)
      function handleSuperuserBooking() {
        // Get supervisor information for the superuser
        const supervisorQuery = `
          SELECT s.id, s.email, s.name, s.wallet_balance, u.full_name as user_name
          FROM InternalUsers iu
          JOIN Supervisor s ON iu.supervisor_id = s.id
          JOIN Users u ON iu.user_id = u.user_id
          WHERE iu.user_id = ?
        `;
        
        db.query(supervisorQuery, [user_id], (supervisorErr, supervisorResults) => {
          if (supervisorErr || !supervisorResults.length) {
            console.error('Error fetching supervisor info for superuser:', supervisorErr);
            // If supervisor info not found, set status to pending
            updateBookingStatus(booking_id, 'Pending');
            return;
          }
          
          const supervisor = supervisorResults[0];
          
          // Check if supervisor has sufficient wallet balance
          if (supervisor.wallet_balance >= cost) {
            // Sufficient funds - auto-approve and deduct from wallet
            updateBookingStatus(booking_id, 'Approved');
            deductFromSupervisorWallet(supervisor.id, cost);
            
            // Send notification email to supervisor about auto-approval
            sendSuperuserAutoApprovalEmail(supervisor, cost, date);
          } else {
            // Insufficient funds - set status to pending and notify user
            updateBookingStatus(booking_id, 'Pending');
            // Send notification to supervisor about insufficient funds
            sendInsufficientFundsNotification(supervisor, cost, date);
          }
        });
      }
      
      // Function to handle regular internal user booking (supervisor approval required)
      function handleRegularInternalUserBooking() {
        // Get supervisor information for the internal user
        const supervisorQuery = `
          SELECT s.email, s.name, s.wallet_balance, u.full_name as user_name
          FROM InternalUsers iu
          JOIN Supervisor s ON iu.supervisor_id = s.id
          JOIN Users u ON iu.user_id = u.user_id
          WHERE iu.user_id = ?
        `;
        
        console.log('Querying supervisor for user_id:', user_id);
        db.query(supervisorQuery, [user_id], (supervisorErr, supervisorResults) => {
          console.log('Supervisor query results:', supervisorResults);
          if (supervisorErr || !supervisorResults.length) {
            console.error('Error fetching supervisor info:', supervisorErr);
            // Continue with booking creation even if supervisor email fails
          } else {
            const supervisor = supervisorResults[0];
            
            // Send email to supervisor
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            });

            console.log('Creating approval URL with supervisor:', { booking_id, supervisorEmail: supervisor.email });
            const tokenString = `${booking_id}:${supervisor.email}`;
            const encodedToken = Buffer.from(tokenString).toString('base64');
            console.log('Token generation details:', {
              tokenString,
              encodedToken,
              booking_id_type: typeof booking_id,
              supervisor_email_type: typeof supervisor.email
            });
            const approveUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/supervisor-booking-approval?booking_id=${booking_id}&token=${encodedToken}`;
            console.log('Approval URL:', approveUrl);
            
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: supervisor.email,
              subject: 'Internal User Booking Approval Required',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Booking Approval Required</h2>
                  <p>Dear ${supervisor.name},</p>
                  <p>${supervisor.user_name} has requested to book a facility slot and requires your approval.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Booking Details:</h3>
                    <p><strong>Cost:</strong> ₹${cost}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Your Wallet Balance:</strong> ₹${supervisor.wallet_balance}</p>
                  </div>
                  <p>Please click the button below to review and approve this booking:</p>
                  <a href="${approveUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Review Booking</a>
                  <p style="color: #6b7280; font-size: 14px;">If you have sufficient funds in your wallet, you can approve this booking. The cost will be deducted from your wallet balance.</p>
                </div>
              `
            };

            transporter.sendMail(mailOptions, (emailErr) => {
              if (emailErr) {
                console.error('Failed to send supervisor email:', emailErr);
              } else {
                console.log('Supervisor approval email sent successfully');
              }
            });
          }
        });
      }
      
      // Helper function to update booking status
      function updateBookingStatus(bookingId, status) {
        const updateQuery = 'UPDATE BookingHistory SET status = ? WHERE booking_id = ?';
        db.query(updateQuery, [status, bookingId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating booking status:', updateErr);
          } else {
            console.log(`Booking ${bookingId} status updated to ${status}`);
          }
        });
      }
      
      // Helper function to deduct amount from supervisor wallet
      function deductFromSupervisorWallet(supervisorId, amount) {
        const deductQuery = 'UPDATE Supervisor SET wallet_balance = wallet_balance - ? WHERE id = ?';
        db.query(deductQuery, [amount, supervisorId], (deductErr) => {
          if (deductErr) {
            console.error('Error deducting from supervisor wallet:', deductErr);
          } else {
            console.log(`₹${amount} deducted from supervisor ${supervisorId} wallet`);
          }
        });
      }
      
      // Helper function to send superuser auto-approval notification
      function sendSuperuserAutoApprovalEmail(supervisor, cost, date) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: supervisor.email,
          subject: 'Superuser Booking Auto-Approved',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Superuser Booking Auto-Approved</h2>
              <p>Dear ${supervisor.name},</p>
              <p>A superuser under your supervision has automatically booked their designated facility.</p>
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #10b981;">Auto-Approval Details:</h3>
                <p><strong>Amount Deducted:</strong> ₹${cost}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>New Wallet Balance:</strong> ₹${supervisor.wallet_balance - cost}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This booking was automatically approved as the user is a superuser for this facility. The amount has been deducted from your wallet.</p>
            </div>
          `
        };
        
        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) {
            console.error('Failed to send superuser auto-approval email:', emailErr);
          } else {
            console.log('Superuser auto-approval email sent successfully');
          }
        });
      }
      
      // Helper function to send insufficient funds notification
      function sendInsufficientFundsNotification(supervisor, cost, date) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: supervisor.email,
          subject: '⚠️ Insufficient Funds for Superuser Booking',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">⚠️ Insufficient Funds for Superuser Booking</h2>
              <p>Dear ${supervisor.name},</p>
              <p>A superuser under your supervision attempted to book their designated facility, but your wallet has insufficient funds.</p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Booking Details:</h3>
                <p><strong>Required Amount:</strong> ₹${cost}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Current Wallet Balance:</strong> ₹${supervisor.wallet_balance}</p>
                <p><strong>Shortfall:</strong> ₹${cost - supervisor.wallet_balance}</p>
              </div>
              <p style="color: #dc2626; font-weight: bold;">Please top up your wallet to enable superuser bookings.</p>
              <p style="color: #6b7280; font-size: 14px;">The booking is currently pending and will be automatically approved once sufficient funds are available.</p>
            </div>
          `
        };
        
        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) {
            console.error('Failed to send insufficient funds notification:', emailErr);
          } else {
            console.log('Insufficient funds notification sent successfully');
          }
        });
      }
    }

    // Then create the bifurcation entries
    if (bifurcation_ids && bifurcation_ids.length > 0) {
      const bifurcationQuery = 'INSERT INTO BookingBifurcations (booking_id, bifurcation_id, sample_count) VALUES (?, ?, ?)';
      
      let completed = 0;
      let hasError = false;

      bifurcation_ids.forEach(bifurcation_id => {
        db.query(bifurcationQuery, [booking_id, bifurcation_id, 1], (err) => {
          if (err) {
            console.error('Error creating booking bifurcation:', err);
            hasError = true;
          }
          completed++;
          
          if (completed === bifurcation_ids.length) {
            if (hasError) {
              return res.status(500).json({ message: 'Booking created but failed to create some bifurcations' });
            }
            res.json({ 
              message: isInternalUser ? 'Booking submitted for supervisor approval' : 'Booking created successfully',
              booking_id: booking_id,
              requires_supervisor_approval: isInternalUser
            });
          }
        });
      });
    } else {
      res.json({ 
        message: isInternalUser ? 'Booking submitted for supervisor approval' : 'Booking created successfully',
        booking_id: booking_id,
        requires_supervisor_approval: isInternalUser
      });
    }
  });
});

// Add endpoint to get booking bifurcations
app.get('/api/booking/:bookingId/bifurcations', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  
  const query = `
    SELECT bb.*, fb.bifurcation_name, fb.pricing_type 
    FROM BookingBifurcations bb 
    JOIN facility_bifurcations fb ON bb.bifurcation_id = fb.id 
    WHERE bb.booking_id = ?
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) {
      console.error('Error fetching booking bifurcations:', err);
      return res.status(500).json({ message: 'Failed to fetch booking bifurcations' });
    }
    res.json(results);
  });
});

// Get bifurcations for a facility
app.get('/api/facility/:facilityId/bifurcations', authenticateToken, (req, res) => {
  console.log('Fetching bifurcations for facility:', req.params.facilityId);
  const query = `
    SELECT * FROM facility_bifurcations 
    WHERE facility_id = ? 
    ORDER BY bifurcation_name
  `;
  
  db.query(query, [req.params.facilityId], (err, results) => {
    if (err) {
      console.error('Error fetching bifurcations:', err);
      return res.status(500).json({ error: 'Failed to fetch bifurcations' });
    }
    console.log('Bifurcations found:', results.length);
    res.json(results);
  });
});

// Add new bifurcation
app.post('/api/facility/:facilityId/bifurcations', authenticateToken, (req, res) => {
  console.log('Adding new bifurcation:', req.body);
  const {
    bifurcation_name,
    pricing_type,
    price_internal,
    price_internal_consultancy,
    price_external,
    price_industry
  } = req.body;

  // Validate required fields
  if (!bifurcation_name || !pricing_type || !price_internal || !price_internal_consultancy || !price_external || !price_industry) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO facility_bifurcations 
    (facility_id, bifurcation_name, pricing_type, price_internal, price_internal_consultancy, price_external, price_industry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      req.params.facilityId,
      bifurcation_name,
      pricing_type,
      price_internal,
      price_internal_consultancy,
      price_external,
      price_industry
    ],
    (err, result) => {
      if (err) {
        console.error('Error adding bifurcation:', err);
        return res.status(500).json({ error: 'Failed to add bifurcation' });
      }
      console.log('Bifurcation added successfully:', result.insertId);
      res.json({ 
        message: 'Bifurcation added successfully',
        bifurcationId: result.insertId 
      });
    }
  );
});

// Update bifurcation
app.put('/api/facility/bifurcations/:bifurcationId', authenticateToken, (req, res) => {
  console.log('Updating bifurcation:', req.params.bifurcationId, req.body);
  const {
    bifurcation_name,
    pricing_type,
    price_internal,
    price_internal_consultancy,
    price_external,
    price_industry
  } = req.body;

  // Validate required fields
  if (!bifurcation_name || !pricing_type || !price_internal || !price_internal_consultancy || !price_external || !price_industry) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    UPDATE facility_bifurcations 
    SET 
      bifurcation_name = ?,
      pricing_type = ?,
      price_internal = ?,
      price_internal_consultancy = ?,
      price_external = ?,
      price_industry = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      bifurcation_name,
      pricing_type,
      price_internal,
      price_internal_consultancy,
      price_external,
      price_industry,
      req.params.bifurcationId
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating bifurcation:', err);
        return res.status(500).json({ error: 'Failed to update bifurcation' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bifurcation not found' });
      }
      console.log('Bifurcation updated successfully');
      res.json({ message: 'Bifurcation updated successfully' });
    }
  );
});

// Delete bifurcation
app.delete('/api/facility/bifurcations/:bifurcationId', authenticateToken, (req, res) => {
  console.log('Deleting bifurcation:', req.params.bifurcationId);
  
  // First check if bifurcation is in use
  const checkQuery = `
    SELECT COUNT(*) as count 
    FROM BookingBifurcations 
    WHERE bifurcation_id = ?
  `;
  
  db.query(checkQuery, [req.params.bifurcationId], (err, results) => {
    if (err) {
      console.error('Error checking bifurcation usage:', err);
      return res.status(500).json({ error: 'Failed to check bifurcation usage' });
    }

    if (results[0].count > 0) {
      console.log('Bifurcation is in use, cannot delete');
      return res.status(400).json({ error: 'Cannot delete bifurcation that is in use' });
    }

    // If not in use, proceed with deletion
    const deleteQuery = `
      DELETE FROM facility_bifurcations 
      WHERE id = ?
    `;

    db.query(deleteQuery, [req.params.bifurcationId], (err, result) => {
      if (err) {
        console.error('Error deleting bifurcation:', err);
        return res.status(500).json({ error: 'Failed to delete bifurcation' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bifurcation not found' });
      }
      console.log('Bifurcation deleted successfully');
      res.json({ message: 'Bifurcation deleted successfully' });
    });
  });
});

// API endpoint to update facility special note
app.put('/api/facilities/:id/special-note', (req, res) => {
  const facilityId = req.params.id;
  const { special_note } = req.body;

  const query = `
    UPDATE Facilities
    SET special_note = ?
    WHERE id = ?
  `;

  db.query(query, [special_note, facilityId], (err, result) => {
    if (err) {
      console.error('Error updating facility special note:', err);
      return res.status(500).json({ error: 'Error updating special note' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json({ message: 'Special note updated successfully' });
  });
});

// API endpoint to get all user publications (admin only)
app.get('/api/admin/publications', authenticateToken, (req, res) => {
  // Check if user is admin
  // const token = req.headers['authorization'];
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(req.headers);
  // if (req.headers["position"] !== 'Admin') {
  //   return res.status(403).json({ error: 'Access denied. Admin only.' });
  // }

  const query = `
    SELECT 
      p.*,
      u.email as user_email
    FROM User_Publications p
    JOIN Users u ON p.user_id = u.user_id
    ORDER BY p.year DESC, p.publication_id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching publications:', err);
      return res.status(500).json({ error: 'Failed to fetch publications' });
    }
    res.json(results);
  });
});

// Configure multer storage for QR code uploads
const qrCodeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const qrCodePath = path.join(__dirname, 'uploads/qr-codes');
    if (!fs.existsSync(qrCodePath)) {
      fs.mkdirSync(qrCodePath, { recursive: true });
    }
    cb(null, qrCodePath);
  },
  filename: function (req, file, cb) {
    const uniqueId = Date.now();
    cb(null, `qr-code-${uniqueId}${path.extname(file.originalname)}`);
  }
});

const qrCodeUpload = multer({
  storage: qrCodeStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for QR codes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// QR code endpoints
app.get('/api/qr-code', (req, res) => {
  db.query('SELECT image_url FROM qr_code ORDER BY created_at DESC LIMIT 1', (err, rows) => {
    if (err) {
      console.error('Error fetching QR code:', err);
      return res.status(500).json({ error: 'Failed to fetch QR code' });
    }
    if (rows.length > 0) {
      res.json({ image_url: rows[0].image_url });
    } else {
      res.json({ image_url: null });
    }
  });
});

app.post('/api/qr-code', authenticateToken, qrCodeUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/qr-codes/${req.file.filename}`;
    
    // Insert the new QR code into the database
    db.query('INSERT INTO qr_code (image_url) VALUES (?)', [imageUrl], (err, result) => {
      if (err) {
        console.error('Error saving QR code:', err);
        return res.status(500).json({ error: 'Failed to save QR code' });
      }
      
      res.json({ 
        success: true, 
        image_url: imageUrl,
        message: 'QR code uploaded successfully' 
      });
    });
  } catch (err) {
    console.error('Error uploading QR code:', err);
    res.status(500).json({ error: 'Failed to upload QR code' });
  }
});

// API to get all supervisors
app.get('/api/all-supervisors', (req, res) => {
  const query = 'SELECT * FROM Supervisor ORDER BY department_name, name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching supervisors:', err);
      return res.status(500).json({ error: 'Failed to fetch supervisors' });
    }
    res.json(results);
  });
});

// API to add a new supervisor
app.post('/api/add-supervisor', (req, res) => {
  const { name, email, department_name, wallet_balance, password } = req.body;
  
  if (!name || !email || !department_name) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password is required (min 6 chars)' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const parsedBalance = wallet_balance === undefined || wallet_balance === null || wallet_balance === ''
    ? 0
    : parseFloat(wallet_balance);
  if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
    return res.status(400).json({ error: 'Invalid wallet balance' });
  }

  // Check unique email first
  db.query('SELECT id FROM Supervisor WHERE email = ?', [email], async (checkErr, rows) => {
    if (checkErr) {
      console.error('Error checking supervisor email:', checkErr);
      return res.status(500).json({ error: 'Failed to add supervisor' });
    }
    if (rows && rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(String(password), salt);

      const query = 'INSERT INTO Supervisor (name, email, department_name, wallet_balance, password_hash) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [name, email, department_name, parsedBalance, passwordHash], async (err, result) => {
        if (err) {
          console.error('Error adding supervisor:', err);
          return res.status(500).json({ error: 'Failed to add supervisor' });
        }

        try {
          // Send credential email
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Supervisor Account Created',
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
                <h2 style="color:#003B4C;margin-bottom:8px">Your Supervisor Account</h2>
                <p>Dear ${name},</p>
                <p>An administrator has created your supervisor account.</p>
                <p><strong>Login Email:</strong> ${email}<br/>
                   <strong>Temporary Password:</strong> ${String(password).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                <p>Please change your password after first login.</p>
                <p>If you did not expect this, please contact the administrator.</p>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
        } catch (emailErr) {
          console.error('Error sending supervisor credential email:', emailErr);
          // Do not fail the request if email fails; report partial success
        }

        res.json({ message: 'Supervisor added successfully', id: result.insertId });
      });
    } catch (hashErr) {
      console.error('Error hashing supervisor password:', hashErr);
      return res.status(500).json({ error: 'Failed to add supervisor' });
    }
  });
});

// API to delete a supervisor
app.delete('/api/delete-supervisor/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if supervisor is being used by any internal users
  const checkQuery = 'SELECT COUNT(*) as count FROM InternalUsers WHERE supervisor_id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Error checking supervisor usage:', err);
      return res.status(500).json({ error: 'Failed to check supervisor usage' });
    }
    
    if (results[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete supervisor. They are assigned to internal users.' });
    }
    
    const deleteQuery = 'DELETE FROM Supervisor WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting supervisor:', err);
        return res.status(500).json({ error: 'Failed to delete supervisor' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Supervisor not found' });
      }
      
      res.json({ message: 'Supervisor deleted successfully' });
    });
  });
});

// API to update a supervisor
app.put('/api/update-supervisor/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, department_name, wallet_balance } = req.body;
  
  if (!name || !email || !department_name) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const parsedBalance = wallet_balance === undefined || wallet_balance === null || wallet_balance === ''
    ? 0
    : parseFloat(wallet_balance);
  if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
    return res.status(400).json({ error: 'Invalid wallet balance' });
  }

  const query = 'UPDATE Supervisor SET name = ?, email = ?, department_name = ?, wallet_balance = ? WHERE id = ?';
  db.query(query, [name, email, department_name, parsedBalance, id], (err, result) => {
    if (err) {
      console.error('Error updating supervisor:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update supervisor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }
    
    res.json({ message: 'Supervisor updated successfully' });
  });
});

// API to update only wallet balance for a supervisor
app.patch('/api/supervisors/:id/wallet', (req, res) => {
  const { id } = req.params;
  const { wallet_balance } = req.body;

  const parsedBalance = wallet_balance === undefined || wallet_balance === null || wallet_balance === ''
    ? null
    : parseFloat(wallet_balance);

  if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
    return res.status(400).json({ error: 'Invalid wallet balance' });
  }

  const query = 'UPDATE Supervisor SET wallet_balance = ? WHERE id = ?';
  db.query(query, [parsedBalance, id], (err, result) => {
    if (err) {
      console.error('Error updating supervisor wallet balance:', err);
      return res.status(500).json({ error: 'Failed to update wallet balance' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }

    res.json({ message: 'Wallet balance updated successfully', wallet_balance: parsedBalance });
  });
});

// Footer Management API Endpoints

// Get footer content
app.get('/api/footer-content', (req, res) => {
  try {
    const footerPath = path.join(__dirname, 'footerContent.json');
    if (!fs.existsSync(footerPath)) {
      return res.status(404).json({ error: 'Footer content file not found' });
    }
    
    const footerContent = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
    res.json(footerContent);
  } catch (error) {
    console.error('Error reading footer content:', error);
    res.status(500).json({ error: 'Failed to read footer content' });
  }
});

// Update quick links
app.put('/api/footer-content/quickLinks', (req, res) => {
  try {
    const { quickLinks } = req.body;
    
    if (!Array.isArray(quickLinks)) {
      return res.status(400).json({ error: 'Quick links must be an array' });
    }
    
    // Validate each quick link
    for (const link of quickLinks) {
      if (!link.name || !link.path) {
        return res.status(400).json({ error: 'Each quick link must have name and path' });
      }
    }
    
    const footerPath = path.join(__dirname, 'footerContent.json');
    const footerContent = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
    
    footerContent.quickLinks = quickLinks;
    
    fs.writeFileSync(footerPath, JSON.stringify(footerContent, null, 2));
    
    res.json({ message: 'Quick links updated successfully', quickLinks });
  } catch (error) {
    console.error('Error updating quick links:', error);
    res.status(500).json({ error: 'Failed to update quick links' });
  }
});

// Update contact info
app.put('/api/footer-content/contactInfo', (req, res) => {
  try {
    const { contactInfo } = req.body;
    
    if (!Array.isArray(contactInfo)) {
      return res.status(400).json({ error: 'Contact info must be an array' });
    }
    
    // Validate each contact item
    for (const item of contactInfo) {
      if (!item.type || !item.text || !item.href) {
        return res.status(400).json({ error: 'Each contact item must have type, text, and href' });
      }
    }
    
    const footerPath = path.join(__dirname, 'footerContent.json');
    const footerContent = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
    
    footerContent.contactInfo = contactInfo;
    
    fs.writeFileSync(footerPath, JSON.stringify(footerContent, null, 2));
    
    res.json({ message: 'Contact info updated successfully', contactInfo });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ error: 'Failed to update contact info' });
  }
});

// Update social media links
app.put('/api/footer-content/socialLinks', (req, res) => {
  try {
    const { socialLinks } = req.body;
    
    if (!Array.isArray(socialLinks)) {
      return res.status(400).json({ error: 'Social links must be an array' });
    }
    
    // Validate each social link
    for (const link of socialLinks) {
      if (!link.platform || typeof link.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Each social link must have platform and enabled status' });
      }
    }
    
    const footerPath = path.join(__dirname, 'footerContent.json');
    const footerContent = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
    
    footerContent.socialLinks = socialLinks;
    
    fs.writeFileSync(footerPath, JSON.stringify(footerContent, null, 2));
    
    res.json({ message: 'Social links updated successfully', socialLinks });
  } catch (error) {
    console.error('Error updating social links:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Update entire footer content
app.put('/api/footer-content', (req, res) => {
  try {
    const { quickLinks, contactInfo, socialLinks } = req.body;
    
    // Validate all sections
    if (!Array.isArray(quickLinks) || !Array.isArray(contactInfo) || !Array.isArray(socialLinks)) {
      return res.status(400).json({ error: 'All sections must be arrays' });
    }
    
    const footerPath = path.join(__dirname, 'footerContent.json');
    const footerContent = {
      quickLinks,
      contactInfo,
      socialLinks
    };
    
    fs.writeFileSync(footerPath, JSON.stringify(footerContent, null, 2));
    
    res.json({ message: 'Footer content updated successfully', footerContent });
  } catch (error) {
    console.error('Error updating footer content:', error);
    res.status(500).json({ error: 'Failed to update footer content' });
  }
});

// Contact Page Management API Endpoints

// Get contact page content
app.get('/api/contact-content', (req, res) => {
  try {
    const contactPath = path.join(__dirname, 'contactContent.json');
    if (!fs.existsSync(contactPath)) {
      return res.status(404).json({ error: 'Contact content file not found' });
    }
    
    const contactContent = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
    res.json(contactContent);
  } catch (error) {
    console.error('Error reading contact content:', error);
    res.status(500).json({ error: 'Failed to read contact content' });
  }
});

// Update contact page content
app.put('/api/contact-content', (req, res) => {
  try {
    const contactContent = req.body;
    
    if (!contactContent) {
      return res.status(400).json({ error: 'Contact content is required' });
    }
    
    const contactPath = path.join(__dirname, 'contactContent.json');
    fs.writeFileSync(contactPath, JSON.stringify(contactContent, null, 2));
    
    res.json({ message: 'Contact content updated successfully', contactContent });
  } catch (error) {
    console.error('Error updating contact content:', error);
    res.status(500).json({ error: 'Failed to update contact content' });
  }
});

// Function to resize image to fit specified dimensions
const resizeImage = async (inputPath, outputPath, targetWidth, targetHeight) => {
  try {
    // Check if sharp is available
    if (typeof sharp === 'undefined') {
      console.log('Sharp library not available, skipping image resize');
      return false;
    }
    
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'inside', // This ensures the image fits within the dimensions without cropping
        withoutEnlargement: true // This prevents upscaling if the image is smaller
      })
      .jpeg({ quality: 85 }) // Optimize for web
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error('Error resizing image:', error);
    return false;
  }
};

// Upload contact page hero image
app.post('/api/contact-content/hero-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const resizedFilename = `resized_${filename}`;
    const resizedPath = path.join(__dirname, 'uploads', resizedFilename);
    
    // Resize image to optimal dimensions for hero section (1920x600)
    let resizeSuccess = false;
    try {
      resizeSuccess = await resizeImage(originalPath, resizedPath, 1920, 600);
    } catch (resizeError) {
      console.error('Error during image resize:', resizeError);
      resizeSuccess = false;
    }
    
    if (!resizeSuccess) {
      // If resizing fails, use original image
      const imagePath = `/uploads/${filename}`;
      
      const contactPath = path.join(__dirname, 'contactContent.json');
      const contactContent = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
      contactContent.hero.image = imagePath;
      fs.writeFileSync(contactPath, JSON.stringify(contactContent, null, 2));
      
      return res.json({ 
        message: 'Hero image updated successfully (original size - Sharp library not available)', 
        imagePath: imagePath,
        contactContent 
      });
    }
    
    // Use resized image
    const imagePath = `/uploads/${resizedFilename}`;
    
    // Update the contact content with new image path
    const contactPath = path.join(__dirname, 'contactContent.json');
    const contactContent = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
    
    contactContent.hero.image = imagePath;
    
    fs.writeFileSync(contactPath, JSON.stringify(contactContent, null, 2));
    
    // Try to remove original file to save space, but don't fail if it can't be deleted
    try {
      fs.unlinkSync(originalPath);
    } catch (deleteError) {
      console.log('Could not delete original file (this is normal on Windows):', deleteError.message);
      // Continue with the response even if we can't delete the original file
    }
    
    res.json({ 
      message: 'Hero image updated successfully and resized to optimal dimensions', 
      imagePath: imagePath,
      contactContent 
    });
  } catch (error) {
    console.error('Error updating hero image:', error);
    res.status(500).json({ error: 'Failed to update hero image' });
  }
});

const OTP_EXPIRY_MS = 15 * 60 * 1000; 
const OTP_RESEND_COOLDOWN_MS = 10 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5; 

app.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check resend cooldown
    db.query('SELECT last_sent_at FROM email_otps WHERE email = ?', [email], async (selErr, rows) => {
      if (selErr) {
        console.error('OTP select error:', selErr);
        return res.status(500).json({ message: 'Server error.' });
      }

      const now = new Date();
      if (rows && rows.length > 0 && rows[0].last_sent_at) {
        const last = new Date(rows[0].last_sent_at);
        if (now - last < OTP_RESEND_COOLDOWN_MS) {
          const waitMs = OTP_RESEND_COOLDOWN_MS - (now - last);
          return res.status(429).json({ message: `Please wait ${Math.ceil(waitMs / 1000)}s before resending.` });
        }
      }

      // Generate 6-digit numeric OTP
      const otp = ('' + Math.floor(100000 + Math.random() * 900000));
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      // Upsert OTP
      const upsertSql = `
        INSERT INTO email_otps (email, otp_hash, expires_at, attempts, last_sent_at)
        VALUES (?, ?, ?, 0, ?)
        ON DUPLICATE KEY UPDATE
          otp_hash = VALUES(otp_hash),
          expires_at = VALUES(expires_at),
          attempts = 0,
          last_sent_at = VALUES(last_sent_at)
      `;
      db.query(upsertSql, [email, otpHash, expiresAt, now], async (upErr) => {
        if (upErr) {
          console.error('OTP upsert error:', upErr);
          return res.status(500).json({ message: 'Server error.' });
        }

        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Email Verification',
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
                <h2 style="color:#003B4C;margin-bottom:8px">Email Verification</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <div style="font-size:24px;font-weight:bold;letter-spacing:4px;margin:12px 0">${otp}</div>
                <p>This code will expire in 15 minutes. Do not share it with anyone.</p>
                <p style="color:#666;font-size:12px">If you did not request this, you can ignore this email.</p>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          return res.json({ success: true, message: 'OTP sent successfully.' });
        } catch (emailErr) {
          console.error('Error sending OTP email:', emailErr);
          return res.status(500).json({ message: 'Failed to send OTP email.' });
        }
      });
    });
  } catch (e) {
    console.error('send-otp error:', e);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    db.query('SELECT otp_hash, expires_at, attempts FROM email_otps WHERE email = ?', [email], async (selErr, rows) => {
      if (selErr) {
        console.error('OTP select error:', selErr);
        return res.status(500).json({ message: 'Server error.' });
      }
      if (!rows || rows.length === 0) {
        return res.status(400).json({ message: 'No OTP request found for this email.' });
      }
      const record = rows[0];

      if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
      }

      if (new Date(record.expires_at) < new Date()) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      }

      const match = await bcrypt.compare(otp, record.otp_hash);
      if (!match) {
        db.query('UPDATE email_otps SET attempts = attempts + 1 WHERE email = ?', [email], (updErr) => {
          if (updErr) console.error('OTP attempt update error:', updErr);
          return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        });
        return;
      }

      // Success: delete the row
      db.query('DELETE FROM email_otps WHERE email = ?', [email], (delErr) => {
        if (delErr) {
          console.error('OTP delete error:', delErr);
          // Even if delete fails, consider verification successful but warn
        }
        return res.json({ success: true, verified: true });
      });
    });
  } catch (e) {
    console.error('verify-otp error:', e);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Supervisor self endpoints
app.get('/api/supervisor/me', authenticateToken, (req, res) => {
  try {
    const email = req.user && req.user.email ? req.user.email : null;
    if (!email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const q = 'SELECT id, name, email, department_name, wallet_balance FROM Supervisor WHERE email = ?';
    db.query(q, [email], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
      return res.json(rows[0]);
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/supervisor/change-password', authenticateToken, async (req, res) => {
  try {
    const email = req.user && req.user.email ? req.user.email : null;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Invalid password data' });
    }
    db.query('SELECT id, password_hash FROM Supervisor WHERE email = ?', [email], async (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
      const sup = rows[0];
      const ok = sup.password_hash ? await bcrypt.compare(String(currentPassword), sup.password_hash) : false;
      if (!ok) return res.status(401).json({ message: 'Current password incorrect' });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(String(newPassword), salt);
      db.query('UPDATE Supervisor SET password_hash = ? WHERE id = ?', [hash, sup.id], (uErr) => {
        if (uErr) return res.status(500).json({ message: 'Failed to update password' });
        return res.json({ success: true, message: 'Password updated successfully' });
      });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Supervisor: list pending internal users assigned to this supervisor
app.get('/api/supervisor/pending-internal-users', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;
    const q = `
      SELECT u.user_id, u.full_name, u.email, iu.department_name
      FROM InternalUsers iu
      JOIN Users u ON u.user_id = iu.user_id
      WHERE iu.supervisor_id = ? AND u.verified = 'NO'
      ORDER BY u.full_name
    `;
    db.query(q, [supId], (e2, r2) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(r2);
    });
  });
});

// Supervisor: list approved/managed internal users
app.get('/api/supervisor/managed-internal-users', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;
    const q = `
      SELECT u.user_id, u.full_name, u.email, iu.department_name
      FROM InternalUsers iu
      JOIN Users u ON u.user_id = iu.user_id
      WHERE iu.supervisor_id = ? AND u.verified = 'YES'
      ORDER BY u.full_name
    `;
    db.query(q, [supId], (e2, r2) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(r2);
    });
  });
});

// Supervisor: approve internal user
app.post('/api/supervisor/approve-internal-user', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const { user_id } = req.body || {};
  if (!user_id) return res.status(400).json({ message: 'user_id is required' });
  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;
    // ensure mapping exists
    const qMap = 'SELECT 1 FROM InternalUsers WHERE supervisor_id = ? AND user_id = ?';
    db.query(qMap, [supId, user_id], (e2, r2) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!r2 || r2.length === 0) return res.status(404).json({ message: 'Mapping not found' });
      const q = "UPDATE Users SET verified = 'YES' WHERE user_id = ?";
      db.query(q, [user_id], (e3) => {
        if (e3) return res.status(500).json({ message: 'Failed to approve user' });
        return res.json({ success: true, message: 'User approved' });
      });
    });
  });
});

// Supervisor: remove internal user mapping (and set verified to NO)
app.delete('/api/supervisor/internal-user/:userId', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ message: 'userId is required' });
  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;
    const delQ = 'DELETE FROM InternalUsers WHERE supervisor_id = ? AND user_id = ?';
    db.query(delQ, [supId, userId], (e2, r2) => {
      if (e2) return res.status(500).json({ message: 'Failed to remove mapping' });
      if (r2.affectedRows === 0) return res.status(404).json({ message: 'Mapping not found' });
      db.query("UPDATE Users SET verified = 'NO' WHERE user_id = ?", [userId], (e3) => {
        if (e3) return res.status(500).json({ message: 'Failed to update user' });
        return res.json({ success: true, message: 'User removed from your supervision' });
      });
    });
  });
});

// Supervisor: list bookings for own internal users
app.get('/api/supervisor/bookings', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const { status, from, to } = req.query;

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    let where = 'iu.supervisor_id = ?';
    const params = [supId];
    if (status) { where += ' AND bh.status = ?'; params.push(status); }
    if (from) { where += ' AND DATE(bh.booking_date) >= ?'; params.push(from); }
    if (to) { where += ' AND DATE(bh.booking_date) <= ?'; params.push(to); }

    const q = `
      SELECT bh.booking_id, bh.facility_id, f.name AS facility_name, bh.booking_date, bh.cost, bh.status,
             u.user_id, u.full_name, u.email
      FROM BookingHistory bh
      JOIN Users u ON u.user_id = bh.user_id
      JOIN InternalUsers iu ON iu.user_id = u.user_id
      JOIN Facilities f ON f.id = bh.facility_id
      WHERE ${where}
      ORDER BY bh.booking_date DESC, bh.booking_id DESC
      LIMIT 500
    `;
    db.query(q, params, (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(rows);
    });
  });
});

// Supervisor: update booking status (approve/reject/cancel) for own users
app.post('/api/supervisor/bookings/:id/status', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const bookingId = req.params.id;
  const { action } = req.body || {};
  if (!['approve', 'reject', 'cancel'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  const qSup = 'SELECT id, wallet_balance FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    const qBk = `
      SELECT bh.booking_id, bh.status, bh.cost, s.id AS supervisor_id, s.wallet_balance
      FROM BookingHistory bh
      JOIN Users u ON u.user_id = bh.user_id
      JOIN InternalUsers iu ON iu.user_id = u.user_id
      JOIN Supervisor s ON s.id = iu.supervisor_id
      WHERE bh.booking_id = ? AND s.id = ?
    `;
    db.query(qBk, [bookingId, supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
      const bk = rows[0];

      if (bk.status !== 'Pending' && action !== 'cancel') {
        return res.status(400).json({ message: 'Only pending bookings can be approved/rejected' });
      }

      if (action === 'approve') {
        if (Number(bk.wallet_balance) < Number(bk.cost)) {
          return res.status(400).json({ message: 'Insufficient wallet balance' });
        }
        const q1 = 'UPDATE BookingHistory SET status = "Approved" WHERE booking_id = ?';
        const q2 = 'UPDATE Supervisor SET wallet_balance = wallet_balance - ? WHERE id = ?';
        db.query(q1, [bookingId], (u1) => {
          if (u1) return res.status(500).json({ message: 'Failed to update booking' });
          db.query(q2, [Number(bk.cost), supId], (u2) => {
            if (u2) return res.status(500).json({ message: 'Failed to update wallet' });
            return res.json({ success: true, message: 'Booking approved', new_wallet_balance: Number(bk.wallet_balance) - Number(bk.cost) });
          });
        });
      } else if (action === 'reject') {
        // Reject booking - no refund needed as it was never charged
        db.query('UPDATE BookingHistory SET status = "Cancelled" WHERE booking_id = ?', [bookingId], (u) => {
          if (u) return res.status(500).json({ message: 'Failed to update booking' });
          return res.json({ success: true, message: 'Booking rejected' });
        });
      } else if (action === 'cancel') {
        // Cancel approved booking - refund the amount to supervisor wallet
        if (bk.status === 'Approved') {
          const q1 = 'UPDATE BookingHistory SET status = "Cancelled" WHERE booking_id = ?';
          const q2 = 'UPDATE Supervisor SET wallet_balance = wallet_balance + ? WHERE id = ?';
          
          db.query(q1, [bookingId], (u1) => {
            if (u1) return res.status(500).json({ message: 'Failed to update booking' });
            db.query(q2, [Number(bk.cost), supId], (u2) => {
              if (u2) return res.status(500).json({ message: 'Failed to update wallet' });
              return res.json({ 
                success: true, 
                message: 'Booking cancelled and amount refunded', 
                new_wallet_balance: Number(bk.wallet_balance) + Number(bk.cost),
                refunded_amount: Number(bk.cost)
              });
            });
          });
        } else {
          // Cannot cancel non-approved bookings
          return res.status(400).json({ message: 'Only approved bookings can be cancelled' });
        }
      }
    });
  });
});

// Internal user: request to become superuser for a facility
app.post('/api/superuser/request', authenticateToken, (req, res) => {
  console.log('Superuser request - req.user:', req.user);
  const userId = req.user && req.user.userId;
  if (!userId) {
    console.log('No userId found in JWT token');
    return res.status(401).json({ message: 'Unauthorized - No userId in token' });
  }
  
  const { facility_id, reason } = req.body;
  if (!facility_id || !reason) {
    return res.status(400).json({ message: 'Facility ID and reason are required' });
  }

  // Check if user is internal and not already a superuser
  const qCheck = `
    SELECT iu.id, iu.isSuperUser
    FROM InternalUsers iu 
    WHERE iu.user_id = ?
  `;
  db.query(qCheck, [userId], (e1, rows) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Internal user not found' });
    
    const user = rows[0];
    if (user.isSuperUser === 'Y') {
      return res.status(400).json({ message: 'You are already a superuser' });
    }

    // Check if facility exists
    db.query('SELECT id, name FROM Facilities WHERE id = ?', [facility_id], (e2, fRows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!fRows || fRows.length === 0) return res.status(404).json({ message: 'Facility not found' });

      // Check if there's already a pending request for this user
      const qCheckPending = 'SELECT id FROM superuser_requests WHERE user_id = ? AND status = "pending"';
      db.query(qCheckPending, [userId], (e3, pendingRows) => {
        if (e3) return res.status(500).json({ message: 'Server error' });
        
        if (pendingRows && pendingRows.length > 0) {
          // Update existing pending request
          const qUpdate = 'UPDATE superuser_requests SET facility_id = ?, reason = ? WHERE user_id = ? AND status = "pending"';
          db.query(qUpdate, [facility_id, reason, userId], (e4) => {
            if (e4) return res.status(500).json({ message: 'Failed to update request' });
            return res.json({ success: true, message: 'Superuser request updated successfully' });
          });
        } else {
          // Create new request
          const qInsert = 'INSERT INTO superuser_requests (user_id, facility_id, reason) VALUES (?, ?, ?)';
          db.query(qInsert, [userId, facility_id, reason], (e4) => {
            if (e4) return res.status(500).json({ message: 'Failed to create request' });
            return res.json({ success: true, message: 'Superuser request submitted successfully' });
          });
        }
      });
    });
  });
});

// Supervisor: get current superusers (approved)
app.get('/api/supervisor/current-superusers', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    const q = `
      SELECT iu.id, iu.user_id, iu.full_name, iu.email, iu.department_name, 
             iu.super_facility, f.name AS facility_name
      FROM InternalUsers iu
      JOIN Facilities f ON f.id = iu.super_facility
      WHERE iu.supervisor_id = ? AND iu.super_facility IS NOT NULL AND iu.isSuperUser = 'Y'
      ORDER BY iu.id DESC
    `;
    db.query(q, [supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(rows);
    });
  });
});

// Supervisor: get pending superuser requests
app.get('/api/supervisor/pending-superusers', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    const q = `
      SELECT sr.id, sr.user_id, sr.facility_id, sr.reason, sr.requested_at,
             iu.full_name, iu.email, iu.department_name, f.name AS facility_name
      FROM superuser_requests sr
      JOIN InternalUsers iu ON iu.user_id = sr.user_id
      JOIN Facilities f ON f.id = sr.facility_id
      WHERE iu.supervisor_id = ? AND sr.status = 'pending'
      ORDER BY sr.requested_at DESC
    `;
    db.query(q, [supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(rows);
    });
  });
});

// Supervisor: approve superuser request
app.post('/api/supervisor/approve-superuser/:userId', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const targetUserId = req.params.userId;

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    // Get the pending request for this user
    const qCheck = `
      SELECT sr.id, sr.facility_id, sr.reason, iu.full_name, f.name AS facility_name
      FROM superuser_requests sr
      JOIN InternalUsers iu ON iu.user_id = sr.user_id
      JOIN Facilities f ON f.id = sr.facility_id
      WHERE sr.user_id = ? AND iu.supervisor_id = ? AND sr.status = 'pending'
    `;
    db.query(qCheck, [targetUserId, supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Pending request not found or not under your supervision' });

      const request = rows[0];
      
      // Get a connection from the pool for transaction
      db.getConnection((e3, connection) => {
        if (e3) return res.status(500).json({ message: 'Server error' });
        
        // Start transaction
        connection.beginTransaction((e4) => {
          if (e4) {
            connection.release();
            return res.status(500).json({ message: 'Server error' });
          }
          
          // Update the request status to approved
          const qUpdateRequest = 'UPDATE superuser_requests SET status = "approved", processed_at = NOW(), processed_by = ? WHERE id = ?';
          connection.query(qUpdateRequest, [supId, request.id], (e5) => {
            if (e5) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ message: 'Failed to approve request' });
              });
            }
            
            // Update the user to be a superuser and set the facility
            const qUpdateUser = 'UPDATE InternalUsers SET isSuperUser = "Y", super_facility = ? WHERE user_id = ?';
            connection.query(qUpdateUser, [request.facility_id, targetUserId], (e6) => {
              if (e6) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ message: 'Failed to approve superuser' });
                });
              }
              
              // Commit the transaction
              connection.commit((e7) => {
                if (e7) {
                  connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ message: 'Server error' });
                  });
                  return;
                }
                
                connection.release();
                return res.json({ 
                  success: true, 
                  message: `Superuser approved for ${request.full_name} (${request.facility_name})` 
                });
              });
            });
          });
        });
      });
    });
  });
});

// Supervisor: reject superuser request
app.post('/api/supervisor/reject-superuser/:userId', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const targetUserId = req.params.userId;

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    // Get the pending request for this user
    const qCheck = `
      SELECT sr.id, sr.facility_id, iu.full_name, f.name AS facility_name
      FROM superuser_requests sr
      JOIN InternalUsers iu ON iu.user_id = sr.user_id
      JOIN Facilities f ON f.id = sr.facility_id
      WHERE sr.user_id = ? AND iu.supervisor_id = ? AND sr.status = 'pending'
    `;
    db.query(qCheck, [targetUserId, supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Pending request not found or not under your supervision' });

      const request = rows[0];
      
      // Update the request status to cancelled
      const qUpdate = 'UPDATE superuser_requests SET status = "cancelled", processed_at = NOW(), processed_by = ? WHERE id = ?';
      db.query(qUpdate, [supId, request.id], (e3) => {
        if (e3) return res.status(500).json({ message: 'Failed to reject superuser request' });
        return res.json({ 
          success: true, 
          message: `Superuser request rejected for ${request.full_name} (${request.facility_name})` 
        });
      });
    });
  });
});

// Supervisor: remove superuser status
app.post('/api/supervisor/remove-superuser/:userId', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const targetUserId = req.params.userId;

  const qSup = 'SELECT id FROM Supervisor WHERE email = ?';
  db.query(qSup, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    const supId = r1[0].id;

    // Verify the target user is under this supervisor and is currently a superuser
    const qCheck = `
      SELECT iu.id, iu.full_name, iu.super_facility, f.name AS facility_name
      FROM InternalUsers iu
      LEFT JOIN Facilities f ON f.id = iu.super_facility
      WHERE iu.user_id = ? AND iu.supervisor_id = ? AND iu.isSuperUser = 'Y'
    `;
    db.query(qCheck, [targetUserId, supId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Superuser not found or not under your supervision' });

      const user = rows[0];
      
      // Remove superuser status and clear facility assignment so user can request again
      const qUpdate = 'UPDATE InternalUsers SET isSuperUser = "N", super_facility = NULL WHERE user_id = ?';
      db.query(qUpdate, [targetUserId], (e3) => {
        if (e3) return res.status(500).json({ message: 'Failed to remove superuser status' });
        
        // Also mark any existing requests as cancelled
        const qUpdateRequests = 'UPDATE superuser_requests SET status = "cancelled", processed_at = NOW(), processed_by = ? WHERE user_id = ? AND status IN ("pending", "approved")';
        db.query(qUpdateRequests, [supId, targetUserId], (e4) => {
          if (e4) {
            console.error('Failed to update superuser requests:', e4);
          }
          return res.json({ 
            success: true, 
            message: `Superuser status removed for ${user.full_name} (${user.facility_name})` 
          });
        });
      });
    });
  });
});

// Get user's superuser status
app.get('/api/user/superuser-status', authenticateToken, (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  // Get user's current superuser status and any pending requests
  const q = `
    SELECT 
      iu.isSuperUser,
      iu.super_facility,
      f.name AS facility_name,
      sr.status AS request_status,
      sr.facility_id AS request_facility_id,
      f2.name AS request_facility_name
    FROM InternalUsers iu
    LEFT JOIN Facilities f ON f.id = iu.super_facility
    LEFT JOIN superuser_requests sr ON sr.user_id = iu.user_id AND sr.status = 'pending'
    LEFT JOIN Facilities f2 ON f2.id = sr.facility_id
    WHERE iu.user_id = ?
  `;
  db.query(q, [userId], (e, rows) => {
    if (e) return res.status(500).json({ message: 'Server error' });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = rows[0];
    
    // Determine the status to show
    let status = 'none';
    let facilityName = null;
    
    if (user.isSuperUser === 'Y') {
      status = 'active';
      facilityName = user.facility_name;
    } else if (user.request_status === 'pending') {
      status = 'pending';
      facilityName = user.request_facility_name;
    }
    
    return res.json({
      status: status,
      isSuperUser: user.isSuperUser === 'Y',
      superFacility: user.super_facility,
      facilityName: facilityName,
      requestStatus: user.request_status,
      requestFacilityName: user.request_facility_name
    });
  });
});

// Admin: get all superusers
app.get('/api/admin/superusers', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  // Check if user is admin
  const qAdmin = 'SELECT Position FROM management_cred WHERE email = ?';
  db.query(qAdmin, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(403).json({ message: 'Admin access required' });
    
    const admin = r1[0];
    if (admin.Position !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all superusers with their details
    const q = `
      SELECT iu.id, iu.user_id, iu.full_name, iu.email, iu.department_name, 
             iu.super_facility, f.name AS facility_name, s.name AS supervisor_name
      FROM InternalUsers iu
      LEFT JOIN Facilities f ON f.id = iu.super_facility
      LEFT JOIN Supervisor s ON s.id = iu.supervisor_id
      WHERE iu.isSuperUser = 'Y'
      ORDER BY iu.full_name
    `;
    db.query(q, (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      return res.json(rows);
    });
  });
});

// Admin: revoke superuser status
app.post('/api/admin/revoke-superuser/:userId', authenticateToken, (req, res) => {
  const email = req.user && req.user.email;
  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  // Check if user is admin
  const qAdmin = 'SELECT Position FROM management_cred WHERE email = ?';
  db.query(qAdmin, [email], (e1, r1) => {
    if (e1) return res.status(500).json({ message: 'Server error' });
    if (!r1 || r1.length === 0) return res.status(403).json({ message: 'Admin access required' });
    
    const admin = r1[0];
    if (admin.Position !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const targetUserId = req.params.userId;
    
    // Check if target user exists and is a superuser
    const qCheck = `
      SELECT iu.id, iu.full_name, iu.email, iu.super_facility, f.name AS facility_name
      FROM InternalUsers iu
      LEFT JOIN Facilities f ON f.id = iu.super_facility
      WHERE iu.user_id = ? AND iu.isSuperUser = 'Y'
    `;
    db.query(qCheck, [targetUserId], (e2, rows) => {
      if (e2) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Superuser not found' });

      const user = rows[0];
      
      // Revoke superuser status and clear facility assignment so user can request again
      const qUpdate = 'UPDATE InternalUsers SET isSuperUser = "N", super_facility = NULL WHERE user_id = ?';
      db.query(qUpdate, [targetUserId], (e3) => {
        if (e3) return res.status(500).json({ message: 'Failed to revoke superuser status' });
        
        // Also mark any existing requests as cancelled
        const qUpdateRequests = 'UPDATE superuser_requests SET status = "cancelled", processed_at = NOW(), processed_by = NULL WHERE user_id = ? AND status IN ("pending", "approved")';
        db.query(qUpdateRequests, [targetUserId], (e4) => {
          if (e4) {
            console.error('Failed to update superuser requests:', e4);
          }
          return res.json({ 
            success: true, 
            message: `Superuser status revoked for ${user.full_name} (${user.facility_name})` 
          });
        });
      });
    });
  });
});
