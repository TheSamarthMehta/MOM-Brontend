# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mom_portal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure

# Server Configuration
PORT=8800
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

3. **Initialize database with default users:**
   ```bash
   npm run init-db
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Default Users Created

After running `npm run init-db`, the following users will be created:

### 1. Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Full system access

### 2. Convener
- **Email:** convener@example.com
- **Password:** convener123
- **Role:** Convener
- **Access:** Meeting management, attendance, reports

### 3. Staff Member
- **Email:** staff@example.com
- **Password:** staff123
- **Role:** Staff
- **Access:** Basic access, document management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (requires token)
- `PUT /api/auth/profile` - Update user profile (requires token)
- `PUT /api/auth/change-password` - Change password (requires token)

### Example Login Request
```bash
curl -X POST http://localhost:8800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Example Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "Admin",
      "lastName": "User",
      "name": "Admin User",
      "email": "admin@example.com",
      "mobileNo": "1234567890",
      "role": "Admin",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Testing the API

You can test the login functionality using:

1. **Postman/Insomnia:**
   - Method: POST
   - URL: http://localhost:8800/api/auth/login
   - Body: JSON with email and password

2. **curl:**
   ```bash
   curl -X POST http://localhost:8800/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "admin123"}'
   ```

3. **Frontend Application:**
   - The frontend is configured to connect to http://localhost:8800/api
   - Use the default admin credentials to test login

## Troubleshooting

### Common Issues:

1. **"Route not found" error:**
   - Make sure the server is running on port 8800
   - Check that you're using POST method for login (not GET)
   - Verify the URL is exactly: http://localhost:8800/api/auth/login

2. **Database connection error:**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Run `npm run init-db` to create the database and users

3. **JWT token errors:**
   - Make sure JWT_SECRET is set in your .env file
   - The token expires in 1 day by default

4. **CORS errors:**
   - The server is configured to accept requests from http://localhost:3000
   - Update CORS_ORIGIN in .env if your frontend runs on a different port

## Server Status

Once the server is running, you can check if it's working by visiting:
- http://localhost:8800/ - Should return "Backend server is running and connected to DB."



