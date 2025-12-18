# Charity NGO Backend API

A comprehensive backend API for a charity/NGO website built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Registration, login with Basic Auth
- **Donation System**: Razorpay integration for secure payments
- **Contact Management**: Handle contact form submissions
- **Admin Panel**: Search users, view donations, manage data
- **Security**: Password hashing, input validation, authentication middleware

## API Endpoints

### Authentication (`/api/v1/registration`)
- `GET /` - Check if user exists by email
- `POST /` - Register new user
- `POST /auth` - User login
- `GET /getLogs` - Get user login logs (authenticated)

### Donations (`/api/v1/donate`)
- `GET /` - Get Razorpay key (authenticated)
- `POST /pay` - Create payment order (authenticated)
- `POST /pay/verify` - Verify payment (authenticated)

### Contact (`/api/v1/contact`)
- `POST /` - Submit contact form
- `GET /` - Get all contacts (admin)

### Search (`/api/v1/search`)
- `GET /:query` - Search users by email pattern (admin)
- `GET /donations` - Get user donations and info (admin)
- `GET /allDonations` - Get all donations summary (admin)

## Environment Variables

Create a `.env` file with:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Models

### User
- email (unique)
- password (hashed)
- name
- isEnabled
- totalAmount
- logs (array of login timestamps)
- createdAt
- lastLogin

### Donation
- name
- email
- amount
- orderId
- paymentId
- signature
- status (pending/completed/failed)
- date
- createdAt

### Contact
- name
- email
- subject
- message
- createdAt

## Authentication

The API uses Basic Authentication for protected routes. Credentials are base64 encoded in the format `email:password`.

## Payment Integration

Integrated with Razorpay for secure payment processing:
1. Create order with amount
2. Process payment on frontend
3. Verify payment signature on backend
4. Update donation status and user total

## Security Features

- Password hashing with bcryptjs
- Input validation and sanitization
- Authentication middleware
- CORS enabled
- Environment variable protection

## Error Handling

Comprehensive error handling with appropriate HTTP status codes and error messages.