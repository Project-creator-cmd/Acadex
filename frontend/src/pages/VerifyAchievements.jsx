import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { CheckCircle, XCircle, ExternalLink, Calendar, MapPin } from 'lucide-react'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

const VerifyAchievements = () => {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [verifyData, setVerifyData] = useState({ status: 'approved', remarks: '' })

  useEffect(() => {
    fetchPendingAchievements()
  }, [])

  const fetchPendingAchievements = async () => {
    try {
      const { data } = await axios.get('/achievements/pending/list')
      setAchievements(data.data)
    } catch (error) {
      toast.error('Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedAchievement) return

    try {
      await axios.put(`/achievements/${selectedAchievement._id}/verify`, verifyData)
      toast.success('Achievement verified successfully')
      setSelectedAchievement(null)
      setVerifyData({ status: 'approved', remarks: '' })
      fetchPendingAchievements()
    } catch (error) {
      toast.error('Failed to verify achievement')
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Achievements</h1>

        {achievements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No pending achievements to verify</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievements List */}
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedAchievement?._id === achievement._id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.userId?.name} • {achievement.userId?.rollNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 text-xs rounded-full">
                      {achievement.type}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 text-xs rounded-full">
                      {achievement.level}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs rounded-full">
                      {achievement.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{achievement.organizer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Verification Panel */}
            {selectedAchievement && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Verify Achievement
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {selectedAchievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted by: {selectedAchievement.userId?.name}
                    </p>
                  </div>

                  {selectedAchievement.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedAchievement.description}
                      </p>
                    </div>
                  )}

                  <a
                    href={selectedAchievement.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink size={16} />
                    View Certificate
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Decision
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVerifyData({ ...verifyData, status: 'approved' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                          verifyData.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => setVerifyData({ ...verifyData, status: 'rejected' })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                          verifyData.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={verifyData.remarks}
                      onChange={(e) => setVerifyData({ ...verifyData, remarks: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Add any comments or feedback..."
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Submit Verification
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default VerifyAchievements
