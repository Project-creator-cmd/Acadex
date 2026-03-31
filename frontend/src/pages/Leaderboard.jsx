import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Medal, Award, Filter } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Leaderboard = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')

  useEffect(() => {
    // Faculty is locked to their own department
    if (user?.role === 'faculty') {
      setSelectedDept(user.department)
      fetchLeaderboard(user.department)
    } else {
      fetchDepartments()
      fetchLeaderboard('')
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/users/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const depts = [...new Set(data.data.map(s => s.department).filter(Boolean))].sort()
      setDepartments(depts)
    } catch (_) {}
  }

  const fetchLeaderboard = async (dept) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ limit: 50 })
      if (dept) params.append('department', dept)
      const { data } = await axios.get(`/analytics/leaderboard?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Handle both { data: [...] } and plain array
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setLeaderboard(list)
    } catch (error) {
      toast.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDeptChange = (dept) => {
    setSelectedDept(dept)
    fetchLeaderboard(dept)
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-5 text-center">{index + 1}</span>
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Ranked by total score from admin-approved achievements
              {selectedDept && ` · ${selectedDept}`}
            </p>
          </div>

          {/* Department filter — hidden for faculty (locked to their dept) */}
          {user?.role !== 'faculty' && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-gray-500" />
              <button
                onClick={() => handleDeptChange('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedDept === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Departments
              </button>
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => handleDeptChange(dept)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No data yet for this department</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4">
                {/* 2nd */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-3">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-center">{leaderboard[1].name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">{leaderboard[1].department}</p>
                  <p className="text-2xl font-bold text-primary-600">{leaderboard[1].totalScore}</p>
                  <p className="text-xs text-gray-500">{leaderboard[1].achievementsCount} achievements</p>
                </motion.div>

                {/* 1st */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-xl shadow-lg p-6 -mt-4 border-2 border-yellow-400"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-3 shadow-lg">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white text-center">{leaderboard[0].name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">{leaderboard[0].department}</p>
                  <p className="text-3xl font-bold text-primary-600">{leaderboard[0].totalScore}</p>
                  <p className="text-xs text-gray-500">{leaderboard[0].achievementsCount} achievements</p>
                </motion.div>

                {/* 3rd */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-3">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-center">{leaderboard[2].name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">{leaderboard[2].department}</p>
                  <p className="text-2xl font-bold text-primary-600">{leaderboard[2].totalScore}</p>
                  <p className="text-xs text-gray-500">{leaderboard[2].achievementsCount} achievements</p>
                </motion.div>
              </div>
            )}

            {/* Full Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Achievements</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboard.map((student, index) => (
                      <motion.tr
                        key={student.studentId}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-6">
                            {getRankIcon(index)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.rollNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{student.department}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Award size={14} />
                            {student.achievementsCount}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-primary-600">{student.totalScore}</span>
                        </td>
                        <td className="px-6 py-4">
                          {student.placementReady && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full font-medium">
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
          </>
        )}
      </div>
    </Layout>
  )
}

export default Leaderboard
