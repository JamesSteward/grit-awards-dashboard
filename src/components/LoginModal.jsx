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
        setError('This account is not a family account. Please select the correct role.')
        setLoading(false)
        return
      }
      
      if (selectedRole === 'leader' && userData.user_type !== 'leader') {
        setError('This account is not a leader account. Please select the correct role.')
        setLoading(false)
        return
      }
      
      if (selectedRole === 'admin' && userData.user_type !== 'admin') {
        setError('This account is not an admin account. Please select the correct role.')
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
    return 'Enter username'
  }
  
  const getDemoCredentials = () => {
    return null
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
          <img src="/GRIT-logo.svg" alt="GRIT Awards" className="w-48 h-auto mx-auto" />
        </div>
        
        {!selectedRole ? (
          /* Role Selection */
          <>
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('family')}
                className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg shadow-[#032717]/20 hover:shadow-xl hover:shadow-[#032717]/30 hover:-translate-y-0.5 transition-all duration-200 text-white font-semibold py-4 px-8 rounded-lg"
              >
                I'm a Family Member
              </button>
              
              <button
                onClick={() => handleRoleSelect('leader')}
                className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg shadow-[#032717]/20 hover:shadow-xl hover:shadow-[#032717]/30 hover:-translate-y-0.5 transition-all duration-200 text-white font-semibold py-4 px-8 rounded-lg"
              >
                GRIT Leaders
              </button>
              
              <button
                className="w-full bg-gray-400 text-white py-4 px-8 rounded-lg cursor-not-allowed"
                disabled
              >
                GRIT Directors (Coming Soon)
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                className="text-sm text-gray-400 cursor-not-allowed"
                disabled
              >
                I'm a GRIT Administrator (Coming Soon)
              </button>
            </div>
          </>
        ) : (
          /* Login Form */
          <>
            {selectedRole !== 'admin' && (
              <button
                onClick={handleBackToRoles}
                className="mb-4 text-sm text-[#032717] hover:underline font-medium flex items-center"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#032717] focus:border-[#032717]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#032717] focus:border-[#032717]"
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
                className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg shadow-[#032717]/20 hover:shadow-xl hover:shadow-[#032717]/30 hover:-translate-y-0.5 transition-all duration-200 text-white font-semibold py-4 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
