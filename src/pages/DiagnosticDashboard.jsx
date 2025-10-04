import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const DiagnosticDashboard = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics = {}
    
    try {
      const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
      
      // 1. Check student_progress table structure and data
      console.log('🔍 DIAGNOSTIC: Checking student_progress table...')
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', rileyId)
      
      diagnostics.student_progress = {
        error: progressError,
        count: progressData?.length || 0,
        data: progressData,
        sample: progressData?.slice(0, 3)
      }

      // 2. Check challenges table
      console.log('🔍 DIAGNOSTIC: Checking challenges table...')
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .limit(5)
      
      diagnostics.challenges = {
        error: challengesError,
        count: challengesData?.length || 0,
        sample: challengesData
      }

      // 3. Check joined query (current approach)
      console.log('🔍 DIAGNOSTIC: Testing joined query...')
      const { data: joinedData, error: joinedError } = await supabase
        .from('student_progress')
        .select('*, challenges(*)')
        .eq('student_id', rileyId)
      
      diagnostics.joined_query = {
        error: joinedError,
        count: joinedData?.length || 0,
        data: joinedData,
        statusBreakdown: joinedData?.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1
          return acc
        }, {}) || {}
      }

      // 4. Check if Riley exists in students table
      console.log('🔍 DIAGNOSTIC: Checking Riley in students table...')
      const { data: rileyData, error: rileyError } = await supabase
        .from('students')
        .select('*')
        .eq('id', rileyId)
        .single()
      
      diagnostics.riley_student = {
        error: rileyError,
        exists: !!rileyData,
        data: rileyData
      }

      // 5. Check all student_progress records (not just Riley's)
      console.log('🔍 DIAGNOSTIC: Checking all student_progress records...')
      const { data: allProgressData, error: allProgressError } = await supabase
        .from('student_progress')
        .select('student_id, status')
        .limit(10)
      
      diagnostics.all_progress = {
        error: allProgressError,
        count: allProgressData?.length || 0,
        sample: allProgressData
      }

    } catch (error) {
      diagnostics.global_error = error
    }
    
    setResults(diagnostics)
    setLoading(false)
    
    // Log everything for easy copy-paste
    console.log('📋 FULL DIAGNOSTIC RESULTS:', diagnostics)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032717] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Running Diagnostics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#032717] mb-8">🔬 Database Diagnostics</h1>
        
        <div className="grid gap-6">
          {/* Riley Student Check */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">👤 Riley Student Record</h2>
            <div className="space-y-2">
              <p><strong>Exists:</strong> {results.riley_student?.exists ? '✅ Yes' : '❌ No'}</p>
              {results.riley_student?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.riley_student.error.message}</p>
              )}
              {results.riley_student?.data && (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(results.riley_student.data, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Student Progress for Riley */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Student Progress (Riley)</h2>
            <div className="space-y-2">
              <p><strong>Record Count:</strong> {results.student_progress?.count || 0}</p>
              {results.student_progress?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.student_progress.error.message}</p>
              )}
              {results.student_progress?.sample && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Sample Data</summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(results.student_progress.sample, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Joined Query Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🔗 Joined Query Results</h2>
            <div className="space-y-2">
              <p><strong>Record Count:</strong> {results.joined_query?.count || 0}</p>
              <p><strong>Status Breakdown:</strong></p>
              <ul className="ml-4 space-y-1">
                {Object.entries(results.joined_query?.statusBreakdown || {}).map(([status, count]) => (
                  <li key={status}>• {status}: {count}</li>
                ))}
              </ul>
              {results.joined_query?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.joined_query.error.message}</p>
              )}
              {results.joined_query?.data && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Raw Data</summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2 max-h-64">
                    {JSON.stringify(results.joined_query.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Challenges Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-grit-green" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Challenges Table
            </h2>
            <div className="space-y-2">
              <p><strong>Sample Records:</strong> {results.challenges?.count || 0}</p>
              {results.challenges?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.challenges.error.message}</p>
              )}
              {results.challenges?.sample && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Sample Data</summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(results.challenges.sample, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* All Progress Records */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">📈 All Student Progress</h2>
            <div className="space-y-2">
              <p><strong>Total Records:</strong> {results.all_progress?.count || 0}</p>
              {results.all_progress?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.all_progress.error.message}</p>
              )}
              {results.all_progress?.sample && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Sample Data</summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(results.all_progress.sample, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Global Error */}
          {results.global_error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Global Error</h2>
              <p className="text-red-600">{results.global_error.message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">💡 Next Steps</h2>
          <ol className="list-decimal ml-6 space-y-2 text-blue-700">
            <li>Check browser console for detailed logs</li>
            <li>Verify Riley's student ID exists in database</li>
            <li>Check if student_progress table has data for Riley</li>
            <li>Verify challenges table has data and proper relationships</li>
            <li>Check if status values match filter expectations</li>
          </ol>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={runDiagnostics}
            className="bg-[#032717] text-white px-6 py-2 rounded-lg hover:bg-[#054d2a] transition-colors"
          >
            🔄 Re-run Diagnostics
          </button>
          <button 
            onClick={() => window.location.href = '/family'}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Family Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticDashboard
