import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AttendanceRelaxation = () => {
  const { user } = useAuth()
  const [relaxations, setRelaxations] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    reason: '',
    relaxationDays: 5
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (user?.role === 'student') {
        const { data } = await axios.get('/attendance/my-relaxations')
        setRelaxations(data.data)
      } else if (user?.role === 'faculty') {
        const [relaxRes, studentsRes] = await Promise.all([
          axios.get('/attendance/my-recommendations'),
          axios.get('/users/students')
        ])
        setRelaxations(relaxRes.data.data)
        setStudents(studentsRes.data.data)
      } else if (user?.role === 'admin') {
        const { data } = await axios.get('/attendance/pending')
        setRelaxations(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleRecommend = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/attendance/recommend', formData)
      toast.success('Relaxation recommended successfully')
      setShowForm(false)
      setFormData({ studentId: '', reason: '', relaxationDays: 5 })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to recommend')
    }
  }

  const handleApprove = async (id, status) => {
    try {
      await axios.put(`/attendance/${id}/approve`, { status, remarks: '' })
      toast.success(`Relaxation ${status}`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Attendance Relaxation
          </h1>
          {user?.role === 'faculty' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              {showForm ? 'Cancel' : 'Recommend Student'}
            </button>
          )}
        </div>

        {/* Faculty Recommendation Form */}
        {user?.role === 'faculty' && showForm && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recommend Attendance Relaxation
            </h2>
            <form onSubmit={handleRecommend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.rollNumber} (Score: {student.totalScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relaxation Days
                </label>
                <input
                  type="number"
                  value={formData.relaxationDays}
                  onChange={(e) => setFormData({ ...formData, relaxationDays: e.target.value })}
                  min="1"
                  max="30"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Reason for attendance relaxation..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Submit Recommendation
              </button>
            </form>
          </motion.div>
        )}

        {/* Relaxations List */}
        <div className="space-y-4">
          {relaxations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No relaxation requests found</p>
            </div>
          ) : (
            relaxations.map((relaxation, index) => (
              <motion.div
                key={relaxation._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {user?.role === 'student' ? 'Your Request' : relaxation.studentId?.name}
                    </h3>
                    {user?.role !== 'student' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Roll No: {relaxation.studentId?.rollNumber} • Score: {relaxation.studentId?.totalScore}
                      </p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">{relaxation.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    relaxation.status === 'approved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : relaxation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {relaxation.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{relaxation.relaxationDays} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{new Date(relaxation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Recommended by: {relaxation.recommendedBy?.name}</p>
                  {relaxation.approvedBy && (
                    <p>Approved by: {relaxation.approvedBy?.name}</p>
                  )}
                </div>

                {user?.role === 'admin' && relaxation.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(relaxation._id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(relaxation._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AttendanceRelaxation
