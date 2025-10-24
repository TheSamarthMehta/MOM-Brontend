# Backend Setup

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
MONGO_URL=mongodb://localhost:27017/mom_management
JWT_SECRET=your_secret_key
PORT=5000
```

3. Start server:
```bash
npm run dev
```

## API Endpoints

- `/api/auth` - Authentication
- `/api/meetings` - Meeting management
- `/api/staff` - Staff management
- `/api/meeting-types` - Meeting types
- `/api/meeting-members` - Meeting participants
- `/api/meeting-documents` - Document management
- `/api/dashboard` - Dashboard data
- `/api/upload` - File uploads
