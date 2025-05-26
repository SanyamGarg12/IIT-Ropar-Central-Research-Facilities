-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS iitrpr;

-- Switch to the newly created database
USE iitrpr;

-- Create the Categories table
CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Create the Facilities table
CREATE TABLE IF NOT EXISTS Facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  specifications TEXT,
  usage_details TEXT,
  image_url VARCHAR(255),
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Create the Publications table
CREATE TABLE IF NOT EXISTS Publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  facility_id INT,
  FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE
);

-- Insert data into Categories table
INSERT INTO Categories (name, description)
VALUES 
  ('Miscellaneous', ''),
  ('Spectroscopy', ''),
  ('Microscopy', '');


ALTER TABLE Facilities
ADD COLUMN make_year INT AFTER name, -- Adding make_year column (integer for the year)
ADD COLUMN model VARCHAR(255) AFTER make_year, -- Adding model column (string for the model)
ADD COLUMN faculty_in_charge VARCHAR(255) AFTER model, -- Adding faculty-in-charge name (string)
ADD COLUMN contact_person_contact VARCHAR(15) AFTER faculty_in_charge; -- Adding contact number (string to accommodate formatting)

-- Insert data into Publications table
INSERT INTO Publications (title, link, facility_id)
VALUES 
  ('Advanced Imaging with Electron Microscopes', 'https://example.com/publication1', 1),
  ('3D Printing in Modern Engineering', 'https://example.com/publication2', 2),
  ('Research Trends in Scientific Libraries', 'https://example.com/publication3', 3),
  ('Innovation through Engineering Workshops', 'https://example.com/publication4', 4);

  -- Create the Members table
  CREATE TABLE IF NOT EXISTS Members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    profile_link VARCHAR(255),
    image_path VARCHAR(255)
  );

  -- Insert data into Members table
  INSERT INTO Members (name, designation, profile_link, image_path)
  VALUES
    ('John Doe', 'Software Engineer', 'https://example.com/profile/johndoe', '/images/johndoe.jpg'),
    ('Jane Smith', 'Project Manager', 'https://example.com/profile/janesmith', '/images/janesmith.jpg'),
    ('Sanyam', 'Chairman', 'https://example.com/profile/janesmith', '/images/janesmith.jpg'),
    ('garg', 'Vice Chairman', 'https://example.com/profile/janesmith', '/images/janesmith.jpg'),
    ('Alice Brown', 'Data Scientist', 'https://example.com/profile/alicebrown', '/images/alicebrown.jpg');


-- Create the Users table
CREATE TABLE Users ( 
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('Internal', 'External Academic', 'R&D Lab', 'Industry') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_number VARCHAR(15),
    org_name VARCHAR(255),  -- Organization name column
    id_proof VARCHAR(512),  -- File path of ID proof (increased length to store full path)
    verified ENUM('YES', 'NO') DEFAULT 'NO',  -- Verification status column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE facility_publications (
  facility_id INT,
  publication_id INT,
  PRIMARY KEY (facility_id, publication_id),
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
  FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
);


INSERT INTO Facility_Publications (facility_id, publication_id)
VALUES
  (2, 2),
  (3, 3),
  (4, 4),
  (5,2),
  (5,3),
  (5,4),
  (11, 3),
  (11, 4);
-- Create the LoginLogoutHistory table
CREATE TABLE LoginLogoutHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


ALTER TABLE facilities ADD COLUMN price_industry DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE facilities ADD COLUMN price_internal DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE facilities ADD COLUMN price_external DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE facilities ADD COLUMN price_r_and_d DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE facilities ADD COLUMN Faculty_contact VARCHAR(15);
ALTER TABLE facilities ADD COLUMN Faculty_email VARCHAR(255);
ALTER TABLE facilities ADD COLUMN operator_name VARCHAR(255);
ALTER TABLE facilities CHANGE COLUMN contact_person_contact operator_contact VARCHAR(15);
ALTER TABLE facilities ADD COLUMN operator_email VARCHAR(255);




CREATE TABLE FacilitySchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    weekday ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_slots INT,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    UNIQUE (facility_id, weekday, start_time, end_time)
);


-- Electron Microscope (Monday and Wednesday, 9 AM to 11 AM, split into 1-hour slots)
INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots)
VALUES 
  ((SELECT id FROM Facilities WHERE name = 'Electron Microscope'), 'Monday', '09:00:00', '10:00:00', 5),
  ((SELECT id FROM Facilities WHERE name = 'Electron Microscope'), 'Monday', '10:00:00', '11:00:00', 5),
  ((SELECT id FROM Facilities WHERE name = 'Electron Microscope'), 'Wednesday', '14:00:00', '15:00:00', 3),
  ((SELECT id FROM Facilities WHERE name = 'Electron Microscope'), 'Wednesday', '15:00:00', '16:00:00', 3);

-- 3D Printer (Tuesday and Thursday, 10 AM to 12 PM, split into 1-hour slots)
INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots)
VALUES 
  ((SELECT id FROM Facilities WHERE name = '3D Printer'), 'Tuesday', '10:00:00', '11:00:00', 4),
  ((SELECT id FROM Facilities WHERE name = '3D Printer'), 'Tuesday', '11:00:00', '12:00:00', 4),
  ((SELECT id FROM Facilities WHERE name = '3D Printer'), 'Thursday', '15:00:00', '16:00:00', 6),
  ((SELECT id FROM Facilities WHERE name = '3D Printer'), 'Thursday', '16:00:00', '17:00:00', 6);

-- Research Library (Monday to Friday, 8 AM to 6 PM, hourly slots)
INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots)
VALUES
  -- Monday to Friday, hourly slots from 8 AM to 6 PM
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '08:00:00', '09:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '09:00:00', '10:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '10:00:00', '11:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '11:00:00', '12:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '12:00:00', '13:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '13:00:00', '14:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '14:00:00', '15:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '15:00:00', '16:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '16:00:00', '17:00:00', 20),
  ((SELECT id FROM Facilities WHERE name = 'Research Library'), 'Monday', '17:00:00', '18:00:00', 20);

-- Repeat the same pattern for Tuesday to Friday...

-- Workshop Area (Friday and Saturday, split hourly)
INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots)
VALUES 
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Friday', '09:00:00', '10:00:00', 8),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Friday', '10:00:00', '11:00:00', 8),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Friday', '11:00:00', '12:00:00', 8),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Saturday', '13:00:00', '14:00:00', 10),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Saturday', '14:00:00', '15:00:00', 10),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Saturday', '15:00:00', '16:00:00', 10),
  ((SELECT id FROM Facilities WHERE name = 'Workshop Area'), 'Saturday', '16:00:00', '17:00:00', 10);


-- Create the BookingHistory table
CREATE TABLE BookingHistory (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    schedule_id INT NOT NULL,
    booking_date DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Cancelled') DEFAULT 'Pending',
    cost DECIMAL(10, 2),
    receipt_path VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES FacilitySchedule(schedule_id) ON DELETE CASCADE,
    UNIQUE (facility_id, schedule_id, booking_date, user_id),
    operator_email VARCHAR(255)
);

CREATE TABLE forms (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique identifier for each form
    form_name VARCHAR(255) NOT NULL,         -- Name of the form
    description TEXT,                        -- Description of the form
    form_link VARCHAR(2083) NOT NULL,        -- Link to the form
    facility_name VARCHAR(255),             -- Name of the related facility
    facility_link VARCHAR(2083),            -- Link to the facility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Last update timestamp
);

INSERT INTO forms (form_name, description, form_link, facility_name, facility_link)
VALUES
('Equipment Request Form', 'Form to request lab equipment for experiments', 'https://example.com/equipment-request', 'Central Lab Facility', 'https://example.com/central-lab'),
('Room Booking Form', 'Form to book seminar and conference rooms', 'https://example.com/room-booking', 'Event Management', 'https://example.com/event-management'),
('Research Proposal Submission', 'Form for submitting research project proposals', 'https://example.com/research-proposal', 'Research Department', 'https://example.com/research-department'),
('Maintenance Request Form', 'Request form for facility maintenance services', 'https://example.com/maintenance-request', 'Maintenance Department', 'https://example.com/maintenance-department'),
('Library Membership Form', 'Form to apply for library membership', 'https://example.com/library-membership', 'Library Services', 'https://example.com/library-services');

CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for each staff member
    name VARCHAR(255) NOT NULL,        -- Name of the staff member
    image_name VARCHAR(255),           -- Name of the image file
    designation VARCHAR(255) NOT NULL, -- Designation of the staff member
    phone VARCHAR(20),                 -- Phone number
    email VARCHAR(255) UNIQUE,         -- Email address
    office_address TEXT,               -- Office address
    qualification TEXT                 -- Qualification details
);

INSERT INTO staff (name, image_name, designation, phone, email, office_address, qualification) 
VALUES
('Dr. Rahul Sharma', 'rahul_sharma.jpg', 'Technical Officer', '9876543210', 'rahul.sharma@example.com', 'Office No. 101, Building A', 'PhD in Electronics'),
('Ms. Priya Nair', 'priya_nair.jpg', 'Technical Superintendent', '9876543211', 'priya.nair@example.com', 'Office No. 102, Building B', 'M.Tech in Computer Science'),
('Mr. Amit Kumar', 'amit_kumar.jpg', 'Junior Technical Superintendent', '9876543212', 'amit.kumar@example.com', 'Office No. 103, Building C', 'B.Tech in Mechanical Engineering'),
('Ms. Sneha Verma', 'sneha_verma.jpg', 'Operator', '9876543213', 'sneha.verma@example.com', 'Office No. 104, Building D', 'Diploma in Electrical Engineering'),
('Mr. Anil Singh', 'anil_singh.jpg', 'Others', '9876543214', 'anil.singh@example.com', 'Office No. 105, Building E', 'BSc in Physics');


CREATE TABLE heroImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imagepath VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255)
);

-- Create the heroNews table
CREATE TABLE heroNews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    imagepath VARCHAR(255) NOT NULL,
    link VARCHAR(255) DEFAULT 'https://iitrpr.ac.in'
);

-- Create the thought table
CREATE TABLE thought (
    id INT PRIMARY KEY DEFAULT 1, -- To ensure only one entry
    thought_text TEXT NOT NULL
);

-- Populate heroImages table
INSERT INTO heroImages (imagepath, title, subtitle)
VALUES 
('/images/hero1.jpg', 'Welcome to the Future', 'Discover the innovations shaping tomorrow.'),
('/images/hero2.jpg', 'Your Gateway to Knowledge', 'Unlock the potential of endless learning.'),
('/images/hero3.jpg', 'Empowering Communities', 'Together, we achieve greatness.');

-- Populate heroNews table
INSERT INTO heroNews (news_title, summary, imagepath, link)
VALUES 
('Breaking: Tech Revolution in AI', 
 'AI has reached unprecedented heights, transforming industries across the globe.', 
 '/images/news1.jpg', 
 'https://example.com/ai-revolution'),
('Climate Change Updates', 
 'Recent studies show a path to sustainability through collective action.', 
 '/images/news2.jpg', 
 'https://example.com/climate-change'),
('Healthcare Innovations in 2025', 
 'Explore groundbreaking healthcare solutions set to redefine treatment paradigms.', 
 '/images/news3.jpg', 
 'https://example.com/healthcare-innovations');

-- Populate thought table
INSERT INTO thought (id, thought_text)
VALUES 
(1, 'The only limit to our realization of tomorrow is our doubts of today.');

-- Create the management_cred table
CREATE TABLE management_cred (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    Pass VARCHAR(255) NOT NULL,
    Position VARCHAR(255) NOT NULL
);

INSERT INTO management_cred (email, pass, Position)
VALUES
    ('adminneetu@bansal.com', '123', 'Admin'),
    ('sneha.verma@example.com', '123', 'Operator'),
    ('sanyam.garg@example.com', '123', 'Operator');

Create table results(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    result_date VARCHAR(255) NOT NULL,
    result_file_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES BookingHistory(booking_id) ON DELETE CASCADE  
)

CREATE TABLE User_Publications (
    publication_id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    title_of_paper VARCHAR(255) NOT NULL,
    journal_name VARCHAR(255),
    volume_number INT,
    year INT,
    page_number VARCHAR(50),
    file_path VARCHAR(255),
    user_id INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Add receipt_path column to BookingHistory if it doesn't exist
ALTER TABLE BookingHistory ADD COLUMN receipt_path VARCHAR(255);

CREATE TABLE Supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL
);

CREATE TABLE InternalUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    supervisor_id INT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    verification_token VARCHAR(128),
    verified TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (supervisor_id) REFERENCES Supervisor(id)
);

CREATE TABLE SupervisorVerifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- insert into facilities table

-- New INSERT statements generated by AI Assistant

-- Clear existing data (optional, uncomment if you want to start fresh for these tables)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DELETE FROM SupervisorVerifications;
-- DELETE FROM InternalUsers;
-- DELETE FROM User_Publications;
-- DELETE FROM results;
-- DELETE FROM management_cred;
-- DELETE FROM thought; -- Or handle with REPLACE INTO
-- DELETE FROM heroNews;
-- DELETE FROM heroImages;
-- DELETE FROM staff;
-- DELETE FROM forms;
-- DELETE FROM BookingHistory;
-- DELETE FROM FacilitySchedule;
-- DELETE FROM LoginLogoutHistory;
-- DELETE FROM facility_publications;
-- DELETE FROM Publications;
-- DELETE FROM Facilities;
-- DELETE FROM Supervisor;
-- DELETE FROM Users;
-- DELETE FROM Members;
-- DELETE FROM Categories;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Populate Categories table
INSERT INTO Categories (id, name, description) VALUES
(101, 'Advanced Materials Characterization', 'Techniques for analyzing material properties.'),
(102, 'Biological Imaging', 'Microscopy and imaging for biological samples.'),
(103, 'Chemical Analysis', 'Spectroscopy and chromatography for chemical identification.'),
(104, 'Fabrication & Prototyping', 'Tools for creating prototypes and custom parts.');
-- Ensure to use different IDs if 1,2,3 are already used by previous inserts.
-- If IDs are auto-incrementing and you want to ignore previous ones, just omit ID column.
-- For this script, I will assume we are starting with fresh IDs or that existing ones are handled.

-- Populate Users table
-- Assuming password_hash is handled by backend, using placeholder 'password_hashed'
INSERT INTO Users (user_id, user_type, full_name, email, password_hash, contact_number, org_name, id_proof, verified, created_at) VALUES
(101, 'Internal', 'Dr. Priya Sharma', 'priya.sharma@example.com', 'password_hashed_priya', '9876500001', 'IIT Ropar', 'id_proofs/priya_sharma.pdf', 'YES', NOW()),
(102, 'External Academic', 'Prof. Anil Kumar', 'anil.kumar@university.edu', 'password_hashed_anil', '9876500002', 'Panjab University', 'id_proofs/anil_kumar.pdf', 'YES', NOW()),
(103, 'R&D Lab', 'Mr. Raj Patel', 'raj.patel@rdlab.org', 'password_hashed_raj', '9876500003', 'CSIR Lab', 'id_proofs/raj_patel.pdf', 'NO', NOW()),
(104, 'Industry', 'Ms. Sunita Singh', 'sunita.singh@industrycorp.com', 'password_hashed_sunita', '9876500004', 'Industry Corp', 'id_proofs/sunita_singh.pdf', 'YES', NOW()),
(105, 'Internal', 'Amit Verma', 'amit.verma@example.com', 'password_hashed_amit', '9876500005', 'IIT Ropar', 'id_proofs/amit_verma.pdf', 'NO', NOW());

-- Populate Supervisor table
INSERT INTO Supervisor (id, name, email, department_name) VALUES
(101, 'Dr. Ramesh Gupta', 'ramesh.gupta@iitrpr.ac.in', 'Computer Science'),
(102, 'Dr. Meena Iyer', 'meena.iyer@iitrpr.ac.in', 'Mechanical Engineering'),
(103, 'Dr. Vikram Rathore', 'vikram.rathore@iitrpr.ac.in', 'Physics'),
(104, 'Dr. Anjali Desai', 'anjali.desai@iitrpr.ac.in', 'Chemistry');

-- Populate Facilities table
-- Ensure category_id values (101-104) exist from Categories inserts above.
INSERT INTO Facilities (id, name, make_year, model, faculty_in_charge, operator_contact, description, specifications, usage_details, image_url, category_id, price_industry, price_internal, price_external, price_r_and_d, Faculty_contact, Faculty_email, operator_name, operator_email) VALUES
(101, 'High-Res SEM', 2022, 'Zeiss GeminiSEM 500', 'Dr. A. B. Charan', '9000011111', 'High-Resolution Scanning Electron Microscope', 'Resolution: 0.6nm, Max Mag: 2,000,000x', 'Sample prep required. Training mandatory.', 'uploads/facility_images/sem.jpg', 101, 5000.00, 500.00, 2500.00, 1000.00, '9112233445', 'ab.charan@iitrpr.ac.in', 'Rakesh Kumar', 'rakesh.op@iitrpr.ac.in'),
(102, 'Confocal Microscope', 2021, 'Leica TCS SP8', 'Dr. C. D. Elara', '9000022222', 'Laser Scanning Confocal Microscope', '4 lasers (405, 488, 561, 633nm)', 'Live cell imaging possible. Booking essential.', 'uploads/facility_images/confocal.jpg', 102, 6000.00, 600.00, 3000.00, 1200.00, '9223344556', 'cd.elara@iitrpr.ac.in', 'Sunita Devi', 'sunita.op@iitrpr.ac.in'),
(103, 'NMR Spectrometer', 2020, 'Bruker Avance III 600MHz', 'Dr. E. F. Ghani', '9000033333', 'Nuclear Magnetic Resonance Spectrometer', '600 MHz, Cryoprobe available', 'For liquid and solid-state NMR.', 'uploads/facility_images/nmr.jpg', 103, 7500.00, 750.00, 3750.00, 1500.00, '9334455667', 'ef.ghani@iitrpr.ac.in', 'Anil Mehta', 'anil.op@iitrpr.ac.in'),
(104, 'Metal 3D Printer', 2023, 'EOS M290', 'Dr. G. H. Ivan', '9000044444', 'Direct Metal Laser Sintering (DMLS)', 'Build volume: 250x250x325 mm', 'Material: Titanium, Steel. Design consultation available.', 'uploads/facility_images/metal_3d_printer.jpg', 104, 15000.00, 1500.00, 7500.00, 3000.00, '9445566778', 'gh.ivan@iitrpr.ac.in', 'Priya Chawla', 'priya.op@iitrpr.ac.in');

-- Populate Publications table (facility-specific publications)
-- Ensure facility_id values (101-104) exist from Facilities inserts above.
INSERT INTO Publications (id, title, link, facility_id) VALUES
(101, 'Advanced Material Analysis using SEM', 'https://example.com/pub/sem_analysis', 101),
(102, 'Imaging Cellular Structures with Confocal Microscopy', 'https://example.com/pub/confocal_cell_imaging', 102),
(103, 'Molecular Structure Elucidation by NMR', 'https://example.com/pub/nmr_structure', 103),
(104, 'Additive Manufacturing of Complex Metal Parts', 'https://example.com/pub/metal_3d_printing_parts', 104),
(105, 'Correlative Microscopy Techniques', 'https://example.com/pub/correlative_microscopy', 101);


-- Populate facility_publications table
-- Ensure facility_id and publication_id exist.
INSERT INTO facility_publications (facility_id, publication_id) VALUES
(101, 101),
(101, 105),
(102, 102),
(103, 103),
(104, 104);

-- Populate Members table
INSERT INTO Members (id, name, designation, profile_link, image_path) VALUES
(101, 'Prof. S. K. Das', 'Director', 'https://iitrpr.ac.in/director', 'uploads/members/sk_das.jpg'),
(102, 'Prof. Geeta Bhatt', 'Dean R&D', 'https://iitrpr.ac.in/dean_rnd', 'uploads/members/geeta_bhatt.jpg'),
(103, 'Dr. Manoj Singh', 'CRF Coordinator', 'https://iitrpr.ac.in/crf_coordinator', 'uploads/members/manoj_singh.jpg'),
(104, 'Ms. Kavita Joshi', 'Lab Manager', '#', 'uploads/members/kavita_joshi.jpg');

-- Populate LoginLogoutHistory table
-- Ensure user_id values (101-105) exist.
INSERT INTO LoginLogoutHistory (user_id, login_time, logout_time) VALUES
(101, NOW() - INTERVAL '2' DAY, NOW() - INTERVAL '2' DAY + INTERVAL '2' HOUR),
(102, NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY + INTERVAL '3' HOUR),
(103, NOW() - INTERVAL '1' DAY + INTERVAL '1' HOUR, NULL), -- User still logged in
(104, NOW() - INTERVAL '5' HOUR, NOW() - INTERVAL '1' HOUR),
(101, NOW() - INTERVAL '3' HOUR, NULL); -- User Priya logged in again

-- Populate FacilitySchedule table
-- Ensure facility_id values (101-104) exist.
INSERT INTO FacilitySchedule (schedule_id, facility_id, weekday, start_time, end_time, total_slots) VALUES
(101, 101, 'Monday', '09:00:00', '11:00:00', 2),
(102, 101, 'Wednesday', '14:00:00', '16:00:00', 2),
(103, 102, 'Tuesday', '10:00:00', '13:00:00', 3),
(104, 102, 'Thursday', '10:00:00', '13:00:00', 3),
(105, 103, 'Friday', '09:00:00', '17:00:00', 8),
(106, 104, 'Monday', '10:00:00', '12:00:00', 1),
(107, 104, 'Wednesday', '10:00:00', '12:00:00', 1);

-- Populate BookingHistory table
-- Ensure user_id, facility_id, schedule_id exist.
-- operator_email should match an operator from management_cred or staff, or be a valid email.
INSERT INTO BookingHistory (user_id, facility_id, schedule_id, booking_date, status, cost, receipt_path, operator_email) VALUES
(101, 101, 101, CURDATE() + INTERVAL '7' DAY, 'Pending', 500.00, 'uploads/receipts/receipt_booking_101_101.pdf', 'rakesh.op@iitrpr.ac.in'),
(102, 102, 103, CURDATE() + INTERVAL '10' DAY, 'Approved', 3000.00, 'uploads/receipts/receipt_booking_102_103.pdf', 'sunita.op@iitrpr.ac.in'),
(103, 103, 105, CURDATE() + INTERVAL '14' DAY, 'Pending', 1500.00, 'uploads/receipts/receipt_booking_103_105.pdf', 'anil.op@iitrpr.ac.in'),
(104, 104, 106, CURDATE() + INTERVAL '5' DAY, 'Approved', 15000.00, 'uploads/receipts/receipt_booking_104_106.pdf', 'priya.op@iitrpr.ac.in'),
(101, 102, 104, CURDATE() + INTERVAL '12' DAY, 'Cancelled', 600.00, 'uploads/receipts/receipt_booking_101_104.pdf', 'sunita.op@iitrpr.ac.in');

-- Populate forms table
INSERT INTO forms (form_name, description, form_link, facility_name, facility_link) VALUES
('NMR Sample Submission Form', 'Form for submitting samples for NMR analysis', 'https://example.com/forms/nmr_sample', 'NMR Spectrometer', 'https://example.com/facilities/nmr'),
('SEM Imaging Request', 'Request form for SEM imaging services', 'https://example.com/forms/sem_request', 'High-Res SEM', 'https://example.com/facilities/sem'),
('Confocal Usage Log', 'Log sheet for Confocal Microscope usage', 'https://example.com/forms/confocal_log', 'Confocal Microscope', 'https://example.com/facilities/confocal'),
('3D Printing Project Proposal', 'Submit your project proposal for Metal 3D Printing', 'https://example.com/forms/3dprint_proposal', 'Metal 3D Printer', 'https://example.com/facilities/metal_3d_printer');

-- Populate staff table
INSERT INTO staff (name, image_name, designation, phone, email, office_address, qualification) VALUES
('Dr. Alok Verma', 'alok_verma.jpg', 'Chief Technical Officer', '9988776601', 'alok.verma@iitrpr.ac.in', 'Room 101, CRF Building', 'PhD Material Science'),
('Ms. Rekha Sharma', 'rekha_sharma.jpg', 'Senior Technician SEM', '9988776602', 'rekha.sharma@iitrpr.ac.in', 'SEM Lab, CRF Building', 'M.Sc Physics'),
('Mr. Vijay Kumar', 'vijay_kumar.jpg', 'Technician NMR', '9988776603', 'vijay.kumar@iitrpr.ac.in', 'NMR Lab, CRF Building', 'B.Tech Chemical Eng.'),
('Ms. Tina Dcosta', 'tina_dcosta.jpg', 'Admin Assistant CRF', '9988776604', 'tina.dcosta@iitrpr.ac.in', 'CRF Office', 'MBA');
-- This matches one of the operator emails from management_cred
INSERT INTO staff (name, image_name, designation, phone, email, office_address, qualification) VALUES
('Sneha Verma', 'sneha_verma_staff.jpg', 'Operator', '9876543213', 'sneha.verma@example.com', 'CRF Operator Desk', 'Diploma in Instrumentation');


-- Populate heroImages table
INSERT INTO heroImages (imagepath, title, subtitle) VALUES
('uploads/hero/facility_collage.jpg', 'State-of-the-Art Research Facilities', 'Explore Cutting-Edge Instrumentation at IIT Ropar CRF'),
('uploads/hero/microscope_close_up.jpg', 'Unlock Microscopic Worlds', 'Advanced Imaging Solutions for Your Research'),
('uploads/hero/lab_scientist.jpg', 'Innovation Starts Here', 'Empowering Scientific Discovery'),
('uploads/hero/iit_ropar_campus.jpg', 'Excellence in Research and Education', 'Indian Institute of Technology Ropar');

-- Populate heroNews table
INSERT INTO heroNews (news_title, summary, imagepath, link) VALUES
('New Raman Spectrometer Acquired', 'CRF enhances its analytical capabilities with a new high-performance Raman spectrometer.', 'uploads/news/raman_spec.jpg', 'https://iitrpr.ac.in/crf/news/raman'),
('Workshop on Advanced Microscopy', 'Successful completion of a 3-day workshop on electron and confocal microscopy techniques.', 'uploads/news/microscopy_workshop.jpg', 'https://iitrpr.ac.in/crf/events/microscopy2024'),
('CRF Annual Report Published', 'Read about our achievements and facility usage statistics in the latest annual report.', 'uploads/news/annual_report.jpg', 'https://iitrpr.ac.in/crf/reports/annual2023'),
('Call for Proposals: Seed Grants', 'CRF invites research proposals for internal seed grants. Deadline approaching!', 'uploads/news/seed_grant.jpg', 'https://iitrpr.ac.in/crf/grants/seed2024');

-- Populate thought table (using REPLACE INTO to handle the single entry constraint)
REPLACE INTO thought (id, thought_text) VALUES (1, 'The journey of a thousand miles begins with a single step. - Lao Tzu');

-- Populate management_cred table
-- Ensuring some emails might overlap with Users or Staff for realistic operator/admin roles
-- Passwords should be hashed in a real system. Here, plain text for example.
INSERT INTO management_cred (email, Pass, Position) VALUES
('crf_admin@iitrpr.ac.in', 'admin_pass_hashed', 'Admin'),
('rakesh.op@iitrpr.ac.in', 'op_rakesh_pass_hashed', 'Operator'), -- SEM Operator from Facilities
('sunita.op@iitrpr.ac.in', 'op_sunita_pass_hashed', 'Operator'), -- Confocal Operator from Facilities
('anil.op@iitrpr.ac.in', 'op_anil_pass_hashed', 'Operator');     -- NMR Operator from Facilities
-- 'sneha.verma@example.com' is already in the file, assuming we add distinct ones or it handles duplicates via UNIQUE constraint.

-- Populate results table
-- Needs booking_id from BookingHistory (e.g., 102, 104 are 'Approved') and user_id from Users.
INSERT INTO results (user_id, booking_id, result_date, result_file_path) VALUES
(102, 102, CURDATE() + INTERVAL '11' DAY, 'uploads/results/result_102_102.zip'), -- Result for Prof. Anil Kumar's confocal booking
(104, 104, CURDATE() + INTERVAL '6' DAY, 'uploads/results/result_104_104.pdf'); -- Result for Ms. Sunita Singh's 3D printer booking

-- Populate User_Publications table
-- Needs user_id from Users.
INSERT INTO User_Publications (author_name, title_of_paper, journal_name, volume_number, year, page_number, file_path, user_id, status) VALUES
('Dr. Priya Sharma', 'Novel Drug Delivery Systems', 'Journal of Pharmaceutical Sciences', 110, 2023, '1234-1245', 'uploads/user_pubs/priya_pharma.pdf', 101, 'Approved'),
('Prof. Anil Kumar, Dr. Priya Sharma', 'AI in Material Science Discovery', 'Advanced Functional Materials', 33, 2024, '2300150', 'uploads/user_pubs/anil_priya_ai_mat.pdf', 102, 'Pending'),
('Mr. Raj Patel', 'Development of a New Catalyst', 'Catalysis Letters', 150, 2022, '800-810', 'uploads/user_pubs/raj_catalyst.pdf', 103, 'Approved'),
('Ms. Sunita Singh (Industry Corp)', 'Optimization of Manufacturing Process using IoT', 'IEEE Transactions on Industrial Informatics', 20, 2024, '550-560', 'uploads/user_pubs/sunita_iot.pdf', 104, 'Rejected');

-- Populate InternalUsers table
-- Needs user_id from Users (where user_type = 'Internal') and supervisor_id from Supervisor.
INSERT INTO InternalUsers (user_id, email, full_name, supervisor_id, department_name, verification_token, verified) VALUES
(101, 'priya.sharma@example.com', 'Dr. Priya Sharma', 101, 'Computer Science', 'token_priya_123', 1), -- Assuming user_id 101 is internal
(105, 'amit.verma@example.com', 'Amit Verma', 102, 'Mechanical Engineering', 'token_amit_456', 0);       -- Assuming user_id 105 is internal

-- Populate SupervisorVerifications table
-- Needs user_id (typically an InternalUser awaiting verification).
INSERT INTO SupervisorVerifications (user_id, token, created_at) VALUES
(105, 'token_amit_456', NOW()); -- For Amit Verma, matching the token in InternalUsers