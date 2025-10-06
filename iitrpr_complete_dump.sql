-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: iitrpr
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `archived_news`
--
create database iitrpr if not exists;
use iitrpr;
DROP TABLE IF EXISTS `archived_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archived_news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `news_title` varchar(255) NOT NULL,
  `summary` text,
  `imagepath` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `archived_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archived_news`
--
-- ORDER BY:  `id`

LOCK TABLES `archived_news` WRITE;
/*!40000 ALTER TABLE `archived_news` DISABLE KEYS */;
/*!40000 ALTER TABLE `archived_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookingbifurcations`
--

DROP TABLE IF EXISTS `bookingbifurcations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookingbifurcations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `bifurcation_id` int NOT NULL,
  `sample_count` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `bifurcation_id` (`bifurcation_id`),
  CONSTRAINT `bookingbifurcations_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookinghistory` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `bookingbifurcations_ibfk_2` FOREIGN KEY (`bifurcation_id`) REFERENCES `facility_bifurcations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookingbifurcations`
--
-- ORDER BY:  `id`

LOCK TABLES `bookingbifurcations` WRITE;
/*!40000 ALTER TABLE `bookingbifurcations` DISABLE KEYS */;
INSERT INTO `bookingbifurcations` VALUES (40,38,10,1),(41,38,10,1),(42,39,10,1),(43,39,10,1),(44,40,10,1),(45,40,10,1),(46,41,10,1),(47,41,10,1),(48,42,10,1),(49,42,10,1),(50,43,10,1),(51,43,10,1),(52,44,11,1),(53,44,11,2),(54,45,13,1),(55,45,13,1),(56,46,13,1),(57,46,13,1),(58,47,13,1),(59,47,13,1),(60,48,13,1),(61,48,13,1),(62,50,13,1),(63,50,13,1),(64,51,13,1),(65,51,13,1);
/*!40000 ALTER TABLE `bookingbifurcations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookinghistory`
--

DROP TABLE IF EXISTS `bookinghistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookinghistory` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `facility_id` int NOT NULL,
  `schedule_id` varchar(255) NOT NULL,
  `booking_date` date NOT NULL,
  `status` enum('Pending','Approved','Cancelled') DEFAULT 'Pending',
  `cost` decimal(10,2) DEFAULT NULL,
  `receipt_path` varchar(255) DEFAULT NULL,
  `operator_email` varchar(255) DEFAULT NULL,
  `billing_address` text,
  `gst_number` varchar(50) DEFAULT NULL,
  `utr_number` varchar(100) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `facility_id` (`facility_id`,`schedule_id`,`booking_date`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `bookinghistory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `bookinghistory_ibfk_2` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookinghistory`
--
-- ORDER BY:  `booking_id`

LOCK TABLES `bookinghistory` WRITE;
/*!40000 ALTER TABLE `bookinghistory` DISABLE KEYS */;
INSERT INTO `bookinghistory` VALUES (38,28,52,'19,20','2025-09-08','Cancelled',500.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-07 00:46:35'),(39,28,52,'21,20,19','2025-09-08','Approved',750.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-07 01:02:12'),(40,28,52,'23','2025-09-15','Approved',250.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-12 09:12:24'),(41,28,52,'19,20','2025-09-22','Approved',500.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-13 04:40:42'),(42,28,52,'19,20','2025-09-29','Cancelled',500.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-13 04:49:01'),(43,28,52,'19','2025-09-15','Approved',250.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-13 04:59:57'),(44,28,52,'21','2025-10-27','Cancelled',2000.00,NULL,'crf.lscm@iitrpr.ac.in',NULL,NULL,NULL,NULL,'2025-09-13 05:04:18'),(45,33,59,'25','2025-10-27','Cancelled',2.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-09-28 17:31:24'),(46,33,59,'25,26','2025-10-06','Cancelled',4.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-09-28 18:37:43'),(47,33,59,'26','2025-10-20','Cancelled',2.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-09-28 18:38:20'),(48,33,59,'26','2025-10-06','Cancelled',2.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-09-28 19:33:57'),(50,33,59,'29','2025-10-07','Approved',2.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-09-30 05:35:58'),(51,33,59,'26,25','2025-10-27','Approved',4.00,NULL,'adfs@sdfs.com',NULL,NULL,NULL,NULL,'2025-10-01 09:18:00');
/*!40000 ALTER TABLE `bookinghistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--
-- ORDER BY:  `id`

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Miscellaneous',''),(2,'Spectroscopy',''),(3,'Microscopy','');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_otps`
--

DROP TABLE IF EXISTS `email_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_otps` (
  `email` varchar(255) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `last_sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_otps`
--
-- ORDER BY:  `email`

LOCK TABLES `email_otps` WRITE;
/*!40000 ALTER TABLE `email_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `make_year` int DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `faculty_in_charge` varchar(255) DEFAULT NULL,
  `operator_contact` varchar(15) DEFAULT NULL,
  `description` text,
  `specifications` text,
  `usage_details` text,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `Faculty_contact` varchar(15) DEFAULT NULL,
  `Faculty_email` varchar(255) DEFAULT NULL,
  `operator_name` varchar(255) DEFAULT NULL,
  `operator_email` varchar(255) DEFAULT NULL,
  `special_note` varchar(255) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `max_hours_per_booking` int DEFAULT '8',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--
-- ORDER BY:  `id`

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (37,'PXRD',2010,'Xpert Pro MPD','Dr. Rajiv Kumar','01881-23-3053','<blockquote style=\"margin: 0 0 0 40px; border: none; padding: 0px;\"><blockquote style=\"margin: 0 0 0 40px; border: none; padding: 0px;\"><blockquote style=\"margin: 0 0 0 40px; border: none; padding: 0px;\"><h1><span style=\"font-size: 1.5rem; font-family: inherit;\">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Model – Xpert \r\nPro MPD (</span><b style=\"font-size: 1.5rem; font-family: inherit;\">Pananalytical</b><span style=\"font-size: 1.5rem; font-family: inherit;\">)</span></h1></blockquote></blockquote></blockquote><div>The instrument is a PANalyticalX\'Pert Pro MPD, powered by a Philips PW3040/60 X-ray generator and fitted with an X\'Celerator* detector.Diffraction data is acquired by exposing powder samples to Cu-KαX-ray radiation, which has a characteristic wavelength (l) of 1.54Å.  X-rays were generated from a Cu anode supplied with 40 kV and a current of 40 mA\r\nPhase identification was carried out by means of the X\'Pert accompanying software program PANalyticalHigh Score Plusin conjunction with the ICDD Powder Diffraction File 2 Database (1999), ICDD Powder Diffraction File 4 - Minerals (2012), the American Mineralogist Crystal Structure Database (March 2010) and the Crystallography Open Database\r\nThe X’Celerator is an ultra-fast X-ray detector that uses RTMS (Real Time Multiple Strip) technology.  It operates as an array of a hundred channels which can simultaneously count X-rays diffracted from a sample over the range of 2θ angles specified during a scan.  The X’Celerator is therefore able to give produce high quality diffraction data in a significantly shorter time period than an older style diffractometerwould require.\r\nPrinciple:-\r\nLet us consider an X-ray beam incident on a pair of parallel planes P1 and P2, separated by an inter-planar spacing d.\r\nThe two parallel incident rays 1 and 2 make an angle (THETA) with these planes. A reflected beam of maximum intensity will result if the waves represented by 1’ and 2’ are in phase. The difference in path length between 1 to 1’ and 2 to 2’ must then be an integral number of wavelengths, (LAMBDA). We can express this  relationship mathematically in Bragg’s law.\r\n2d*sin T = n * ?\r\nThe process of reflection is described here in terms of incident and reflected (or diffracted) rays, each making an angle THETA with a fixed crystal plane. Reflections occurs from planes set at angle THETA with respect to the incident beam and generates a reflected beam at an angle 2-THETA from the incident beam.\r\nThe possible d-spacing defined by the indices h, k, l are determined by the shape of the unit cell. Rewriting  Bragg’s law we get :\r\nsin T = ?/2d\r\nTherefore the possible 2-THETA values where we can have reflections are determined by the unit cell  dimensions. However, the intensities of the reflections are determined by the distribution of the electrons in the unit cell. The highest electron density are found around atoms. Therefore, the intensities depend on what kind of atoms we have and where in the unit cell they are located.\r\nPlanes going through areas with high electron density will reflect strongly, planes with low electron density will give weak intensities.</div>','ConditionValue X-ray tube Cu                            ( 1.54059)\r\n\r\nVoltage :                                                        45 kV\r\n\r\nAmperage:                                                     40 mA\r\n\r\nScan range Step Size Collection time               :1941s\r\n\r\nScan speed Slit Revolution time:                       0.5s\r\n\r\nMode                                                   Transmission\r\n\r\n \r\n\r\n','<ol><li><span style=\"font-family: inherit;\">Materials<strike> Science</strike>\r\nPhase Identification\r\nStructure Determination \r\nDefect Analysis\r\nMaterial Development&nbsp;</span></li><li><span style=\"font-family: inherit;\">Chemistry\r\nCatalyst <u>Characterization</u> \r\nPolymorphism Studies\r\nReaction M</span>onitoring</li><li><span style=\"font-family: inherit;\">Earth Sciences and Geology<i>\r\nMineralogy</i>\r\nSoil Analysis\r\nOre Characterization&nbsp;</span></li><li><span style=\"font-family: inherit;\">Nanotechnology\r\n<b>Nanostructure</b> Analysis\r\nThin Film Characterizatio</span></li></ol>','uploads/XRD (Powder).jpg',1,'1881232411','krajiv@iitrpr.ac.in','Mr Kamlesh Satpute','pxrd.crf@iitrpr.ac.in',NULL,'Malvern Panalytical',8),(39,'NMR 400',2012,'JNM-ECS-400','Dr Manoj Kumar Pandey','01881-23-3052','Nuclear Magnetic Resonance (NMR 400 MHz)\n\nMake & Model – JEOL & JNMECS400    \n\nECS Narrow Bore Spectrometer (400) FT NMR System is a versatile high-performance system that utilizes the latest digital and high-frequency technologies.  The JNM ECS400 series FT NMR System features improved operability and small installation space, both of which are required for routine NMR systems. It’s a two-channel spectrometer., Room-temperature shim: Digital matrix shim, 21 items controlled.\n\nVariable temperature range:  -140 to +180-degree C.\nHigh Band (1H /19F) amplifier (HF): 50 W,\nLow band (or Broad) band amplifier (LF): 150W \nGradient Strength: 30G/Cm @ 10A (Standard)\n                                                 \n\n                                         \n\nWorking Principle:\n\nThe principle behind NMR is that many nuclei have spin and all nuclei are electrically charged. If an external magnetic field is applied, an energy transfer is possible between the base energy to a higher energy level (generally a single energy gap). The energy transfer takes place at a wavelength that corresponds to radio frequencies and when the spin returns to its base level, energy is emitted at the same frequency. The signal that matches this transfer is measured in many ways and processed in order to yield an NMR spectrum for the nucleus concerned.\n\nFig., relates to spin- ½ nuclei that include the most commonly used NMR nucleus, proton (1H or hydrogen-1) as well as many other nuclei such as 13C, 15N and 31P. Many nuclei such as deuterium (2H or hydrogen-2) have a higher spin and are therefore quadrupolar and although they yield NMR spectra their energy diagram and some their properties are different.                                                                  \n\n                                            \n\nVisitors Sinc','Basic Specifications: JNM-ECS400: 400MHz NMR SPECTROMETER\nTwo Channel Spectrometer\nObservation nuclei: 1H/19F, 31P to 15N\nAuto tuning/matching range: All observation nuclei.\n Sensitivity for 13C: 190 or more\nObservation frequency: 1H: 400 MHz, 13C: 100MHz\nSensitivity for 1H:  280 or more (0.1% ethyl benzene)\nDrift rate:  ≤ 4Hz\nVariable temperature range: -140 to +180-degree C\nRoom-temperature shim: Digital matrix shim, 21 items controlled\n ECS Standard Software\n\nThe client system of the ECS, Delta, provides versatile data processing and easy to-use interfacing with the NMR spectrometer. The Delta software application, constructed on a highly virtual architecture, is easily transported to various operating systems, ensuring that the operating environment lasts despite rapid changes in computer technology. Supporting the standard graphics environment, OpenGL, the Delta software can efficiently perform routine data processing. The JNM-ECS FT NMR System is operated under both the high-grade, stable hardware and the easy-to-use superior software, in spite of being a small, low-cost system. Thus, the JNM-ECS provides the highest-level NMR research data while greatly reducing the analysis time required for routine NMR measurement\nVibration Proof Table\n\nThis is an air-damper-type vibration proof table used with a 400 MHz superconducting magnet (SCM) for an NMR system\n \n400MHZ TH5Probe\n\nThis probe is used for 1H and multinuclear NMR observation while irradiating 1H and applying a pulsed magnetic field gradient to a sample using a 5 mm sample tube in the FT NMR system. By using the optional Auto Tuning Unit, you can automatically tune the probe for the multiple nuclei.\n400MHz H5X Probe\n\nThis 5mm probe is optimized for 1H observation. This probe is therefore recommended for 1H measurements including inverse experiments (1H observed 2D experiments). This probe is compatible with the Auto tune controller thus consecutive measurements can include change of nucleus as well as different experiments.\n \nSTACMAN ASC64\n\nThe “Auto Sample Changer 64” can be installed in an FT NMR system, which is configured with one of the superconducting magnets (SCM).\n \nThis sample changer can be used to automatically change the sample tube containing the sample for measurement by commands from the host computer\nVariable Temperature Accessory: Liquid Nitrogen based\n\nVT control range:  -100 oC to + 150 oC., Temperature setting steps 0.1 Deg C. Low temperature unit include suitable liquid nitrogen Dewar. Low temperature limit: - 100 Deg C. The low temperature unit is complete in all respects. This all function controlled under host computer.\n \nAuto Tuning Unit\n\nAuto tuning unit comes as a standard, which will be helpful in doing Automatic Tuning and Matching for the nuclei under study for liquid samples.\n \nVisitors Since 2','\n\n             \n1Organic/Inorganic Chemistry/Pharmaceuticals: Analyrsis of molecular structure and identification of unknown chemical substances. 2 Polymer Chemistry/Food Chemistry/Qualitycontrol: Quantitative analysis and analysis of mixtures 3 Peptides/Petrochemicals/Organometallics/Catalysis Electro chemistry:  Measurement of diffusion coefficient,  relaxation time, dynamics, reaction monitoring.\n',NULL,2,'1881232051','mkpandey@iitrpr.ac.in','Mr Manish Kumar','nmr@iitrpr.ac.in',NULL,'JEOL',8),(40,'NMR 600',2019,' JNM ECZ600R/ M3','Dr Manoj Kumar Pandey','1881232061','The JNM-ECZ600R/M3 is a 600 MHz NMR spectrometer from JEOL, a high-resolution instrument designed for advanced analytical applications, particularly in solid-state and liquid-state NMR. It uses a superconducting magnet, providing high sensitivity and resolution for detailed structural analysis of molecules. \nKey Features and Capabilities:\nHigh Field Strength: The instrument utilizes a 14.09 Tesla magnet, corresponding to a 600 MHz frequency for 1H. \nSolid-State and Liquid-State NMR: It\'s capable of performing both solid-state and liquid-state NMR experiments. \nMultiple Probes: The JNM-ECZ600R/M3 is equipped with a variety of probes, including:\nSolid-state probes: 3.2 mm and 1 mm HX MAS probes for solid-state analysis, with variable temperature capabilities and fast rotation speeds. \nLiquid-state probes: 5 mm FG/RO probe for liquid phase measurements, with automatic frequency tuning. \nBroadband probes: TH5 probe for 1H, 19F, 15N, and 31P nuclei, and Royal Probe for 15N to 31P. \nSmart Transceiver System (STS): The instrument utilizes JEOL\'s STS technology for high-precision and stable RF control. \nMulti-sequencer: The multi-sequencer allows for complex and multi-dimensional NMR experiments with precise control of multiple RF sources. \nTemperature Control: Variable temperature control, allowing experiments from -100 to +150°C. \nAutomatic Sample Changer: An automatic sample changer for efficient sample analysis. \nSoftware: The instrument comes with NMR software for data processing and analysis. ','MAGNET\nSuperconducting 600 MHz, shielded\nCONSOLE\nECZ600R, two channels, 44 magnetic field homogenity corrections, 200 W (high-frequency 550 - 610 MHz) amplifiers and 500 W (low-frequency 5 - 245 MHz)\nPROBEHEADS\n3.2 mm HX MAS probe with large temperature range (from -100 to +200 ° C, maximum rotation speed 22 kHz); 1 mm HX MAS probe (80 kHz maximum rotation speed); 5 mm FG / RO probe for liquid phase measurement with automatic frequency tuning\nWORKSTATION\nDell OptiPlex 7050, Win 10 Pro, NMR software Delta 5.3',' Structural Analysis: Determining the structure of small molecules and proteins in solution. \nSolid-State NMR: Studying the structure and dynamics of materials in the solid state. \nVariable Temperature Studies: Performing NMR experiments at different temperatures for studying dynamic processes. \nReaction Monitoring: Tracking the progress of chemical reactions in real-time. \nMaterial Science: Characterizing the chemical and physical properties of materials. ',NULL,2,'1881232061','mkpandey@iitrpr.ac.in','Mr Manish Kumar','nmr600.crf@iitrpr.ac.in',NULL,'JEOL',8),(41,'HRMS',2016,'XEVO G2-XS QTOFEL','Dr.Anupam Bandopadhyay','01881-23-3079','Model – YEA955 (Waters)\n\nHigh-resolution MS (HRMS) is rapidly advancing into many fields of modern analytical sciences. Instruments such as Fourier-transform ion cyclotron resonance (FTICR) and modern orbitrap and TOF systems are now frequently used in laboratories, where only a few years ago traditional quadrupole and ion trap mass spectrometers dominated. In particular, the selective data-acquisition modes of triple quadrupole mass spectrometers (e.g., precursor ion scan or multiple reaction monitoring) are increasingly being replaced by full-scan or MS/MS experiments on HRMS instruments even in quantitative applications, because the information gained from high-resolution, accurate mass data often outweighs the benefits of highly selective measurements on low-resolution mass spectrometers.\nPrinciple:-\n\nA mass spectrometer generates multiple ions from the sample under investigation, it then separates them according to their specific mass-to-charge ratio (m/z), and then records the relative abundance of each ion type.\n\nThe first step in the mass spectrometric analysis of compounds is the production of gas phase ions of the compound, basically by electron ionization. This molecular ion undergoes fragmentation. Each primary product ion derived from the molecular ion, in turn, undergoes fragmentation, and so on. The ions are separated in the mass spectrometer according to their mass-to-charge ratio, and are detected in proportion to their abundance. A mass spectrum of the molecule is thus produced. It displays the result in the form of a plot of ion abundance versus mass-to-charge ratio. Ions provide information concerning the nature and the structure of their precursor molecule. In the spectrum of a pure compound, the molecular ion, if present, appears at the highest value of m/z (followed by ions containing heavier isotopes) and gives the molecular mass of the compound.\n\n \n\nVisitors Since 20-01-2021 :- 467','1.) Mass Range: 20 to 32,000 m/z in Quadrupole & 20 to 1,00,000 m/z in TOF.\n\n2.) Resolution: ≥ 45,000 FWHM for m/z 1000 and ≥ 35,000 FWHM for around 200 m/z.\n\n3.) Sensitivity: Full MS/MS mode ≤ 10 femtogram on column, at S/N ratio greater than 100:1\n\nACQUITY UPLC H – CLASS PLUS SYTEM:\n\n1.) Quaternary operating pump(s) with an operating pressure of minimum 15000 psi\n\n2.) Flow rate range - 0.010 to 2.200 mL/min, in 0.001 mL increments\n\n3.) Flow rate accuracy: ±0.1 %.\n','1Chemistry and Biochemistry                       2Pharmaceutical and Drug Development 3Forensic Science                          4Environmental Analysis',NULL,2,'1881232055','anupamba@iitrpr.ac.in','Mr. Anuj Babbar','hrms@iitrpr.ac.in',NULL,'WATER GMBH',8),(42,'SEM',2010,'JSM6610LV','Dr Nitish Bibhanshu','01881-23-2567','SEM provides high-resolution imaging to analyze surface morphology, topography, and composition. It is widely used for failure analysis, material characterization, and microstructural studies, offering insights at the nanoscale with elemental analysis capabilities via Energy Dispersive X-ray Spectroscopy (EDS)','Resolution: 3.0 nm (30 kV) , 8.0 nm (3 kV), 15 nm (1 kV) at HV mode,4.0 nm (30 kV) at LV mode\n\nMagnification:× 5 to × 300,000 (on 128 mm × 96 mm image size)\n\nAccelerating voltage: 0.3kV to 30 kV,\n\nProbe current: 10-12 to 10-6 A,\n\nSpecimen stage: Eucentric large-specimen motorized axes stage: x-y: 125 mm x 100 mm, tilt: -10° to ～＋90°, rotation: 360°, working distance: 5 mm to 80 mm','1Material Science: Surface morphology, failure analysis, and microstructural characterization.\n2Biology: Imaging cellular structures, tissues, and microorganisms                                           3Nanotechnology: Analysis of nanostructures, thin films, and coatings.\n',NULL,3,'1881232413','nitishbibhanshu@iitrpr.ac.in','Mr Amit Kaushal','sem@iitrpr.ac.in',NULL,'JEOL',8),(43,'SPM',2011,' Xpert Pro MPD','Dr.Mukesh Kumar','01881-23-2565','Atomic Force Microscope (AFM)\n\n\n\nModel: Multimode 8 SPM (Bruker)\n\n\n\nThe Atomic Force Microscope (AFM) is a powerful instrument for nanometer scale science and technology.\n\n\n\n                                       \n\n\n\nPrinciple:-\n\n\n\nThe AFM principle is based on the cantilever/tip assembly that interacts with the sample; this assembly is also commonly referred to as the probe. The AFM probe interacts with the substrate through a raster scanning motion. The up/down and side to side motion of the AFM tip as it scans along the surface is monitored through a laser beam reflected off the cantilever. This reflected laser beam is tracked by a position sensitive photo-detector (PSPD) that picks up the vertical and lateral motion of the probe. The deflection sensitivity of these detectors has to be calibrated in terms of how many nanometres of motion correspond to a unit of voltage measured on the detector.\n\n\n\n \n\n\n\nVisitors Since 2','SPM Controller Heads\nStandard- Supports all modes except application modules\nScanners\nAS-130VLR scanner – 125µm x 125µm XY and 5µm Z range (vertical engage), features improved liquid resistance\nStandard Accessories\nIncluded with all MultiMode 8 system configurations: – OMV, Optical microscope with 10X objective for viewing tip, sample, and laser, (video output is displayed within NanoScope software)\n– Probe holder for most imaging applications in air, includes tip bias connection\n– MFM starter kit with probes and training samples;\n– Calibration grating for scanner calibration\nVibration Isolation*\nVT-102, air table, 24in. square x 31in. tall (requires compressed air);','1 Materials Science: Obtain 3-D images of surfaces with atomic resolution revealing features like defects, grain boundaries etc.                        2 Nanotechnology: Characterizing size, shape and surface morphology of nanomaterials           3 Semiconductors:Providing high-resolution potential profiles of semiconductor devices',NULL,3,'01881-232462','mkumar@iitrpr.ac.in','Mr. Harsimranjit Singh','spm@iitrpr.ac.in',NULL,'BRUKER',8),(44,'HT Furnace',2014,'RHTH120/600/\r\n18\r\n','Dr.Sarang Gumfekar','01881-23-2563','Due to their solid construction and compact stand-alone design, these high-temperature furnaces are perfect for processes in the laboratory where the highest precision is needed. Oustanding temperature uniformity and practical details set unbeatable quality benchmarks. For configuration for your processes, these furnaces can be extended with extras from our extensive option list.','Outer dimensions furnace approx: 2500 x 1150 x 2130 mm\r\n\r\nWeight approx. 600 kg\r\n\r\nPower rating furnace approx. 14,4 kW\r\n\r\nPower supply furnace 380 V, 3/N/PE, 50 Hz, fuse protection without earth-leakage breaker \r\n\r\nMax. tube diameter outer 120 mm\r\n\r\nHeated tube length 600 mm\r\n\r\nLength constant temperature +−  K 200 mm\r\n\r\nTmax 1800 °C\r\n\r\nTmax in working tube approx. 1750 °C\r\n\r\nProcess gases nitrogen (N2), hydrogen (H2)\r\n\r\nFlow rate of process gases 10 – 100 l/h\r\n\r\nOperation pressure approx. 30 – 50 mbar\r\n\r\nDetails','NA',NULL,1,'1881234014','sarang.gumfekar@iitrpr.ac.in','Mr. Harsimranjit Singh','htf.crf@iitrpr.ac.in',NULL,'NABERTHEM GERMANY',8),(45,'Nanoindenter',2014,' Hyistron TI 950','Dr.Hariprasad Gopalan','01881-23-2566','Model – Hyistron TI 950 (Bruker)\n\n\n\nA Nanoindenter is the main component for indentation hardness tests used in nanoindentation. Nanoindentation, also called depth sensing indentation or instrumented indentation, gained popularity with the development of machines that could record small load and displacement with high accuracy and precision. The load displacement data can be used to determine modulus of elasticity, hardness, yield strength, fracture toughness, scratch hardness and wear properties.\n\n\n\nThere are many types of nanoindenters in current use differing mainly on their tip geometry. Among the numerous available geometries are three and four sided pyramids, wedges, cones, cylinders, filaments, and spheres. The material for most nanoindenters is diamond and sapphire, although other hard materials can be used such as quartz, silicon, tungsten, steel, tungsten carbide and almost any other hard metal or ceramic material. Diamond is the most commonly used material for nanoindentation due to its properties of hardness, thermal conductivity, and chemical inertness. In some cases electrically conductive diamond may be needed for special applications and is also available. For precise measurements a laser goniometer is used to measure diamond nanoindenter angles. Nanoindenter faces are highly polished and reflective which is the basis for the laser goniometer measurements. The laser goniometer can measure within a thousandth of a degree to specified or requested angles.\n\n\n\n                                                                         \n\n\n\n \n\n\n\nTesting Modes:-\n\n\n\nQuasistatic Nanoindentation\n\nMeasure Young’s modulus, hardness, fracture toughness and other mechanical properties via nanoindentation.\n\n\n\nScratch Testing\n\nQuantify scratch resistance, critical delamination forces, and friction coefficients with simultaneous normal and lateral force and displacement monitoring.\n\n\n\nNanowear\n\nQuantify wear behavior over the nanometer to micrometer length scales as a function of number of sliding cycles, sliding velocity, wear area, and applied force.\n\n\n\nSPM Imaging\n\nIn-situ imaging using the indenter tip provides nanometer precision test positioning and surface topography information.\n\n\n\nVisitors Since 20-01-2021 :- 467','. 2D High Resolution Indenter Head Assembly\n\n\n\n Normal Displacement\n\n\n\nDisplacement resolution <0.006nm\n\nDisplacement noise floor <0.2nm\n\nTotal indenter travel in vertical direction ~50mm\n\nMaximum indentation depth >5μm\n\nThermal drift 0.05nm/s\n\n Normal Load\n\n\n\nMaximum load 10mN\n\nLoad resolution <1 nN\n\nMinimum contact force <70nN\n\nLoad noise floor ≤30nN\n\nMaximum Load rate >50mN/s\n\n Lateral Displacement\n\n\n\nDisplacement resolution <0.02nm\n\nDisplacement noise floor <2nm\n\nMaximum Displacement 15μm\n\nMinimum lateral displacement 500nm\n\nThermal drift 0.05nm/s\n\nLateral Load\n\n\n\nMaximum Load 2mN\n\nLoad resolution <50nN\n\nLoad noise floor <3.5μN\n\n In-situ SPM Imaging\n\n\n\nMinimum imaging force <70nN\n\nScan rate 0.01Hz-3.0Hz\n\nScan resolution 256x256 lines per image\n\nMaximum scan volume 60x60x4μm\n\nTip positioning accuracy +/- 10nm\n\nAutomated imaging and indenting capability\n\nPiezo automation to allow point-and – click test location selection and setup of arrays for automated indentation patterns\n\n Scanning Wear\n\n\n\nWear track size Adjustable from <1μm to 60μm\n\nScan velocity ≤ 180μm/s\n\nNormal load range 70nN - 1mN\n\n2. Multi-Range Nanoprobe (High Load)\n\n\n\nMaximum Lateral Force: 5N\n\nLateral Force Noise Floor: 40μN\n\nMaximum Scratch Length: Limited by circular sample stage (~25mm)\n\nLateral Displacement Noise Floor: 100nm\n\nMaximum Normal Force: 2N\n\nNormal Force Noise Floor: 0.5nm\n\nMaximum Normal Displacement: 80μm\n\nNormal Displacement Noise Floor: 0.5nm\n\n3. NanoDMA\n\n\n\nFrequency Range: 0.1Hz-300Hz\n\nMaximum Dynamic Force Amplitude: 5mN\n\nMaximum Quasi-Static Force: 10mN\n\nForce Noise Floor: <30nN\n\nMaximum Dynamic Displacement Amplitude: 2.5μm\n\nMaximum Quasi-Static Displacement: 5μm\n\nDisplacement Noise Floor: <0.2nm\n\n \n\n\n\n4. X, Y ,Z translation stage (coarse positioning)\n\n\n\nX-Y Travel 250mmx150mm\n\nMeasured accuracy <1μm\n\nMeasured positioning repeatability <1μm\n\nMicro step resolution X, Y axis 50nm\n\nMicro step resolution Z axis 3nm\n\nX-Y encoder resolution 100nm\n\nMaximum translation speed X, Y axis 30mm/s\n\nMaximum translation speed Z axis 1.9mm/s\n\n5. Data Acquisition specifications\n\n\n\nData acquisition rate (open and closed loop): up to 38,000 points/second\n\nLoad time 0.1 – 2000 seconds.\n\nMaximum number of loading segments 2,000\n\nFeedback loop rate in closed loop operation: 78kHz\n\n6. Electrical Contact Resistance (nanoECR)\n\n\n\nCurrent measurement noise floor: 20 pA\n\nCurrent measurement resolution: 5pA\n\nVoltage measurement noise floor: 10 μV\n\nVoltage measurement resolution: 5μV\n\nMaximum Current (software limited): 10mA\n\nMaximum Voltage (software limited): 10V\n\nElectrical measurement rate: Up to 4kHz\n\nMaximum load: 10 mN\n\nLoad Resolution: <1nN\n\nLoad noise floor: ≤30nN\n\nDisplacement Resolution: 0.02nm\n\nDisplacement noise floor: 0.2nm\n\nShielded System Enclosure\n\nAuxillary Data Channel Acquisition\n\n \n\n\n\n7. Optical Microscope specification\n\n\n\nOptical resolution 1μm\n\nDigital zoom 0.5X – 11X\n\nOptical Objective 20X\n\nApparent magnification (monitor view) 220X-2200X\n\nMaximum field of view 772x588μm\n\nMinimum field of view 30x24μm\n\n \n\n\n\n8.  Active Vibration Isolation\n\n\n\nFrequency range 1.0 – 200Hz active damping, >200Hz passive damping\n\nTransmissibility <0.017 above 10Hz and decreasing rapidly beyond 100Hz\n\nSystem noise <50ng per root Hz from 0.1 - 300Hz\n\nStatic Compliance 14.0μm/N vertical, 28μm/N horizontal\n\nCorrection Forces 16N vertical, 8N horizontal\n\n9.  Acoustic and thermal isolation enclosure\n\n\n\nMulti-layered acoustic dampening Environmental acoustic noise should not be more than 75 dB.\n\nLarger front door for improved sample access\n\nLarger side windows for improved operator visibility\n\nSealed enclosure for atmospheric conditioning\n\n \n\n\n\n \n\n\n\n','1Quasistatic nanoindentation                        2Characterisation of Visco-elastic materials  via DMA                                                                        3Scratch testing and Surface Scanning of biomaterials, thin films and coatings',NULL,1,'1881232414','hariprasadgopalan@iitrpr.ac.in','Mr Harsimranjit Singh','nanaoindenter@iitrpr.ac.in',NULL,'BRUKER',8),(46,'Raman Spectrometer',2019,'\nLABRAM HR Evolution','Dr.Tharamani CN','01881-23-2564','Micro RAMAN  Spectrometer\n\n\n\nMake & Model – Horiba & LABH Rev-UV-Open\n\n\n\nThe LabRAM HR systems are ideally suited to both micro and macro measurements, and offer advanced confocal imaging capabilities in 2D and 3D. The true confocal microscope enables the most detailed images and analyses to be obtained with speed and confidence. Highly versatile, each LabRAM HR is a flexible base unit which can be expanded with a range of options, upgrades and accessories to suit all budgets and applications. Specialized dedicated and/or customized solutions can be supplied where required, so whatever spectral resolution, laser wavelength or sampling regime is needed, HORIBA Scientific can provide the best solution.\n\n\n\nLife sciences\n\n\n\nDisease diagnosis, dermatology, cell screening, cosmetics, microbiology, protein investigations, drug interactions and many more: the LabRAM HR offers new characterization methods for life sciences.\n\n\n\nMaterials\n\n\n\nGraphene and 2D materials, polymers and monomers, inorganics and metal oxides, ceramics, coatings and thin films, photovoltaics, catalysts: the LabRAM HR Evolution contributes to a better knowledge of materials and is a reliable tool for routine analysis\n\n\n\nPharmaceuticals\n\n\n\nActive pharmaceutical ingredients (API) and excipients mapping and characterization, polymorph identification, phase determination: the high information content of the Raman spectrum affords researchers and QC technicians deeper insight into the performance and quality of their materials.\n\n\n\nVisitors Since 20-01-2021 :- 467','Laser source: 325, 473, 532, 633 and 785 nm\nObjective lenses: 10x, 50x 100x and long working distance objectives\nSpectral range: 100-4000 cm-1\nSpectral resolution: Upto 0.3 cm-1.\nCCD detector with deep cooling \nLabSpec6 software for data acquisition, processing and analysis\n','Identifying crystal structures, phase transitions, and stress/strain analysis in ceramics, semiconductors, polymers, and composite materials\nIdentification of molecular structures and vibrational modes\nReaction Monitoring: Observing chemical reactions in situ and in real-time\nLattice Dynamics: Studying phonons and vibrational properties in crystals\nOptoelectronics: Characterization of materials used in LEDs and solar cells\nBiomedical Diagnostics: Detecting biomarkers in tissues and fluids for cancer, infectious diseases, or other pathologies\nCellular Analysis: Examining cells for structural and compositional studies.\n',NULL,2,'1881232058','tharamani@iitrpr.ac.in','MrDamninder Singh','ramancrf@iitrpr.ac.in',NULL,'Horiba France',8),(47,'UV Spectroscopy',2018,' Lambda 950','Dr.Neha Sardana','01881-23-2561','Spectroscopy is the study of the interaction between matter and electromagnetic radiation. UV-Vis-NIR Spectroscopy focuses  on the ultraviolet (UV), visible (Vis), and near-infrared (NIR) regions of the electromagnetic spectrum.','2D Detector Module\nUniversal Reflectance Accessory (URA)\nSnap-in integrating spheres of 150 mm\nHighest performance UV/Vis/NIR system \nWavelength range: 175 nm – 3,300 nm\nUV/Vis resolution: 0.05 nm – 5.00 nm \nNIR Resolution: 0.20 nm – 20.00 nm','1materials science\n2Bacterial culture\n3Food and Beverage\n4DNA and RNA analysis\n5wastewater treatment\n6Pharmaceutical analysis\n7Photocatalytic studies',NULL,2,'1881232406','nsardana@iitrpr.ac.in','MrDamninder Singh','uv.vis.crf@iitrpr.ac.in',NULL,'Perkin Elmer',8),(48,'APT',2019,'LEAP 5000 XR','Dr.Khushboo Rakha','01881-232562','The CAMECA LEAP 5000 XR is a state-of-the-art atom probe tomography (APT) instrument for high-resolution, three-dimensional imaging and chemical composition mapping of materials at the atomic scale. It utilizes a pulsed laser to evaporate and ionize sample atoms, allowing for the measurement of their mass-to-charge ratio and spatial location,','','Cutting-edge LEAP 5000XR installed at NFAPT enables materials analysis\nwith nanoscale resolution with high sensitivity.     Steels & ODS steels\n Clusters, precipitates & interfaces\n Non-ferrous alloys, Superalloys\n High entropy alloys & Glasses\n Ceramics & Polymers\n Thermoelectric materials\n Energy capture and storage materials\n Geochemistry\n Magnetic, Ferroelectric & ME Materials\n Biomaterials\n Semiconductors multilayers & devices\n Catalytic materials\n Sprintronic & Photovoltaic materials\n Nano wires and tubes, quantum dots',NULL,1,'1881232408','Krakha@iitrpr.ac.in',' Mr Amit Kaushal','crf.nfapt@iitrpr.ac.in',NULL,'cameca',8),(49,'TEM 120',2019,' Talos L120C ','Dr.Avijit Goswami','01881-23-2554','Talos L120C TEM is a 20-120 kV thermionic (scanning) transmission electron microscope uniquely designed for performance and productivity across a wide range of samples and applications, such as 2D and 3D imaging of cells, cell organelles, asbestos, polymers, and soft materials, both at ambient and cryogenic temperatures. The Talos L120C TEM is designed from the ground up to allow users at any skill level to acquire high-quality results with minimal effort. Fast, sophisticated automation and advanced 3D imaging workflows allow applied researchers to focus on scientific questions rather than microscope operation.  \n\n \n\nFeatures\n\n \n\nSuperior images. High-contrast, high-quality TEM and STEM imaging with simultaneous, multiple signal detection up to four-channel integration STEM detectors.\n\n\n\nSpace for more. Add tomography or in situ sample holders. Large analytical pole piece gap, 180° stage tilt range, and large Z range.\n\n\n\nImproved productivity and reproducibility. Ultra-stable column and remote operation with SmartCam and constant power objective lenses for quick mode and HT switches. Fast, easy switching for multi-user environments.\n\n\n\nAuto-alignments. All daily TEM tunings, such as focus, eucentric height, center beam shift, center condenser aperture, and rotation center are automated.\n\n\n\n4k × 4K Ceta CMOS camera. Large field-of-view enables live digital zooming with high sensitivity and high speed over the entire high-tension range.\n\n\n\nMulti-User, Multi-Material, Multi-Discipline\n\n\n\nWith its optional, motorized, retractable cryo box and low-dose technique, the Talos L120C TEM\'s imaging quality of beam-sensitive materials is taken to the next level. To enhance productivity, especially in multi-user, multi-material environments, the constant-power objective lenses and low-hysteresis design allow for straightforward reproducible mode and high-tension switches.\n\n\n\nThe large C-Twin pole piece gap-giving highest flexibility in applications-combined with a reproducibly performing electron column opens new opportunities for high-resolution 3D characterization, in situ dynamic observations, and diffraction applications with a special emphasis on high-contrast imaging and cryo-TEM.\n\n\n\n \n\n\n\nVisitors Since 20-01-2021 :- 467','TEM Line Resolution 0.204 nm\n\n\n\nTEM Point Resolution < 0.37 nm\n\n\n\nTEM Magnification Range 25 – 650 k×\n\n\n\nTEM Magnification Range with Camera 35 – 910 k× Alpha Tilt Angle (with standard holders) -90° to +90°','Cryo-TEM: Optimization and imaging of delicate samples in thin ice for macromolecular studies​.\n\nMaterials Science: Studying polymers, asbestos, and beam-sensitive materials at ambient and cryogenic conditions.\n\nBiological Sciences: High-contrast imaging of cells, organelles, and protein complexes for structural and functional analysis.',NULL,3,'1881232056','agoswami@iitrpr.ac.in','Mr. Manish Kumar','tem120.crf@iitrpr.ac.in',NULL,'Thermo Scientific',8),(50,'TEM 300',2019,'Themis 300 G 3','Dr.Avijit Goswami','01881-23-2554','High-Resolution Transmission Electron Microscopy (HRTEM) is an advanced imaging technique that provides atomic-scale resolution for analyzing the structural properties of materials. By utilizing electron wave interference, HRTEM enables detailed visualization of crystalline structures, defects, and interfaces, making it indispensable for nanotechnology, materials science, and biological research.','Accelerating voltage: 60 -300 kV\n\nElectron source: High brightness Schottky field emission electron source (X-FEG)\n\nIntegrated electron source energy monochromator for beam energy widths to <150meV\n\nProbe forming optics include an advanced 4th order (5th order optimized) spherical aberration corrector (DCOR)\n\nProbe corrector tunings at 60, 80, and 300 kV\n\nSTEM resolution: ranging from <60pm at 300kV to  <120pm at 60 kV\n\nGreater than 100 pA probe currents available in a 1 angstrom electron probe\n\nHigh Angle Annular Dark Field (HAADF) detector and on-axis bright field/dark field STEM detector\n\nIntegrated Differential Phase Contrast (iDPC) for light element (low Z) imaging\n\nSimultaneous collection of BF/ABF/DF and HAADF images on the system\n\nTEM mode: information transfer of 60pm at 300kV to 100pm at 60kV\n\n4-crystal EDS (Energy Dispersive Spectroscopy for X-Rays) detection system (FEI Super-X)\n\nLarge EDS collection solid angle of 0.7 steradians for atomic scale EDS analysis\n\nEDS compatible with large sample rotation/tilt for 3D EDS tomography\n\nConstant power magnetic lenses enabling faster mode and accelerating voltage changes switching by eliminating related thermal drift and providing high controllability and reproducibility\n\nAutomated tuning for the monochromator and corrector (OptiMono & OptiSTEM+)\n\nComputerized 5-axes Piezo enhanced stage\n\nHigh-speed, digital search-and-view camera\n\nFEI Ceta 16M 16-megapixel digital camera for for imaging and diffraction applications\n\nSTEM & TEM tomography acquisition software and high field-of-view single-tilt tomography holder\n\nPrecession electron diffraction','1 Materials Science: Atomic-level imaging and analysis of metals, ceramics, and semiconductors 2 Nanotechnology: Characterization of nanostructures like nanoparticles and quantum dots. 3 Life Sciences: Imaging biomolecules and viruses in high resolution.',NULL,3,'1881242121','agoswami@iitrpr.ac.in','Mr.Manish Kumar','tem300.crf@iitrpr.ac.in',NULL,'Thermo Scientific',8),(51,'XPS',2019,'ESCALAB Xi +','Dr.Mukesh Kumar','01881-23--2555','hermo Scientific ESCALAB XI+ X-ray Photoelectron Spectrometer (XPS) Microprobe combines high sensitivity with high resolution quantitative imaging and multi-technique capability. Equipped with a micro-focusing X-ray monochromator designed to deliver optimum XPS performance, the ESCALAB XI+ X-ray Photoelectron Spectrometer (XPS) Microprobe ensures maximum sample throughput. The multi-technique capability and availability of a range of preparation chambers and devices provides the solution to any surface analytical problem. Using the advanced Avantage data system for acquisition and data processing, maximum information is extracted from the data\n\n\n                                                            Features\n\n  High sensitivity spectroscopy\n\n Small area XPS\n Depth profiling capabili Angle resolved XPS\nIon scattering spectroscopy (ISS) in base system\nReflected electron energy loss spectroscopy (REELS) in base system\n“Preploc” chamber in base system\nMulti-technique analytical versatility\nMany sample preparation options\nAutomated, unattended analysis\nMultiple sample analysis\nX-ray Monochromator\n\nTwin-crystal, micro-focusing monochromator has a 500mm Rowland circle and uses an Al anode\nSample X-ray spot size is selectable over a range of 200 to 900μm\nLens, Analyzer and Detector\n\nLens/analyzer/detector combination makes the ESCALAB XI+ XPS Spectrometer unique for both imaging and small area XPS\nTwo types of detectors ensures optimum detection for each type of analysis — two-dimensional detector for imaging and a detector based on channel electron multipliers for spectroscopy when high count rates are to be detected\nLens is equipped with two, computer-controlled iris mechanisms — one allows the user to control the field of view of the lens down to <20μm for small area analysis and the other to control the angular acceptance of the lens, which is essential for high-quality angle resolved XPS\n180° hemispherical energy analyzer\nDepth Profiling\n\nDigitally-controlled EX06 ion gun is a high-performance ion source even when using low energy ions\nAzimuthal sample rotation is available\nMulti-technique capability\nOther analytical techniques accommodated without compromise to the XPS performance\nReverse power supplies for the lenses and analyzer using the EX06 ion gun (ion scattering spectroscopy (ISS) is always available)\nElectron gun can be operated at up to 1000V and provides an excellent source for REELS\nTechnique Options\n\nXPS with non-monochromatic X-rays\nAES (Auger electron spectroscopy)\nUPS (Ultra-violet photoelectron spectroscopy)\n \n\nVisitors','Sampling Area\n\n\n\n50 x 20 mm\n\n\n\nX-Ray Spot Size\n\n\n\n200 to 900 μm\n\n\n\nTechnique Options\n\n\n\nUV lamp for UPS, field emission electron source for AES/SEM, Twin anode non-monochromated X-ray source\n\n\n\nAnalyzer Type\n\n\n\n180° double-focusing, hemispherical analyzer with dual detector system\n\n\n\nDepth Profiling\n\n\n\nEX06 Ion Source\n\n\n\nX-Ray Source Type\n\n\n\nMonochromated, Micro-focused Al K-Alpha\n\n\n\nOptional Accessories\n\n\n\nMAGCIS, UV lamp for UPS, field emission electron source for AES/SEM, Twin anode non-monochromated X-ray source, Platter camera\n\n\n\nItem Description\n\n\n\nESCALAB 250Xi X-ray Photoelectron Spectrometer (XPS) Microprobe\n\n\n\nSample Preparation Options\n\n\n\nHeat/cool sample holder, additional preparation chamber, bakeable 3-gas admission manifold, fracture stage, high pressure gas cell, sample parking facility\n\n\n\nThickness (Metric) Max. Sample\n\n\n\n12mm\n\n\n\nVacuum System\n\n\n\n2x turbo molecular pumps for entry and analysis chambers\n\n\n\n \n\n\n\nVisitors Since 20-01-2021 :- 467','1 Materials Science: Characterizing thin films, coatings, and nanomaterials.                           2Electronics: Analyzing semiconductors, insulators, and conductive materials.                   3 Catalysis: Investigating catalyst surfaces and reaction intermediates.                                         4 Environmental Science: Studying surface contamination and environmental pollutants\n ',NULL,2,'1881232462','mKumar@iitrpr.ac.in','Mr.Manu Rana','crf.xps@iitrpr.ac.in',NULL,'Thermo Scientific',8),(52,'LSCM',2019,'LSM 880 with Airyscan Fast Module','Dr.Durba Pal','01881-23-2556','The confocal laser-scanning microscope (LSM) is one of the most popular instruments in basic biomedical research for fluorescence based live cell imaging applications, providing high-contrast images and with versatile optical sectioning capability to investigate three-dimensional biological structures. ZEISS LSM 880 with Airyscan combines the Airyscan pinhole-plane detection technology with a new illumination shaping approach, enabling a fourfold increase in image acquisition rates. With the new fast mode, Airyscan affords researchers simultaneous access to super-resolution, increased signal-to-noise ratio and increased acquisition speeds without compromise.  ','Specifications\n\n\n\n1 Microscope\n\n\n\n• Inverted stand: Axio Observer\n\n\n\n• Upright stand: Axio Examiner, Axio Imager\n\n\n\n• Port for coupling of ELYRA\n\n\n\n• Camera port\n\n\n\n• Manual or motorized stages\n\n\n\n• Incubation solutions\n\n\n\n• Fast Z piezo inserts\n\n\n\n• Definite Focus\n\n\n\n2 Objectives\n\n\n\n• C-APOCHROMAT\n\n\n\n• Plan-APOCHROMAT\n\n\n\n• W Plan-APOCHROMAT, Clr Plan-APOCHROMAT, Clr Plan-NEOFLUAR\n\n\n\n• LCI Plan-APOCHROMAT\n\n\n\n3 Illumination\n\n\n\n• UV laser: 355 nm, 405 nm\n\n\n\n• VIS laser: 440 nm, 458 nm, 488 nm, 514 nm, 543 nm, 561 nm, 594 nm, 633 nm\n\n\n\n• NIR laser for multiphoton imaging: Ti:Sa, OPO*, InSight DeepSee*, Discovery*\n\n\n\n4 Detection\n\n\n\n• 3 or 34 descanned spectral channels\n\n\n\n(GaAsP and/or multialkali PMT)\n\n\n\n• Airyscan detector with optional Fast module\n\n\n\n• 2 additional GaAsP channels (BiG.2)\n\n\n\n• Up to 6 non-descanned GaAsP detectors\n\n\n\n• Up to 12 non-descanned GaAsP or PMT detectors total\n\n\n\n• Transmitted light detector (T-PMT)\n\n\n\n5 Software\n\n\n\n• ZEN, recommended modules:\n\n\n\nTiles & Positions, Experiment Designer, FRAP, FRET, RICS, FCS, Deconvolution, 3Dxl Viewer – powered by arivis\n\n\n\n \n\n\n\nScanning Module\n\n\n\nScanner Two independent, galvanometric scanning mirrors with ultrashort line and frame flyback\n\n\n\nScanning Resolution 4 × 1 to 8192 × 8192 pixels, also for multiple channels, continuously adjustable\n\n\n\nScanning Speed 19 × 2 speed levels; up to 13 images/sec. with 512 × 512 pixels (max. 430 images/sec. 512 × 16), up to 6875 lines/sec.\n\n\n\nIn Fast Airyscan mode: 13×2 speed levels, up to 19 images/sec. with 512×512 (max. 27 images/sec. 480×480, or 6 images/sec. 1024×1024)\n\n\n\nScanning Zoom 0.6 × to 40 ×; digitally adjustable in increments of 0.1 (Axio Examiner: 0.67 × to 40 ×)\n\n\n\nScanning Rotation Can be rotated freely (360 degrees), adjustable in increments of one degree, freely adjustable XY offset\n\n\n\nScanning Field 20 mm field diagonal (max. 18 mm for Axio Examiner) in the intermediate image plane, with full pupil illumination\n\n\n\nPinholes Master pinhole with preset size and position; can be adjusted as desired for multitracking and short wavelengths (such as 405 nm)\n\n\n\nBeam Path Exchangeable Twin Gate beam splitter with up to 100 combinations of excitation wavelengths and outstanding laser line suppression;\n\n\n\nmanual interface port for external detection modules (such as BiG.2, Airyscan, third party detectors, internal detection\n\n\n\nwith spectral signal separation and signal recycling loop for compensation of polarization effects)\n\n\n\nDetection Options\n\n\n\nDetectors 3 or 34 spectral detection channels, GaAsP and /or multialkali PMT (QE 45% typical for GaAsP)\n\n\n\n2 additional GaAsP detection channels (BiG.2)\n\n\n\nAiryscan detector (32 channels GaAsP), delivers resolution up to 140 nm lateral, 400 nm axial; in Fast mode: 145/180 nm lateral, 450 nm axial\n\n\n\nUp to 12 non-descanned detection channels (PMT and/or GaAsP)\n\n\n\nTransmitted light detector (PMT)\n\n\n\nSpectral Detection 3 or 34 simultaneous, confocal reflected-light channels, GaAsP and /or PMT based\n\n\n\nfreely adjustable spectral detection area (resolution down to 3 nm)\n\n\n\nData Depth 8 bit, 12 bit or 16 bit available; up to 35 channels simultaneously detectable\n\n\n\nReal-Time Electronics Microscope, laser, scanning module and additional accessory control; data acquisition and synchronization management through real-time\n\n\n\nelectronics; oversampling read-out logic; ability to evaluate data online during image acquisition\n\n\n\n \n\n\n\nZEN Imaging Software\n\n\n\nSystem Configurations Workspace to conveniently configure all of the motorized functions of the scanning module, laser and microscope; save and restore application configurations (Re-use)\n\n\n\nSystem Self Rest Calibration and testing tool to automatically test and calibrate the system\n\n\n\nRecording Modes, Smart Setup: Spot, Line/Spline, Frame, Tiles, Z Stack, Lambda Stack, Time Series and all combinations (XYZ, lambda, t), online calculation and visualization of ratio images, average and summation (by line/image, adjustable), Step Scan (for higher image frame rates);\n\n\n\nquick set up of imaging conditions using Smart Setup by simply selecting the labelling dye\n\n\n\nCrop Function Easily select scanning areas (simultaneously select zoom, offset, rotation)\n\n\n\nReal ROI Scan, Spline Scan: Scans of up to 99 designated ROIs (regions of interest) as desired and pixel-by-pixel laser blanking; scan along a freely defined line\n\n\n\nROI Bleaching Localized bleaching in up to 99 bleach ROIs for applications such as FRAP (fluorescence recovery after photobleaching) or uncaging; use of different speeds for bleaching and imaging, use of different laser lines for different ROIs\n\n\n\nMultitracking Rapidly change excitation lines when recording multiple fluorescences for the purpose of minimizing signal crosstalk and increasing dynamic range\n\n\n\nFast Acquisition Fast mode scan with 4x parallelisation in Y-direction, detection by Airyscan module\n\n\n\nLambda Scan Parallel or sequential acquisition of image stacks with spectral information for every pixel\n\n\n\nLinear Unmixing Acquisition of crosstalk-free, multiple fluorescence images using simultaneous excitation; online or offline and automatic or interactive unmixing; advanced unmixing logic with indication of reliability\n\n\n\nVisualization XY, orthogonal (XY, XZ, YZ), Cut (3D section); 2.5D for time series of line scans, projections (maximum intensity); animations;\n\n\n\nDepth coding (inverse colors), brightness, gamma and contrast settings; color table selection and modification (LUT), character functions\n\n\n\nImage Analysis and Operations : Colocalization and histogram analysis with individual parameters, number & brightness analysis, profile measurement along user-defined lines, measurement of lengths, angles, areas, intensities and much more; operations: addition, subtraction, multiplication, division, ratio, shift, filters (low-pass, median, high-pass, etc., also user-definable)\n\n\n\nImage Management Features for managing images and the corresponding imaging parameters; multiprint feature; streaming of acquisition data for online processing of large data sets\n\n\n\nApplications\n\n\n\nLive cell imaging, FRET, FRAP, Co-localisation analysis, Spectral Mixing, 3D Recontruction\n\n\n','1 Biological Sciences\nEnables high-resolution imaging of cellular structures and tissue dynamics.                                         2 Molecular Biology\nFacilitates detailed study of protein localization and gene expression.                                           3 Biomedical Research\nPowers visualization of disease mechanisms and drug effects on tissues',NULL,3,'1881242211','durba.pal@iitrpr.ac.in','MR.FAROOQ AHMAD','crf.lscm@iitrpr.ac.in',NULL,'Zeiss',8),(53,'FESEM',2019,'JSM 7610F Plus','Dr.Prabhat K Agnihotri','01881-23-2557','JSM-7610F FESEM is an ultra high resolution Schottky Field Emission Scanning Electron Microscope which has semi-in-lens objective lens. High power optics can provide high throughput and high performance analysis and achieving even better resolution (15 kV 0.8 nm, 1 kV 1.0nm). JSM-7610FPlus can be equipped to satisfy a variety of user needs, including observation at low accelerating voltages with GENTLEBEAM™ mode, and signal selection using r-filter. The next-generation r-filter in this model is a unique energy filter that combines a secondary electron control electrode, a backscattered electron control electrode and a filter electrode.\n\n\n\nWhen the specimen surface is irradiated by the electron beam, electron with various energies are emitted from the surface. The new r-filter makes it possible to selectively detect the secondary electrons and backscattered electrons from the specimen while the electron beam is held at the center of the lens using a combination of multiple electrostatic fields with increase in signal. It is suitable for high spatial resolution analysis, and with its gentle Beam mode feature, it can reduce the incident electron penetration to the specimen, enabling to observe its topmost surface by using a few hundred landing energy. Combining two proven technologies – an electron column with semi-in-lens objective lens which can provide high resolution imaging by low accelerating voltage and an in-lens Schottky FEG which can provide stable large probe current – to deliver ultrahigh resolution with wide range of probe currents for all applications (A few pA to more than 200 nA). The in-lens Schottky FEG is a combination of a Schottky FEG and the first condenser lens and is designed to collect the electrons from the emitter efficiently.\n\n\n\n ','Secondary electron image resolution\n\n0.8 nm(Accelerating voltage 15 kV)\n1.0 nm(Accelerating voltage 1 kV GB mode)\n0.8 nm(Accelerating voltage 1 kV GBSH mode)*1\nDuring analysis 3.0 nm\n(Accelerating voltage 15 kV, WD 8 mm, Probe current 5 nA)\n\n    Magnification  \n\n  Direct magnification: x25 to 1,000,000(120 x 90mm)\n  Display magnification: x75 to 3,000,000(1,280 x 960 pixels)\n\n    Accelerating             voltage\n\n  0.1 to 30 kV\n\n   Probe current\n\n   A few pA to ≥ 200 nA\n\n   Electron Gun       \n\n  In-lens Schottky field emission electron gun\n\n    Lens system\n\n  Condenser lens (CL)\n  Aperture-angle control lens (ACL)\n  Semi-in lens objective lens (OL)\n\n  Specimen stage\n\n  Fully eucentric goniometer stage\n\n      Specimen                movement\n\n  Specimen stage\n  Standard\n\n Optional\n\n Optional\n\n  type I A2\n  X : 70 mm\n  Y : 50 mm \n  Z : 1.0 ~ 40 mm\n  Tilt: -5 to +70°\n  Rotation: 360°\n\n type II \n X : 110 mm\n Y : 80 mm\n Z : 1.0 ~ 40 mm\n Tilt: -5 to +70°\n Rotation: 360° \n\n type III\n X : 140 mm\n Y : 80 mm\n Z : 1.0 ~ 40 mm\n Tilt: -5 to +70°\n  Rotation: 360°\n\n  Specimen holders\n\n 12.5 mm diameter × 10 mm thick, 32 mm diameter × 20 mm thick\n\n     Specimen                exchange\n\n One-action exchange mechanism\n\n       Electron              detector system\n\n Upper detector, r-filter, Built-in, Lower detector\n\n      Automatic                 Functions \n\n Focus, Stigmator, Brightness, Contrast\n\n  Image observation  LCD\n\n Screen size: 23-inch wide\n Maximum resolution: 1,280 × 1,024 pixels\n\n   SEM Control               System\n\n PC: IBM PC/AT compatible computer\n OS: Windows® 7 Professional*2\n\n      Scan and              display modes \n\n Full-frame scan\n Real magnification\n Selected- area scan\n Two-image display\n (with different magnifications, different image modes)\n Two-image wide display\n Four-image display (four-signal live display)\n Addition image (4 images + addition image)\n Scale\n\nEvacuation System \n\n Gun chamber, first and second intermediate chambers:\n\n Ultra high-vacuum dry evacuation system using ion pumps\n Specimen chamber:\n Dry evacuation system using a turbo-molecular pump (TMP)\n\n Ultimate pressure \n\n Gun chamber: Order of 10-7 Pa (for standard configuration)\n Specimen chamber: Order of 10-4 Pa (for standard configuration)','Surface Morphology\nMicrostructure\nPhase analysis\nElemental composition\nElemental mapping \n3-D imaging using BSE\nCross-sectional imaging for thickness of thin films or interfacial study',NULL,3,'1881232367','prabhat@iitrpr.ac.in','ABISHEK SHARMA','crf.fesem@iitrpr.ac.in',NULL,'JEOL',8),(54,'Metal 3D Printer',2021,'Model-EOS M 290 with DMLS te Chnology','Dr.Anupam Agarwal','','Highly productive, modular  and well-established mid-size 3D printing system for additive manufacturing of high-quality metal components in its inert nitrogen or argon atmosphere','Build Volume: 250 x 250 x 325* mm \nLaser Type:  400 W Yb-fiber laser\nScan Speed: Upto 7.0 m/s\nFocus Diameter:   100 um\nRaw Materials- Metal Powders\nTi6Al4V, SS, Maraging Steel, Inconel, AlSi10Mg',' Usage in Automotive; Aerospace; Oil & Gas; Robotics; Architectural/Structural Components; Tooling; Bio-Implants; Dental; Die Casting mold; Tool-Die; Product Development',NULL,1,'1881232356','anupam@iitrpr.ac.in','Mr. Varinder Dhiman','metal3dprint.crf@iitrpr.ac.in',NULL,'EOS GmBh',8),(55,'Laser Writer\n (Lithography)',2020,' MicroWriter ML3','Dr.Rakesh Kumar','01881-232570','MicroWriter ML3 Pro is our flagship machine within the MicroWriter ML family and is a compact, high-performance, direct-write optical lithography machine which is designed to offer unprecedented value for money in a small laboratory footprint.  Sitting on its own vibration-isolation optical table, its only service requirement is a standard power socket.  A temperature-compensated light-excluding enclosure with safety interlock allows it to be used equally well in an open laboratory environment or in a clean room','','',NULL,1,'1881242479','rakesh@iitrpr.ac.in','Ms. Shital Chowdhary','cmnf@iitrpr.ac.in',NULL,'Quantum Design',8),(56,'Optical Microscope',2019,'Upright Optical','Dr.K C Jena','01881-232571','','','',NULL,3,'1881232476','kcjena@iitrpr.ac.in','Ms. Shital Chowdhary','cmnf@iitrpr.ac.in',NULL,'Carl Zeiss',8),(57,'LPCVD',2019,'Technos','Dr.P K Agnihotri','01881-232572','','','',NULL,1,'1881242257','prabhat@iitrpr.ac.in','Ms. Shital Chowdhary','cmnf@iitrpr.ac.in',NULL,'Technos Instruments',8),(58,'S C XRD',2013,' D8Venture','Dr.Debaprasad Mandal','01881-23-3053','','Specifications:\r\nSealed tube X-ray sources\r\nMo radiation Microfocus TXS Rotating Anode\r\nCompact Direct drive with low maintenance\r\nPre-crystallized and pre-aligned filaments\r\nIµS 3.0 microfocus X-ray source - tailored to the needs of crystallography\r\nMo  radiation\r\nTwice the intensity of conventional microfocus sources\r\nAir-cooledAdvanced safety enclosures\r\nCompliant with the strictest radiation safety regulations\r\nCompliant with the new machinery directive\r\nGoniometer\r\nFIXED-CHI\r\nKAPPA\r\nBest goniometer precision\r\nSphere of confusion of less than 7 micrometer ensures that even your smallest sample stays reliably in the center of the X-ray beam.\r\n Software\r\nAPEX3 is the most complete suite for chemical crystallography\r\nPROTEUM3 now with a data processing pipeline for structural biology\r\nFully integrated low temperature devices (Oxford Cryosystem: Cobraplus)\r\nIntelligent Goniometer Control - 3D robotic path planning\r\nWithin the concept of DAVINCI.DESIGN the D8 VENTURE use a revolutionary 3D robotic path planning algorithm to efficiently drive the goniometer, maximizing the system’s capabilities. The path planning software continuously checks the validity of the experimental setup. Hardware recognition identifies components like mirrors, collimators or beam stops automatically.\r\nThe intelligent beam path components store all important information about functionality, spatial requirements and dependencies with other components in a memory chip.\r\nAdding the knowledge about the current position of each component provides an up-to-date 3D model of the system and allows the dynamic calculation of an efficient and safe goniometer driving path:\r\nAdding or removing a component from the system is instantly updated in the instrument status and available for automated software path planning.\r\n','1Pharmaceutical Development: Used to analyze molecular structures of compounds to optimize drug formulation2 oordination and Organic Chemistry: Structural determination of compounds3Biomacromolecules: SCXRD for High-Resolution 3D Structural Insights',NULL,1,'1881232051','dmandal@iitrpr.ac.in','Mr Kamlesh Satpute','scxrdadmin@iitrpr.ac.in',NULL,'Bruker',8),(59,'test',1900,'model','fac','8130620061','sdfs','sd','s','/uploads/1759072854427.jpeg',2,'8130620065','adfs@d.com','adsfa','adfs@sdfs.com',NULL,'asd',8);
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility_base_prices`
--

DROP TABLE IF EXISTS `facility_base_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility_base_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facility_id` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL COMMENT 'Price to be deducted from supervisor wallet for superuser activation',
  `base_hours` int NOT NULL COMMENT 'Hours allocated to superuser upon activation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_facility_base_price` (`facility_id`),
  CONSTRAINT `facility_base_prices_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility_base_prices`
--
-- ORDER BY:  `id`

LOCK TABLES `facility_base_prices` WRITE;
/*!40000 ALTER TABLE `facility_base_prices` DISABLE KEYS */;
INSERT INTO `facility_base_prices` VALUES (1,59,100.00,2,'2025-09-28 17:06:44','2025-09-28 17:06:44'),(2,37,500.00,10,'2025-09-30 06:06:53','2025-10-01 07:39:03');
/*!40000 ALTER TABLE `facility_base_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility_bifurcations`
--

DROP TABLE IF EXISTS `facility_bifurcations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility_bifurcations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facility_id` int DEFAULT NULL,
  `bifurcation_name` varchar(255) NOT NULL,
  `pricing_type` enum('slot','hour','half-hour') NOT NULL,
  `price_internal` decimal(10,2) DEFAULT NULL,
  `price_superuser` decimal(10,2) DEFAULT NULL,
  `price_external` decimal(10,2) DEFAULT NULL,
  `price_industry` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facility_id` (`facility_id`),
  CONSTRAINT `facility_bifurcations_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility_bifurcations`
--
-- ORDER BY:  `id`

LOCK TABLES `facility_bifurcations` WRITE;
/*!40000 ALTER TABLE `facility_bifurcations` DISABLE KEYS */;
INSERT INTO `facility_bifurcations` VALUES (10,52,'Confocal Microscope','slot',250.00,500.00,1500.00,4000.00),(11,52,'Live Cell Imaging','slot',1000.00,2000.00,6000.00,16000.00),(12,52,'base','hour',1.00,2.00,3.00,4.00),(13,59,'basic','slot',1.00,2.00,3.00,4.00);
/*!40000 ALTER TABLE `facility_bifurcations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility_booking_limits`
--

DROP TABLE IF EXISTS `facility_booking_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility_booking_limits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facility_id` int NOT NULL,
  `user_type` enum('Internal','Government R&D Lab or External Academics','Private Industry or Private R&D Lab','SuperUser') NOT NULL,
  `max_hours_per_booking` int NOT NULL DEFAULT '8',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_facility_user_type` (`facility_id`,`user_type`),
  CONSTRAINT `facility_booking_limits_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility_booking_limits`
--
-- ORDER BY:  `id`

LOCK TABLES `facility_booking_limits` WRITE;
/*!40000 ALTER TABLE `facility_booking_limits` DISABLE KEYS */;
INSERT INTO `facility_booking_limits` VALUES (1,37,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(2,44,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(3,45,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(5,54,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(6,55,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(7,57,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(8,58,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(9,39,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(10,40,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(11,41,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(12,46,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(13,47,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(14,51,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(15,42,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(16,43,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(17,49,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(18,50,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(19,52,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(20,53,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(21,56,'Internal',8,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(22,37,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(23,44,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(24,45,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(26,54,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(27,55,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(28,57,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(29,58,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(30,39,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(31,40,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(32,41,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(33,46,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(34,47,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(35,51,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(36,42,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(37,43,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(38,49,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(39,50,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(40,52,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(41,53,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(42,56,'Government R&D Lab or External Academics',6,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(43,37,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(44,44,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(45,45,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(47,54,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(48,55,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(49,57,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(50,58,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(51,39,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(52,40,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(53,41,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(54,46,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(55,47,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(56,51,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(57,42,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(58,43,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(59,49,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(60,50,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(61,52,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(62,53,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(63,56,'Private Industry or Private R&D Lab',4,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(64,37,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(65,44,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(66,45,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(68,54,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(69,55,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(70,57,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(71,58,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(72,39,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(73,40,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(74,41,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(75,46,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(76,47,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(77,51,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(78,42,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(79,43,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(80,49,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(81,50,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(82,52,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(83,53,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(84,56,'SuperUser',10,'2025-09-03 00:05:28','2025-09-03 00:05:28'),(89,48,'Internal',15,'2025-09-14 11:53:38','2025-09-14 11:53:38'),(90,48,'Government R&D Lab or External Academics',6,'2025-09-14 11:53:38','2025-09-14 11:53:38'),(91,48,'Private Industry or Private R&D Lab',4,'2025-09-14 11:53:38','2025-09-14 11:53:38'),(92,48,'SuperUser',10,'2025-09-14 11:53:38','2025-09-14 11:53:38'),(93,59,'Internal',8,'2025-09-28 15:20:54','2025-09-28 15:20:54'),(94,59,'Government R&D Lab or External Academics',6,'2025-09-28 15:20:54','2025-09-28 15:20:54'),(95,59,'Private Industry or Private R&D Lab',4,'2025-09-28 15:20:54','2025-09-28 15:20:54'),(96,59,'SuperUser',10,'2025-09-28 15:20:54','2025-09-28 15:20:54');
/*!40000 ALTER TABLE `facility_booking_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility_publications`
--

DROP TABLE IF EXISTS `facility_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility_publications` (
  `facility_id` int NOT NULL,
  `publication_id` int NOT NULL,
  PRIMARY KEY (`facility_id`,`publication_id`),
  KEY `publication_id` (`publication_id`),
  CONSTRAINT `facility_publications_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `facility_publications_ibfk_2` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility_publications`
--
-- ORDER BY:  `facility_id`,`publication_id`

LOCK TABLES `facility_publications` WRITE;
/*!40000 ALTER TABLE `facility_publications` DISABLE KEYS */;
INSERT INTO `facility_publications` VALUES (43,20),(43,21),(43,22),(46,25),(51,24),(51,25),(52,23),(53,19),(58,18);
/*!40000 ALTER TABLE `facility_publications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilityschedule`
--

DROP TABLE IF EXISTS `facilityschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilityschedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `facility_id` int NOT NULL,
  `weekday` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `total_slots` int DEFAULT NULL,
  `user_type` enum('Internal','Government R&D Lab or External Academics','Private Industry or Private R&D Lab','SuperUser') NOT NULL,
  `status` enum('Valid','Deprecated') NOT NULL DEFAULT 'Valid',
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `facility_time_user` (`facility_id`,`weekday`,`start_time`,`end_time`,`user_type`),
  CONSTRAINT `facilityschedule_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilityschedule`
--
-- ORDER BY:  `schedule_id`

LOCK TABLES `facilityschedule` WRITE;
/*!40000 ALTER TABLE `facilityschedule` DISABLE KEYS */;
INSERT INTO `facilityschedule` VALUES (19,52,'Monday','07:24:00','08:24:00',NULL,'Internal','Valid'),(20,52,'Monday','08:24:00','09:25:00',NULL,'Internal','Valid'),(21,52,'Monday','09:25:00','10:25:00',NULL,'Internal','Valid'),(22,52,'Monday','11:25:00','11:31:00',NULL,'SuperUser','Deprecated'),(23,52,'Monday','14:40:00','18:40:00',NULL,'SuperUser','Deprecated'),(24,37,'Monday','20:46:00','23:46:00',NULL,'Internal','Valid'),(25,59,'Monday','02:00:00','03:00:00',NULL,'SuperUser','Valid'),(26,59,'Monday','03:00:00','04:00:00',NULL,'SuperUser','Valid'),(27,59,'Tuesday','14:00:00','14:00:00',NULL,'SuperUser','Deprecated'),(28,59,'Tuesday','14:00:00','15:01:00',NULL,'SuperUser','Deprecated'),(29,59,'Tuesday','14:00:00','15:00:00',NULL,'SuperUser','Valid'),(30,59,'Monday','15:59:00','17:56:00',NULL,'Internal','Valid');
/*!40000 ALTER TABLE `facilityschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_name` varchar(255) NOT NULL,
  `description` text,
  `form_link` varchar(2083) NOT NULL,
  `facility_name` varchar(255) DEFAULT NULL,
  `facility_link` varchar(2083) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--
-- ORDER BY:  `id`

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (3,'Confocal Usage Log','Log sheet for Confocal Microscope usage','https://example.com/forms/confocal_log','Confocal Microscope','https://example.com/facilities/confocal','2025-05-26 19:18:12','2025-05-26 19:18:12'),(4,'3D Printing Project Proposal','Submit your project proposal for Metal 3D Printing','https://example.com/forms/3dprint_proposal','Metal 3D Printer','https://example.com/facilities/metal_3d_printer','2025-05-26 19:18:12','2025-05-26 19:18:12');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heroimages`
--

DROP TABLE IF EXISTS `heroimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heroimages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imagepath` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heroimages`
--
-- ORDER BY:  `id`

LOCK TABLES `heroimages` WRITE;
/*!40000 ALTER TABLE `heroimages` DISABLE KEYS */;
INSERT INTO `heroimages` VALUES (9,'1750835364461.webp','Title','OUR CAMPUS'),(11,'1750835485159.avif','Our Campus at Night','Subtitle');
/*!40000 ALTER TABLE `heroimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heronews`
--

DROP TABLE IF EXISTS `heronews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heronews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `news_title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `imagepath` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT 'https://iitrpr.ac.in',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heronews`
--
-- ORDER BY:  `id`

LOCK TABLES `heronews` WRITE;
/*!40000 ALTER TABLE `heronews` DISABLE KEYS */;
INSERT INTO `heronews` VALUES (10,'News',' CRF facilities open for utilization of internal and external users!! Users are requested to book their slot online and submit the duly filled and signed job forms before availing the slots. Kindly use the new and updated job form for all your needs. Forms in the old format will not be accepted w.e.f. 1st July 2025.','1750836207076.png','https://iitrpr.ac.in'),(11,'title','sum','1755305483240.png','http://localhost:3000/admin/hero');
/*!40000 ALTER TABLE `heronews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internalusers`
--

DROP TABLE IF EXISTS `internalusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internalusers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `supervisor_id` int NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `verification_token` varchar(128) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `isSuperUser` enum('Y','N') NOT NULL DEFAULT 'N',
  `super_facility` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `internalusers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `internalusers_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internalusers`
--
-- ORDER BY:  `id`

LOCK TABLES `internalusers` WRITE;
/*!40000 ALTER TABLE `internalusers` DISABLE KEYS */;
INSERT INTO `internalusers` VALUES (1,1,'priya.sharma@example.com','Dr. Priya Sharma',1,'Computer Science','token_priya_123',1,'N',NULL),(2,5,'amit.verma@example.com','Amit Verma',2,'Mechanical Engineering','token_amit_456',0,'N',NULL),(3,25,'s448@iiitd.ac.in','weapon',5,'Computer Science',NULL,0,'N',NULL),(4,27,'neetubansal.in@gmail.com','neetu',5,'Computer Science',NULL,0,'N',NULL),(5,28,'abc@iitrpr.ac.in','sanya',5,'Computer Science',NULL,0,'Y','52'),(7,33,'a@iitrpr.ac.in','a',8,'Computer Science',NULL,0,'Y','59'),(8,34,'testinga@iitrpr.ac.in','innocent',5,'Computer Science',NULL,0,'N',NULL);
/*!40000 ALTER TABLE `internalusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loginlogouthistory`
--

DROP TABLE IF EXISTS `loginlogouthistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loginlogouthistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_time` datetime NOT NULL,
  `logout_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `loginlogouthistory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loginlogouthistory`
--
-- ORDER BY:  `id`

LOCK TABLES `loginlogouthistory` WRITE;
/*!40000 ALTER TABLE `loginlogouthistory` DISABLE KEYS */;
INSERT INTO `loginlogouthistory` VALUES (96,32,'2025-09-30 10:56:20','2025-09-30 10:57:00'),(97,33,'2025-09-30 10:57:09','2025-09-30 11:17:02'),(98,32,'2025-10-01 13:24:53','2025-10-01 13:29:39'),(99,34,'2025-10-01 13:35:38','2025-10-01 13:44:54'),(100,33,'2025-10-01 14:42:02',NULL);
/*!40000 ALTER TABLE `loginlogouthistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `management_cred`
--

DROP TABLE IF EXISTS `management_cred`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `management_cred` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `Pass` varchar(255) NOT NULL,
  `Position` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `management_cred`
--
-- ORDER BY:  `id`

LOCK TABLES `management_cred` WRITE;
/*!40000 ALTER TABLE `management_cred` DISABLE KEYS */;
INSERT INTO `management_cred` VALUES (1,'crf_admin@iitrpr.ac.in','admin_pass_hashed','Admin'),(2,'rakesh.op@iitrpr.ac.in','op_rakesh_pass_hashed','Operator'),(4,'anil.op@iitrpr.ac.in','op_anil_pass_hashed','Operator'),(5,'pxrd.crf@iitrpr.ac.in','1','Operator'),(6,'crf.lscm@iitrpr.ac.in','1','Operator');
/*!40000 ALTER TABLE `management_cred` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `profile_link` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--
-- ORDER BY:  `id`

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (12,'Dr. Pratik Kumar Ray','Chairman','https://www.iitrpr.ac.in/faculty/','1755306311619.jpg'),(13,'Dr. Atharva Poundarik','Vice chairman','https://www.iitrpr.ac.in/faculty/','Dr_Kailash_Chandra_Jena.jpg'),(14,'Prof. CM Nagaraja','Member','https://www.iitrpr.ac.in/faculty/','Dr_Neha_Sardana.jpg'),(15,'Prof. Prabhat K Agnihotri','Member','https://www.iitrpr.ac.in/faculty/','Dr_Samir_Chandra_Roy.jpg'),(16,'Dr. Brijesh Rawat','Member','https://www.iitrpr.ac.in/faculty/','Dr_Rajesh_Kumar.jpg'),(17,'Dr. Vijay K Singh','Member','https://www.iitrpr.ac.in/faculty/','Dr_Rajesh_Kumar.jpg'),(18,'Dr. Dinesh Deva','Member','https://www.iitrpr.ac.in/faculty/','Dr_Rajesh_Kumar.jpg'),(19,'Dr. Neetu Bansal','Member','https://www.iitrpr.ac.in/faculty/','Dr_Rajesh_Kumar.jpg');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publications`
--

DROP TABLE IF EXISTS `publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `facility_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facility_id` (`facility_id`),
  CONSTRAINT `publications_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publications`
--
-- ORDER BY:  `id`

LOCK TABLES `publications` WRITE;
/*!40000 ALTER TABLE `publications` DISABLE KEYS */;
INSERT INTO `publications` VALUES (18,'6,6′-Biindeno[1,2-b]fluorene: an open-shell indenofluorene dimer','https://doi.org/10.1039/D4SC03996C',NULL),(19,'Investigation of microstructural evolution and carbon redistribution in ausformed nanostructured bainitic steel via 3D Atom Probe Tomography and its structure-property relationship','\nhttps://doi.org/10.1016/j.mtla.2025.102342\n',NULL),(20,'A review on nanoparticles: characteristics, synthesis, applications, and challenges','10.3389/fmicb.2023.1155622',NULL),(21,'Erosion dynamics of faceted pyramidal surfaces','https://doi.org/10.1016/j.cap.2016.05.017',NULL),(22,'The multiscale characterization and constitutive modeling of healthy and type 2 diabetes mellitus Sprague Dawley rat skin\n\n','https://doi.org/10.1016/j.actbio.2022.12.037',NULL),(23,'Harnessing a bis-electrophilic boronic acid lynchpin for azaborolo thiazolidine (ABT) grafting in cyclic peptides','https://doi.org/10.1039/D4SC04348K',NULL),(24,'Staggered band alignment of n-Er2O3/p-Si heterostructure for the fabrication of a high-performance broadband photodetector','https://doi.org/10.1088/2632-959X/ad5d81\n',NULL),(25,'Fast response and high-performance UV-C to NIR broadband photodetector based on MoS2/a-Ga2O3 heterostructures and impact of band-alignment and charge carrier dynamics','https://doi.org/10.1016/j.apsusc.2023.157597',NULL);
/*!40000 ALTER TABLE `publications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_code`
--

DROP TABLE IF EXISTS `qr_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_code` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_code`
--
-- ORDER BY:  `id`

LOCK TABLES `qr_code` WRITE;
/*!40000 ALTER TABLE `qr_code` DISABLE KEYS */;
INSERT INTO `qr_code` VALUES (7,'/uploads/qr-codes/qr-code-1750256874476.png','2025-06-18 14:27:54');
/*!40000 ALTER TABLE `qr_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `result_date` varchar(255) NOT NULL,
  `result_file_path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `results_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookinghistory` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--
-- ORDER BY:  `id`

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
INSERT INTO `results` VALUES (1,28,38,'Sun Sep 07 2025 06:02:46 GMT+0530 (India Standard Time)','/results/1757205166511-archive.zip'),(2,28,38,'Sun Sep 07 2025 06:08:44 GMT+0530 (India Standard Time)','/results/1757205524068-iiit_resume (1).zip');
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `designation` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `office_address` text,
  `qualification` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--
-- ORDER BY:  `id`

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (18,'Dr.Dinesh Deva','Dr_Dinesh_Deva.png','Clean Room Consultant','01881-23-2553','ddeva@iitrpr.ac.in',' Office Room no.103,CRF building','Ph.D. in Material Science'),(19,'Dr.Neetu Bansal','Dr_Neetu_Bansal.png','Technical officer','01881-23-2560','to.crf@iitrpr.ac.in; staff.neetu.bansal@iitrpr.ac.in','Office Room no.103,CRF building','Ph.D. in Physics & Materials Science,'),(20,'Dr.Harsimranjit Singh','Dr_Harsimranjit_Singh.jpg','Technical Supritendent','01881-23-2565','harsimranjit@iitrpr.ac.in','Multipurpose lab,First floor,CRF building','M.Sc (Chemistry)M.Tech(Nanoscience & Nanotechnology),\n\n\n\n'),(21,'Mr.Kamlesh Satpute','Mr_Kamlesh_Satpute.png','Junior Technical Supritendent','01881-23-3053','kamlesh.satpute@iitrpr.ac.in','Room no.115,SS Bhatnagar Block','M.Sc (Chemistry)'),(22,'Mr.Amit Kaushal','Mr_Amit_Kaushal.png','Junior Technical Supritendent','01881-23-2567','amit.kaushal@iitrpr.ac.in','Muiltipurpose lab,First floor,CRF building','M.Sc (Human Biology)'),(23,'Mr.Damninder Singh','Mr_Damninder_Singh.jpg','Junior Technical Supritendent','01881-23-2561,2564','damninder.singh@iitrpr.ac.in','Multipurpose lab,First floor,CRF building','M.Tech in ECE'),(24,'Mr.Anuj Babbar','Mr_Anuj_Babbar.jpg','Operator','01881-23-3079','anuj.babbar@iitrpr.ac.in','Room no.106,SS Bhatnagar Block','M.E in Thermal Engineering'),(25,'Mr.Manish Kumar','nmr_manish.png','Operator','01881-23-3052','nmr@iitrpr.ac.in','Room no.114, Bhatnagar Block','M.Sc Instrumentation'),(26,'Mr.Abhishek Sharma','Mr_Abhishek_Sharma.jpg','Operator','01881-23-2557','crf.fesem@iitrpr.ac.in','Room no.003,FESEM lab,CRF building','B. Tech (Mechanical)'),(27,'Mr.Manu Rana','Mr_Manu_Rana.jpg','Operator','01881-23-2555','crf.xps@iitrpr.ac.in','Room no.002,XPS lab,CRF building','M.Sc Chemistry (HPU)'),(28,'Mr.Manish Kumar','Mr_Manish_Kumar.jpg','Operator','01881-23-2554','tem300.crf@iitrpr.ac.in; tem120.crf@iitrpr.ac.in','Room no.006,HRTEM lab,CRF building','M.Sc Instrumentation'),(29,'Mr.Farooq Ahmed','Mr_Farooq_Ahmed.jpg','Operator','01881-23-2556','crf.lscm@iitrpr.ac.in','Room no.007,LSCM lab,CRF building','M.Sc Environmental Science');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `superuser_hour_allocations`
--

DROP TABLE IF EXISTS `superuser_hour_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `superuser_hour_allocations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `facility_id` int NOT NULL,
  `supervisor_id` int NOT NULL,
  `total_hours_allocated` int NOT NULL COMMENT 'Total hours allocated when superuser was activated',
  `hours_remaining` int NOT NULL COMMENT 'Hours remaining for use',
  `base_price_paid` decimal(10,2) NOT NULL COMMENT 'Base price paid by supervisor',
  `activated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_facility_allocation` (`user_id`,`facility_id`),
  KEY `idx_superuser_allocations_user` (`user_id`),
  KEY `idx_superuser_allocations_facility` (`facility_id`),
  KEY `idx_superuser_allocations_supervisor` (`supervisor_id`),
  KEY `idx_superuser_allocations_active` (`is_active`),
  CONSTRAINT `superuser_hour_allocations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `superuser_hour_allocations_ibfk_2` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `superuser_hour_allocations_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `superuser_hour_allocations`
--
-- ORDER BY:  `id`

LOCK TABLES `superuser_hour_allocations` WRITE;
/*!40000 ALTER TABLE `superuser_hour_allocations` DISABLE KEYS */;
INSERT INTO `superuser_hour_allocations` VALUES (8,33,59,8,2,1,0.00,'2025-09-28 19:33:27',NULL,1);
/*!40000 ALTER TABLE `superuser_hour_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `superuser_hour_usage`
--

DROP TABLE IF EXISTS `superuser_hour_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `superuser_hour_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `allocation_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `hours_used` decimal(5,2) NOT NULL COMMENT 'Hours deducted for this booking',
  `booking_date` date NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_superuser_usage_allocation` (`allocation_id`),
  CONSTRAINT `superuser_hour_usage_ibfk_1` FOREIGN KEY (`allocation_id`) REFERENCES `superuser_hour_allocations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `superuser_hour_usage_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookinghistory` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `superuser_hour_usage`
--
-- ORDER BY:  `id`

LOCK TABLES `superuser_hour_usage` WRITE;
/*!40000 ALTER TABLE `superuser_hour_usage` DISABLE KEYS */;
INSERT INTO `superuser_hour_usage` VALUES (3,8,48,1.00,'2025-09-29','2025-09-28 19:33:57'),(4,8,48,-1.00,'2025-09-29','2025-09-28 19:34:09'),(5,8,45,-1.00,'2025-09-29','2025-09-28 19:34:24'),(6,8,47,-1.00,'2025-09-29','2025-09-28 19:34:27'),(7,8,50,1.00,'2025-09-30','2025-09-30 05:35:58'),(8,8,51,2.00,'2025-10-01','2025-10-01 09:18:00');
/*!40000 ALTER TABLE `superuser_hour_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `superuser_requests`
--

DROP TABLE IF EXISTS `superuser_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `superuser_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `facility_id` int NOT NULL,
  `reason` text,
  `status` enum('pending','approved','cancelled') DEFAULT 'pending',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facility_id` (`facility_id`),
  KEY `idx_superuser_requests_user` (`user_id`),
  KEY `idx_superuser_requests_status` (`status`),
  CONSTRAINT `superuser_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `superuser_requests_ibfk_2` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `superuser_requests`
--
-- ORDER BY:  `id`

LOCK TABLES `superuser_requests` WRITE;
/*!40000 ALTER TABLE `superuser_requests` DISABLE KEYS */;
INSERT INTO `superuser_requests` VALUES (1,33,52,'a','cancelled','2025-09-02 16:44:45','2025-09-02 16:45:01',8),(2,33,52,'a','cancelled','2025-09-02 16:45:19','2025-09-02 16:47:55',8),(3,33,52,'a','cancelled','2025-09-02 16:48:06','2025-09-09 22:50:46',8),(4,28,52,'please','cancelled','2025-09-12 08:51:42','2025-09-12 08:56:11',5),(5,28,52,'abc','cancelled','2025-09-12 08:56:23','2025-09-12 08:57:28',5),(6,28,52,'a','cancelled','2025-09-12 08:57:45','2025-09-12 09:17:22',5),(7,28,52,'s','cancelled','2025-09-12 09:19:15','2025-09-13 04:40:24',5),(8,28,52,'abc','cancelled','2025-09-14 11:35:43','2025-09-14 11:36:19',5),(9,28,52,'a','approved','2025-09-14 12:01:26','2025-09-14 12:01:42',5),(10,33,52,'a','cancelled','2025-09-28 15:48:49','2025-09-28 17:08:41',8),(11,33,59,'A','cancelled','2025-09-28 17:09:04','2025-09-28 17:11:57',8),(12,33,59,'sdf','cancelled','2025-09-28 17:12:13','2025-09-28 17:17:21',8),(13,33,59,'s','cancelled','2025-09-28 17:17:50','2025-09-28 17:20:46',8),(14,33,59,'a','approved','2025-09-28 17:21:37','2025-09-28 17:21:42',8),(15,34,59,'please','cancelled','2025-10-01 08:05:49','2025-10-01 08:13:35',5),(16,34,59,'sds','cancelled','2025-10-01 08:13:56','2025-10-01 08:14:14',5);
/*!40000 ALTER TABLE `superuser_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisor`
--

DROP TABLE IF EXISTS `supervisor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `wallet_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisor`
--
-- ORDER BY:  `id`

LOCK TABLES `supervisor` WRITE;
/*!40000 ALTER TABLE `supervisor` DISABLE KEYS */;
INSERT INTO `supervisor` VALUES (1,'Dr. Ramesh Gupta','ramesh.gupta@iitrpr.ac.in','Computer Science',1020.00,NULL),(2,'Dr. Meena Iyer','meena.iyer@iitrpr.ac.in','Mechanical Engineering',100.00,NULL),(3,'Dr. Vikram Rathore','vikram.rathore@iitrpr.ac.in','Physics',0.00,NULL),(4,'Dr. Anjali Desai JI','anjali.desai@iitrpr.ac.in','Chemistry',37.00,NULL),(5,'Sanyam','sanyam22448@iiitd.ac.in','Computer Science',7800.00,'$2b$10$X.8L.CCvBrIkVxPpwUIq.Oi4od0XVk4/uP6nBuzb1mNXZYead8aYO'),(7,'a','sanyam22s448@iiitd.ac.in','s',0.00,NULL),(8,'Sanya','gargsanyam2004@gmail.com','Computer Science',21466.00,'$2b$10$X.8L.CCvBrIkVxPpwUIq.Oi4od0XVk4/uP6nBuzb1mNXZYead8aYO');
/*!40000 ALTER TABLE `supervisor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisorbookingapprovals`
--

DROP TABLE IF EXISTS `supervisorbookingapprovals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisorbookingapprovals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(128) NOT NULL,
  `booking_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `supervisorbookingapprovals_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookinghistory` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisorbookingapprovals`
--
-- ORDER BY:  `id`

LOCK TABLES `supervisorbookingapprovals` WRITE;
/*!40000 ALTER TABLE `supervisorbookingapprovals` DISABLE KEYS */;
/*!40000 ALTER TABLE `supervisorbookingapprovals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisortransactions`
--

DROP TABLE IF EXISTS `supervisortransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisortransactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `supervisor_id` int NOT NULL,
  `transaction_type` enum('TOP_UP','BOOKING_APPROVAL','BOOKING_REFUND','SUPERUSER_BOOKING','SUPERUSER_ACTIVATION','SUPERUSER_REFUND') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `description` text,
  `booking_id` int DEFAULT NULL,
  `facility_name` varchar(255) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `admin_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `supervisortransactions_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supervisortransactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookinghistory` (`booking_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisortransactions`
--
-- ORDER BY:  `transaction_id`

LOCK TABLES `supervisortransactions` WRITE;
/*!40000 ALTER TABLE `supervisortransactions` DISABLE KEYS */;
INSERT INTO `supervisortransactions` VALUES (1,4,'TOP_UP',1.00,2.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:05:50'),(2,4,'TOP_UP',1.00,3.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:06:00'),(3,4,'TOP_UP',1.00,4.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:06:02'),(4,4,'TOP_UP',11.00,15.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:06:05'),(5,4,'TOP_UP',11.00,26.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:06:17'),(6,4,'TOP_UP',11.00,37.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:09:42'),(7,1,'TOP_UP',1000.00,1000.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:11:57'),(8,2,'TOP_UP',100.00,100.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:12:17'),(9,1,'TOP_UP',20.00,1020.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:15:11'),(10,8,'TOP_UP',10.00,19760.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:15:28'),(11,8,'TOP_UP',2000.00,21760.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-09 22:15:34'),(12,5,'SUPERUSER_BOOKING',-250.00,8750.00,'Superuser booking #40 auto-approved for sanya - LSCM',40,'LSCM','sanya',NULL,'2025-09-12 09:12:24'),(15,5,'BOOKING_APPROVAL',-500.00,8250.00,'Booking #41 approved for sanya - LSCM',41,'LSCM','sanya',NULL,'2025-09-13 04:43:58'),(16,5,'BOOKING_APPROVAL',-500.00,8250.00,'Booking #41 approved for sanya - LSCM',41,'LSCM','sanya',NULL,'2025-09-13 04:44:48'),(18,5,'BOOKING_APPROVAL',-500.00,8250.00,'Booking #41 approved for sanya - LSCM',41,'LSCM','sanya',NULL,'2025-09-13 04:48:03'),(19,5,'BOOKING_APPROVAL',-500.00,7750.00,'Booking #42 approved for sanya - LSCM',42,'LSCM','sanya',NULL,'2025-09-13 04:49:09'),(20,5,'BOOKING_APPROVAL',-250.00,7500.00,'Booking #43 approved for sanya - LSCM',43,'LSCM','sanya',NULL,'2025-09-13 05:01:01'),(21,5,'BOOKING_REFUND',500.00,8000.00,'Booking #42 rejected - refund for sanya - LSCM',42,'LSCM','sanya',NULL,'2025-09-13 05:12:12'),(24,8,'SUPERUSER_ACTIVATION',-100.00,21560.00,'Superuser activation for a - test (2 hours allocated)',NULL,'test','a',NULL,'2025-09-28 17:15:43'),(26,8,'SUPERUSER_ACTIVATION',-100.00,21460.00,'Superuser activation for a - test (2 hours allocated)',NULL,'test','a',NULL,'2025-09-28 17:19:05'),(27,8,'SUPERUSER_ACTIVATION',-100.00,21360.00,'Superuser activation for a - test (2 hours allocated)',NULL,'test','a',NULL,'2025-09-28 17:21:42'),(28,8,'BOOKING_APPROVAL',-4.00,21356.00,'Booking #46 approved for a - test',46,'test','a',NULL,'2025-09-28 18:38:57'),(29,8,'BOOKING_REFUND',4.00,21360.00,'Booking cancellation refund for a - test',46,'test','a',NULL,'2025-09-28 19:33:27'),(30,8,'BOOKING_REFUND',2.00,21362.00,'Booking cancellation refund for a - test',48,'test','a',NULL,'2025-09-28 19:34:09'),(31,8,'BOOKING_REFUND',2.00,21364.00,'Booking cancellation refund for a - test',45,'test','a',NULL,'2025-09-28 19:34:24'),(32,8,'BOOKING_REFUND',2.00,21366.00,'Booking cancellation refund for a - test',47,'test','a',NULL,'2025-09-28 19:34:27'),(33,8,'TOP_UP',100.00,21466.00,'Top-up by Admin (crf_admin@iitrpr.ac.in)',NULL,NULL,NULL,'crf_admin@iitrpr.ac.in','2025-09-30 05:50:41'),(34,5,'SUPERUSER_ACTIVATION',-100.00,7900.00,'Superuser activation for innocent - test (2 hours allocated)',NULL,'test','innocent',NULL,'2025-10-01 08:06:44'),(35,5,'SUPERUSER_ACTIVATION',-100.00,7800.00,'Superuser activation for innocent - test (2 hours allocated)',NULL,'test','innocent',NULL,'2025-10-01 08:14:02');
/*!40000 ALTER TABLE `supervisortransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisorverifications`
--

DROP TABLE IF EXISTS `supervisorverifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisorverifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(128) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `supervisorverifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisorverifications`
--
-- ORDER BY:  `id`

LOCK TABLES `supervisorverifications` WRITE;
/*!40000 ALTER TABLE `supervisorverifications` DISABLE KEYS */;
INSERT INTO `supervisorverifications` VALUES (1,5,'token_amit_456','2025-05-26 19:18:13'),(3,27,'e79680b72937cdff82aaa39e227c90d70c8cfee77ef062953a31f9a5d1e26e9e','2025-05-30 07:36:20'),(5,32,'a756dcf21cd837912507b08cf383c06fc036766582e5c7d749413310e23ac472','2025-09-02 12:56:43'),(6,33,'b897d8d6c890ad0c5731c56f967a87a560c4f3ba78fbb4781e815c48fed21c29','2025-09-02 13:36:23'),(7,34,'7bf57a6d2090c3717d10a584c8b495c324e3910495e6b22f94f2a81e66a772ff','2025-10-01 08:04:12');
/*!40000 ALTER TABLE `supervisorverifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thought`
--

DROP TABLE IF EXISTS `thought`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thought` (
  `id` int NOT NULL DEFAULT '1',
  `thought_text` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thought`
--
-- ORDER BY:  `id`

LOCK TABLES `thought` WRITE;
/*!40000 ALTER TABLE `thought` DISABLE KEYS */;
INSERT INTO `thought` VALUES (1,'thought');
/*!40000 ALTER TABLE `thought` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_publications`
--

DROP TABLE IF EXISTS `user_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_publications` (
  `publication_id` int NOT NULL AUTO_INCREMENT,
  `author_name` varchar(255) NOT NULL,
  `title_of_paper` varchar(255) NOT NULL,
  `journal_name` varchar(255) DEFAULT NULL,
  `volume_number` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `page_number` varchar(50) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `user_id` int NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  PRIMARY KEY (`publication_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_publications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_publications`
--
-- ORDER BY:  `publication_id`

LOCK TABLES `user_publications` WRITE;
/*!40000 ALTER TABLE `user_publications` DISABLE KEYS */;
INSERT INTO `user_publications` VALUES (1,'Dr. Priya Sharma','Novel Drug Delivery Systems','Journal of Pharmaceutical Sciences',110,2023,'1234-1245','uploads/user_pubs/priya_pharma.pdf',1,'Approved'),(2,'Prof. Anil Kumar, Dr. Priya Sharma','AI in Material Science Discovery','Advanced Functional Materials',33,2024,'2300150','uploads/user_pubs/anil_priya_ai_mat.pdf',2,'Pending'),(3,'Mr. Raj Patel','Development of a New Catalyst','Catalysis Letters',150,2022,'800-810','uploads/user_pubs/raj_catalyst.pdf',3,'Approved'),(4,'Ms. Sunita Singh (Industry Corp)','Optimization of Manufacturing Process using IoT','IEEE Transactions on Industrial Informatics',20,2024,'550-560','uploads/user_pubs/sunita_iot.pdf',4,'Rejected'),(5,'a','a','a',5,9,'111','publications/1748525844149-instruments.zip',25,'Pending');
/*!40000 ALTER TABLE `user_publications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_type` enum('Internal','Internal Consultancy','Government R&D Lab or External Academics','Private Industry or Private R&D Lab') NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `org_name` varchar(255) DEFAULT NULL,
  `id_proof` varchar(512) DEFAULT NULL,
  `verified` enum('YES','NO') DEFAULT 'NO',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--
-- ORDER BY:  `user_id`

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Internal','Dr. Priya Sharma','priya.sharma@example.com','password_hashed_priya','9876500001','IIT Ropar','id_proofs/priya_sharma.pdf','YES','2025-05-26 19:18:12'),(2,'Government R&D Lab or External Academics','Prof. Anil Kumar','anil.kumar@university.edu','password_hashed_anil','9876500002','Panjab University','id_proofs/anil_kumar.pdf','YES','2025-05-26 19:18:12'),(3,'Internal Consultancy','Mr. Raj Patel','raj.patel@rdlab.org','password_hashed_raj','9876500003','CSIR Lab','id_proofs/raj_patel.pdf','YES','2025-05-26 19:18:12'),(4,'Private Industry or Private R&D Lab','Ms. Sunita Singh','sunita.singh@industrycorp.com','password_hashed_sunita','9876500004','Industry Corp','id_proofs/sunita_singh.pdf','YES','2025-05-26 19:18:12'),(5,'Internal','Amit Verma','amit.verma@example.com','password_hashed_amit','9876500005','IIT Ropar','id_proofs/amit_verma.pdf','NO','2025-05-26 19:18:12'),(6,'Government R&D Lab or External Academics','Sanyam Garg','sanyam22448@iiitd.ac.in','$2b$10$e8qs9pLKLKqT61tBxpkMtufqfQHKJ2QgcxvrCPWRo4yEWY7XnHgsi','8130620064',NULL,NULL,'YES','2025-05-28 11:01:20'),(7,'Government R&D Lab or External Academics','Sanyam Garg','sanyam224418@iiitd.ac.in','$2b$10$DDEAdXj12PsTdqdfdJloFuNtTnH.s.cgsLQQmTuEAzJScdOHNrTbm','8130620064',NULL,NULL,'NO','2025-05-28 11:02:44'),(8,'Government R&D Lab or External Academics','abc','abc@gmail.com','$2b$10$uQnPw9jVHaBGOKrEy2IitOusHxwI99xkjgcjrNZkO1Uc1.e7UZTGu','8130620064',NULL,NULL,'YES','2025-05-28 11:04:36'),(9,'Government R&D Lab or External Academics','a','a@g.com','$2b$10$yT3FArgWwRyd6yqx6TY5ZuHallm9KbvUpkCSsocPx/wMdJ6CeVTgu','8130620064',NULL,NULL,'NO','2025-05-28 11:08:51'),(10,'Government R&D Lab or External Academics','Sanyam Garg','sanyam122448@iiitd.ac.in','$2b$10$t28433bftuzxBmUsQsiNs./mvOxRnczwp2N86XK7/4v3e5GssDX/G','8130620064','qq',NULL,'NO','2025-05-28 11:11:10'),(12,'Government R&D Lab or External Academics','Sanyam Garg','sanyam1122448@iiitd.ac.in','$2b$10$olYBz9swwxgNSeBmo5Ac6eN8FTl8RS.RMC474.8YY9CXEMOwdEtw6','8130620064','1',NULL,'NO','2025-05-28 11:12:10'),(13,'Government R&D Lab or External Academics','Sanyam Garg','sanyam211112448@iiitd.ac.in','$2b$10$..DH6THfZTwNDghI9s3GlOFxCK2sHDM9.C8vYxCkcciAuwC3V5RA2','8130620064','1',NULL,'NO','2025-05-28 11:16:30'),(14,'Government R&D Lab or External Academics','Sanyam Garg','sa11nyam22448@iiitd.ac.in','$2b$10$6AepJebvn2nQ2541NrJZZ.kiTk2gMCDXNSwuDPUe31EboKOpx588C','8130620064','1','uploads/1748431248581-dda4da1f-2690-447b-84eb-780916eeac88.pdf','NO','2025-05-28 11:20:48'),(15,'Government R&D Lab or External Academics','11','sanyam21122448@iiitd.ac.in','$2b$10$ZbyEgji.biLRUL1kvLjXl.R7kqYjjMWj.rciLdiLwXekPfwdmwC1a','1130620064','1','uploads/1748431296002-5e2e7951-3ce0-407e-8dac-3e982a056599.pdf','NO','2025-05-28 11:21:36'),(16,'Government R&D Lab or External Academics','Sanyam Garg','sany1am212448@iiitd.ac.in','$2b$10$K3NEn9UH1An.TAfBtiWV.e2FzOenqvuBHQbMI9CsVBTlDxPtGC4F2','9130620064','1','uploads/1748431576229.pdf','YES','2025-05-28 11:26:35'),(17,'Internal','gujar','sanyam22441233218@iiitd.ac.in','$2b$10$F/3OS9aq3T6g4//hRuwkvehLHx6R9y/5TVgg7p0C6pr2w9WITPxs6','8130620064',NULL,'uploads/1748432076344.pdf','YES','2025-05-28 11:34:37'),(19,'Internal','gujar','sanyqam22441233218@iiitd.ac.in','$2b$10$CiPdHAJDKe3bX90UP1KRJemh4GxpZH.RjNmPKWfPYOBu5lKBB8Uma','8130620064',NULL,'uploads/1748432076344.pdf','YES','2025-05-28 11:35:13'),(25,'Internal','weapon','s448@iiitd.ac.in','$2b$10$dYjHtJJl8zOyNm.0ZPdhqOir0nr2ttwHATsc665gpUY7hd0XBHf0a','8130620064',NULL,'uploads/1748434317056.png','YES','2025-05-28 12:26:05'),(26,'Government R&D Lab or External Academics','Sa','aa@aa.com','$2b$10$3nFhEioGphVQj3ijEfC9A.yYNk6IXcpvR94z2hs6ZYQUX5wGF2uCC','8130620068',NULL,'uploads/1748451649597.pdf','YES','2025-05-28 19:43:15'),(27,'Internal','neetu','neetubansal.in@gmail.com','$2b$10$jXVWoFiWj.BIWVGDgokXo.rKI4M33W0WPJqMs4xZcCSS/krwsX8di','9646714923',NULL,'uploads/1748590528714.pdf','YES','2025-05-30 07:36:20'),(28,'Internal','sanya','abc@iitrpr.ac.in','$2b$10$Zwtjr7RaJqr3lLRmN9r8xu3eepGD9Fkhg2in8PhvRCoyh9eJnEZRS','8130620064',NULL,'uploads/1750077690852.jpeg','YES','2025-06-16 12:41:42'),(30,'Private Industry or Private R&D Lab','a','sanyam22w448@iiitd.ac.in','$2b$10$MV.Ez/2bJNoy1IeTwMEf2usKYHEVwOn5ScLSvmDCpdMTbPD3mImBy','8130620064',NULL,'uploads/1751612407602.pdf','YES','2025-07-04 07:00:23'),(31,'Government R&D Lab or External Academics','Innocent_garg','gargsanyam2004@gmail.com','$2b$10$3sxAMmTGSM66lJElD1BdFeIFyDabbQIZpJ1hPeQYmrJVFC5IU176e','8130620061',NULL,'uploads/1756815067039.jpg','YES','2025-09-02 12:12:39'),(32,'Internal','a','sanyam22@iitrpr.ac.in','$2b$10$AOfWp32NIVNoOclX/LoZoeeCeGs7AfWp.OLOdrRyKgz2wVAOkUG3W','1234567890',NULL,'uploads/1756817691259.jpg','YES','2025-09-02 12:56:43'),(33,'Internal','a','a@iitrpr.ac.in','$2b$10$EHjl9ztuMGtxBrnyCbjRJ.lkHAEkIxfjlgW6qzgfI5H1HllCfp52.','1234567890',NULL,'uploads/1756820171736.jpg','YES','2025-09-02 13:36:23'),(34,'Internal','innocent','testinga@iitrpr.ac.in','$2b$10$NX1YG8RuNDagcjKaOHiXvuUT118Nvp67uznTEY5zrEU.gaUafjj2i','8130720065',NULL,'uploads/1759305849839.jpeg','YES','2025-10-01 08:04:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'iitrpr'
--

--
-- Dumping routines for database 'iitrpr'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-06 10:40:08
