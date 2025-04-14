drop database iitrpr if exists;

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
  ('Laboratory', 'Research facilities for scientific experiments'),
  ('Equipment', 'High-end research equipment available for use'),
  ('Library', 'Collection of academic and research resources'),
  ('Workshop', 'Facilities for hands-on project development');


ALTER TABLE Facilities
ADD COLUMN make_year INT AFTER name, -- Adding make_year column (integer for the year)
ADD COLUMN model VARCHAR(255) AFTER make_year, -- Adding model column (string for the model)
ADD COLUMN faculty_in_charge VARCHAR(255) AFTER model, -- Adding faculty-in-charge name (string)
ADD COLUMN contact_person_contact VARCHAR(15) AFTER faculty_in_charge; -- Adding contact number (string to accommodate formatting)

-- Insert data into Facilities table
INSERT INTO Facilities (name, description, specifications, usage_details, image_url, category_id, make_year, model, faculty_in_charge, contact_person_contact)
VALUES 
  ('Electron Microscope', 'A high-resolution electron microscope for imaging.', 'Resolution: 1nm', 'Available for biological and material research.', 'https://imgur.com/a/GWMS84J', 1, 2020, 'EM-2020', 'Dr. Alice Johnson', '+1234567890'),
  ('3D Printer', 'A state-of-the-art 3D printer for prototyping and research.', 'Resolution: 50 microns', 'Available for mechanical and electronic design projects.', 'https://drive.google.com/uc?id=example_id_2', 2, 2018, '3DP-500', 'Dr. Bob Smith', '+0987654321'),
  ('Research Library', 'A collection of scientific journals, books, and articles.', 'Over 2000 journals and books', 'Available for students and faculty for academic research.', 'https://drive.google.com/uc?id=example_id_3', 3, 2010, 'RL-01', 'Dr. Clara White', '+1122334455'),
  ('Workshop Area', 'A space for hands-on engineering projects.', 'Machines: CNC, Lathe, etc.', 'Available for student and faculty project development.', 'https://drive.google.com/uc?id=example_id_4', 4, 2015, 'WA-300', 'Dr. David Brown', '+2233445566');



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

