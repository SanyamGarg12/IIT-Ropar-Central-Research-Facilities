const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = 5000;
const JWT_SECRET = 'abcd';
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
        INSERT INTO Facilities_Publications (facility_id, publication_id)
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

app.post('/api/hero', (req, res) => {
  const { action} = req.body;
  
  if(action === 'updateSlider'){
    const { src,title, subtitle  } = req.body;
    var data = { src, title, subtitle };
  }else if(action === 'updateThought'){
    const { thought } = req.body;
    var data = thought ;
  }else if(action === 'addNews'){
    const {action, title, summary, image, link } = req.body;
    var data = { action, title, summary, image, link };
  }
  const filePath = path.join(__dirname, 'homeContent.json');

  fs.readFile(filePath, 'utf-8', (readErr, fileContent) => {
    if (readErr) {
      console.error('Error reading hero content:', readErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let heroContent;
    try {
      heroContent = JSON.parse(fileContent);
    } catch (parseErr) {
      console.error('Error parsing hero content:', parseErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    switch (action) {
      case 'updateSlider':
        heroContent.sliderImages.push(data);
        break;
      case 'updateThought':
        heroContent.Thought = data;
        break;
      case 'addNews':
        heroContent.NewsFeed.push(data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    fs.writeFile(filePath, JSON.stringify(heroContent, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing hero content:', writeErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ message: 'Hero content updated successfully' });
    });
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

  const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).send("Invalid Token");
    }
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
    console.log(err, results);
    if (err) {
      return res.status(500).json({ message: "Server error." });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or user type." });
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


app.post('/api/logout', (req, res) => {
  // TODO
  // Note : table named LoginLogoutHistory has to be created in the database(query is already written in the sql file). We will store past 2 days entry and please code to delete oldeer entreis automatically!
  // Also, during logging in, make entry in this table too!.
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

app.post('/api/change-password', authenticateToken, async (req, res) => {
  // change password logic here , refer to table named users to edit password all 4 kind of users are there!.
  // Note : users table will be modified later(4-5 Columns add honge), for now, just change password of the user who is logged in.
  // TODO
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

//removed authenticate token from this route
app.post('/api/booking', (req, res) => {
  const { facility, date, schedule_id, user_id } = req.body;
  const query = `INSERT INTO bookinghistory (user_id, facility_id, booking_date, schedule_id) VALUES (?, ?, ?, ?)`;
  try {
    db.query(query, [user_id, facility, date, schedule_id], (err, result) => {
      // console.log("result",result);
      // console.log("err",err);
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

app.get('/api/getsliderimages', (req, res) => {
  res.sendFile(path.join(__dirname, 'homeContent.json'));
});

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
  console.log(facilityId);
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


app.put("/api/facilities/:id", (req, res) => {
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
    image_url,
    category_id,
    price_internal,
    price_external,
    price_r_and_d,
    price_industry,
  } = req.body;

  // Corrected SQL Query
  const query = `
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
    facilityId, // The last value corresponds to the `id` to match the `WHERE` clause
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating facility:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.status(200).json({
      message: "Facility updated successfully",
      facilityId,
    });
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

app.post('/api/saveAboutContent', (req, res) => {
  const aboutContent = req.body;

  // Save the updated about content to a JSON file
  fs.writeFile(path.join(__dirname, 'aboutContent.json'), JSON.stringify(aboutContent, null, 2), (err) => {
    if (err) {
      console.error('Error saving about content:', err);
      res.status(500).send('Error saving about content');
    } else {
      res.send('About content saved successfully');
    }
  });
});

// get available slots for a facility on a particular date
function getWeekday(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

app.get("/api/slots", async (req, res) => {

  //pending according to number of people can be accomodated in a slot




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

    // console.log("totalSlots: ", totalSlots);

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

    // console.log("bookedSlots: ", bookedSlots);

    // Extract schedule_ids of booked slots
    const bookedSlotIds = bookedSlots
      .filter((slot) => slot.status === "Approved")
      .map((slot) => slot.schedule_id);

    // console.log("bookedSlotIds: ", bookedSlotIds);
    // Add 'available' field to each slot, indicating whether the slot is available for booking
    const slotsWithAvailability = totalSlots.map((slot) => ({
      ...slot,
      available: !bookedSlotIds.includes(slot.schedule_id),
    }));

    // console.log("slotsWithAvailability: ", slotsWithAvailability);

    // Return all slots with the 'available' field
    return res.status(200).json({ slots: slotsWithAvailability });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Error fetching slots");
  }
});




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});