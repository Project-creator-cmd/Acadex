# Deployment Guide - Acadex Portal

## MongoDB Atlas Setup

1. Create account at mongodb.com/cloud/atlas
2. Create new cluster (Free tier available)
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (Allow from anywhere)
5. Get connection string
6. Replace `<password>` and `<dbname>` in connection string

## Cloudinary Setup

1. Create account at cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Use in backend .env file

## Backend Deployment (Render)

1. Push code to GitHub
2. Go to render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - Name: acadex-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
6. Add Environment Variables:
   - NODE_ENV=production
   - PORT=5000
   - MONGODB_URI=your_mongodb_uri
   - JWT_SECRET=your_jwt_secret
   - CLOUDINARY_CLOUD_NAME=your_cloud_name
   - CLOUDINARY_API_KEY=your_api_key
   - CLOUDINARY_API_SECRET=your_api_secret
   - FRONTEND_URL=your_frontend_url
7. Click "Create Web Service"
8. Copy deployed URL

## Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - VITE_API_URL=your_backend_url/api
7. Click "Deploy"
8. Copy deployed URL
9. Update backend FRONTEND_URL with this URL

## Post-Deployment

1. Test all features
2. Create admin user via API or MongoDB
3. Configure scoring rules
4. Test file uploads
5. Verify email notifications (if implemented)

## Monitoring

- Backend logs: Render Dashboard
- Frontend logs: Vercel Dashboard
- Database: MongoDB Atlas Dashboard
- File storage: Cloudinary Dashboard

## Troubleshooting

- CORS errors: Check FRONTEND_URL in backend .env
- File upload fails: Verify Cloudinary credentials
- Database connection: Check MongoDB URI and IP whitelist
- 404 errors: Ensure API_URL is correct in frontend
