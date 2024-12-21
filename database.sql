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

-- Insert data into Facilities table
INSERT INTO Facilities (name, description, specifications, usage_details, image_url, category_id)
VALUES 
  ('Electron Microscope', 'A high-resolution electron microscope for imaging.', 'Resolution: 1nm', 'Available for biological and material research.', 'https://drive.google.com/uc?id=example_id_1', 1),
  ('3D Printer', 'A state-of-the-art 3D printer for prototyping and research.', 'Resolution: 50 microns', 'Available for mechanical and electronic design projects.', 'https://drive.google.com/uc?id=example_id_2', 2),
  ('Research Library', 'A collection of scientific journals, books, and articles.', 'Over 2000 journals and books', 'Available for students and faculty for academic research.', 'https://drive.google.com/uc?id=example_id_3', 3),
  ('Workshop Area', 'A space for hands-on engineering projects.', 'Machines: CNC, Lathe, etc.', 'Available for student and faculty project development.', 'https://drive.google.com/uc?id=example_id_4', 4);

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
    profile_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the User_Publications table
CREATE TABLE User_Publications (
    publication_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    publication_date DATE NOT NULL,
    journal_name VARCHAR(255),
    doi VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create the BookingHistory table
CREATE TABLE BookingHistory (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('Pending', 'Approved', 'Cancelled') DEFAULT 'Pending',
    cost DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create the Results table
CREATE TABLE Results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    result_date DATETIME NOT NULL,
    result_file_path VARCHAR(255) NOT NULL, -- Path to the zip file storing the result
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Insert default data into Users table
INSERT INTO Users (user_type, full_name, email, password_hash, contact_number, profile_details)
VALUES
    ('Internal', 'Alice Smith', 'alice@internal.com', 'hashed_password_1', '1234567890', 'Internal researcher specializing in physics.'),
    ('External Academic', 'Bob Johnson', 'bob@academic.com', 'hashed_password_2', '0987654321', 'Visiting professor from XYZ University.'),
    ('R&D Lab', 'Charlie Lee', 'charlie@rdlab.com', 'hashed_password_3', '5678901234', 'Researcher working in nanotechnology.'),
    ('Industry', 'Diana Brown', 'diana@industry.com', 'hashed_password_4', '6789012345', 'Industry professional in the field of AI.');

-- Insert sample data into User_Publications table
INSERT INTO User_Publications (user_id, title, publication_date, journal_name, doi)
VALUES
    (1, 'Quantum Physics Breakthrough', '2023-10-15', 'Nature Physics', '10.1038/s41567-023-01234'),
    (2, 'Advances in Machine Learning', '2023-05-20', 'IEEE Transactions', '10.1109/TML.2023.123456'),
    (3, 'Nanotechnology in Medicine', '2022-12-10', 'Nano Letters', '10.1021/nl1234567'),
    (4, 'AI and Industry 4.0', '2023-09-01', 'AI Journal', '10.1016/j.aij.2023.78901');

-- Insert sample data into BookingHistory table
INSERT INTO BookingHistory (user_id, facility_name, booking_date, booking_time, status, cost)
VALUES
    (1, 'Advanced Physics Lab', '2024-01-10', '14:00:00', 'Approved', 1000.00),
    (2, 'AI Research Facility', '2024-02-15', '10:30:00', 'Pending', 1500.00),
    (3, 'Nanotechnology Lab', '2023-12-05', '16:00:00', 'Cancelled', 2000.00),
    (4, 'Data Analysis Center', '2023-11-25', '09:00:00', 'Approved', 2500.00);

-- Insert sample data into Results table
INSERT INTO Results (user_id, facility_name, result_date, result_file_path)
VALUES
    (1, 'Advanced Physics Lab', '2024-01-20 14:30:00', '/results/quantum_tunneling_2024.zip'),
    (2, 'AI Research Facility', '2024-02-10 11:45:00', '/results/ml_algorithm_2024.zip'),
    (3, 'Nanotechnology Lab', '2023-12-15 10:00:00', '/results/nanobot_prototype_2023.zip'),
    (4, 'Data Analysis Center', '2023-11-30 17:15:00', '/results/industrial_ai_system_2023.zip');
