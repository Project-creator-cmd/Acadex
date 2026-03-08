import { motion } from 'framer-motion'
import { User, Mail, Building, Award, Trophy } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                    <p className="text-gray-900 dark:text-white">{user?.department}</p>
                  </div>
                </div>

                {user?.role === 'student' && (
                  <>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Roll Number</p>
                        <p className="text-gray-900 dark:text-white">{user?.rollNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                        <p className="text-2xl font-bold text-primary-600">{user?.totalScore || 0}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {user?.role === 'student' && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.achievementsCount || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.totalScore || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.placementReady ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Placement Ready</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Profile
