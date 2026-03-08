# Acadex - Smart Academic Achievement Portal

Production-ready web platform for managing academic achievements, performance tracking, and placement readiness.

## Features

- **Achievement Management**: Upload, verify, and track academic achievements
- **Dynamic Scoring Engine**: Automated performance scoring based on achievements
- **Attendance Relaxation**: Faculty recommendation and admin approval workflow
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Leaderboard**: Real-time student rankings
- **Role-Based Access**: Student, Faculty, Admin, and Placement Officer roles
- **Department Isolation**: Department-level data segregation
- **Placement Readiness**: Automated placement eligibility tracking

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Router DOM

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary (File Storage)
- Bcrypt (Password Hashing)

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
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

4. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

## Deployment

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Import GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

## Default User Roles

- **Student**: Upload achievements, view scores, check placement readiness
- **Faculty**: Verify achievements, recommend attendance relaxation, view analytics
- **Admin**: Manage users, configure scoring rules, approve relaxations, view reports
- **Placement**: View placement-ready students, access analytics

## License

MIT
