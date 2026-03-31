import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Award, TrendingUp, CheckCircle, Clock, Trophy, Target, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </motion.div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      if (user?.role === 'student') {
        const res = await axios.get('/dashboard/student')
        setData(res.data.data)
      } else if (user?.role === 'admin') {
        const res = await axios.get('/dashboard/admin')
        setData(res.data.data)
      } else {
        // faculty / placement — use analytics summary
        const res = await axios.get('/analytics/dashboard')
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const studentCards = [
    { label: 'Total Score', value: data?.totalScore ?? 0, icon: <Trophy className="w-6 h-6 text-purple-600" />, color: 'bg-purple-100 dark:bg-purple-900/20', delay: 0 },
    { label: 'Total Achievements', value: data?.summary?.total ?? 0, icon: <Award className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100 dark:bg-blue-900/20', delay: 0.1 },
    { label: 'Pending', value: data?.summary?.pending ?? 0, icon: <Clock className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-100 dark:bg-yellow-900/20', delay: 0.2 },
    { label: 'Approved', value: data?.summary?.admin_approved ?? 0, icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100 dark:bg-green-900/20', delay: 0.3 },
  ]

  const adminCards = [
    { label: 'Total Students', value: data?.totalStudents ?? 0, icon: <TrendingUp className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100 dark:bg-blue-900/20', delay: 0 },
    { label: 'Total Submissions', value: data?.totalSubmissions ?? 0, icon: <Award className="w-6 h-6 text-purple-600" />, color: 'bg-purple-100 dark:bg-purple-900/20', delay: 0.1 },
    { label: 'Awaiting Faculty', value: data?.pendingApprovals?.awaitingFaculty ?? 0, icon: <Clock className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-100 dark:bg-yellow-900/20', delay: 0.2 },
    { label: 'Awaiting Admin', value: data?.pendingApprovals?.awaitingAdmin ?? 0, icon: <AlertCircle className="w-6 h-6 text-orange-600" />, color: 'bg-orange-100 dark:bg-orange-900/20', delay: 0.25 },
    { label: 'Placement Ready', value: data?.placementReady ?? 0, icon: <Target className="w-6 h-6 text-green-600" />, color: 'bg-green-100 dark:bg-green-900/20', delay: 0.3 },
  ]

  const facultyCards = [
    { label: 'Total Students', value: data?.totalStudents ?? 0, icon: <TrendingUp className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100 dark:bg-blue-900/20', delay: 0 },
    { label: 'Total Achievements', value: data?.totalAchievements ?? 0, icon: <Award className="w-6 h-6 text-purple-600" />, color: 'bg-purple-100 dark:bg-purple-900/20', delay: 0.1 },
    { label: 'Pending Verifications', value: data?.pendingVerifications ?? 0, icon: <Clock className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-100 dark:bg-yellow-900/20', delay: 0.2 },
    { label: 'Placement Ready', value: data?.placementReadyStudents ?? 0, icon: <Target className="w-6 h-6 text-green-600" />, color: 'bg-green-100 dark:bg-green-900/20', delay: 0.3 },
  ]

  const cards = user?.role === 'student' ? studentCards
    : user?.role === 'admin' ? adminCards
    : facultyCards

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* Placement Ready Banner */}
        {user?.role === 'student' && data?.placementReady && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white flex items-center gap-4"
          >
            <Trophy size={48} />
            <div>
              <h3 className="text-2xl font-bold mb-1">Placement Ready!</h3>
              <p className="text-green-100">Your score of {data.totalScore} meets the placement threshold (50+).</p>
            </div>
          </motion.div>
        )}

        {/* Verification workflow info for student */}
        {user?.role === 'student' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Progress</h3>
            <div className="flex items-center gap-2 text-sm">
              {[
                { label: 'Submitted', count: data?.summary?.total, color: 'bg-gray-400' },
                { label: 'Faculty Approved', count: data?.summary?.faculty_approved, color: 'bg-blue-500' },
                { label: 'Admin Approved', count: data?.summary?.admin_approved, color: 'bg-green-500' },
                { label: 'Rejected', count: data?.summary?.rejected, color: 'bg-red-500' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-400">→</span>}
                  <div className="flex items-center gap-1">
                    <span className={`w-3 h-3 rounded-full ${step.color}`}></span>
                    <span className="text-gray-700 dark:text-gray-300">{step.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">({step.count ?? 0})</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Department stats for admin */}
        {user?.role === 'admin' && data?.departmentStats?.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department-wise Stats</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Achievements</th>
                    <th className="pb-3">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.departmentStats.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 text-gray-900 dark:text-white font-medium">{dept._id}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{dept.totalAchievements}</td>
                      <td className="py-3 text-primary-600 font-semibold">{dept.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Recent achievements for student */}
        {user?.role === 'student' && data?.achievements?.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {data.achievements.slice(0, 5).map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.type} • {a.level}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === 'admin_approved' && (
                      <span className="text-sm font-bold text-primary-600">+{a.score} pts</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'admin_approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : a.status === 'faculty_approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : a.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
