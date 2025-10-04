import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { supabase } from '../lib/supabaseClient'

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
    setUsername('')
    setPassword('')
  }
  
  const handleBackToRoles = () => {
    setSelectedRole(null)
    setError('')
    setUsername('')
    setPassword('')
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Append @demo.com to username
      const email = `${username}@demo.com`
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError('Invalid username or password')
        setLoading(false)
        return
      }

      // Query users table to get user_type
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, full_name')
        .eq('email', email)
        .single()

      if (userError) {
        setError('Error fetching user data')
        setLoading(false)
        return
      }

      // Check if user type matches selected role
      if (selectedRole === 'family' && userData.user_type !== 'family') {
        setError('This account is not a family account')
        setLoading(false)
        return
      }
      
      if (selectedRole === 'leader' && userData.user_type !== 'leader') {
        setError('This account is not a leader account')
        setLoading(false)
        return
      }
      
      if (selectedRole === 'admin' && userData.user_type !== 'admin') {
        setError('This account is not an admin account')
        setLoading(false)
        return
      }

      // Close modal and redirect based on user_type
      onClose()
      if (userData.user_type === 'family') {
        navigate('/family')
      } else if (userData.user_type === 'leader') {
        navigate('/leader')
      } else if (userData.user_type === 'admin') {
        navigate('/admin')
      }

    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }
  
  const getPlaceholder = () => {
    switch (selectedRole) {
      case 'family':
        return 'riley, mia, or andy'
      case 'leader':
        return 'mia, andy, or teacher'
      case 'admin':
        return 'admin'
      default:
        return 'username'
    }
  }
  
  const getDemoCredentials = () => {
    switch (selectedRole) {
      case 'family':
        return (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Demo accounts:</p>
            <p>riley / password (Family)</p>
            <p>mia / password (Family)</p>
            <p>andy / password (Family)</p>
          </div>
        )
      case 'leader':
        return (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Demo accounts:</p>
            <p>mia / password (Leader)</p>
            <p>andy / password (Leader)</p>
            <p>teacher / password (Leader)</p>
          </div>
        )
      case 'admin':
        return (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Demo accounts:</p>
            <p>admin / password (Admin)</p>
          </div>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* GRIT Logo */}
        <div className="flex justify-center mb-8">
          <img src="/GRIT-logo.svg" alt="GRIT Awards" className="h-12 w-auto" />
        </div>
        
        {!selectedRole ? (
          /* Role Selection */
          <>
            <div className="space-y-4">
              <Button
                onClick={() => handleRoleSelect('family')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                I'm a Family Member
              </Button>
              
              <Button
                onClick={() => handleRoleSelect('leader')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                GRIT Leaders
              </Button>
              
              <Button
                onClick={() => handleRoleSelect('admin')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                GRIT Directors
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => handleRoleSelect('admin')}
                className="text-sm text-[#032717] hover:text-[#054d2a] underline"
              >
                I'm a GRIT Administrator
              </button>
            </div>
          </>
        ) : (
          /* Login Form */
          <>
            {selectedRole !== 'admin' && (
              <button
                onClick={handleBackToRoles}
                className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to role selection
              </button>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            {/* Demo Instructions */}
            {getDemoCredentials()}
          </>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2 text-xs text-gray-500">
            <a href="#" className="hover:text-[#032717]">COPPA Direct Notice</a>
            <span>•</span>
            <a href="#" className="hover:text-[#032717]">Terms of Service</a>
            <span>and</span>
            <a href="#" className="hover:text-[#032717]">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-[#032717]">Browse Classroom Activities</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
