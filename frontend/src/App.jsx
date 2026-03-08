import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

// Pages
import SplashScreen from './pages/SplashScreen'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Achievements from './pages/Achievements'
import UploadAchievement from './pages/UploadAchievement'
import VerifyAchievements from './pages/VerifyAchievements'
import AttendanceRelaxation from './pages/AttendanceRelaxation'
import Analytics from './pages/Analytics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/achievements" element={
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        } />
        
        <Route path="/upload-achievement" element={
          <ProtectedRoute roles={['student', 'faculty']}>
            <UploadAchievement />
          </ProtectedRoute>
        } />
        
        <Route path="/verify-achievements" element={
          <ProtectedRoute roles={['faculty', 'admin']}>
            <VerifyAchievements />
          </ProtectedRoute>
        } />
        
        <Route path="/attendance-relaxation" element={
          <ProtectedRoute>
            <AttendanceRelaxation />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute roles={['faculty', 'admin', 'placement']}>
            <Analytics />
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
