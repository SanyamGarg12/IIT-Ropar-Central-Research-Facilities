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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

  // Query the database to find the user by email
  const query = "SELECT * FROM management_cred WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error." });
    }

    // If the user does not exist
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];

    // Compare the provided password with the hashed password stored in the database
    if (password !== user.Pass) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Generate a JWT token with the email and position
    const token = jwt.sign({ email: user.email}, JWT_SECRET, { expiresIn: '1h' });

    // Return the token and user's position in the response
    res.json({
      token,
      position: user.Position,
      email: user.email,
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
              'facility_id', bh.facility_id,
              'facility_name', f.name,
              'booking_date', bh.booking_date,
              'status', bh.status,
              'cost', bh.cost,
              'schedule_id', bh.schedule_id,
              'receipt_path', bh.receipt_path,
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

// Find the booking API endpoint
app.post('/api/booking', (req, res) => {
  const { facility_id, date, schedule_id, user_id, operator_email, cost, user_type, receipt_path } = req.body;
  
  // Validate receipt path
  if (!receipt_path) {
    return res.status(400).json({ message: "Receipt is required for booking" });
  }
  
  // Create the booking with receipt path
  const query = `INSERT INTO bookinghistory (facility_id, booking_date, schedule_id, user_id, operator_email, cost, receipt_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [facility_id, date, schedule_id, user_id, operator_email, cost, receipt_path], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ message: "Booking failed" });
    }
    res.json({ message: "Booking successful", bookingId: result.insertId });
  });
});

// Get booking history
app.get('/api/booking-history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const query = `
  SELECT
    bh.*,
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
      bh.facility_id,
      f.name AS facility_name,
      bh.booking_date,
      bh.status,
      bh.cost,
      bh.schedule_id,
      bh.booking_id,
      bh.receipt_path,
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
  const query = `UPDATE BookingHistory SET status = ? WHERE booking_id = ?`;
  db.query(query, [action, bookingId], (err, result) => {
    if (err) return res.status(500).json({ message: "Booking action failed" });
    res.json({ message: "Booking action successful" });
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

app.get("/api/slots", async (req, res) => {
  const { facility_id, date } = req.query;

  // Check if the facility can be available on that weekday and find the number of slots
  const day = getWeekday(date);

  const checkSlotsQuery = `
    SELECT schedule_id, start_time, end_time, total_slots 
    FROM facilityschedule 
    WHERE facility_id = ? AND weekday = ?
  `;

  try {
    // Using await to fetch total slots
    const [totalSlots] = await db
      .promise()
      .query(checkSlotsQuery, [facility_id, day]);

    if (totalSlots.length === 0) {
      return res
        .status(200)
        .json({ slots: [] });
    }


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

app.get('/api/weekly-slots', (req, res) => {
  const { facilityId } = req.query;  // Changed from operatorId to facilityId

  if (!facilityId) {
    return res.status(400).json({ message: 'Facility ID is required' });
  }

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

    // Query to fetch the schedule for the selected facility
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
      'INSERT INTO facilityschedule (facility_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
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

// Delete a slot
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
      'DELETE FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ?',
      [facilityId, weekday, slot.start_time, slot.end_time],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to delete slot' });
        }
        res.json({ message: 'Slot deleted successfully' });
      }
    );
  });
});

// Admin endpoints for managing facility slots
// Get all facilities with their slots for admin
app.get('/admin/facilities/slots', authenticateToken, (req, res) => {
 
  db.query('SELECT id, name, description FROM facilities', (err, rows) => {
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

// Admin add slot endpoint
app.post('/admin/slots', authenticateToken, (req, res) => {

  const { facilityId, weekday, start_time, end_time } = req.body;

  if (!facilityId || !weekday || !start_time || !end_time) {
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

    // Check if slot already exists
    db.query(
      'SELECT schedule_id FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ?',
      [facilityId, weekday, start_time, end_time],
      (err, existingSlots) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to check existing slots' });
        }

        if (existingSlots.length > 0) {
          return res.status(400).json({ message: 'Slot already exists for this time period' });
        }

        // Add the new slot
        db.query(
          'INSERT INTO facilityschedule (facility_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
          [facilityId, weekday, start_time, end_time],
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

// Admin delete slot endpoint
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

    // Check if there are any bookings for this slot
    db.query(
      'SELECT COUNT(*) as bookingCount FROM bookinghistory bh JOIN facilityschedule fs ON bh.schedule_id = fs.schedule_id WHERE fs.facility_id = ? AND fs.weekday = ? AND fs.start_time = ? AND fs.end_time = ?',
      [facilityId, weekday, slot.start_time, slot.end_time],
      (err, bookingResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to check bookings' });
        }

        if (bookingResults[0].bookingCount > 0) {
          return res.status(400).json({ message: 'Cannot delete slot with existing bookings' });
        }

        // Delete the slot
        db.query(
          'DELETE FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ?',
          [facilityId, weekday, slot.start_time, slot.end_time],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Failed to delete slot' });
            }
            res.json({ message: 'Slot deleted successfully' });
          }
        );
      }
    );
  });
});

// Admin update slot endpoint
app.put('/admin/slots', authenticateToken, (req, res) => {

  const { facilityId, weekday, oldSlot, newSlot } = req.body;

  if (!facilityId || !weekday || !oldSlot || !newSlot) {
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

    // Check if there are any bookings for the old slot
    db.query(
      'SELECT COUNT(*) as bookingCount FROM bookinghistory bh JOIN facilityschedule fs ON bh.schedule_id = fs.schedule_id WHERE fs.facility_id = ? AND fs.weekday = ? AND fs.start_time = ? AND fs.end_time = ?',
      [facilityId, weekday, oldSlot.start_time, oldSlot.end_time],
      (err, bookingResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to check bookings' });
        }

        if (bookingResults[0].bookingCount > 0) {
          return res.status(400).json({ message: 'Cannot update slot with existing bookings' });
        }

        // Check if new slot time conflicts with existing slots
        db.query(
          'SELECT schedule_id FROM facilityschedule WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ? AND (start_time != ? OR end_time != ?)',
          [facilityId, weekday, newSlot.start_time, newSlot.end_time, oldSlot.start_time, oldSlot.end_time],
          (err, conflictResults) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Failed to check slot conflicts' });
            }

            if (conflictResults.length > 0) {
              return res.status(400).json({ message: 'New slot time conflicts with existing slots' });
            }

            // Update the slot
            db.query(
              'UPDATE facilityschedule SET start_time = ?, end_time = ? WHERE facility_id = ? AND weekday = ? AND start_time = ? AND end_time = ?',
              [newSlot.start_time, newSlot.end_time, facilityId, weekday, oldSlot.start_time, oldSlot.end_time],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Failed to update slot' });
                }
                res.json({ message: 'Slot updated successfully' });
              }
            );
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
  const { facility_id, date, schedule_id, user_id, operator_email, cost, user_type, receipt_path, bifurcation_ids } = req.body;
  
  // First create the booking
  const bookingQuery = `
    INSERT INTO BookingHistory 
    (facility_id, booking_date, schedule_id, user_id, operator_email, cost, user_type, receipt_path) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(bookingQuery, [facility_id, date, schedule_id, user_id, operator_email, cost, user_type, receipt_path], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ message: 'Failed to create booking' });
    }

    const booking_id = result.insertId;
    console.log('Created booking with ID:', booking_id);

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
              message: 'Booking created successfully',
              booking_id: booking_id
            });
          }
        });
      });
    } else {
      res.json({ 
        message: 'Booking created successfully',
        booking_id: booking_id
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
  const { name, email, department_name } = req.body;
  
  if (!name || !email || !department_name) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = 'INSERT INTO Supervisor (name, email, department_name) VALUES (?, ?, ?)';
  db.query(query, [name, email, department_name], (err, result) => {
    if (err) {
      console.error('Error adding supervisor:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to add supervisor' });
    }
    res.json({ message: 'Supervisor added successfully', id: result.insertId });
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
  const { name, email, department_name } = req.body;
  
  if (!name || !email || !department_name) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = 'UPDATE Supervisor SET name = ?, email = ?, department_name = ? WHERE id = ?';
  db.query(query, [name, email, department_name, id], (err, result) => {
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
