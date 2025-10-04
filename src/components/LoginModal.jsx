import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { supabase } from '../lib/supabaseClient'

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
    setUsername('')
    setPassword('')
    setShowPassword(false)
  }
  
  const handleBackToRoles = () => {
    setSelectedRole(null)
    setError('')
    setUsername('')
    setPassword('')
    setShowPassword(false)
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // For family role, use email directly; for others, append @demo.com
      const email = selectedRole === 'family' ? username : `${username}@demo.com`
      
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
    return selectedRole === 'family' ? 'Enter email' : 'Enter username'
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
        ) : selectedRole === 'family' ? (
          /* Family Member Sign In Form */
          <>
            <button
              onClick={handleBackToRoles}
              className="mb-4 text-sm text-[#032717] hover:underline font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to role selection
            </button>

            <h2 className="text-2xl font-bold text-[#032717] mb-8 text-center">Sign In as a Family Member</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#032717] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032717]/20 focus:border-[#032717]"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#032717] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032717]/20 focus:border-[#032717]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Family Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg text-white font-semibold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Family Sign In'}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center my-4">
              <button
                onClick={() => alert("Password reset feature coming soon")}
                className="text-[#032717] font-bold text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Divider with "Sign in with" */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Sign in with</span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => alert("SSO integration coming soon")}
                className="w-14 h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                onClick={() => alert("SSO integration coming soon")}
                className="w-14 h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
              </button>
            </div>

            {/* Help Links */}
            <div className="text-center text-sm space-y-1">
              <div>
                <span className="text-gray-600">Trouble signing in? </span>
                <button className="text-[#032717] hover:underline">Check out the FAQ</button>
              </div>
              <div className="text-gray-500">COPPA | GDPR Notice</div>
            </div>

            {/* Another Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Create Family Account Button */}
            <button
              onClick={() => alert("Account creation feature coming soon - Contact your school's GRIT Lead for QR code")}
              className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg text-white font-semibold py-4 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Family Account
            </button>
          </>
        ) : (
          /* Other Role Login Form */
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
