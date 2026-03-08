import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const { data } = await axios.get('/auth/me')
      setUser(data.data)
    } catch (error) {
      console.error('Load user error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      setUser(data.user)
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      setUser(data.user)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
