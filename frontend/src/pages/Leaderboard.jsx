import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Medal, Award } from 'lucide-react'
import Layout from '../components/Layout'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get('/analytics/leaderboard?limit=50')
      setLeaderboard(data.data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="text-gray-600 dark:text-gray-400 font-semibold">{index + 1}</span>
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Top performers across all departments</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Medal className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboard[1].name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboard[1].department}</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">{leaderboard[1].totalScore}</p>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center -mt-8"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{leaderboard[0].name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboard[0].department}</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{leaderboard[0].totalScore}</p>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Medal className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboard[2].name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboard[2].department}</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">{leaderboard[2].totalScore}</p>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Achievements</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Award size={16} />
                        {student.achievementsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-primary-600">{student.totalScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student.placementReady && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full font-medium">
                          Placement Ready
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Leaderboard
