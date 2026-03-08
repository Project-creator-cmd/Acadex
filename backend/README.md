# Acadex Backend API

Production-ready backend for Acadex - Smart Academic Achievement Portal

## Features

- JWT Authentication
- Role-based Access Control (Student, Faculty, Admin, Placement)
- Achievement Management with Verification Workflow
- Dynamic Scoring Engine
- Attendance Relaxation System
- Analytics & Reporting
- Department Isolation
- File Upload (Cloudinary)
- MongoDB Database

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### Run Development

```bash
npm run dev
```

### Run Production

```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/update-profile` - Update profile
- PUT `/api/auth/change-password` - Change password

### Achievements
- POST `/api/achievements` - Create achievement
- GET `/api/achievements/my-achievements` - Get my achievements
- GET `/api/achievements` - Get all achievements (Faculty/Admin)
- GET `/api/achievements/pending/list` - Get pending achievements
- GET `/api/achievements/:id` - Get achievement by ID
- PUT `/api/achievements/:id/verify` - Verify achievement
- DELETE `/api/achievements/:id` - Delete achievement

### Attendance Relaxation
- POST `/api/attendance/recommend` - Recommend relaxation (Faculty)
- GET `/api/attendance/my-recommendations` - Get my recommendations
- GET `/api/attendance/pending` - Get pending relaxations (Admin)
- PUT `/api/attendance/:id/approve` - Approve relaxation (Admin)
- GET `/api/attendance/my-relaxations` - Get my relaxations (Student)

### Analytics
- GET `/api/analytics/dashboard` - Dashboard stats
- GET `/api/analytics/trends` - Achievement trends
- GET `/api/analytics/leaderboard` - Leaderboard
- GET `/api/analytics/category-distribution` - Category distribution
- GET `/api/analytics/performance-distribution` - Performance distribution

### Admin
- GET `/api/admin/users` - Get all users
- POST `/api/admin/users` - Create user
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user
- PUT `/api/admin/users/:id/toggle-status` - Toggle user status
- GET `/api/admin/scoring-rules` - Get scoring rules
- POST `/api/admin/scoring-rules` - Create scoring rule
- PUT `/api/admin/scoring-rules/:id` - Update scoring rule
- GET `/api/admin/reports/batch` - Batch report
- GET `/api/admin/reports/department` - Department report

## Deployment

### Render/Railway

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t acadex-backend .
docker run -p 5000:5000 --env-file .env acadex-backend
```

## License

MIT
