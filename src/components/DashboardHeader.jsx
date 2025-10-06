import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const DashboardHeader = ({ userType }) => {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.email) return

      try {
        if (userType === 'family') {
          // For family users, get student first name
          const { data, error } = await supabase
            .from('students')
            .select('first_name')
            .eq('family_user_id', user.id)
            .single()

          if (error) {
            console.error('Error fetching student name:', error)
            setUserName('User')
          } else {
            setUserName(data?.first_name || 'User')
          }
        } else if (userType === 'leader') {
          // For leader users, get full name from users table
          const { data, error } = await supabase
            .from('users')
            .select('full_name')
            .eq('email', user.email)
            .single()

          if (error) {
            console.error('Error fetching user name:', error)
            setUserName('User')
          } else {
            setUserName(data?.full_name?.split(' ')[0] || 'User')
          }
        }
      } catch (err) {
        console.error('Error fetching user name:', err)
        setUserName('User')
      } finally {
        setLoading(false)
      }
    }

    fetchUserName()
  }, [user, userType])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/GRIT-logo-white.svg" alt="GRIT Awards" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-semibold">Dashboard</span>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {!loading && userName && (
              <span className="text-sm">
                Welcome, <span className="font-medium">{userName}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-grit-gold-dark hover:text-white transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
