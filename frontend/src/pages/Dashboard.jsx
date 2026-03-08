import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Award, TrendingUp, CheckCircle, Clock, Trophy, Target } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentAchievements, setRecentAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'student') {
        const { data } = await axios.get('/achievements/my-achievements')
        setRecentAchievements(data.data.slice(0, 5))
        
        const approved = data.data.filter(a => a.status === 'approved').length
        const pending = data.data.filter(a => a.status === 'pending').length
        
        setStats({
          totalAchievements: data.count,
          approvedAchievements: approved,
          pendingVerifications: pending,
          totalScore: user.totalScore
        })
      } else {
        const { data } = await axios.get('/analytics/dashboard')
        setStats(data.data)
        
        const achievementsRes = await axios.get('/achievements?status=pending')
        setRecentAchievements(achievementsRes.data.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = user?.role === 'student' ? [
    { icon: <Award />, label: 'Total Achievements', value: stats?.totalAchievements || 0, color: 'blue' },
    { icon: <CheckCircle />, label: 'Approved', value: stats?.approvedAchievements || 0, color: 'green' },
    { icon: <Clock />, label: 'Pending', value: stats?.pendingVerifications || 0, color: 'yellow' },
    { icon: <Trophy />, label: 'Total Score', value: stats?.totalScore || 0, color: 'purple' },
  ] : [
    { icon: <Award />, label: 'Total Students', value: stats?.totalStudents || 0, color: 'blue' },
    { icon: <CheckCircle />, label: 'Total Achievements', value: stats?.totalAchievements || 0, color: 'green' },
    { icon: <Clock />, label: 'Pending Verifications', value: stats?.pendingVerifications || 0, color: 'yellow' },
    { icon: <Target />, label: 'Placement Ready', value: stats?.placementReadyStudents || 0, color: 'purple' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Placement Ready Badge */}
        {user?.role === 'student' && user?.placementReady && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center gap-4">
              <Trophy size={48} />
              <div>
                <h3 className="text-2xl font-bold mb-1">Placement Ready!</h3>
                <p className="text-green-100">Congratulations! You've achieved the placement readiness threshold.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Achievements */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {user?.role === 'student' ? 'Recent Achievements' : 'Pending Verifications'}
          </h3>
          
          {recentAchievements.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No achievements yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.type} • {achievement.level}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    achievement.status === 'approved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : achievement.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {achievement.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

export default Dashboard
