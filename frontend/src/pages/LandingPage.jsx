import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Award, TrendingUp, Users, Shield } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Track Achievements",
      description: "Upload and manage all your academic achievements in one place"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Scoring",
      description: "Get dynamic performance scores based on your achievements"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Leaderboard",
      description: "Compete with peers and track your ranking"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Records",
      description: "Faculty-verified achievements for credibility"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Find Academic Excellence
              <br />
              <span className="text-primary-600">Made Just For You</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto font-light">
              Track, verify, and showcase your academic achievements with our intelligent performance tracking system
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
