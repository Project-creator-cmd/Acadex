import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'

const Analytics = () => {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [statsRes, categoryRes, perfRes] = await Promise.all([
        axios.get('/analytics/dashboard'),
        axios.get('/analytics/category-distribution'),
        axios.get('/analytics/performance-distribution')
      ])

      setStats(statsRes.data.data)
      
      const categoryChartData = categoryRes.data.data.map(item => ({
        name: item._id,
        count: item.count,
        points: item.totalPoints
      }))
      setCategoryData(categoryChartData)

      const perfChartData = [
        { name: 'Excellent (>100)', value: perfRes.data.data.excellent },
        { name: 'Good (50-100)', value: perfRes.data.data.good },
        { name: 'Average (20-50)', value: perfRes.data.data.average },
        { name: 'Low (<20)', value: perfRes.data.data.low }
      ]
      setPerformanceData(perfChartData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalStudents || 0}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Achievements</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalAchievements || 0}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.averageScore || 0}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Placement Ready</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.placementReadyStudents || 0}</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Achievement Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Distribution */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Analytics
