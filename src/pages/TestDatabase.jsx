import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const TestDatabase = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper function to format award display
  const formatAward = (award) => {
    const awardMap = {
      'cadets': "Cadet",
      'second_lieutenants': "Second Lieutenant",
      'lieutenants': "Lieutenant",
      'captains': "Captain's Award",
      'majors': "Major's Award",
      'lt_colonels': "Lieutenant Colonel's Award",
      'colonels': "Colonel",
      'brigadiers': "Brigadier",
      'major_generals': "Major General",
      'lt_generals': "Lieutenant General",
      'generals': "General",
      'field_marshals': "Field Marshal"
    };
    return awardMap[award] || award;
  };

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, year_level, current_award, progress_percentage, current_streak, avatar')
        .order('last_name')
      
      if (error) {
        throw error
      }
      
      setStudents(data || [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grit-green mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-grit-red mb-4">
            Database Connection Error
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={fetchStudents}
            className="bg-grit-green text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-grit-green mb-4">
            Database Connection Test
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Testing Supabase connection with students table
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block">
            ✅ Connection successful! Found {students.length} students
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-500">
              The students table exists but contains no data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <img 
                    src={`/avatars/${student.avatar || 'avatar-astronaut-001.svg'}`} 
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-12 h-12 rounded-full border-2 border-[#032717] mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-grit-green">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Year {student.year_level}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Award:</span>
                    <span className="text-sm font-medium text-grit-gold-dark">
                      {formatAward(student.current_award) || 'None'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <span className="text-sm font-medium text-grit-green">
                      {student.progress_percentage || 0}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Streak:</span>
                    <span className="text-sm font-medium text-grit-red">
                      {student.current_streak || 0} days
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-grit-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchStudents}
            className="bg-grit-green text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all mr-4"
          >
            Refresh Data
          </button>
          <a
            href="/"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default TestDatabase
