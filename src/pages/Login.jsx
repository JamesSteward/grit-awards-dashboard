import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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

      // Redirect based on user_type
      if (userData.user_type === 'family') {
        navigate('/family')
      } else if (userData.user_type === 'leader') {
        navigate('/leader')
      } else {
        setError('Invalid user type')
        setLoading(false)
      }

    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* GRIT Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-green-600 mb-2">GRIT</div>
          <div className="text-grit-gold">Awards Dashboard</div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-grit-gold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="riley, mia, or andy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-grit-gold mb-2">
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
        <div className="mt-6 text-center text-sm text-grit-gold-dark">
          <p>Demo accounts:</p>
          <p>riley / password (Family)</p>
          <p>mia / password (Family)</p>
          <p>andy / password (Leader)</p>
        </div>
      </div>
    </div>
  )
}

export default Login
