# IIT Ropar Central Research Facilities Management System

## Overview
The IIT Ropar Central Research Facilities Management System is a comprehensive web-based platform designed to manage and streamline the operations of research facilities at IIT Ropar. The system facilitates facility booking, user management, publication tracking, and administrative functions for various research equipment and laboratories.

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
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Frontend (.env)
cp frontend/.env.example frontend/.env
```

4. Configure the environment variables with your specific settings.

5. Initialize the database:
```bash
# Create the database
mysql -u your_username -p < database.sql

# Run migrations
cd backend
npx sequelize-cli db:migrate
```

6. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

### Configuration
- Update database credentials in `backend/.env`
- Configure AWS credentials for S3 access
- Set up email service credentials
- Configure JWT secret key

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
