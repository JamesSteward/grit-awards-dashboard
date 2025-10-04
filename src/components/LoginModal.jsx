import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const LoginModal = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()
  
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

  const handleCreateAccount = () => {
    setSelectedRole('createAccount')
    setError('')
    setUsername('')
    setPassword('')
    setShowPassword(false)
  }

  const handleBackToFamilyLogin = () => {
    setSelectedRole('family')
    setError('')
    setUsername('')
    setPassword('')
    setShowPassword(false)
  }

  const handleScanQR = () => {
    alert("QR Code scanning feature - Demo only\n\nIn a real implementation, this would:\n1. Open camera\n2. Scan QR code\n3. Extract child/class information\n4. Create family account automatically")
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let email = username
      
      // For family login, use email directly
      if (selectedRole === 'family') {
        email = username
      } else {
        // For other roles, append @demo.com
        email = `${username}@demo.com`
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      // Get user type from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, full_name')
        .eq('email', email)
        .single()

      if (userError) {
        setError('Failed to get user information')
        return
      }

      // Validate role
      if (selectedRole === 'family' && userData.user_type !== 'family') {
        setError('This account is not authorized for family access')
        return
      }
      
      if (selectedRole === 'leader' && userData.user_type !== 'leader') {
        setError('This account is not authorized for leader access')
        return
      }

      // Redirect based on user type
      if (userData.user_type === 'family') {
        navigate('/family')
      } else if (userData.user_type === 'leader') {
        navigate('/leader')
      } else {
        setError('Unknown user type')
      }

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholder = () => {
    if (selectedRole === 'family') {
      return 'Enter email'
    } else if (selectedRole === 'leader') {
      return 'Enter username'
    }
    return 'Enter username'
  }

  const getDemoCredentials = () => {
    if (selectedRole === 'family') {
      return (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Accounts:</p>
          <p className="text-xs text-blue-700">riley@demo.com / password</p>
          <p className="text-xs text-blue-700">mia@demo.com / password</p>
        </div>
      )
    } else if (selectedRole === 'leader') {
      return (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Account:</p>
          <p className="text-xs text-blue-700">andy / password</p>
        </div>
      )
    }
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
      <div className="relative bg-white rounded-lg p-6 sm:p-8 max-w-md w-[95%] max-h-[85vh] overflow-y-auto mx-4 shadow-xl">
        
        {/* GRIT Logo */}
        <div className="flex justify-center mb-8">
          <img src="/GRIT-logo.svg" alt="GRIT Awards" className="w-40 sm:w-48 h-auto mx-auto" />
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
              className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-md transition-all duration-200 hover:-translate-x-1 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#032717]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-[#032717] mb-8 text-center">Sign In as a Family Member</h2>
            
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg shadow-[#032717]/20 hover:shadow-xl hover:shadow-[#032717]/30 hover:-translate-y-0.5 transition-all duration-200 text-white font-semibold py-4 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Signing in...' : 'Family Sign In'}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-center my-4">
              <button
                onClick={() => alert("Password reset feature coming soon")}
                className="text-[#032717] font-bold text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">Sign in with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* SSO Buttons */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => alert("SSO integration coming soon")}
                className="w-14 h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                className="w-14 h-14 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
              </button>
            </div>

            {/* Help Links */}
            <div className="text-center text-sm mb-6">
              <div className="mb-2">
                <a href="#" className="text-[#032717] text-sm hover:underline">
                  Trouble signing in? Check out the FAQ
                </a>
              </div>
              <div>
                <a href="#" className="text-[#032717] text-sm hover:underline">
                  COPPA | GDPR Notice
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Create Family Account Button */}
            <button
              onClick={handleCreateAccount}
              className="w-full bg-gradient-to-br from-[#032717] to-[#054d2a] shadow-lg text-white font-semibold py-4 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Family Account
            </button>
          </>
        ) : selectedRole === 'createAccount' ? (
          /* Create Family Account View */
          <>
            <button
              onClick={handleBackToFamilyLogin}
              className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-md transition-all duration-200 hover:-translate-x-1 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#032717]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-[#032717] text-center mb-10">Scan the QR code for your child</h2>
            
            {/* Scan Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleScanQR}
                className="w-full sm:w-72 max-w-full bg-gradient-to-br from-[#032717] to-[#054d2a] py-5 px-10 rounded-xl text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-4"
              >
                <img src="/QR.svg" alt="QR Code" className="w-7 h-7" />
                Scan Code
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center text-gray-700 text-base mb-5">
              Don't have a QR code? Contact your School's GRIT Lead.
            </div>
            
            <div className="text-center text-gray-500 text-sm mb-8">
              If you are having trouble scanning the QR code, go to the URL at the bottom of the invite handout instead.
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Sign In Link */}
            <div className="text-center text-base">
              <span className="text-gray-700">Already have an account? </span>
              <button
                onClick={handleBackToFamilyLogin}
                className="text-[#032717] font-medium hover:underline"
              >
                Sign In
              </button>
            </div>

            {/* Terms Text */}
            <div className="text-center text-gray-500 text-sm mt-8">
              By signing up, I agree to the{' '}
              <a href="#" className="text-[#032717] font-medium hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#032717] font-medium hover:underline">Privacy Policy</a>
            </div>
          </>
        ) : (
          /* Other Role Login Form */
          <>
            {selectedRole !== 'admin' && (
              <button
                onClick={handleBackToRoles}
                className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-md transition-all duration-200 hover:-translate-x-1 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-[#032717]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
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
      </div>
    </div>
  )
}

export default LoginModal