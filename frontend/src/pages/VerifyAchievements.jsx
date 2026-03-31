import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { CheckCircle, XCircle, ExternalLink, Calendar, MapPin, Info, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  faculty_approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  admin_approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const VerifyAchievements = () => {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)

  const isFaculty = user?.role === 'faculty'
  const approveStatus = isFaculty ? 'faculty_approved' : 'admin_approved'
  const queueLabel = isFaculty
    ? `Pending achievements · ${user?.department}`
    : 'Faculty-approved achievements awaiting admin review'

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      // Use /pending (spec-compliant) with explicit auth header as fallback safety
      const res = await axios.get('/achievements/pending', {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Handle both response shapes: { data: [...] } or plain array
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? [])

      setAchievements(list)

      if (list.length === 0) {
        toast('No items in your queue', { icon: 'ℹ️' })
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      toast.error(`Failed to load queue: ${msg}`)
      console.error('fetchQueue error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!form.status) return toast.error('Please select Approve or Reject')
    if (form.status === 'rejected' && !form.remarks.trim()) {
      return toast.error('Remarks are required when rejecting')
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/achievements/${selected._id}/verify`,
        { status: form.status, remarks: form.remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Achievement ${form.status === 'rejected' ? 'rejected' : 'approved'} successfully`)
      setSelected(null)
      setForm({ status: '', remarks: '' })
      fetchQueue()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Achievements</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-1">
              <Info size={14} />
              {queueLabel} — {achievements.length} item(s)
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Workflow info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
          <strong>Workflow:</strong>&nbsp;
          Student uploads →&nbsp;
          <span className="px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-900/40 rounded">pending</span>
          &nbsp;→ Faculty approves →&nbsp;
          <span className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900/40 rounded">faculty_approved</span>
          &nbsp;→ Admin approves →&nbsp;
          <span className="px-1.5 py-0.5 bg-green-200 dark:bg-green-900/40 rounded">admin_approved</span>
          &nbsp;(score assigned here)
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Queue is empty</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {isFaculty
                ? 'No pending achievements from your department'
                : 'No faculty-approved achievements awaiting admin review'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievement list */}
            <div className="space-y-3">
              {achievements.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setSelected(a); setForm({ status: '', remarks: '' }) }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-5 cursor-pointer hover:shadow-md transition-all ${
                    selected?._id === a._id
                      ? 'border-primary-500'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{a.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {a.userId?.name ?? 'Unknown'}
                        {a.userId?.rollNumber ? ` · ${a.userId.rollNumber}` : ''}
                        {a.userId?.department ? ` · ${a.userId.department}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[a.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {a.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full capitalize">{a.type}</span>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full capitalize">{a.level}</span>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
                    {a.organizer && <span className="flex items-center gap-1"><MapPin size={11} />{a.organizer}</span>}
                    {a.date && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(a.date).toLocaleDateString()}</span>}
                  </div>

                  {isFaculty === false && a.facultyRemarks && (
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
                      Faculty note: {a.facultyRemarks}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Review panel */}
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6 h-fit"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Achievement</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Title</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selected.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{selected.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Level</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{selected.level}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Student</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selected.userId?.name}
                      {selected.userId?.rollNumber && <span className="text-gray-500 font-normal"> · {selected.userId.rollNumber}</span>}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">{selected.userId?.department}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Organizer</p>
                    <p className="text-gray-700 dark:text-gray-300">{selected.organizer}</p>
                  </div>

                  {selected.description && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
                      <p className="text-gray-700 dark:text-gray-300">{selected.description}</p>
                    </div>
                  )}

                  {!isFaculty && selected.facultyRemarks && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Faculty Remarks</p>
                      <p className="text-blue-700 dark:text-blue-300">{selected.facultyRemarks}</p>
                    </div>
                  )}

                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink size={15} />
                    View Certificate
                  </a>
                </div>

                {/* Decision */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decision</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm(f => ({ ...f, status: approveStatus }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          form.status === approveStatus
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => setForm(f => ({ ...f, status: 'rejected' }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          form.status === 'rejected'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Remarks {form.status === 'rejected' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={form.remarks}
                      onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm resize-none"
                      placeholder="Add comments or feedback..."
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={submitting || !form.status}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Verification'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-400 dark:text-gray-500">Select an achievement to review</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default VerifyAchievements
