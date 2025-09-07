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
INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'PXRD',
            2010,
            'Xpert Pro MPD',
            'Malvern Panalytical',
            'Dr. Rajiv Kumar',
            '01881-23-3053',
            'Model – Xpert Pro MPD (Pananalytical)The instrument is a PANalyticalX''Pert Pro MPD, powered by a Philips PW3040/60 X-ray generator and fitted with an X''Celerator* detector.Diffraction data is acquired by exposing powder samples to Cu-KαX-ray radiation, which has a characteristic wavelength (l) of 1.54Å.  X-rays were generated from a Cu anode supplied with 40 kV and a current of 40 mA
Phase identification was carried out by means of the X''Pert accompanying software program PANalyticalHigh Score Plusin conjunction with the ICDD Powder Diffraction File 2 Database (1999), ICDD Powder Diffraction File 4 - Minerals (2012), the American Mineralogist Crystal Structure Database (March 2010) and the Crystallography Open Database
The X’Celerator is an ultra-fast X-ray detector that uses RTMS (Real Time Multiple Strip) technology.  It operates as an array of a hundred channels which can simultaneously count X-rays diffracted from a sample over the range of 2θ angles specified during a scan.  The X’Celerator is therefore able to give produce high quality diffraction data in a significantly shorter time period than an older style diffractometerwould require.
Principle:-
Let us consider an X-ray beam incident on a pair of parallel planes P1 and P2, separated by an inter-planar spacing d.
The two parallel incident rays 1 and 2 make an angle (THETA) with these planes. A reflected beam of maximum intensity will result if the waves represented by 1’ and 2’ are in phase. The difference in path length between 1 to 1’ and 2 to 2’ must then be an integral number of wavelengths, (LAMBDA). We can express this  relationship mathematically in Bragg’s law.
2d*sin T = n * ?
The process of reflection is described here in terms of incident and reflected (or diffracted) rays, each making an angle THETA with a fixed crystal plane. Reflections occurs from planes set at angle THETA with respect to the incident beam and generates a reflected beam at an angle 2-THETA from the incident beam.
The possible d-spacing defined by the indices h, k, l are determined by the shape of the unit cell. Rewriting  Bragg’s law we get :
sin T = ?/2d
Therefore the possible 2-THETA values where we can have reflections are determined by the unit cell  dimensions. However, the intensities of the reflections are determined by the distribution of the electrons in the unit cell. The highest electron density are found around atoms. Therefore, the intensities depend on what kind of atoms we have and where in the unit cell they are located.
Planes going through areas with high electron density will reflect strongly, planes with low electron density will give weak intensities.

',
            'ConditionValue X-ray tube Cu                            ( 1.54059)

Voltage :                                                        45 kV

Amperage:                                                     40 mA

Scan range Step Size Collection time               :1941s

Scan speed Slit Revolution time:                       0.5s

Mode                                                   Transmission

 

',
            '1Materials Science
Phase Identification
Structure Determination 
Defect Analysis
Material Development 
2. Chemistry
Catalyst Characterization 
Polymorphism Studies
Reaction Monitoring3 Earth Sciences and Geology
Mineralogy
Soil Analysis
Ore Characterization 
4. Nanotechnology
Nanostructure Analysis
Thin Film Characterization',
            "uploads/XRD (Powder).jpg",  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881232411',
            'krajiv@iitrpr.ac.in',
            'Mr Kamlesh Satpute',
            'pxrd.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'S C XRD',
            2013,
            ' D8Venture',
            'Bruker',
            'Dr.Debaprasad Mandal',
            '01881-23-3053',
            '',
            'Specifications:
Sealed tube X-ray sources
Mo radiation Microfocus TXS Rotating Anode
Compact Direct drive with low maintenance
Pre-crystallized and pre-aligned filaments
IµS 3.0 microfocus X-ray source - tailored to the needs of crystallography
Mo  radiation
Twice the intensity of conventional microfocus sources
Air-cooledAdvanced safety enclosures
Compliant with the strictest radiation safety regulations
Compliant with the new machinery directive
Goniometer
FIXED-CHI
KAPPA
Best goniometer precision
Sphere of confusion of less than 7 micrometer ensures that even your smallest sample stays reliably in the center of the X-ray beam.
 Software
APEX3 is the most complete suite for chemical crystallography
PROTEUM3 now with a data processing pipeline for structural biology
Fully integrated low temperature devices (Oxford Cryosystem: Cobraplus)
Intelligent Goniometer Control - 3D robotic path planning
Within the concept of DAVINCI.DESIGN the D8 VENTURE use a revolutionary 3D robotic path planning algorithm to efficiently drive the goniometer, maximizing the system’s capabilities. The path planning software continuously checks the validity of the experimental setup. Hardware recognition identifies components like mirrors, collimators or beam stops automatically.
The intelligent beam path components store all important information about functionality, spatial requirements and dependencies with other components in a memory chip.
Adding the knowledge about the current position of each component provides an up-to-date 3D model of the system and allows the dynamic calculation of an efficient and safe goniometer driving path:
Adding or removing a component from the system is instantly updated in the instrument status and available for automated software path planning.
',
            '1Pharmaceutical Development: Used to analyze molecular structures of compounds to optimize drug formulation2 oordination and Organic Chemistry: Structural determination of compounds3Biomacromolecules: SCXRD for High-Resolution 3D Structural Insights',
            'Single_Crystal_XRD.jpg',  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881232051',
            'dmandal@iitrpr.ac.in',
            'Mr Kamlesh Satpute',
            'scxrdadmin@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'NMR 400',
            2012,
            'JNM-ECS-400',
            'JEOL',
            'Dr Manoj Kumar Pandey',
            '01881-23-3052',
            'Nuclear Magnetic Resonance (NMR 400 MHz)

Make & Model – JEOL & JNMECS400    

ECS Narrow Bore Spectrometer (400) FT NMR System is a versatile high-performance system that utilizes the latest digital and high-frequency technologies.  The JNM ECS400 series FT NMR System features improved operability and small installation space, both of which are required for routine NMR systems. It’s a two-channel spectrometer., Room-temperature shim: Digital matrix shim, 21 items controlled.

Variable temperature range:  -140 to +180-degree C.
High Band (1H /19F) amplifier (HF): 50 W,
Low band (or Broad) band amplifier (LF): 150W 
Gradient Strength: 30G/Cm @ 10A (Standard)
                                                 

                                         

Working Principle:

The principle behind NMR is that many nuclei have spin and all nuclei are electrically charged. If an external magnetic field is applied, an energy transfer is possible between the base energy to a higher energy level (generally a single energy gap). The energy transfer takes place at a wavelength that corresponds to radio frequencies and when the spin returns to its base level, energy is emitted at the same frequency. The signal that matches this transfer is measured in many ways and processed in order to yield an NMR spectrum for the nucleus concerned.

Fig., relates to spin- ½ nuclei that include the most commonly used NMR nucleus, proton (1H or hydrogen-1) as well as many other nuclei such as 13C, 15N and 31P. Many nuclei such as deuterium (2H or hydrogen-2) have a higher spin and are therefore quadrupolar and although they yield NMR spectra their energy diagram and some their properties are different.                                                                  

                                            

Visitors Sinc',
            'Basic Specifications: JNM-ECS400: 400MHz NMR SPECTROMETER
Two Channel Spectrometer
Observation nuclei: 1H/19F, 31P to 15N
Auto tuning/matching range: All observation nuclei.
 Sensitivity for 13C: 190 or more
Observation frequency: 1H: 400 MHz, 13C: 100MHz
Sensitivity for 1H:  280 or more (0.1% ethyl benzene)
Drift rate:  ≤ 4Hz
Variable temperature range: -140 to +180-degree C
Room-temperature shim: Digital matrix shim, 21 items controlled
 ECS Standard Software

The client system of the ECS, Delta, provides versatile data processing and easy to-use interfacing with the NMR spectrometer. The Delta software application, constructed on a highly virtual architecture, is easily transported to various operating systems, ensuring that the operating environment lasts despite rapid changes in computer technology. Supporting the standard graphics environment, OpenGL, the Delta software can efficiently perform routine data processing. The JNM-ECS FT NMR System is operated under both the high-grade, stable hardware and the easy-to-use superior software, in spite of being a small, low-cost system. Thus, the JNM-ECS provides the highest-level NMR research data while greatly reducing the analysis time required for routine NMR measurement
Vibration Proof Table

This is an air-damper-type vibration proof table used with a 400 MHz superconducting magnet (SCM) for an NMR system
 
400MHZ TH5Probe

This probe is used for 1H and multinuclear NMR observation while irradiating 1H and applying a pulsed magnetic field gradient to a sample using a 5 mm sample tube in the FT NMR system. By using the optional Auto Tuning Unit, you can automatically tune the probe for the multiple nuclei.
400MHz H5X Probe

This 5mm probe is optimized for 1H observation. This probe is therefore recommended for 1H measurements including inverse experiments (1H observed 2D experiments). This probe is compatible with the Auto tune controller thus consecutive measurements can include change of nucleus as well as different experiments.
 
STACMAN ASC64

The “Auto Sample Changer 64” can be installed in an FT NMR system, which is configured with one of the superconducting magnets (SCM).
 
This sample changer can be used to automatically change the sample tube containing the sample for measurement by commands from the host computer
Variable Temperature Accessory: Liquid Nitrogen based

VT control range:  -100 oC to + 150 oC., Temperature setting steps 0.1 Deg C. Low temperature unit include suitable liquid nitrogen Dewar. Low temperature limit: - 100 Deg C. The low temperature unit is complete in all respects. This all function controlled under host computer.
 
Auto Tuning Unit

Auto tuning unit comes as a standard, which will be helpful in doing Automatic Tuning and Matching for the nuclei under study for liquid samples.
 
Visitors Since 2',
            '

             
1Organic/Inorganic Chemistry/Pharmaceuticals: Analyrsis of molecular structure and identification of unknown chemical substances. 2 Polymer Chemistry/Food Chemistry/Qualitycontrol: Quantitative analysis and analysis of mixtures 3 Peptides/Petrochemicals/Organometallics/Catalysis Electro chemistry:  Measurement of diffusion coefficient,  relaxation time, dynamics, reaction monitoring.
',
            'Nuclear Magnetic Resonance (NMR 400 MHz.jpg',  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232051',
            'mkpandey@iitrpr.ac.in',
            'Mr Manish Kumar',
            'nmr@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'NMR 600',
            2019,
            ' JNM ECZ600R/ M3',
            'JEOL',
            'Dr Manoj Kumar Pandey',
            '1881232061',
            'The JNM-ECZ600R/M3 is a 600 MHz NMR spectrometer from JEOL, a high-resolution instrument designed for advanced analytical applications, particularly in solid-state and liquid-state NMR. It uses a superconducting magnet, providing high sensitivity and resolution for detailed structural analysis of molecules. 
Key Features and Capabilities:
High Field Strength: The instrument utilizes a 14.09 Tesla magnet, corresponding to a 600 MHz frequency for 1H. 
Solid-State and Liquid-State NMR: It''s capable of performing both solid-state and liquid-state NMR experiments. 
Multiple Probes: The JNM-ECZ600R/M3 is equipped with a variety of probes, including:
Solid-state probes: 3.2 mm and 1 mm HX MAS probes for solid-state analysis, with variable temperature capabilities and fast rotation speeds. 
Liquid-state probes: 5 mm FG/RO probe for liquid phase measurements, with automatic frequency tuning. 
Broadband probes: TH5 probe for 1H, 19F, 15N, and 31P nuclei, and Royal Probe for 15N to 31P. 
Smart Transceiver System (STS): The instrument utilizes JEOL''s STS technology for high-precision and stable RF control. 
Multi-sequencer: The multi-sequencer allows for complex and multi-dimensional NMR experiments with precise control of multiple RF sources. 
Temperature Control: Variable temperature control, allowing experiments from -100 to +150°C. 
Automatic Sample Changer: An automatic sample changer for efficient sample analysis. 
Software: The instrument comes with NMR software for data processing and analysis. ',
            'MAGNET
Superconducting 600 MHz, shielded
CONSOLE
ECZ600R, two channels, 44 magnetic field homogenity corrections, 200 W (high-frequency 550 - 610 MHz) amplifiers and 500 W (low-frequency 5 - 245 MHz)
PROBEHEADS
3.2 mm HX MAS probe with large temperature range (from -100 to +200 ° C, maximum rotation speed 22 kHz); 1 mm HX MAS probe (80 kHz maximum rotation speed); 5 mm FG / RO probe for liquid phase measurement with automatic frequency tuning
WORKSTATION
Dell OptiPlex 7050, Win 10 Pro, NMR software Delta 5.3',
            ' Structural Analysis: Determining the structure of small molecules and proteins in solution. 
Solid-State NMR: Studying the structure and dynamics of materials in the solid state. 
Variable Temperature Studies: Performing NMR experiments at different temperatures for studying dynamic processes. 
Reaction Monitoring: Tracking the progress of chemical reactions in real-time. 
Material Science: Characterizing the chemical and physical properties of materials. ',
            'Nuclear Magnetic Resonance (NMR 600 MHz.jpg',  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232061',
            'mkpandey@iitrpr.ac.in',
            'Mr Manish Kumar',
            'nmr600.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'HRMS',
            2016,
            'XEVO G2-XS QTOFEL',
            'WATER GMBH',
            'Dr.Anupam Bandopadhyay',
            '01881-23-3079',
            'Model – YEA955 (Waters)

High-resolution MS (HRMS) is rapidly advancing into many fields of modern analytical sciences. Instruments such as Fourier-transform ion cyclotron resonance (FTICR) and modern orbitrap and TOF systems are now frequently used in laboratories, where only a few years ago traditional quadrupole and ion trap mass spectrometers dominated. In particular, the selective data-acquisition modes of triple quadrupole mass spectrometers (e.g., precursor ion scan or multiple reaction monitoring) are increasingly being replaced by full-scan or MS/MS experiments on HRMS instruments even in quantitative applications, because the information gained from high-resolution, accurate mass data often outweighs the benefits of highly selective measurements on low-resolution mass spectrometers.
Principle:-

A mass spectrometer generates multiple ions from the sample under investigation, it then separates them according to their specific mass-to-charge ratio (m/z), and then records the relative abundance of each ion type.

The first step in the mass spectrometric analysis of compounds is the production of gas phase ions of the compound, basically by electron ionization. This molecular ion undergoes fragmentation. Each primary product ion derived from the molecular ion, in turn, undergoes fragmentation, and so on. The ions are separated in the mass spectrometer according to their mass-to-charge ratio, and are detected in proportion to their abundance. A mass spectrum of the molecule is thus produced. It displays the result in the form of a plot of ion abundance versus mass-to-charge ratio. Ions provide information concerning the nature and the structure of their precursor molecule. In the spectrum of a pure compound, the molecular ion, if present, appears at the highest value of m/z (followed by ions containing heavier isotopes) and gives the molecular mass of the compound.

 

Visitors Since 20-01-2021 :- 467',
            '1.) Mass Range: 20 to 32,000 m/z in Quadrupole & 20 to 1,00,000 m/z in TOF.

2.) Resolution: ≥ 45,000 FWHM for m/z 1000 and ≥ 35,000 FWHM for around 200 m/z.

3.) Sensitivity: Full MS/MS mode ≤ 10 femtogram on column, at S/N ratio greater than 100:1

ACQUITY UPLC H – CLASS PLUS SYTEM:

1.) Quaternary operating pump(s) with an operating pressure of minimum 15000 psi

2.) Flow rate range - 0.010 to 2.200 mL/min, in 0.001 mL increments

3.) Flow rate accuracy: ±0.1 %.
',
            '1Chemistry and Biochemistry                       2Pharmaceutical and Drug Development 3Forensic Science                          4Environmental Analysis',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232055',
            'anupamba@iitrpr.ac.in',
            'Mr. Anuj Babbar',
            'hrms@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'SEM',
            2010,
            'JSM6610LV',
            'JEOL',
            'Dr Nitish Bibhanshu',
            '01881-23-2567',
            'SEM provides high-resolution imaging to analyze surface morphology, topography, and composition. It is widely used for failure analysis, material characterization, and microstructural studies, offering insights at the nanoscale with elemental analysis capabilities via Energy Dispersive X-ray Spectroscopy (EDS)',
            'Resolution: 3.0 nm (30 kV) , 8.0 nm (3 kV), 15 nm (1 kV) at HV mode,4.0 nm (30 kV) at LV mode

Magnification:× 5 to × 300,000 (on 128 mm × 96 mm image size)

Accelerating voltage: 0.3kV to 30 kV,

Probe current: 10-12 to 10-6 A,

Specimen stage: Eucentric large-specimen motorized axes stage: x-y: 125 mm x 100 mm, tilt: -10° to ～＋90°, rotation: 360°, working distance: 5 mm to 80 mm',
            '1Material Science: Surface morphology, failure analysis, and microstructural characterization.
2Biology: Imaging cellular structures, tissues, and microorganisms                                           3Nanotechnology: Analysis of nanostructures, thin films, and coatings.
',
            'Scanning Electron Microscope (SEM).jpg',  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881232413',
            'nitishbibhanshu@iitrpr.ac.in',
            'Mr Amit Kaushal',
            'sem@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'SPM',
            2011,
            ' Xpert Pro MPD',
            'BRUKER',
            'Dr.Mukesh Kumar',
            '01881-23-2565',
            'Atomic Force Microscope (AFM)



Model: Multimode 8 SPM (Bruker)



The Atomic Force Microscope (AFM) is a powerful instrument for nanometer scale science and technology.



                                       



Principle:-



The AFM principle is based on the cantilever/tip assembly that interacts with the sample; this assembly is also commonly referred to as the probe. The AFM probe interacts with the substrate through a raster scanning motion. The up/down and side to side motion of the AFM tip as it scans along the surface is monitored through a laser beam reflected off the cantilever. This reflected laser beam is tracked by a position sensitive photo-detector (PSPD) that picks up the vertical and lateral motion of the probe. The deflection sensitivity of these detectors has to be calibrated in terms of how many nanometres of motion correspond to a unit of voltage measured on the detector.



 



Visitors Since 2',
            'SPM Controller Heads
Standard- Supports all modes except application modules
Scanners
AS-130VLR scanner – 125µm x 125µm XY and 5µm Z range (vertical engage), features improved liquid resistance
Standard Accessories
Included with all MultiMode 8 system configurations: – OMV, Optical microscope with 10X objective for viewing tip, sample, and laser, (video output is displayed within NanoScope software)
– Probe holder for most imaging applications in air, includes tip bias connection
– MFM starter kit with probes and training samples;
– Calibration grating for scanner calibration
Vibration Isolation*
VT-102, air table, 24in. square x 31in. tall (requires compressed air);',
            '1 Materials Science: Obtain 3-D images of surfaces with atomic resolution revealing features like defects, grain boundaries etc.                        2 Nanotechnology: Characterizing size, shape and surface morphology of nanomaterials           3 Semiconductors:Providing high-resolution potential profiles of semiconductor devices',
            'atomic force microscope (afm).png',  -- Setting image_url to NULL since images are in a separate folder
            3,
            '01881-232462',
            'mkumar@iitrpr.ac.in',
            'Mr. Harsimranjit Singh',
            'spm@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'HT Furnace',
            2014,
            'RHTH120/600/
18
',
            'NABERTHEM GERMANY',
            'Dr.Sarang Gumfekar',
            '01881-23-2563',
            'Due to their solid construction and compact stand-alone design, these high-temperature furnaces are perfect for processes in the laboratory where the highest precision is needed. Oustanding temperature uniformity and practical details set unbeatable quality benchmarks. For configuration for your processes, these furnaces can be extended with extras from our extensive option list.',
            'Outer dimensions furnace approx: 2500 x 1150 x 2130 mm

Weight approx. 600 kg

Power rating furnace approx. 14,4 kW

Power supply furnace 380 V, 3/N/PE, 50 Hz, fuse protection without earth-leakage breaker

Max. tube diameter outer 120 mm

Heated tube length 600 mm

Length constant temperature +−  K 200 mm

Tmax 1800 °C

Tmax in working tube approx. 1750 °C

Process gases nitrogen (N2), hydrogen (H2)

Flow rate of process gases 10 – 100 l/h

Operation pressure approx. 30 – 50 mbar

Details        




',
            '',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881234014',
            'sarang.gumfekar@iitrpr.ac.in',
            'Mr. Harsimranjit Singh',
            'htf.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'Nanoindenter',
            2014,
            ' Hyistron TI 950',
            'BRUKER',
            'Dr.Hariprasad Gopalan',
            '01881-23-2566',
            'Model – Hyistron TI 950 (Bruker)



A Nanoindenter is the main component for indentation hardness tests used in nanoindentation. Nanoindentation, also called depth sensing indentation or instrumented indentation, gained popularity with the development of machines that could record small load and displacement with high accuracy and precision. The load displacement data can be used to determine modulus of elasticity, hardness, yield strength, fracture toughness, scratch hardness and wear properties.



There are many types of nanoindenters in current use differing mainly on their tip geometry. Among the numerous available geometries are three and four sided pyramids, wedges, cones, cylinders, filaments, and spheres. The material for most nanoindenters is diamond and sapphire, although other hard materials can be used such as quartz, silicon, tungsten, steel, tungsten carbide and almost any other hard metal or ceramic material. Diamond is the most commonly used material for nanoindentation due to its properties of hardness, thermal conductivity, and chemical inertness. In some cases electrically conductive diamond may be needed for special applications and is also available. For precise measurements a laser goniometer is used to measure diamond nanoindenter angles. Nanoindenter faces are highly polished and reflective which is the basis for the laser goniometer measurements. The laser goniometer can measure within a thousandth of a degree to specified or requested angles.



                                                                         



 



Testing Modes:-



Quasistatic Nanoindentation

Measure Young’s modulus, hardness, fracture toughness and other mechanical properties via nanoindentation.



Scratch Testing

Quantify scratch resistance, critical delamination forces, and friction coefficients with simultaneous normal and lateral force and displacement monitoring.



Nanowear

Quantify wear behavior over the nanometer to micrometer length scales as a function of number of sliding cycles, sliding velocity, wear area, and applied force.



SPM Imaging

In-situ imaging using the indenter tip provides nanometer precision test positioning and surface topography information.



Visitors Since 20-01-2021 :- 467',
            '. 2D High Resolution Indenter Head Assembly



 Normal Displacement



Displacement resolution <0.006nm

Displacement noise floor <0.2nm

Total indenter travel in vertical direction ~50mm

Maximum indentation depth >5μm

Thermal drift 0.05nm/s

 Normal Load



Maximum load 10mN

Load resolution <1 nN

Minimum contact force <70nN

Load noise floor ≤30nN

Maximum Load rate >50mN/s

 Lateral Displacement



Displacement resolution <0.02nm

Displacement noise floor <2nm

Maximum Displacement 15μm

Minimum lateral displacement 500nm

Thermal drift 0.05nm/s

Lateral Load



Maximum Load 2mN

Load resolution <50nN

Load noise floor <3.5μN

 In-situ SPM Imaging



Minimum imaging force <70nN

Scan rate 0.01Hz-3.0Hz

Scan resolution 256x256 lines per image

Maximum scan volume 60x60x4μm

Tip positioning accuracy +/- 10nm

Automated imaging and indenting capability

Piezo automation to allow point-and – click test location selection and setup of arrays for automated indentation patterns

 Scanning Wear



Wear track size Adjustable from <1μm to 60μm

Scan velocity ≤ 180μm/s

Normal load range 70nN - 1mN

2. Multi-Range Nanoprobe (High Load)



Maximum Lateral Force: 5N

Lateral Force Noise Floor: 40μN

Maximum Scratch Length: Limited by circular sample stage (~25mm)

Lateral Displacement Noise Floor: 100nm

Maximum Normal Force: 2N

Normal Force Noise Floor: 0.5nm

Maximum Normal Displacement: 80μm

Normal Displacement Noise Floor: 0.5nm

3. NanoDMA



Frequency Range: 0.1Hz-300Hz

Maximum Dynamic Force Amplitude: 5mN

Maximum Quasi-Static Force: 10mN

Force Noise Floor: <30nN

Maximum Dynamic Displacement Amplitude: 2.5μm

Maximum Quasi-Static Displacement: 5μm

Displacement Noise Floor: <0.2nm

 



4. X, Y ,Z translation stage (coarse positioning)



X-Y Travel 250mmx150mm

Measured accuracy <1μm

Measured positioning repeatability <1μm

Micro step resolution X, Y axis 50nm

Micro step resolution Z axis 3nm

X-Y encoder resolution 100nm

Maximum translation speed X, Y axis 30mm/s

Maximum translation speed Z axis 1.9mm/s

5. Data Acquisition specifications



Data acquisition rate (open and closed loop): up to 38,000 points/second

Load time 0.1 – 2000 seconds.

Maximum number of loading segments 2,000

Feedback loop rate in closed loop operation: 78kHz

6. Electrical Contact Resistance (nanoECR)



Current measurement noise floor: 20 pA

Current measurement resolution: 5pA

Voltage measurement noise floor: 10 μV

Voltage measurement resolution: 5μV

Maximum Current (software limited): 10mA

Maximum Voltage (software limited): 10V

Electrical measurement rate: Up to 4kHz

Maximum load: 10 mN

Load Resolution: <1nN

Load noise floor: ≤30nN

Displacement Resolution: 0.02nm

Displacement noise floor: 0.2nm

Shielded System Enclosure

Auxillary Data Channel Acquisition

 



7. Optical Microscope specification



Optical resolution 1μm

Digital zoom 0.5X – 11X

Optical Objective 20X

Apparent magnification (monitor view) 220X-2200X

Maximum field of view 772x588μm

Minimum field of view 30x24μm

 



8.  Active Vibration Isolation



Frequency range 1.0 – 200Hz active damping, >200Hz passive damping

Transmissibility <0.017 above 10Hz and decreasing rapidly beyond 100Hz

System noise <50ng per root Hz from 0.1 - 300Hz

Static Compliance 14.0μm/N vertical, 28μm/N horizontal

Correction Forces 16N vertical, 8N horizontal

9.  Acoustic and thermal isolation enclosure



Multi-layered acoustic dampening Environmental acoustic noise should not be more than 75 dB.

Larger front door for improved sample access

Larger side windows for improved operator visibility

Sealed enclosure for atmospheric conditioning

 



 



',
            '1Quasistatic nanoindentation                        2Characterisation of Visco-elastic materials  via DMA                                                                        3Scratch testing and Surface Scanning of biomaterials, thin films and coatings',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881232414',
            'hariprasadgopalan@iitrpr.ac.in',
            'Mr Harsimranjit Singh',
            'nanaoindenter@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'Raman Spectrometer',
            2019,
            '
LABRAM HR Evolution',
            'Horiba France',
            'Dr.Tharamani CN',
            '01881-23-2564',
            'Micro RAMAN  Spectrometer



Make & Model – Horiba & LABH Rev-UV-Open



The LabRAM HR systems are ideally suited to both micro and macro measurements, and offer advanced confocal imaging capabilities in 2D and 3D. The true confocal microscope enables the most detailed images and analyses to be obtained with speed and confidence. Highly versatile, each LabRAM HR is a flexible base unit which can be expanded with a range of options, upgrades and accessories to suit all budgets and applications. Specialized dedicated and/or customized solutions can be supplied where required, so whatever spectral resolution, laser wavelength or sampling regime is needed, HORIBA Scientific can provide the best solution.



Life sciences



Disease diagnosis, dermatology, cell screening, cosmetics, microbiology, protein investigations, drug interactions and many more: the LabRAM HR offers new characterization methods for life sciences.



Materials



Graphene and 2D materials, polymers and monomers, inorganics and metal oxides, ceramics, coatings and thin films, photovoltaics, catalysts: the LabRAM HR Evolution contributes to a better knowledge of materials and is a reliable tool for routine analysis



Pharmaceuticals



Active pharmaceutical ingredients (API) and excipients mapping and characterization, polymorph identification, phase determination: the high information content of the Raman spectrum affords researchers and QC technicians deeper insight into the performance and quality of their materials.



Visitors Since 20-01-2021 :- 467',
            'Laser source: 325, 473, 532, 633 and 785 nm
Objective lenses: 10x, 50x 100x and long working distance objectives
Spectral range: 100-4000 cm-1
Spectral resolution: Upto 0.3 cm-1.
CCD detector with deep cooling 
LabSpec6 software for data acquisition, processing and analysis
',
            'Identifying crystal structures, phase transitions, and stress/strain analysis in ceramics, semiconductors, polymers, and composite materials
Identification of molecular structures and vibrational modes
Reaction Monitoring: Observing chemical reactions in situ and in real-time
Lattice Dynamics: Studying phonons and vibrational properties in crystals
Optoelectronics: Characterization of materials used in LEDs and solar cells
Biomedical Diagnostics: Detecting biomarkers in tissues and fluids for cancer, infectious diseases, or other pathologies
Cellular Analysis: Examining cells for structural and compositional studies.
',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232058',
            'tharamani@iitrpr.ac.in',
            'MrDamninder Singh',
            'ramancrf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'UV Spectroscopy',
            2018,
            ' Lambda 950',
            'Perkin Elmer',
            'Dr.Neha Sardana',
            '01881-23-2561',
            'Spectroscopy is the study of the interaction between matter and electromagnetic radiation. UV-Vis-NIR Spectroscopy focuses  on the ultraviolet (UV), visible (Vis), and near-infrared (NIR) regions of the electromagnetic spectrum.',
            '2D Detector Module
Universal Reflectance Accessory (URA)
Snap-in integrating spheres of 150 mm
Highest performance UV/Vis/NIR system 
Wavelength range: 175 nm – 3,300 nm
UV/Vis resolution: 0.05 nm – 5.00 nm 
NIR Resolution: 0.20 nm – 20.00 nm',
            '1materials science
2Bacterial culture
3Food and Beverage
4DNA and RNA analysis
5wastewater treatment
6Pharmaceutical analysis
7Photocatalytic studies',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232406',
            'nsardana@iitrpr.ac.in',
            'MrDamninder Singh',
            'uv.vis.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'APT',
            2019,
            'LEAP 5000 XR',
            'cameca',
            'Dr.Khushboo Rakha',
            '01881-232562',
            'The CAMECA LEAP 5000 XR is a state-of-the-art atom probe tomography (APT) instrument for high-resolution, three-dimensional imaging and chemical composition mapping of materials at the atomic scale. It utilizes a pulsed laser to evaporate and ionize sample atoms, allowing for the measurement of their mass-to-charge ratio and spatial location,',
            '',
            'Cutting-edge LEAP 5000XR installed at NFAPT enables materials analysis
with nanoscale resolution with high sensitivity.     Steels & ODS steels
 Clusters, precipitates & interfaces
 Non-ferrous alloys, Superalloys
 High entropy alloys & Glasses
 Ceramics & Polymers
 Thermoelectric materials
 Energy capture and storage materials
 Geochemistry
 Magnetic, Ferroelectric & ME Materials
 Biomaterials
 Semiconductors multilayers & devices
 Catalytic materials
 Sprintronic & Photovoltaic materials
 Nano wires and tubes, quantum dots',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881232408',
            'Krakha@iitrpr.ac.in',
            ' Mr Amit Kaushal',
            'crf.nfapt@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'TEM 120',
            2019,
            ' Talos L120C ',
            'Thermo Scientific',
            'Dr.Avijit Goswami',
            '01881-23-2554',
            'Talos L120C TEM is a 20-120 kV thermionic (scanning) transmission electron microscope uniquely designed for performance and productivity across a wide range of samples and applications, such as 2D and 3D imaging of cells, cell organelles, asbestos, polymers, and soft materials, both at ambient and cryogenic temperatures. The Talos L120C TEM is designed from the ground up to allow users at any skill level to acquire high-quality results with minimal effort. Fast, sophisticated automation and advanced 3D imaging workflows allow applied researchers to focus on scientific questions rather than microscope operation.  

 

Features

 

Superior images. High-contrast, high-quality TEM and STEM imaging with simultaneous, multiple signal detection up to four-channel integration STEM detectors.



Space for more. Add tomography or in situ sample holders. Large analytical pole piece gap, 180° stage tilt range, and large Z range.



Improved productivity and reproducibility. Ultra-stable column and remote operation with SmartCam and constant power objective lenses for quick mode and HT switches. Fast, easy switching for multi-user environments.



Auto-alignments. All daily TEM tunings, such as focus, eucentric height, center beam shift, center condenser aperture, and rotation center are automated.



4k × 4K Ceta CMOS camera. Large field-of-view enables live digital zooming with high sensitivity and high speed over the entire high-tension range.



Multi-User, Multi-Material, Multi-Discipline



With its optional, motorized, retractable cryo box and low-dose technique, the Talos L120C TEM''s imaging quality of beam-sensitive materials is taken to the next level. To enhance productivity, especially in multi-user, multi-material environments, the constant-power objective lenses and low-hysteresis design allow for straightforward reproducible mode and high-tension switches.



The large C-Twin pole piece gap-giving highest flexibility in applications-combined with a reproducibly performing electron column opens new opportunities for high-resolution 3D characterization, in situ dynamic observations, and diffraction applications with a special emphasis on high-contrast imaging and cryo-TEM.



 



Visitors Since 20-01-2021 :- 467',
            'TEM Line Resolution 0.204 nm



TEM Point Resolution < 0.37 nm



TEM Magnification Range 25 – 650 k×



TEM Magnification Range with Camera 35 – 910 k× Alpha Tilt Angle (with standard holders) -90° to +90°',
            'Cryo-TEM: Optimization and imaging of delicate samples in thin ice for macromolecular studies​.

Materials Science: Studying polymers, asbestos, and beam-sensitive materials at ambient and cryogenic conditions.

Biological Sciences: High-contrast imaging of cells, organelles, and protein complexes for structural and functional analysis.',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881232056',
            'agoswami@iitrpr.ac.in',
            'Mr. Manish Kumar',
            'tem120.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'TEM 300',
            2019,
            'Themis 300 G 3',
            'Thermo Scientific',
            'Dr.Avijit Goswami',
            '01881-23-2554',
            'High-Resolution Transmission Electron Microscopy (HRTEM) is an advanced imaging technique that provides atomic-scale resolution for analyzing the structural properties of materials. By utilizing electron wave interference, HRTEM enables detailed visualization of crystalline structures, defects, and interfaces, making it indispensable for nanotechnology, materials science, and biological research.',
            'Accelerating voltage: 60 -300 kV

Electron source: High brightness Schottky field emission electron source (X-FEG)

Integrated electron source energy monochromator for beam energy widths to <150meV

Probe forming optics include an advanced 4th order (5th order optimized) spherical aberration corrector (DCOR)

Probe corrector tunings at 60, 80, and 300 kV

STEM resolution: ranging from <60pm at 300kV to  <120pm at 60 kV

Greater than 100 pA probe currents available in a 1 angstrom electron probe

High Angle Annular Dark Field (HAADF) detector and on-axis bright field/dark field STEM detector

Integrated Differential Phase Contrast (iDPC) for light element (low Z) imaging

Simultaneous collection of BF/ABF/DF and HAADF images on the system

TEM mode: information transfer of 60pm at 300kV to 100pm at 60kV

4-crystal EDS (Energy Dispersive Spectroscopy for X-Rays) detection system (FEI Super-X)

Large EDS collection solid angle of 0.7 steradians for atomic scale EDS analysis

EDS compatible with large sample rotation/tilt for 3D EDS tomography

Constant power magnetic lenses enabling faster mode and accelerating voltage changes switching by eliminating related thermal drift and providing high controllability and reproducibility

Automated tuning for the monochromator and corrector (OptiMono & OptiSTEM+)

Computerized 5-axes Piezo enhanced stage

High-speed, digital search-and-view camera

FEI Ceta 16M 16-megapixel digital camera for for imaging and diffraction applications

STEM & TEM tomography acquisition software and high field-of-view single-tilt tomography holder

Precession electron diffraction',
            '1 Materials Science: Atomic-level imaging and analysis of metals, ceramics, and semiconductors 2 Nanotechnology: Characterization of nanostructures like nanoparticles and quantum dots. 3 Life Sciences: Imaging biomolecules and viruses in high resolution.',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881242121',
            'agoswami@iitrpr.ac.in',
            'Mr.Manish Kumar',
            'tem300.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'XPS',
            2019,
            'ESCALAB Xi +',
            'Thermo Scientific',
            'Dr.Mukesh Kumar',
            '01881-23--2555',
            'hermo Scientific ESCALAB XI+ X-ray Photoelectron Spectrometer (XPS) Microprobe combines high sensitivity with high resolution quantitative imaging and multi-technique capability. Equipped with a micro-focusing X-ray monochromator designed to deliver optimum XPS performance, the ESCALAB XI+ X-ray Photoelectron Spectrometer (XPS) Microprobe ensures maximum sample throughput. The multi-technique capability and availability of a range of preparation chambers and devices provides the solution to any surface analytical problem. Using the advanced Avantage data system for acquisition and data processing, maximum information is extracted from the data


                                                            Features

  High sensitivity spectroscopy

 Small area XPS
 Depth profiling capabili Angle resolved XPS
Ion scattering spectroscopy (ISS) in base system
Reflected electron energy loss spectroscopy (REELS) in base system
“Preploc” chamber in base system
Multi-technique analytical versatility
Many sample preparation options
Automated, unattended analysis
Multiple sample analysis
X-ray Monochromator

Twin-crystal, micro-focusing monochromator has a 500mm Rowland circle and uses an Al anode
Sample X-ray spot size is selectable over a range of 200 to 900μm
Lens, Analyzer and Detector

Lens/analyzer/detector combination makes the ESCALAB XI+ XPS Spectrometer unique for both imaging and small area XPS
Two types of detectors ensures optimum detection for each type of analysis — two-dimensional detector for imaging and a detector based on channel electron multipliers for spectroscopy when high count rates are to be detected
Lens is equipped with two, computer-controlled iris mechanisms — one allows the user to control the field of view of the lens down to <20μm for small area analysis and the other to control the angular acceptance of the lens, which is essential for high-quality angle resolved XPS
180° hemispherical energy analyzer
Depth Profiling

Digitally-controlled EX06 ion gun is a high-performance ion source even when using low energy ions
Azimuthal sample rotation is available
Multi-technique capability
Other analytical techniques accommodated without compromise to the XPS performance
Reverse power supplies for the lenses and analyzer using the EX06 ion gun (ion scattering spectroscopy (ISS) is always available)
Electron gun can be operated at up to 1000V and provides an excellent source for REELS
Technique Options

XPS with non-monochromatic X-rays
AES (Auger electron spectroscopy)
UPS (Ultra-violet photoelectron spectroscopy)
 

Visitors',
            'Sampling Area



50 x 20 mm



X-Ray Spot Size



200 to 900 μm



Technique Options



UV lamp for UPS, field emission electron source for AES/SEM, Twin anode non-monochromated X-ray source



Analyzer Type



180° double-focusing, hemispherical analyzer with dual detector system



Depth Profiling



EX06 Ion Source



X-Ray Source Type



Monochromated, Micro-focused Al K-Alpha



Optional Accessories



MAGCIS, UV lamp for UPS, field emission electron source for AES/SEM, Twin anode non-monochromated X-ray source, Platter camera



Item Description



ESCALAB 250Xi X-ray Photoelectron Spectrometer (XPS) Microprobe



Sample Preparation Options



Heat/cool sample holder, additional preparation chamber, bakeable 3-gas admission manifold, fracture stage, high pressure gas cell, sample parking facility



Thickness (Metric) Max. Sample



12mm



Vacuum System



2x turbo molecular pumps for entry and analysis chambers



 



Visitors Since 20-01-2021 :- 467',
            '1 Materials Science: Characterizing thin films, coatings, and nanomaterials.                           2Electronics: Analyzing semiconductors, insulators, and conductive materials.                   3 Catalysis: Investigating catalyst surfaces and reaction intermediates.                                         4 Environmental Science: Studying surface contamination and environmental pollutants
 ',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            2,
            '1881232462',
            'mKumar@iitrpr.ac.in',
            'Mr.Manu Rana',
            'crf.xps@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'LSCM',
            2019,
            'LSM 880 with Airyscan Fast Module',
            'Zeiss',
            'Dr.Durba Pal',
            '01881-23-2556',
            'The confocal laser-scanning microscope (LSM) is one of the most popular instruments in basic biomedical research for fluorescence based live cell imaging applications, providing high-contrast images and with versatile optical sectioning capability to investigate three-dimensional biological structures. ZEISS LSM 880 with Airyscan combines the Airyscan pinhole-plane detection technology with a new illumination shaping approach, enabling a fourfold increase in image acquisition rates. With the new fast mode, Airyscan affords researchers simultaneous access to super-resolution, increased signal-to-noise ratio and increased acquisition speeds without compromise.  ',
            'Specifications



1 Microscope



• Inverted stand: Axio Observer



• Upright stand: Axio Examiner, Axio Imager



• Port for coupling of ELYRA



• Camera port



• Manual or motorized stages



• Incubation solutions



• Fast Z piezo inserts



• Definite Focus



2 Objectives



• C-APOCHROMAT



• Plan-APOCHROMAT



• W Plan-APOCHROMAT, Clr Plan-APOCHROMAT, Clr Plan-NEOFLUAR



• LCI Plan-APOCHROMAT



3 Illumination



• UV laser: 355 nm, 405 nm



• VIS laser: 440 nm, 458 nm, 488 nm, 514 nm, 543 nm, 561 nm, 594 nm, 633 nm



• NIR laser for multiphoton imaging: Ti:Sa, OPO*, InSight DeepSee*, Discovery*



4 Detection



• 3 or 34 descanned spectral channels



(GaAsP and/or multialkali PMT)



• Airyscan detector with optional Fast module



• 2 additional GaAsP channels (BiG.2)



• Up to 6 non-descanned GaAsP detectors



• Up to 12 non-descanned GaAsP or PMT detectors total



• Transmitted light detector (T-PMT)



5 Software



• ZEN, recommended modules:



Tiles & Positions, Experiment Designer, FRAP, FRET, RICS, FCS, Deconvolution, 3Dxl Viewer – powered by arivis



 



Scanning Module



Scanner Two independent, galvanometric scanning mirrors with ultrashort line and frame flyback



Scanning Resolution 4 × 1 to 8192 × 8192 pixels, also for multiple channels, continuously adjustable



Scanning Speed 19 × 2 speed levels; up to 13 images/sec. with 512 × 512 pixels (max. 430 images/sec. 512 × 16), up to 6875 lines/sec.



In Fast Airyscan mode: 13×2 speed levels, up to 19 images/sec. with 512×512 (max. 27 images/sec. 480×480, or 6 images/sec. 1024×1024)



Scanning Zoom 0.6 × to 40 ×; digitally adjustable in increments of 0.1 (Axio Examiner: 0.67 × to 40 ×)



Scanning Rotation Can be rotated freely (360 degrees), adjustable in increments of one degree, freely adjustable XY offset



Scanning Field 20 mm field diagonal (max. 18 mm for Axio Examiner) in the intermediate image plane, with full pupil illumination



Pinholes Master pinhole with preset size and position; can be adjusted as desired for multitracking and short wavelengths (such as 405 nm)



Beam Path Exchangeable Twin Gate beam splitter with up to 100 combinations of excitation wavelengths and outstanding laser line suppression;



manual interface port for external detection modules (such as BiG.2, Airyscan, third party detectors, internal detection



with spectral signal separation and signal recycling loop for compensation of polarization effects)



Detection Options



Detectors 3 or 34 spectral detection channels, GaAsP and /or multialkali PMT (QE 45% typical for GaAsP)



2 additional GaAsP detection channels (BiG.2)



Airyscan detector (32 channels GaAsP), delivers resolution up to 140 nm lateral, 400 nm axial; in Fast mode: 145/180 nm lateral, 450 nm axial



Up to 12 non-descanned detection channels (PMT and/or GaAsP)



Transmitted light detector (PMT)



Spectral Detection 3 or 34 simultaneous, confocal reflected-light channels, GaAsP and /or PMT based



freely adjustable spectral detection area (resolution down to 3 nm)



Data Depth 8 bit, 12 bit or 16 bit available; up to 35 channels simultaneously detectable



Real-Time Electronics Microscope, laser, scanning module and additional accessory control; data acquisition and synchronization management through real-time



electronics; oversampling read-out logic; ability to evaluate data online during image acquisition



 



ZEN Imaging Software



System Configurations Workspace to conveniently configure all of the motorized functions of the scanning module, laser and microscope; save and restore application configurations (Re-use)



System Self Rest Calibration and testing tool to automatically test and calibrate the system



Recording Modes, Smart Setup: Spot, Line/Spline, Frame, Tiles, Z Stack, Lambda Stack, Time Series and all combinations (XYZ, lambda, t), online calculation and visualization of ratio images, average and summation (by line/image, adjustable), Step Scan (for higher image frame rates);



quick set up of imaging conditions using Smart Setup by simply selecting the labelling dye



Crop Function Easily select scanning areas (simultaneously select zoom, offset, rotation)



Real ROI Scan, Spline Scan: Scans of up to 99 designated ROIs (regions of interest) as desired and pixel-by-pixel laser blanking; scan along a freely defined line



ROI Bleaching Localized bleaching in up to 99 bleach ROIs for applications such as FRAP (fluorescence recovery after photobleaching) or uncaging; use of different speeds for bleaching and imaging, use of different laser lines for different ROIs



Multitracking Rapidly change excitation lines when recording multiple fluorescences for the purpose of minimizing signal crosstalk and increasing dynamic range



Fast Acquisition Fast mode scan with 4x parallelisation in Y-direction, detection by Airyscan module



Lambda Scan Parallel or sequential acquisition of image stacks with spectral information for every pixel



Linear Unmixing Acquisition of crosstalk-free, multiple fluorescence images using simultaneous excitation; online or offline and automatic or interactive unmixing; advanced unmixing logic with indication of reliability



Visualization XY, orthogonal (XY, XZ, YZ), Cut (3D section); 2.5D for time series of line scans, projections (maximum intensity); animations;



Depth coding (inverse colors), brightness, gamma and contrast settings; color table selection and modification (LUT), character functions



Image Analysis and Operations : Colocalization and histogram analysis with individual parameters, number & brightness analysis, profile measurement along user-defined lines, measurement of lengths, angles, areas, intensities and much more; operations: addition, subtraction, multiplication, division, ratio, shift, filters (low-pass, median, high-pass, etc., also user-definable)



Image Management Features for managing images and the corresponding imaging parameters; multiprint feature; streaming of acquisition data for online processing of large data sets



Applications



Live cell imaging, FRET, FRAP, Co-localisation analysis, Spectral Mixing, 3D Recontruction


',
            '1 Biological Sciences
Enables high-resolution imaging of cellular structures and tissue dynamics.                                         2 Molecular Biology
Facilitates detailed study of protein localization and gene expression.                                           3 Biomedical Research
Powers visualization of disease mechanisms and drug effects on tissues',
            'Laser Scanning Confocal Microscope(LSCM).png',  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881242211',
            'durba.pal@iitrpr.ac.in',
            'MR.FAROOQ AHMAD',
            'crf.lscm@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'FESEM',
            2019,
            'JSM 7610F Plus',
            'JEOL',
            'Dr.Prabhat K Agnihotri',
            '01881-23-2557',
            'JSM-7610F FESEM is an ultra high resolution Schottky Field Emission Scanning Electron Microscope which has semi-in-lens objective lens. High power optics can provide high throughput and high performance analysis and achieving even better resolution (15 kV 0.8 nm, 1 kV 1.0nm). JSM-7610FPlus can be equipped to satisfy a variety of user needs, including observation at low accelerating voltages with GENTLEBEAM™ mode, and signal selection using r-filter. The next-generation r-filter in this model is a unique energy filter that combines a secondary electron control electrode, a backscattered electron control electrode and a filter electrode.



When the specimen surface is irradiated by the electron beam, electron with various energies are emitted from the surface. The new r-filter makes it possible to selectively detect the secondary electrons and backscattered electrons from the specimen while the electron beam is held at the center of the lens using a combination of multiple electrostatic fields with increase in signal. It is suitable for high spatial resolution analysis, and with its gentle Beam mode feature, it can reduce the incident electron penetration to the specimen, enabling to observe its topmost surface by using a few hundred landing energy. Combining two proven technologies – an electron column with semi-in-lens objective lens which can provide high resolution imaging by low accelerating voltage and an in-lens Schottky FEG which can provide stable large probe current – to deliver ultrahigh resolution with wide range of probe currents for all applications (A few pA to more than 200 nA). The in-lens Schottky FEG is a combination of a Schottky FEG and the first condenser lens and is designed to collect the electrons from the emitter efficiently.



 ',
            'Secondary electron image resolution

0.8 nm(Accelerating voltage 15 kV)
1.0 nm(Accelerating voltage 1 kV GB mode)
0.8 nm(Accelerating voltage 1 kV GBSH mode)*1
During analysis 3.0 nm
(Accelerating voltage 15 kV, WD 8 mm, Probe current 5 nA)

    Magnification  

  Direct magnification: x25 to 1,000,000(120 x 90mm)
  Display magnification: x75 to 3,000,000(1,280 x 960 pixels)

    Accelerating             voltage

  0.1 to 30 kV

   Probe current

   A few pA to ≥ 200 nA

   Electron Gun       

  In-lens Schottky field emission electron gun

    Lens system

  Condenser lens (CL)
  Aperture-angle control lens (ACL)
  Semi-in lens objective lens (OL)

  Specimen stage

  Fully eucentric goniometer stage

      Specimen                movement

  Specimen stage
  Standard

 Optional

 Optional

  type I A2
  X : 70 mm
  Y : 50 mm 
  Z : 1.0 ~ 40 mm
  Tilt: -5 to +70°
  Rotation: 360°

 type II 
 X : 110 mm
 Y : 80 mm
 Z : 1.0 ~ 40 mm
 Tilt: -5 to +70°
 Rotation: 360° 

 type III
 X : 140 mm
 Y : 80 mm
 Z : 1.0 ~ 40 mm
 Tilt: -5 to +70°
  Rotation: 360°

  Specimen holders

 12.5 mm diameter × 10 mm thick, 32 mm diameter × 20 mm thick

     Specimen                exchange

 One-action exchange mechanism

       Electron              detector system

 Upper detector, r-filter, Built-in, Lower detector

      Automatic                 Functions 

 Focus, Stigmator, Brightness, Contrast

  Image observation  LCD

 Screen size: 23-inch wide
 Maximum resolution: 1,280 × 1,024 pixels

   SEM Control               System

 PC: IBM PC/AT compatible computer
 OS: Windows® 7 Professional*2

      Scan and              display modes 

 Full-frame scan
 Real magnification
 Selected- area scan
 Two-image display
 (with different magnifications, different image modes)
 Two-image wide display
 Four-image display (four-signal live display)
 Addition image (4 images + addition image)
 Scale

Evacuation System 

 Gun chamber, first and second intermediate chambers:

 Ultra high-vacuum dry evacuation system using ion pumps
 Specimen chamber:
 Dry evacuation system using a turbo-molecular pump (TMP)

 Ultimate pressure 

 Gun chamber: Order of 10-7 Pa (for standard configuration)
 Specimen chamber: Order of 10-4 Pa (for standard configuration)',
            'Surface Morphology
Microstructure
Phase analysis
Elemental composition
Elemental mapping 
3-D imaging using BSE
Cross-sectional imaging for thickness of thin films or interfacial study',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881232367',
            'prabhat@iitrpr.ac.in',
            'ABISHEK SHARMA',
            'crf.fesem@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'Metal 3D Printer',
            2021,
            'Model-EOS M 290 with DMLS te Chnology',
            'EOS GmBh',
            'Dr.Anupam Agarwal',
            '',
            'Highly productive, modular  and well-established mid-size 3D printing system for additive manufacturing of high-quality metal components in its inert nitrogen or argon atmosphere',
            'Build Volume: 250 x 250 x 325* mm 
Laser Type:  400 W Yb-fiber laser
Scan Speed: Upto 7.0 m/s
Focus Diameter:   100 um
Raw Materials- Metal Powders
Ti6Al4V, SS, Maraging Steel, Inconel, AlSi10Mg',
            ' Usage in Automotive; Aerospace; Oil & Gas; Robotics; Architectural/Structural Components; Tooling; Bio-Implants; Dental; Die Casting mold; Tool-Die; Product Development',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881232356',
            'anupam@iitrpr.ac.in',
            'Mr. Varinder Dhiman',
            'metal3dprint.crf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'Laser Writer
 (Lithography)',
            2020,
            ' MicroWriter ML3',
            'Quantum Design',
            'Dr.Rakesh Kumar',
            '01881-232570',
            'MicroWriter ML3 Pro is our flagship machine within the MicroWriter ML family and is a compact, high-performance, direct-write optical lithography machine which is designed to offer unprecedented value for money in a small laboratory footprint.  Sitting on its own vibration-isolation optical table, its only service requirement is a standard power socket.  A temperature-compensated light-excluding enclosure with safety interlock allows it to be used equally well in an open laboratory environment or in a clean room',
            '',
            '',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881242479',
            'rakesh@iitrpr.ac.in',
            'Ms. Shital Chowdhary',
            'cmnf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'Optical Microscope',
            2019,
            'Upright Optical',
            'Carl Zeiss',
            'Dr.K C Jena',
            '01881-232571',
            '',
            '',
            '',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            3,
            '1881232476',
            'kcjena@iitrpr.ac.in',
            'Ms. Shital Chowdhary',
            'cmnf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );

INSERT INTO Facilities (
            name, make_year, model, manufacturer, faculty_in_charge, operator_contact,
            description, specifications, usage_details, image_url, category_id,
            Faculty_contact, Faculty_email, operator_name, operator_email, special_note
        ) VALUES (
            'LPCVD',
            2019,
            'Technos',
            'Technos Instruments',
            'Dr.P K Agnihotri',
            '01881-232572',
            '',
            '',
            '',
            NULL,  -- Setting image_url to NULL since images are in a separate folder
            1,
            '1881242257',
            'prabhat@iitrpr.ac.in',
            'Ms. Shital Chowdhary',
            'cmnf@iitrpr.ac.in',
            NULL -- Added NULL for the special_note column
        );
ALTER TABLE Facilities ADD COLUMN max_hours_per_booking INT DEFAULT 8;

CREATE TABLE IF NOT EXISTS facility_booking_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    user_type ENUM('Internal', 'Government R&D Lab or External Academics', 'Private Industry or Private R&D Lab', 'SuperUser') NOT NULL,
    max_hours_per_booking INT NOT NULL DEFAULT 8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_facility_user_type (facility_id, user_type)
);
INSERT IGNORE INTO facility_booking_limits (facility_id, user_type, max_hours_per_booking)
SELECT 
    f.id,
    'Internal',
    8
FROM Facilities f
UNION ALL
SELECT 
    f.id,
    'Government R&D Lab or External Academics',
    6
FROM Facilities f
UNION ALL
SELECT 
    f.id,
    'Private Industry or Private R&D Lab',
    4
FROM Facilities f
UNION ALL
SELECT 
    f.id,
    'SuperUser',
    10
FROM Facilities f;
-- Create the facility_bifurcations table
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
    department_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0
);

-- Create the Publications table
CREATE TABLE Publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  facility_id INT,
  FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE
);

-- SQL Insert statements for Publications table
-- Extracted from 'Publication' worksheet

INSERT INTO Publications (
    title, link
) VALUES (
    '6,6′-Biindeno[1,2-b]fluorene: an open-shell indenofluorene dimer',
    'https://doi.org/10.1039/D4SC03996C'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'Investigation of microstructural evolution and carbon redistribution in ausformed nanostructured bainitic steel via 3D Atom Probe Tomography and its structure-property relationship',
    '
https://doi.org/10.1016/j.mtla.2025.102342
'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'A review on nanoparticles: characteristics, synthesis, applications, and challenges',
    '10.3389/fmicb.2023.1155622'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'Erosion dynamics of faceted pyramidal surfaces',
    'https://doi.org/10.1016/j.cap.2016.05.017'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'The multiscale characterization and constitutive modeling of healthy and type 2 diabetes mellitus Sprague Dawley rat skin

',
    'https://doi.org/10.1016/j.actbio.2022.12.037'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'Harnessing a bis-electrophilic boronic acid lynchpin for azaborolo thiazolidine (ABT) grafting in cyclic peptides',
    'https://doi.org/10.1039/D4SC04348K'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'Staggered band alignment of n-Er2O3/p-Si heterostructure for the fabrication of a high-performance broadband photodetector',
    'https://doi.org/10.1088/2632-959X/ad5d81
'
);

INSERT INTO Publications (
    title, link
) VALUES (
    'Fast response and high-performance UV-C to NIR broadband photodetector based on MoS2/a-Ga2O3 heterostructures and impact of band-alignment and charge carrier dynamics',
    'https://doi.org/10.1016/j.apsusc.2023.157597'
);

-- Create the Members table
CREATE TABLE Members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  profile_link VARCHAR(255),
  image_path VARCHAR(255)
);

INSERT INTO Members (name, designation, profile_link, image_path)
VALUES 
  ('Dr. Avijit Goswami', 'Chairman', 'https://www.iitrpr.ac.in/faculty/avijit', 'Dr_Avijit_Goswami.jpg'),
  ('Dr. Kailash Chandra Jena', 'Vice chairman', 'https://www.iitrpr.ac.in/faculty/kailash', 'Dr_Kailash_Chandra_Jena.jpg'),
  ('Dr. Neha Sardana', 'Member', 'https://www.iitrpr.ac.in/faculty/neha', 'Dr_Neha_Sardana.jpg'),
  ('Dr. Samir Chandra Roy', 'Member', 'https://www.iitrpr.ac.in/faculty/samir', 'Dr_Samir_Chandra_Roy.jpg'),
  ('Dr. Rajesh Kumar', 'Member', 'https://www.iitrpr.ac.in/faculty/rajesh', 'Dr_Rajesh_Kumar.jpg');


-- Create the FacilitySchedule table
CREATE TABLE FacilitySchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    weekday ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_slots INT,
    status ENUM('Valid','Deprecated') NOT NULL DEFAULT 'Valid',
    user_type ENUM('Internal', 'Government R&D Lab or External Academics', 'Private Industry or Private R&D Lab', 'SuperUser') NOT NULL,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    UNIQUE (facility_id, weekday, start_time, end_time, user_type)
);

-- Create the BookingHistory table
CREATE TABLE BookingHistory (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    schedule_id INT NOT NULL,
    booking_date DATE NOT NULL,
    billing_address TEXT,
    gst_number VARCHAR(50),
    utr_number VARCHAR(100),
    transaction_date DATE,
    status ENUM('Pending', 'Approved', 'Cancelled') DEFAULT 'Pending',
    cost DECIMAL(10, 2),
    receipt_path VARCHAR(255),
    operator_email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES FacilitySchedule(schedule_id) ON DELETE CASCADE,
    UNIQUE (facility_id, schedule_id, booking_date, user_id)
);
ALTER TABLE BookingHistory DROP FOREIGN KEY bookinghistory_ibfk_3;
-- Change schedule_id to VARCHAR to store comma-separated IDs
ALTER TABLE BookingHistory MODIFY COLUMN schedule_id VARCHAR(255) NOT NULL;
-- Add created_at column for auto-cancellation tracking
ALTER TABLE BookingHistory ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing data to comma-separated format
UPDATE BookingHistory 
SET schedule_id = CAST(schedule_id AS CHAR) 
WHERE schedule_id IS NOT NULL;

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
delete from staff;
INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Dr.Dinesh Deva',
    'Dr_Dinesh_Deva.png',
    'Clean Room Consultant',
    '01881-23-2553',
    'ddeva@iitrpr.ac.in',
    ' Office Room no.103,CRF building',
    'Ph.D. in Material Science'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Dr.Neetu Bansal',
    'Dr_Neetu_Bansal.png',
    'Technical officer',
    '01881-23-2560',
    'to.crf@iitrpr.ac.in; staff.neetu.bansal@iitrpr.ac.in',
    'Office Room no.103,CRF building',
    'Ph.D. in Physics & Materials Science,'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Dr.Harsimranjit Singh',
    'Dr_Harsimranjit_Singh.jpg',
    'Technical Supritendent',
    '01881-23-2565',
    'harsimranjit@iitrpr.ac.in',
    'Multipurpose lab,First floor,CRF building',
    'M.Sc (Chemistry)M.Tech(Nanoscience & Nanotechnology)'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Kamlesh Satpute',
    'Mr_Kamlesh_Satpute.png',
    'Junior Technical Supritendent',
    '01881-23-3053',
    'kamlesh.satpute@iitrpr.ac.in',
    'Room no.115,SS Bhatnagar Block',
    'M.Sc (Chemistry)'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Amit Kaushal',
    'Mr_Amit_Kaushal.png',
    'Junior Technical Supritendent',
    '01881-23-2567',
    'amit.kaushal@iitrpr.ac.in',
    'Muiltipurpose lab,First floor,CRF building',
    'M.Sc (Human Biology)'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Damninder Singh',
    'Mr_Damninder_Singh.jpg',
    'Junior Technical Supritendent',
    '01881-23-2561,2564',
    'damninder.singh@iitrpr.ac.in',
    'Multipurpose lab,First floor,CRF building',
    'M.Tech in ECE'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Anuj Babbar',
    'Mr_Anuj_Babbar.jpg',
    'Operator',
    '01881-23-3079',
    'anuj.babbar@iitrpr.ac.in',
    'Room no.106,SS Bhatnagar Block',
    'M.E in Thermal Engineering'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Manish Kumar',
    'nmr_manish.png',
    'Operator',
    '01881-23-3052',
    'nmr@iitrpr.ac.in',
    'Room no.114, Bhatnagar Block',
    'M.Sc Instrumentation'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Abhishek Sharma',
    'Mr_Abhishek_Sharma.jpg',
    'Operator',
    '01881-23-2557',
    'crf.fesem@iitrpr.ac.in',
    'Room no.003,FESEM lab,CRF building',
    'B. Tech (Mechanical)'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Manu Rana',
    'Mr_Manu_Rana.jpg',
    'Operator',
    '01881-23-2555',
    'crf.xps@iitrpr.ac.in',
    'Room no.002,XPS lab,CRF building',
    'M.Sc Chemistry (HPU)'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Manish Kumar',
    'Mr_Manish_Kumar.jpg',
    'Operator',
    '01881-23-2554',
    'tem300.crf@iitrpr.ac.in; tem120.crf@iitrpr.ac.in',
    'Room no.006,HRTEM lab,CRF building',
    'M.Sc Instrumentation'
);

INSERT INTO staff (
    name, image_name, designation, phone, email, office_address, qualification
) VALUES (
    'Mr.Farooq Ahmed',
    'Mr_Farooq_Ahmed.jpg',
    'Operator',
    '01881-23-2556',
    'crf.lscm@iitrpr.ac.in',
    'Room no.007,LSCM lab,CRF building',
    'M.Sc Environmental Science'
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
    isSuperUser ENUM('Y','N') NOT NULL DEFAULT 'N',
    super_facility varchar(255),
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

CREATE TABLE IF NOT EXISTS qr_code (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS email_otps (
      email VARCHAR(255) PRIMARY KEY,
      otp_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      last_sent_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- Now insert data in the correct order
-- -- Insert data into Categories
-- INSERT INTO Categories (name, description) VALUES
-- ('Advanced Materials Characterization', 'Techniques for analyzing material properties.'),
-- ('Biological Imaging', 'Microscopy and imaging for biological samples.'),
-- ('Chemical Analysis', 'Spectroscopy and chromatography for chemical identification.'),
-- ('Fabrication & Prototyping', 'Tools for creating prototypes and custom parts.'),
-- ('Miscellaneous', ''),
-- ('Spectroscopy', ''),
-- ('Microscopy', '');

-- -- Insert data into Facilities
-- INSERT INTO Facilities (name, make_year, model, faculty_in_charge, operator_contact, description, specifications, usage_details, image_url, category_id, price_industry, price_internal, price_external, price_r_and_d, Faculty_contact, Faculty_email, operator_name, operator_email) VALUES
-- ('High-Res SEM', 2022, 'Zeiss GeminiSEM 500', 'Dr. A. B. Charan', '9000011111', 'High-Resolution Scanning Electron Microscope', 'Resolution: 0.6nm, Max Mag: 2,000,000x', 'Sample prep required. Training mandatory.', 'uploads/facility_images/sem.jpg', 1, 5000.00, 500.00, 2500.00, 1000.00, '9112233445', 'ab.charan@iitrpr.ac.in', 'Rakesh Kumar', 'rakesh.op@iitrpr.ac.in'),
-- ('Confocal Microscope', 2021, 'Leica TCS SP8', 'Dr. C. D. Elara', '9000022222', 'Laser Scanning Confocal Microscope', '4 lasers (405, 488, 561, 633nm)', 'Live cell imaging possible. Booking essential.', 'uploads/facility_images/confocal.jpg', 2, 6000.00, 600.00, 3000.00, 1200.00, '9223344556', 'cd.elara@iitrpr.ac.in', 'Sunita Devi', 'sunita.op@iitrpr.ac.in'),
-- ('NMR Spectrometer', 2020, 'Bruker Avance III 600MHz', 'Dr. E. F. Ghani', '9000033333', 'Nuclear Magnetic Resonance Spectrometer', '600 MHz, Cryoprobe available', 'For liquid and solid-state NMR.', 'uploads/facility_images/nmr.jpg', 3, 7500.00, 750.00, 3750.00, 1500.00, '9334455667', 'ef.ghani@iitrpr.ac.in', 'Anil Mehta', 'anil.op@iitrpr.ac.in'),
-- ('Metal 3D Printer', 2023, 'EOS M290', 'Dr. G. H. Ivan', '9000044444', 'Direct Metal Laser Sintering (DMLS)', 'Build volume: 250x250x325 mm', 'Material: Titanium, Steel. Design consultation available.', 'uploads/facility_images/metal_3d_printer.jpg', 4, 15000.00, 1500.00, 7500.00, 3000.00, '9445566778', 'gh.ivan@iitrpr.ac.in', 'Priya Chawla', 'priya.op@iitrpr.ac.in');

-- -- Insert data into Users
-- INSERT INTO Users (user_type, full_name, email, password_hash, contact_number, org_name, id_proof, verified) VALUES
-- ('Internal', 'Dr. Priya Sharma', 'priya.sharma@example.com', 'password_hashed_priya', '9876500001', 'IIT Ropar', 'id_proofs/priya_sharma.pdf', 'YES'),
-- ('External Academic', 'Prof. Anil Kumar', 'anil.kumar@university.edu', 'password_hashed_anil', '9876500002', 'Panjab University', 'id_proofs/anil_kumar.pdf', 'YES'),
-- ('R&D Lab', 'Mr. Raj Patel', 'raj.patel@rdlab.org', 'password_hashed_raj', '9876500003', 'CSIR Lab', 'id_proofs/raj_patel.pdf', 'NO'),
-- ('Industry', 'Ms. Sunita Singh', 'sunita.singh@industrycorp.com', 'password_hashed_sunita', '9876500004', 'Industry Corp', 'id_proofs/sunita_singh.pdf', 'YES'),
-- ('Internal', 'Amit Verma', 'amit.verma@example.com', 'password_hashed_amit', '9876500005', 'IIT Ropar', 'id_proofs/amit_verma.pdf', 'NO');

-- -- Insert data into Supervisor
-- INSERT INTO Supervisor (name, email, department_name) VALUES
-- ('Dr. Ramesh Gupta', 'ramesh.gupta@iitrpr.ac.in', 'Computer Science'),
-- ('Dr. Meena Iyer', 'meena.iyer@iitrpr.ac.in', 'Mechanical Engineering'),
-- ('Dr. Vikram Rathore', 'vikram.rathore@iitrpr.ac.in', 'Physics'),
-- ('Dr. Anjali Desai', 'anjali.desai@iitrpr.ac.in', 'Chemistry');

-- -- Insert data into FacilitySchedule
-- INSERT INTO FacilitySchedule (facility_id, weekday, start_time, end_time, total_slots) VALUES
-- (1, 'Monday', '09:00:00', '11:00:00', 2),
-- (1, 'Wednesday', '14:00:00', '16:00:00', 2),
-- (2, 'Tuesday', '10:00:00', '13:00:00', 3),
-- (2, 'Thursday', '10:00:00', '13:00:00', 3),
-- (3, 'Friday', '09:00:00', '17:00:00', 8),
-- (4, 'Monday', '10:00:00', '12:00:00', 1),
-- (4, 'Wednesday', '10:00:00', '12:00:00', 1);

-- -- Insert data into BookingHistory
-- INSERT INTO BookingHistory (user_id, facility_id, schedule_id, booking_date, status, cost, receipt_path, operator_email) VALUES
-- (1, 1, 1, CURDATE() + INTERVAL '7' DAY, 'Pending', 500.00, 'uploads/receipts/receipt_booking_101_101.pdf', 'rakesh.op@iitrpr.ac.in'),
-- (2, 2, 3, CURDATE() + INTERVAL '10' DAY, 'Approved', 3000.00, 'uploads/receipts/receipt_booking_102_103.pdf', 'sunita.op@iitrpr.ac.in'),
-- (3, 3, 5, CURDATE() + INTERVAL '14' DAY, 'Pending', 1500.00, 'uploads/receipts/receipt_booking_103_105.pdf', 'anil.op@iitrpr.ac.in'),
-- (4, 4, 6, CURDATE() + INTERVAL '5' DAY, 'Approved', 15000.00, 'uploads/receipts/receipt_booking_104_106.pdf', 'priya.op@iitrpr.ac.in'),
-- (1, 2, 4, CURDATE() + INTERVAL '12' DAY, 'Cancelled', 600.00, 'uploads/receipts/receipt_booking_101_104.pdf', 'sunita.op@iitrpr.ac.in');

-- -- Insert data into forms
-- INSERT INTO forms (form_name, description, form_link, facility_name, facility_link) VALUES
-- ('NMR Sample Submission Form', 'Form for submitting samples for NMR analysis', 'https://example.com/forms/nmr_sample', 'NMR Spectrometer', 'https://example.com/facilities/nmr'),
-- ('SEM Imaging Request', 'Request form for SEM imaging services', 'https://example.com/forms/sem_request', 'High-Res SEM', 'https://example.com/facilities/sem'),
-- ('Confocal Usage Log', 'Log sheet for Confocal Microscope usage', 'https://example.com/forms/confocal_log', 'Confocal Microscope', 'https://example.com/facilities/confocal'),
-- ('3D Printing Project Proposal', 'Submit your project proposal for Metal 3D Printing', 'https://example.com/forms/3dprint_proposal', 'Metal 3D Printer', 'https://example.com/facilities/metal_3d_printer');

-- -- Insert data into heroImages
-- INSERT INTO heroImages (imagepath, title, subtitle) VALUES
-- ('uploads/hero/facility_collage.jpg', 'State-of-the-Art Research Facilities', 'Explore Cutting-Edge Instrumentation at IIT Ropar CRF'),
-- ('uploads/hero/microscope_close_up.jpg', 'Unlock Microscopic Worlds', 'Advanced Imaging Solutions for Your Research'),
-- ('uploads/hero/lab_scientist.jpg', 'Innovation Starts Here', 'Empowering Scientific Discovery'),
-- ('uploads/hero/iit_ropar_campus.jpg', 'Excellence in Research and Education', 'Indian Institute of Technology Ropar');

-- -- Insert data into heroNews
-- INSERT INTO heroNews (news_title, summary, imagepath, link) VALUES
-- ('New Raman Spectrometer Acquired', 'CRF enhances its analytical capabilities with a new high-performance Raman spectrometer.', 'uploads/news/raman_spec.jpg', 'https://iitrpr.ac.in/crf/news/raman'),
-- ('Workshop on Advanced Microscopy', 'Successful completion of a 3-day workshop on electron and confocal microscopy techniques.', 'uploads/news/microscopy_workshop.jpg', 'https://iitrpr.ac.in/crf/events/microscopy2024'),
-- ('CRF Annual Report Published', 'Read about our achievements and facility usage statistics in the latest annual report.', 'uploads/news/annual_report.jpg', 'https://iitrpr.ac.in/crf/reports/annual2023'),
-- ('Call for Proposals: Seed Grants', 'CRF invites research proposals for internal seed grants. Deadline approaching!', 'uploads/news/seed_grant.jpg', 'https://iitrpr.ac.in/crf/grants/seed2024');

-- -- Insert data into thought
-- INSERT INTO thought (id, thought_text) VALUES (1, 'The journey of a thousand miles begins with a single step. - Lao Tzu');

-- -- Insert data into management_cred
-- INSERT INTO management_cred (email, Pass, Position) VALUES
-- ('crf_admin@iitrpr.ac.in', 'admin_pass_hashed', 'Admin'),
-- ('rakesh.op@iitrpr.ac.in', 'op_rakesh_pass_hashed', 'Operator'),
-- ('sunita.op@iitrpr.ac.in', 'op_sunita_pass_hashed', 'Operator'),
-- ('anil.op@iitrpr.ac.in', 'op_anil_pass_hashed', 'Operator');

-- -- Insert data into results
-- INSERT INTO results (user_id, booking_id, result_date, result_file_path) VALUES
-- (2, 2, CURDATE() + INTERVAL '11' DAY, 'uploads/results/result_102_102.zip'),
-- (4, 4, CURDATE() + INTERVAL '6' DAY, 'uploads/results/result_104_104.pdf');

-- -- Insert data into User_Publications
-- INSERT INTO User_Publications (author_name, title_of_paper, journal_name, volume_number, year, page_number, file_path, user_id, status) VALUES
-- ('Dr. Priya Sharma', 'Novel Drug Delivery Systems', 'Journal of Pharmaceutical Sciences', 110, 2023, '1234-1245', 'uploads/user_pubs/priya_pharma.pdf', 1, 'Approved'),
-- ('Prof. Anil Kumar, Dr. Priya Sharma', 'AI in Material Science Discovery', 'Advanced Functional Materials', 33, 2024, '2300150', 'uploads/user_pubs/anil_priya_ai_mat.pdf', 2, 'Pending'),
-- ('Mr. Raj Patel', 'Development of a New Catalyst', 'Catalysis Letters', 150, 2022, '800-810', 'uploads/user_pubs/raj_catalyst.pdf', 3, 'Approved'),
-- ('Ms. Sunita Singh (Industry Corp)', 'Optimization of Manufacturing Process using IoT', 'IEEE Transactions on Industrial Informatics', 20, 2024, '550-560', 'uploads/user_pubs/sunita_iot.pdf', 4, 'Rejected');

-- -- Insert data into InternalUsers
-- INSERT INTO InternalUsers (user_id, email, full_name, supervisor_id, department_name, verification_token, verified) VALUES
-- (1, 'priya.sharma@example.com', 'Dr. Priya Sharma', 1, 'Computer Science', 'token_priya_123', 1),
-- (5, 'amit.verma@example.com', 'Amit Verma', 2, 'Mechanical Engineering', 'token_amit_456', 0);

-- -- Insert data into SupervisorVerifications
-- INSERT INTO SupervisorVerifications (user_id, token, created_at) VALUES
-- (5, 'token_amit_456', NOW());

-- -- Insert data into facility_publications
-- INSERT INTO facility_publications (facility_id, publication_id) VALUES
-- (1, 1),
-- (1, 5),
-- (2, 2),
-- (3, 3),
-- (4, 4);

-- -- Insert data into LoginLogoutHistory
-- INSERT INTO LoginLogoutHistory (user_id, login_time, logout_time) VALUES
-- (1, NOW() - INTERVAL '2' DAY, NOW() - INTERVAL '2' DAY + INTERVAL '2' HOUR),
-- (2, NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY + INTERVAL '3' HOUR),
-- (3, NOW() - INTERVAL '1' DAY + INTERVAL '1' HOUR, NULL),
-- (4, NOW() - INTERVAL '5' HOUR, NOW() - INTERVAL '1' HOUR),
-- (1, NOW() - INTERVAL '3' HOUR, NULL);
CREATE TABLE IF NOT EXISTS superuser_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'cancelled') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL, -- supervisor_id or admin_id
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES Facilities(id) ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX idx_superuser_requests_user ON superuser_requests(user_id);
CREATE INDEX idx_superuser_requests_status ON superuser_requests(status);
