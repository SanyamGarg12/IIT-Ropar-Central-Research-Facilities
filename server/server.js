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
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sdfadfs';

// Security middleware
app.use(helmet());
app.use(xss());
app.use(hpp());

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

// Enable CORS for cross-origin requests
app.use(cors());

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
      f.price_internal,
      f.price_external,
      f.price_r_and_d,
      f.price_industry,
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
  // console.log("req.body", req.body);
  const facilityId = req.params.id;
  const {
    name,
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
    price_internal,
    price_external,
    price_r_and_d,
    price_industry,
    publication_ids, // Array of publication IDs to associate with the facility
  } = req.body;

  // Get the uploaded image filename from req.file
  const image_url = req.file ? req.file.filename : null;

  // Validate required fields
  if (!name || !category_id) {
    return res.status(400).json({ error: "Missing required fields: name or category_id" });
  }

  // SQL query for updating the facility
  const updateQuery = `
    UPDATE Facilities
    SET 
      name = ?, 
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
      image_url = ?, 
      category_id = ?, 
      price_internal = ?, 
      price_external = ?, 
      price_r_and_d = ?, 
      price_industry = ?
    WHERE 
      id = ?
  `;

  const updateValues = [
    name,
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
    price_internal,
    price_external,
    price_r_and_d,
    price_industry,
    facilityId,
  ];

  db.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error("Error updating facility:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Facility not found" });
    }

    // Handle the publications update: delete old ones and add new ones
    const deletePublicationsQuery = `DELETE FROM Facility_Publications WHERE facility_id = ?`;
    db.query(deletePublicationsQuery, [facilityId], (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting old publications:", deleteErr);
        return res.status(500).json({ error: "Error updating publications" });
      }

      if (publication_ids && publication_ids.length > 0) {
        const insertPublicationsQuery = `
          INSERT INTO Facility_Publications (facility_id, publication_id)
          VALUES ?`;
        const publicationValues = publication_ids.map((pubId) => [facilityId, pubId]);

        db.query(insertPublicationsQuery, [publicationValues], (insertErr) => {
          if (insertErr) {
            console.error("Error inserting new publications:", insertErr);
            return res.status(500).json({ error: "Error inserting new publications" });
          }

          return res.status(200).json({
            message: "Facility and publications updated successfully",
            facilityId,
          });
        });
      } else {
        // No publications provided, return success
        return res.status(200).json({
          message: "Facility updated successfully",
          facilityId,
        });
      }
    });
  });
});


app.post('/api/facilities', upload.single("image"), (req, res) => {
  const {
    name,
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
    price_internal,
    price_external,
    price_r_and_d,
    price_industry,
    publications, // This should be an array of publication IDs
  } = req.body;

  // Get the uploaded image filename from req.file
  const image_url = req.file ? req.file.filename : null;

  const query = `
    INSERT INTO Facilities (
      name, 
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
      price_internal,
      price_external,
      price_r_and_d,
      price_industry
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
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
    price_internal,
    price_external,
    price_r_and_d,
    price_industry,
  ];

  // Insert into Facilities table
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting into Facilities:', err);
      return res.status(500).json({ error: 'Error adding facility' });
    }

    const facilityId = result.insertId;

    // If publications are provided, insert into Facilities_Publications table
    if (publications && publications.length > 0) {
      const publicationQuery = `
        INSERT INTO Facility_Publications (facility_id, publication_id)
        VALUES ?
      `;

      // Create values array for bulk insertion
      const publicationValues = publications.map((publicationId) => [facilityId, publicationId]);

      db.query(publicationQuery, [publicationValues], (pubErr) => {
        if (pubErr) {
          console.error('Error inserting into Facilities_Publications:', pubErr);
          return res.status(500).json({ error: 'Error associating facility with publications' });
        }

        return res.status(201).json({ message: 'Facility and publications added successfully', id: facilityId });
      });
    } else {
      // No publications, just return success for the facility insertion
      return res.status(201).json({ message: 'Facility added successfully', id: facilityId });
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

  const token = authHeader // Extract the token after "Bearer"

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

  const facilityQuery = `
    SELECT 
      f.id, 
      f.name, 
      f.make_year, 
      f.model, 
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
      f.price_internal, 
      f.price_external, 
      f.price_r_and_d, 
      f.price_industry, 
      c.name AS category_name
    FROM 
      Facilities f
    INNER JOIN 
      Categories c
    ON 
      f.category_id = c.id
    where 
      f.id = ?;
  `;

  const publicationsQuery = `
    SELECT 
      p.id, 
      p.title AS publication_title, 
      p.link AS publication_link
    FROM 
      Publications p
    INNER JOIN 
      Facility_Publications fp
    ON 
      p.id = fp.publication_id
    WHERE 
      fp.facility_id = ?
  `;

  // Fetch facility details
  db.query(facilityQuery, [facilityId], (facilityErr, facilityResults) => {
    if (facilityErr) {
      console.error('Error fetching facility:', facilityErr);
      return res.status(500).json({ error: 'Error fetching facility' });
    }

    if (facilityResults.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = facilityResults[0];

    // Fetch publications mapped to the facility
    db.query(publicationsQuery, [facilityId], (pubErr, publicationResults) => {
      if (pubErr) {
        console.error('Error fetching publications:', pubErr);
        return res.status(500).json({ error: 'Error fetching publications' });
      }

      // Attach publications to the facility object
      facility.publications = publicationResults;
      res.json(facility);
    });
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
    // Generate a JWT token with the username (email can be used as identifier)
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

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

app.post('/api/forms', (req, res) => {
  const { form_name, description, form_link, facility_name, facility_link } = req.body;
  if (!form_name || !description || !form_link || !facility_name || !facility_link) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query =
    'INSERT INTO forms (form_name, description, form_link, facility_name, facility_link) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [form_name, description, form_link, facility_name, facility_link], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database insertion error' });
    res.status(201).json({ id: result.insertId, form_name, description, form_link, facility_name, facility_link });
  });
});

// Edit an existing form
app.put('/api/forms/:id', (req, res) => {
  const { id } = req.params;
  const { form_name, description, form_link, facility_name, facility_link } = req.body;

  const query =
    'UPDATE forms SET form_name = ?, description = ?, form_link = ?, facility_name = ?, facility_link = ? WHERE id = ?';
  db.query(
    query,
    [form_name, description, form_link, facility_name, facility_link, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database update error' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Form not found' });
      res.status(200).json({ message: 'Form updated successfully' });
    }
  );
});

// Delete a form
app.delete('/api/forms/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM forms WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database deletion error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Form not found' });
    res.status(200).json({ message: 'Form deleted successfully' });
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
              'receipt_path', bh.receipt_path
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
    BookingHistory.*,
    Facilities.name as facility_name,
    FacilitySchedule.start_time,
    FacilitySchedule.end_time
  FROM
    BookingHistory
  INNER JOIN
    Facilities ON BookingHistory.facility_id = Facilities.id
  INNER JOIN
    FacilitySchedule ON BookingHistory.schedule_id = FacilitySchedule.schedule_id
  WHERE
    BookingHistory.user_id = ?
  ORDER BY BookingHistory.booking_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching booking history.');
    }
    
    const formattedResults = results.map(booking => ({
      ...booking,
      facility_name: booking.facility_name,
      slot: `${booking.start_time} - ${booking.end_time}`
    }));
    
    res.json(formattedResults);
  });
});


app.get('/api/booking-requests', authenticateToken, (req, res) => {

  const query = `
    SELECT 
      BookingHistory.user_id,
      Users.full_name AS user_name,
      BookingHistory.facility_id,
      Facilities.name AS facility_name,
      BookingHistory.booking_date,
      BookingHistory.status,
      BookingHistory.cost,
      BookingHistory.schedule_id,
      BookingHistory.booking_id,
      BookingHistory.receipt_path
    FROM 
      BookingHistory
    JOIN 
      Users ON BookingHistory.user_id = Users.user_id
    JOIN 
      Facilities ON BookingHistory.facility_id = Facilities.id
    WHERE 
      BookingHistory.operator_email = ?
  `;

  db.query(query, [req.query.operatorEmail], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching booking history.');
    }
    res.status(200).json(results);
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
      f.faculty_in_charge,
      f.contact_person_contact,
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
    console.log(req.body);
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

app.get('/api/weekly-slots', authenticateToken, (req, res) => {
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