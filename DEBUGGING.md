# Frontend Registration Debugging Guide

## Common Issues and Solutions

### 1. **Port Mismatch** ✅ FIXED
- **Issue**: Frontend was calling `http://localhost:5000/api` but backend runs on `http://localhost:8800/api`
- **Solution**: Updated `frontend/src/api.js` to use port 8800
- **Status**: ✅ Fixed

### 2. **Backend Server Not Running**
- **Check**: Make sure backend server is running
- **Command**: `cd backend && npm run dev`
- **Expected**: Server should show "Server running on port 8800"

### 3. **Database Connection Issues**
- **Check**: MongoDB must be running
- **Command**: `mongod` (if installed locally)
- **Alternative**: Use MongoDB Atlas cloud database

### 4. **Environment Variables Missing**
- **Create**: `.env` file in backend directory
- **Required variables**:
  ```env
  MONGODB_URI=mongodb://localhost:27017/mom_portal
  JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
  PORT=8800
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:3000
  ```

### 5. **Database Not Initialized**
- **Command**: `cd backend && npm run init-db`
- **This creates**: Default users and database structure

### 6. **CORS Issues**
- **Check**: Backend CORS configuration
- **Frontend URL**: Should be `http://localhost:3000`
- **Backend URL**: Should be `http://localhost:8800`

## Step-by-Step Debugging Process

### Step 1: Check Backend Server
```bash
cd backend
npm run dev
```
**Expected Output**: "Server running on port 8800"

### Step 2: Test Backend Health
```bash
curl http://localhost:8800/
```
**Expected Output**: "Backend server is running and connected to DB."

### Step 3: Test Registration Endpoint
```bash
curl -X POST http://localhost:8800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "mobileNo": "1234567890",
    "password": "test123",
    "role": "Admin"
  }'
```

### Step 4: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try registration
4. Look for error messages

### Step 5: Check Network Tab
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try registration
4. Look for failed requests (red entries)
5. Click on failed request to see details

## Common Error Messages and Solutions

### "Network Error" or "Failed to fetch"
- **Cause**: Backend server not running
- **Solution**: Start backend with `npm run dev`

### "Route not found"
- **Cause**: Wrong URL or method
- **Solution**: Use POST to `http://localhost:8800/api/auth/register`

### "User with this email already exists"
- **Cause**: Email already registered
- **Solution**: Use different email or check existing users

### "Validation Error"
- **Cause**: Missing required fields or invalid data
- **Solution**: Check all form fields are filled correctly

### "Internal Server Error"
- **Cause**: Database connection or server error
- **Solution**: Check MongoDB is running and .env file exists

## Testing with Different Tools

### 1. Using curl
```bash
curl -X POST http://localhost:8800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","mobileNo":"1234567890","password":"test123","role":"Admin"}'
```

### 2. Using Postman
- Method: POST
- URL: http://localhost:8800/api/auth/register
- Headers: Content-Type: application/json
- Body: Raw JSON with user data

### 3. Using Browser Console
```javascript
fetch('http://localhost:8800/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    mobileNo: '1234567890',
    password: 'test123',
    role: 'Admin'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Quick Fix Checklist

- [ ] Backend server running on port 8800
- [ ] Frontend API URL updated to port 8800
- [ ] MongoDB running
- [ ] .env file created with required variables
- [ ] Database initialized with `npm run init-db`
- [ ] No CORS errors in browser console
- [ ] All form fields filled correctly
- [ ] Password meets requirements (6+ characters)
- [ ] Email format is valid
- [ ] Role is selected



