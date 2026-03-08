import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Award, Calendar, MapPin, ExternalLink, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const { data } = await axios.get('/achievements/my-achievements')
      setAchievements(data.data)
    } catch (error) {
      toast.error('Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return
    
    try {
      await axios.delete(`/achievements/${id}`)
      toast.success('Achievement deleted')
      fetchAchievements()
    } catch (error) {
      toast.error('Failed to delete achievement')
    }
  }

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : achievements.filter(a => a.status === filter)

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Achievements</h1>
          
          <div className="flex gap-2">
            {['all', 'approved', 'pending', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAchievements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.title}
                      </h3>
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

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{achievement.organizer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                    {achievement.status === 'approved' && (
                      <div className="flex items-center gap-2">
                        <Award size={16} />
                        <span className="font-semibold text-primary-600">{achievement.points} points</span>
                      </div>
                    )}
                  </div>

                  {achievement.remarks && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Remarks:</span> {achievement.remarks}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <a
                      href={achievement.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink size={16} />
                      View Certificate
                    </a>
                    {achievement.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(achievement._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Achievements
