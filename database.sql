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
