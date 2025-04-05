# Finzefy Backend API

A robust Express.js backend service for the Finzefy application, providing secure financial management and business operations APIs. This project was bootstrapped using [Quick-serve](https://github.com/kobiowuquadri/quick-serve) template.

## Features
- **Authentication & Authorization**: Secure JWT-based authentication with email verification
- **Business Management**: Complete business profile management with digital signature support
- **File Handling**: Cloudinary integration for secure file storage and management
- **Database**: Sequelize ORM with support for multiple databases
- **Security**: Implementation of security best practices including:
  - JWT token validation
  - Password hashing
  - Request validation
  - Protected routes
- **Email Services**: Automated email notifications for verification and updates
- **Currency Management**: Support for multiple currencies (NGN, USD, EUR, GBP)

## Tech Stack
- Node.js
- Express.js
- Sequelize ORM
- JWT for authentication
- Cloudinary for file storage
- Nodemailer for email services

## Project Structure

```
finzefy/
│
├── config/
│   ├── swagger.js         # Swagger configuration for API documentation
│
├── controllers/           # Route controllers handling business logic
│
├── middlewares/           # Custom middlewares (e.g., error handler)
│
├── models/                # Mongoose models
│
├── routes/                # API routes
│
├── schema/                # Mongoose schema files
│
├── utils/                 # Helper functions (e.g., token generation, email handler)
│
├── database/              # Database connection setup
│
├── services/              # Public files (e.g., uploads)
│
├── .env                   # Environment variables
├── server.js              # Main entry point for the app
├── package.json           # Project metadata and dependencies
├── README.md              # Project documentation
└── .gitignore             # Git ignore file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL/PostgreSQL database
- Cloudinary account
- Email service account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/FinzefyApp/finzefy-expressjs-backend.git
cd finzefy-expressjs-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/user/register` - Register new user
- `POST /api/v1/user/verify-otp` - Verify email OTP
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/forgot-password` - Request password reset
- `POST /api/v1/user/reset-password` - Reset password

### Business Endpoints
- `PUT /api/v1/business/update-info` - Update business information
- `PUT /api/v1/business/update-currency` - Update primary currency

### Request Examples

**Update Business Information**
```http
PUT /api/v1/business/update-info
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

Form Data:
- businessName: "Your Business Name"
- businessAddress: "Business Address"
- businessPhoneNumber: "+1234567890"
- businessDescription: "Business Description"
- digitalSignature: [File Upload]
- websiteLink: "https://finzefy.com"
- [other optional fields]
```

## Error Handling
The API uses standard HTTP response codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License

## Acknowledgments
- [Quick-serve](https://github.com/kobiowuquadri/quick-serve) - The template used to bootstrap this project
- **Express.js** - Web framework for building the server
- **Sequelize** - ORM for database operations
- **JWT** - For authentication and authorization
- **Nodemailer** - For email functionality
- **Cloudinary** - For file storage and handling

## Support
For support, email [support@finzefy.com](mailto:support@finzefy.com)

---

Enjoy building with **QUICKSERVE**!
