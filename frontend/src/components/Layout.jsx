import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Award, Upload, CheckCircle, Calendar,
  BarChart3, Trophy, User, Settings, LogOut, Menu, X,
  Moon, Sun, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const studentLinks = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/achievements', icon: <Award />, label: 'My Achievements' },
    { path: '/upload-achievement', icon: <Upload />, label: 'Upload Achievement' },
    { path: '/attendance-relaxation', icon: <Calendar />, label: 'Attendance' },
    { path: '/leaderboard', icon: <Trophy />, label: 'Leaderboard' },
    { path: '/profile', icon: <User />, label: 'Profile' },
  ]

  const facultyLinks = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/verify-achievements', icon: <CheckCircle />, label: 'Verify Achievements' },
    { path: '/upload-achievement', icon: <Upload />, label: 'My Achievements' },
    { path: '/attendance-relaxation', icon: <Calendar />, label: 'Attendance' },
    { path: '/analytics', icon: <BarChart3 />, label: 'Analytics' },
    { path: '/leaderboard', icon: <Trophy />, label: 'Leaderboard' },
    { path: '/profile', icon: <User />, label: 'Profile' },
  ]

  const adminLinks = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/verify-achievements', icon: <CheckCircle />, label: 'Verify Achievements' },
    { path: '/attendance-relaxation', icon: <Calendar />, label: 'Attendance' },
    { path: '/analytics', icon: <BarChart3 />, label: 'Analytics' },
    { path: '/leaderboard', icon: <Trophy />, label: 'Leaderboard' },
    { path: '/admin', icon: <Shield />, label: 'Admin Panel' },
    { path: '/profile', icon: <User />, label: 'Profile' },
  ]

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks
    if (user?.role === 'faculty') return facultyLinks
    return studentLinks
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-20"
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-primary-600">Acadex</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 px-2">
          {getLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                location.pathname === link.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {link.icon}
              {sidebarOpen && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span>{isDark ? 'Light' : 'Dark'} Mode</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {user?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {user?.department} • {user?.role}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'student' && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                  <p className="text-2xl font-bold text-primary-600">{user?.totalScore || 0}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
