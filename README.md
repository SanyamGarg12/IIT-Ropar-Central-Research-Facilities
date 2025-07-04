# 🏛️ IIT Ropar Central Research Facilities Management System

<div align="center">
  <img src="Readme Assets/1.png" alt="Screenshot 1" width="350" style="margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px #aaa;">
  <img src="Readme Assets/2.png" alt="Screenshot 2" width="350" style="margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px #aaa;">
  <img src="Readme Assets/3.png" alt="Screenshot 3" width="350" style="margin: 10px; border-radius: 8px; box-shadow: 0 2px 8px #aaa;">
</div>

---

## Overview
A comprehensive web platform to manage and streamline research facilities at IIT Ropar. Features include facility booking, user management, publication tracking, and administrative dashboards.

---

## 🚀 Features
- Facility booking & management
- User registration & verification
- Publication tracking
- Administrative dashboard
- Results management

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, MySQL, Sequelize, JWT, AWS S3
- **Frontend:** React, Redux, Material-UI, React Router, Formik, Chart.js
- **DevOps:** Git, GitHub Actions, Docker, AWS

---

## Project Development
This project was developed as part of the IIT Ropar Central Research Facilities initiative to modernize and digitize the management of research facilities. The system was designed and implemented by [Sanyam Garg](https://github.com/SanyamGarg12) and team.

### Development Timeline
- **Phase 1**: Database Design and Schema Development
- **Phase 2**: Backend API Development
- **Phase 3**: Frontend Implementation
- **Phase 4**: Testing and Deployment
- **Phase 5**: Documentation and Maintenance

## Features

### 1. User Management
- Multi-tier user system (Internal, External Academic, R&D Lab, Industry)
- User registration and verification system
- Profile management
- Login/Logout tracking

### 2. Facility Management
- Detailed facility information including:
  - Specifications
  - Usage details
  - Pricing for different user types
  - Faculty in charge
  - Operator details
  - Contact information
- Facility categorization
- Image management for facilities

### 3. Booking System
- Online facility booking
- Slot-based scheduling
- Booking history tracking
- Status management (Pending, Approved, Cancelled)
- Cost calculation based on user type

### 4. Publication Management
- Publication tracking
- User publication submissions
- Publication-facility association
- Publication status management

### 5. Administrative Features
- Staff management
- Form management
- News and updates
- Hero image management
- Management credentials

### 6. Results Management
- Result file upload and tracking
- Result association with bookings
- User-specific result access

## Technical Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Email Service**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **UI Components**: Material-UI
- **Routing**: React Router
- **Form Handling**: Formik
- **Validation**: Yup
- **Charts**: Chart.js
- **PDF Generation**: React-PDF

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Cloud Platform**: AWS
- **Monitoring**: AWS CloudWatch

## Database Structure

### Core Tables
- `Users` - User information and credentials
- `Facilities` - Research facility details
- `Categories` - Facility categorization
- `BookingHistory` - Booking records
- `FacilitySchedule` - Facility availability schedules
- `Publications` - Research publications
- `User_Publications` - User-submitted publications
- `Results` - Research results and data

### Supporting Tables
- `Members` - Team member information
- `Staff` - Staff details
- `Forms` - Online forms
- `heroImages` - Homepage images
- `heroNews` - News updates
- `thought` - Featured thoughts/quotes
- `management_cred` - Administrative credentials

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- Git
- AWS Account (for S3 and other services)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SanyamGarg12/IIT-Ropar-Central-Research-Facilities.git
cd IIT-Ropar-Central-Research-Facilities
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Server (.env)
cp server/.env.example server/.env
```

4. Configure the environment variables with your specific settings.

5. Initialize the database:
```bash
# Create the database
mysql -u your_username -p < database.sql

# Run migrations
cd server
npx sequelize-cli db:migrate
```

6. Start the development servers:
```bash
# Start server
cd server
npm run dev

# Start frontend server
cd frontend
npm start
```

### Configuration

#### Environment Variables
The project uses environment variables for sensitive configuration. These are stored in the `server/.env` file which is not tracked by Git for security reasons. You'll need to create this file based on the provided example:

Server `.env` file should include:
- Database credentials
- JWT secret key
- AWS credentials
- Email service credentials
- Other API keys

**Important**: Never commit your `server/.env` file to version control. The `.gitignore` file is configured to prevent this.

#### Security Measures
- All sensitive credentials are stored in environment variables
- Database credentials are encrypted
- JWT tokens are used for authentication
- API endpoints are protected with proper authentication
- File uploads are secured with proper validation

## Usage
[Usage instructions to be added]

## Contributing
We welcome contributions to this project! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

Please ensure your code follows our coding standards and includes appropriate tests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
- **Project Maintainer**: [Sanyam Garg](https://github.com/SanyamGarg12)
- **Email**: sanyam22448@iiitd.ac.in
- **Institution**: IIITD
