# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All routes require authentication except login/register.

## Endpoints

### Auth Routes
```
POST /auth/login
POST /auth/register
GET  /auth/profile
PUT  /auth/profile
```

### Meeting Routes
```
GET    /meetings              # Get all meetings
GET    /meetings/:id          # Get single meeting
POST   /meetings              # Create meeting
PUT    /meetings/:id          # Update meeting
DELETE /meetings/:id          # Delete meeting
PUT    /meetings/:id/cancel   # Cancel meeting
GET    /meetings/stats        # Get meeting statistics
GET    /meetings/upcoming     # Get upcoming meetings
```

### Staff Routes
```
GET    /staff                 # Get all staff
GET    /staff/:id             # Get single staff
POST   /staff                 # Create staff
PUT    /staff/:id             # Update staff
DELETE /staff/:id             # Delete staff
GET    /staff/:id/meetings    # Get staff meetings
```

### Meeting Type Routes
```
GET    /meeting-types         # Get all meeting types
GET    /meeting-types/:id     # Get single meeting type
POST   /meeting-types         # Create meeting type
PUT    /meeting-types/:id     # Update meeting type
DELETE /meeting-types/:id    # Delete meeting type
```

### Meeting Member Routes
```
GET    /meetings/:meetingId/members           # Get meeting members
POST   /meetings/:meetingId/members           # Add member to meeting
POST   /meetings/:meetingId/members/bulk      # Add multiple members
PUT    /meeting-members/:id                   # Update member
PUT    /meeting-members/:id/attendance        # Mark attendance
DELETE /meeting-members/:id                  # Remove member
GET    /meetings/:meetingId/attendance       # Get attendance stats
```

### Document Routes
```
GET    /meetings/:meetingId/documents         # Get meeting documents
POST   /meetings/:meetingId/documents         # Add document
PUT    /meeting-documents/:id                 # Update document
DELETE /meeting-documents/:id                 # Delete document
PUT    /meetings/:meetingId/documents/reorder # Reorder documents
GET    /meetings/:meetingId/documents/stats   # Get document stats
```

### Upload Routes
```
POST   /upload/document/:documentId          # Upload file
GET    /upload/document/:documentId           # Download file
DELETE /upload/document/:documentId          # Delete file
```

### Dashboard Routes
```
GET    /dashboard/overview           # Dashboard overview
GET    /dashboard/analytics          # Meeting analytics
GET    /dashboard/staff-performance  # Staff performance
GET    /dashboard/meeting-types      # Meeting type analytics
GET    /dashboard/recent-activity    # Recent activity
```

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Example Requests

### Login
```json
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Create Meeting
```json
POST /meetings
{
  "meetingTitle": "Team Meeting",
  "meetingTypeId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "meetingDate": "2024-01-15",
  "meetingTime": "2024-01-15T10:00:00Z",
  "meetingDescription": "Weekly team sync"
}
```

### Create Staff
```json
POST /staff
{
  "staffName": "John Doe",
  "emailAddress": "john@company.com",
  "mobileNo": "+1234567890"
}
```
