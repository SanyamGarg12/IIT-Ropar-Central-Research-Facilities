-- Create the database if it doesn't exist
DROP DATABASE IF EXISTS iitrpr;
CREATE DATABASE iitrpr;

-- Switch to the newly created database
USE iitrpr;

-- Create the Categories table
CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);
-- Insert data into Categories table
INSERT INTO Categories (name, description) VALUES
('Miscellaneous', ''),
('Spectroscopy', ''),
('Microscopy', '');

-- Create the Facilities table
CREATE TABLE IF NOT EXISTS Facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  make_year INT,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  faculty_in_charge VARCHAR(255),
  operator_contact VARCHAR(15),
  description TEXT,
  specifications TEXT,
  usage_details TEXT,
  image_url VARCHAR(255),
  category_id INT,
  Faculty_contact VARCHAR(15),
  Faculty_email VARCHAR(255),
  operator_name VARCHAR(255),
  operator_email VARCHAR(255),
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

ALTER TABLE facilities
ADD COLUMN special_note VARCHAR(255);

CREATE TABLE facility_bifurcations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT,
    bifurcation_name VARCHAR(255) NOT NULL,
    pricing_type ENUM('slot', 'hour', 'half-hour') NOT NULL,
    price_internal DECIMAL(10,2),
    price_internal_consultancy DECIMAL(10,2),
    price_external DECIMAL(10,2),
    price_industry DECIMAL(10,2),
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Create the Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('Internal', 'Internal Consultancy', 'Government R&D Lab or External Academics', 'Private Industry or Private R&D Lab') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_number VARCHAR(15),
    org_name VARCHAR(255),
    id_proof VARCHAR(512),
    verified ENUM('YES', 'NO') DEFAULT 'NO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Supervisor table
CREATE TABLE Supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL
);

-- Create the Publications table
CREATE TABLE Publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  facility_id INT,
  FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE
);

-- Create the Members table
CREATE TABLE Members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  profile_link VARCHAR(255),
  image_path VARCHAR(255)
);

-- Create the FacilitySchedule table
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
    operator_email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES FacilitySchedule(schedule_id) ON DELETE CASCADE,
    UNIQUE (facility_id, schedule_id, booking_date, user_id)
);

CREATE TABLE BookingBifurcations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    bifurcation_id INT NOT NULL,
    sample_count INT NOT NULL DEFAULT 1,
    FOREIGN KEY (booking_id) REFERENCES BookingHistory(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (bifurcation_id) REFERENCES facility_bifurcations(id) ON DELETE CASCADE
);

-- Create the forms table
CREATE TABLE forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_name VARCHAR(255) NOT NULL,
    description TEXT,
    form_link VARCHAR(2083) NOT NULL,
    facility_name VARCHAR(255),
    facility_link VARCHAR(2083),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the staff table
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_name VARCHAR(255),
    designation VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    office_address TEXT,
    qualification TEXT
);

-- Create the heroImages table
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
    id INT PRIMARY KEY DEFAULT 1,
    thought_text TEXT NOT NULL
);

-- Create the management_cred table
CREATE TABLE management_cred (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    Pass VARCHAR(255) NOT NULL,
    Position VARCHAR(255) NOT NULL
);

-- Create the results table
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    result_date VARCHAR(255) NOT NULL,
    result_file_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES BookingHistory(booking_id) ON DELETE CASCADE
);

-- Create the User_Publications table
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

-- Create the InternalUsers table
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

-- Create the SupervisorVerifications table
CREATE TABLE SupervisorVerifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create the facility_publications table
CREATE TABLE facility_publications (
    facility_id INT,
    publication_id INT,
    PRIMARY KEY (facility_id, publication_id),
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (publication_id) REFERENCES Publications(id) ON DELETE CASCADE
);

-- Create the LoginLogoutHistory table
CREATE TABLE LoginLogoutHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Now insert data in the correct order
-- Insert data into Categories
INSERT INTO Categories (name, description) VALUES
('Advanced Materials Characterization', 'Techniques for analyzing material properties.'),
('Biological Imaging', 'Microscopy and imaging for biological samples.'),
('Chemical Analysis', 'Spectroscopy and chromatography for chemical identification.'),
('Fabrication & Prototyping', 'Tools for creating prototypes and custom parts.'),
('Miscellaneous', ''),
('Spectroscopy', ''),
('Microscopy', '');

-- Insert data into Facilities
INSERT INTO Facilities (name, make_year, model, faculty_in_charge, operator_contact, description, specifications, usage_details, image_url, category_id, price_industry, price_internal, price_external, price_r_and_d, Faculty_contact, Faculty_email, operator_name, operator_email) VALUES
('High-Res SEM', 2022, 'Zeiss GeminiSEM 500', 'Dr. A. B. Charan', '9000011111', 'High-Resolution Scanning Electron Microscope', 'Resolution: 0.6nm, Max Mag: 2,000,000x', 'Sample prep required. Training mandatory.', 'uploads/facility_images/sem.jpg', 1, 5000.00, 500.00, 2500.00, 1000.00, '9112233445', 'ab.charan@iitrpr.ac.in', 'Rakesh Kumar', 'rakesh.op@iitrpr.ac.in'),
('Confocal Microscope', 2021, 'Leica TCS SP8', 'Dr. C. D. Elara', '9000022222', 'Laser Scanning Confocal Microscope', '4 lasers (405, 488, 561, 633nm)', 'Live cell imaging possible. Booking essential.', 'uploads/facility_images/confocal.jpg', 2, 6000.00, 600.00, 3000.00, 1200.00, '9223344556', 'cd.elara@iitrpr.ac.in', 'Sunita Devi', 'sunita.op@iitrpr.ac.in'),
('NMR Spectrometer', 2020, 'Bruker Avance III 600MHz', 'Dr. E. F. Ghani', '9000033333', 'Nuclear Magnetic Resonance Spectrometer', '600 MHz, Cryoprobe available', 'For liquid and solid-state NMR.', 'uploads/facility_images/nmr.jpg', 3, 7500.00, 750.00, 3750.00, 1500.00, '9334455667', 'ef.ghani@iitrpr.ac.in', 'Anil Mehta', 'anil.op@iitrpr.ac.in'),
('Metal 3D Printer', 2023, 'EOS M290', 'Dr. G. H. Ivan', '9000044444', 'Direct Metal Laser Sintering (DMLS)', 'Build volume: 250x250x325 mm', 'Material: Titanium, Steel. Design consultation available.', 'uploads/facility_images/metal_3d_printer.jpg', 4, 15000.00, 1500.00, 7500.00, 3000.00, '9445566778', 'gh.ivan@iitrpr.ac.in', 'Priya Chawla', 'priya.op@iitrpr.ac.in');

-- Insert data into Users
INSERT INTO Users (user_type, full_name, email, password_hash, contact_number, org_name, id_proof, verified) VALUES
('Internal', 'Dr. Priya Sharma', 'priya.sharma@example.com', 'password_hashed_priya', '9876500001', 'IIT Ropar', 'id_proofs/priya_sharma.pdf', 'YES'),
('External Academic', 'Prof. Anil Kumar', 'anil.kumar@university.edu', 'password_hashed_anil', '9876500002', 'Panjab University', 'id_proofs/anil_kumar.pdf', 'YES'),
('R&D Lab', 'Mr. Raj Patel', 'raj.patel@rdlab.org', 'password_hashed_raj', '9876500003', 'CSIR Lab', 'id_proofs/raj_patel.pdf', 'NO'),
('Industry', 'Ms. Sunita Singh', 'sunita.singh@industrycorp.com', 'password_hashed_sunita', '9876500004', 'Industry Corp', 'id_proofs/sunita_singh.pdf', 'YES'),
('Internal', 'Amit Verma', 'amit.verma@example.com', 'password_hashed_amit', '9876500005', 'IIT Ropar', 'id_proofs/amit_verma.pdf', 'NO');

-- Insert data into Supervisor
INSERT INTO Supervisor (name, email, department_name) VALUES
('Dr. Ramesh Gupta', 'ramesh.gupta@iitrpr.ac.in', 'Computer Science'),
('Dr. Meena Iyer', 'meena.iyer@iitrpr.ac.in', 'Mechanical Engineering'),
('Dr. Vikram Rathore', 'vikram.rathore@iitrpr.ac.in', 'Physics'),
('Dr. Anjali Desai', 'anjali.desai@iitrpr.ac.in', 'Chemistry');

-- Insert data into Publications
INSERT INTO Publications (title, link, facility_id) VALUES
('Advanced Material Analysis using SEM', 'https://example.com/pub/sem_analysis', 1),
('Imaging Cellular Structures with Confocal Microscopy', 'https://example.com/pub/confocal_cell_imaging', 2),
('Molecular Structure Elucidation by NMR', 'https://example.com/pub/nmr_structure', 3),
('Additive Manufacturing of Complex Metal Parts', 'https://example.com/pub/metal_3d_printing_parts', 4),
('Correlative Microscopy Techniques', 'https://example.com/pub/correlative_microscopy', 1);

-- Insert data into Members
INSERT INTO Members (name, designation, profile_link, image_path) VALUES
('Prof. S. K. Das', 'Director', 'https://iitrpr.ac.in/director', 'uploads/members/sk_das.jpg'),
('Prof. Geeta Bhatt', 'Dean R&D', 'https://iitrpr.ac.in/dean_rnd', 'uploads/members/geeta_bhatt.jpg'),
('Dr. Manoj Singh', 'CRF Coordinator', 'https://iitrpr.ac.in/crf_coordinator', 'uploads/members/manoj_singh.jpg'),
('Ms. Kavita Joshi', 'Lab Manager', '#', 'uploads/members/kavita_joshi.jpg');

-- Insert data into FacilitySchedule
INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots) VALUES
(1, 'Monday', '09:00:00', '11:00:00', 2),
(1, 'Wednesday', '14:00:00', '16:00:00', 2),
(2, 'Tuesday', '10:00:00', '13:00:00', 3),
(2, 'Thursday', '10:00:00', '13:00:00', 3),
(3, 'Friday', '09:00:00', '17:00:00', 8),
(4, 'Monday', '10:00:00', '12:00:00', 1),
(4, 'Wednesday', '10:00:00', '12:00:00', 1);

-- Insert data into BookingHistory
INSERT INTO BookingHistory (user_id, facility_id, schedule_id, booking_date, status, cost, receipt_path, operator_email) VALUES
(1, 1, 1, CURDATE() + INTERVAL '7' DAY, 'Pending', 500.00, 'uploads/receipts/receipt_booking_101_101.pdf', 'rakesh.op@iitrpr.ac.in'),
(2, 2, 3, CURDATE() + INTERVAL '10' DAY, 'Approved', 3000.00, 'uploads/receipts/receipt_booking_102_103.pdf', 'sunita.op@iitrpr.ac.in'),
(3, 3, 5, CURDATE() + INTERVAL '14' DAY, 'Pending', 1500.00, 'uploads/receipts/receipt_booking_103_105.pdf', 'anil.op@iitrpr.ac.in'),
(4, 4, 6, CURDATE() + INTERVAL '5' DAY, 'Approved', 15000.00, 'uploads/receipts/receipt_booking_104_106.pdf', 'priya.op@iitrpr.ac.in'),
(1, 2, 4, CURDATE() + INTERVAL '12' DAY, 'Cancelled', 600.00, 'uploads/receipts/receipt_booking_101_104.pdf', 'sunita.op@iitrpr.ac.in');

-- Insert data into forms
INSERT INTO forms (form_name, description, form_link, facility_name, facility_link) VALUES
('NMR Sample Submission Form', 'Form for submitting samples for NMR analysis', 'https://example.com/forms/nmr_sample', 'NMR Spectrometer', 'https://example.com/facilities/nmr'),
('SEM Imaging Request', 'Request form for SEM imaging services', 'https://example.com/forms/sem_request', 'High-Res SEM', 'https://example.com/facilities/sem'),
('Confocal Usage Log', 'Log sheet for Confocal Microscope usage', 'https://example.com/forms/confocal_log', 'Confocal Microscope', 'https://example.com/facilities/confocal'),
('3D Printing Project Proposal', 'Submit your project proposal for Metal 3D Printing', 'https://example.com/forms/3dprint_proposal', 'Metal 3D Printer', 'https://example.com/facilities/metal_3d_printer');

-- Insert data into staff
INSERT INTO staff (name, image_name, designation, phone, email, office_address, qualification) VALUES
('Dr. Alok Verma', 'alok_verma.jpg', 'Chief Technical Officer', '9988776601', 'alok.verma@iitrpr.ac.in', 'Room 101, CRF Building', 'PhD Material Science'),
('Ms. Rekha Sharma', 'rekha_sharma.jpg', 'Senior Technician SEM', '9988776602', 'rekha.sharma@iitrpr.ac.in', 'SEM Lab, CRF Building', 'M.Sc Physics'),
('Mr. Vijay Kumar', 'vijay_kumar.jpg', 'Technician NMR', '9988776603', 'vijay.kumar@iitrpr.ac.in', 'NMR Lab, CRF Building', 'B.Tech Chemical Eng.'),
('Ms. Tina Dcosta', 'tina_dcosta.jpg', 'Admin Assistant CRF', '9988776604', 'tina.dcosta@iitrpr.ac.in', 'CRF Office', 'MBA');

-- Insert data into heroImages
INSERT INTO heroImages (imagepath, title, subtitle) VALUES
('uploads/hero/facility_collage.jpg', 'State-of-the-Art Research Facilities', 'Explore Cutting-Edge Instrumentation at IIT Ropar CRF'),
('uploads/hero/microscope_close_up.jpg', 'Unlock Microscopic Worlds', 'Advanced Imaging Solutions for Your Research'),
('uploads/hero/lab_scientist.jpg', 'Innovation Starts Here', 'Empowering Scientific Discovery'),
('uploads/hero/iit_ropar_campus.jpg', 'Excellence in Research and Education', 'Indian Institute of Technology Ropar');

-- Insert data into heroNews
INSERT INTO heroNews (news_title, summary, imagepath, link) VALUES
('New Raman Spectrometer Acquired', 'CRF enhances its analytical capabilities with a new high-performance Raman spectrometer.', 'uploads/news/raman_spec.jpg', 'https://iitrpr.ac.in/crf/news/raman'),
('Workshop on Advanced Microscopy', 'Successful completion of a 3-day workshop on electron and confocal microscopy techniques.', 'uploads/news/microscopy_workshop.jpg', 'https://iitrpr.ac.in/crf/events/microscopy2024'),
('CRF Annual Report Published', 'Read about our achievements and facility usage statistics in the latest annual report.', 'uploads/news/annual_report.jpg', 'https://iitrpr.ac.in/crf/reports/annual2023'),
('Call for Proposals: Seed Grants', 'CRF invites research proposals for internal seed grants. Deadline approaching!', 'uploads/news/seed_grant.jpg', 'https://iitrpr.ac.in/crf/grants/seed2024');

-- Insert data into thought
INSERT INTO thought (id, thought_text) VALUES (1, 'The journey of a thousand miles begins with a single step. - Lao Tzu');

-- Insert data into management_cred
INSERT INTO management_cred (email, Pass, Position) VALUES
('crf_admin@iitrpr.ac.in', 'admin_pass_hashed', 'Admin'),
('rakesh.op@iitrpr.ac.in', 'op_rakesh_pass_hashed', 'Operator'),
('sunita.op@iitrpr.ac.in', 'op_sunita_pass_hashed', 'Operator'),
('anil.op@iitrpr.ac.in', 'op_anil_pass_hashed', 'Operator');

-- Insert data into results
INSERT INTO results (user_id, booking_id, result_date, result_file_path) VALUES
(2, 2, CURDATE() + INTERVAL '11' DAY, 'uploads/results/result_102_102.zip'),
(4, 4, CURDATE() + INTERVAL '6' DAY, 'uploads/results/result_104_104.pdf');

-- Insert data into User_Publications
INSERT INTO User_Publications (author_name, title_of_paper, journal_name, volume_number, year, page_number, file_path, user_id, status) VALUES
('Dr. Priya Sharma', 'Novel Drug Delivery Systems', 'Journal of Pharmaceutical Sciences', 110, 2023, '1234-1245', 'uploads/user_pubs/priya_pharma.pdf', 1, 'Approved'),
('Prof. Anil Kumar, Dr. Priya Sharma', 'AI in Material Science Discovery', 'Advanced Functional Materials', 33, 2024, '2300150', 'uploads/user_pubs/anil_priya_ai_mat.pdf', 2, 'Pending'),
('Mr. Raj Patel', 'Development of a New Catalyst', 'Catalysis Letters', 150, 2022, '800-810', 'uploads/user_pubs/raj_catalyst.pdf', 3, 'Approved'),
('Ms. Sunita Singh (Industry Corp)', 'Optimization of Manufacturing Process using IoT', 'IEEE Transactions on Industrial Informatics', 20, 2024, '550-560', 'uploads/user_pubs/sunita_iot.pdf', 4, 'Rejected');

-- Insert data into InternalUsers
INSERT INTO InternalUsers (user_id, email, full_name, supervisor_id, department_name, verification_token, verified) VALUES
(1, 'priya.sharma@example.com', 'Dr. Priya Sharma', 1, 'Computer Science', 'token_priya_123', 1),
(5, 'amit.verma@example.com', 'Amit Verma', 2, 'Mechanical Engineering', 'token_amit_456', 0);

-- Insert data into SupervisorVerifications
INSERT INTO SupervisorVerifications (user_id, token, created_at) VALUES
(5, 'token_amit_456', NOW());

-- Insert data into facility_publications
INSERT INTO facility_publications (facility_id, publication_id) VALUES
(1, 1),
(1, 5),
(2, 2),
(3, 3),
(4, 4);

-- Insert data into LoginLogoutHistory
INSERT INTO LoginLogoutHistory (user_id, login_time, logout_time) VALUES
(1, NOW() - INTERVAL '2' DAY, NOW() - INTERVAL '2' DAY + INTERVAL '2' HOUR),
(2, NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY + INTERVAL '3' HOUR),
(3, NOW() - INTERVAL '1' DAY + INTERVAL '1' HOUR, NULL),
(4, NOW() - INTERVAL '5' HOUR, NOW() - INTERVAL '1' HOUR),
(1, NOW() - INTERVAL '3' HOUR, NULL);
