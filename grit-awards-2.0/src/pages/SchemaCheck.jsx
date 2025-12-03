import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const SchemaCheck = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSchema()
  }, [])

  const checkSchema = async () => {
    setLoading(true)
    const diagnostics = {}
    
    try {
      // 1. Get sample student_progress record to see actual structure
      console.log('🔍 Checking student_progress table structure...')
      const { data: sampleData, error: sampleError } = await supabase
        .from('student_progress')
        .select('*')
        .limit(1)
      
      diagnostics.sample_record = {
        error: sampleError,
        data: sampleData?.[0],
        columns: sampleData?.[0] ? Object.keys(sampleData[0]) : []
      }

      // 2. Try to get Riley's existing records to see column structure
      const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
      const { data: rileyData, error: rileyError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', rileyId)
        .limit(1)
      
      diagnostics.riley_record = {
        error: rileyError,
        data: rileyData?.[0],
        columns: rileyData?.[0] ? Object.keys(rileyData[0]) : []
      }

      // 3. Test join with challenges using different possible column names
      const possibleColumns = ['challenge_id', 'objective_id', 'challenges_id']
      
      for (const col of possibleColumns) {
        try {
          console.log(`🔍 Testing join with ${col}...`)
          const { data: joinTest, error: joinError } = await supabase
            .from('student_progress')
            .select(`*, challenges(*)`)
            .limit(1)
          
          diagnostics[`join_test_${col}`] = {
            error: joinError,
            success: !joinError && joinTest?.length > 0,
            data: joinTest?.[0]
          }
        } catch (err) {
          diagnostics[`join_test_${col}`] = {
            error: err,
            success: false
          }
        }
      }

      // 4. Check if we can access schema information
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_schema', { table_name: 'student_progress' })
        
        diagnostics.schema_info = {
          error: schemaError,
          data: schemaData
        }
      } catch (err) {
        diagnostics.schema_info = {
          error: 'RPC function not available',
          note: 'Schema check via RPC failed - normal if function not created'
        }
      }

    } catch (error) {
      diagnostics.global_error = error
    }
    
    setResults(diagnostics)
    setLoading(false)
    
    // Log everything for easy analysis
    console.log('📋 SCHEMA CHECK RESULTS:', diagnostics)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032717] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Checking Schema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#032717] mb-8">🔬 Schema Check Results</h1>
        
        <div className="grid gap-6">
          {/* Sample Record Structure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Sample student_progress Record</h2>
            <div className="space-y-2">
              <p><strong>Columns Found:</strong></p>
              <div className="bg-blue-50 p-3 rounded">
                {results.sample_record?.columns.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {results.sample_record.columns.map((col, index) => (
                      <li key={index} className={col.includes('challenge') || col.includes('objective') ? 'font-bold text-blue-600' : ''}>
                        {col}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No columns found or no data</p>
                )}
              </div>
              {results.sample_record?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.sample_record.error.message}</p>
              )}
              {results.sample_record?.data && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Raw Data</summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(results.sample_record.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {/* Riley's Record Structure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">👤 Riley's student_progress Record</h2>
            <div className="space-y-2">
              <p><strong>Columns in Riley's Record:</strong></p>
              <div className="bg-green-50 p-3 rounded">
                {results.riley_record?.columns.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {results.riley_record.columns.map((col, index) => (
                      <li key={index} className={col.includes('challenge') || col.includes('objective') ? 'font-bold text-green-600' : ''}>
                        {col}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No data found for Riley</p>
                )}
              </div>
              {results.riley_record?.error && (
                <p className="text-red-600"><strong>Error:</strong> {results.riley_record.error.message}</p>
              )}
            </div>
          </div>

          {/* Join Test Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🔗 Foreign Key Detection</h2>
            <div className="space-y-4">
              {['challenge_id', 'objective_id', 'challenges_id'].map(col => (
                <div key={col} className="border rounded p-3">
                  <h3 className="font-semibold">Testing: {col}</h3>
                  {results[`join_test_${col}`] ? (
                    <div className={`mt-2 p-2 rounded ${results[`join_test_${col}`].success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {results[`join_test_${col}`].success ? '✅ JOIN WORKS' : '❌ JOIN FAILED'}
                      {results[`join_test_${col}`].error && (
                        <p className="text-sm mt-1">Error: {results[`join_test_${col}`].error.message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-2">Not tested</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">💡 Next Steps</h2>
            <div className="space-y-2 text-blue-700">
              <p><strong>Based on the results above:</strong></p>
              <ol className="list-decimal ml-6 space-y-1">
                <li>Look for columns highlighted in <strong className="text-blue-600">blue/green</strong> - these are likely the foreign key</li>
                <li>Check which JOIN test shows ✅ - that's the correct column name</li>
                <li>If no clear foreign key found, check the raw data structure</li>
                <li>Update the SQL script with the correct column name</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={checkSchema}
            className="bg-[#032717] text-white px-6 py-2 rounded-lg hover:bg-[#054d2a] transition-colors"
          >
            🔄 Re-check Schema
          </button>
          <button 
            onClick={() => window.location.href = '/diagnostic'}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Diagnostics
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchemaCheck







