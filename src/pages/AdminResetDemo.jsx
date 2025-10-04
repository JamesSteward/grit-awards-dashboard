import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const AdminResetDemo = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === 'gritdemo2025') {
      setIsUnlocked(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const resetDemoData = async () => {
    setIsResetting(true)
    setStatus('Starting reset...')
    setError('')

    try {
      // Step 1: Delete all messaging data
      setStatus('Deleting existing data...')
      
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (messagesError) throw messagesError

      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (conversationsError) throw conversationsError

      const { error: evidenceError } = await supabase
        .from('evidence_submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (evidenceError) throw evidenceError


      // Step 2: Get valid challenge IDs from database
      setStatus('Fetching valid challenge IDs...')
      
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('id')
        .limit(5)
      
      if (challengesError) throw challengesError
      
      if (!challenges || challenges.length === 0) {
        throw new Error('No challenges found in database. Please ensure challenges are seeded first.')
      }
      
      // Step 3: Insert fresh test data
      setStatus('Creating fresh test data...')

      // Evidence submissions using real challenge IDs
      const evidenceSubmissions = [
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          challenge_id: challenges[0].id,
          title: 'Morning Exercise Routine',
          text_content: 'I did 20 jumping jacks and 10 push-ups before school today!',
          media_urls: ['https://example.com/exercise1.jpg'],
          status: 'pending',
          submission_type: 'challenge',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          challenge_id: challenges[1]?.id || challenges[0].id,
          title: 'Helping Classmate with Math',
          text_content: 'I helped Sarah understand fractions during lunch break.',
          media_urls: [],
          status: 'pending',
          submission_type: 'challenge',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440012',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          challenge_id: challenges[2]?.id || challenges[0].id,
          title: 'Creative Writing Story',
          text_content: 'I wrote a story about a brave knight who saves a village from a dragon.',
          media_urls: ['https://example.com/story1.jpg', 'https://example.com/story2.jpg'],
          status: 'pending',
          submission_type: 'challenge',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440013',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          challenge_id: challenges[3]?.id || challenges[0].id,
          title: 'Science Experiment',
          text_content: 'I built a volcano with baking soda and vinegar!',
          media_urls: ['https://example.com/volcano1.jpg'],
          status: 'pending',
          submission_type: 'challenge',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440014',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          challenge_id: challenges[4]?.id || challenges[0].id,
          title: 'Art Project',
          text_content: 'I painted a picture of my family.',
          media_urls: [],
          status: 'pending',
          submission_type: 'challenge',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const { error: evidenceInsertError } = await supabase
        .from('evidence_submissions')
        .insert(evidenceSubmissions)

      if (evidenceInsertError) throw evidenceInsertError

      // Conversations
      const conversations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440020',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'Evidence Review: Morning Exercise',
          conversation_type: 'evidence_review',
          evidence_submission_id: '550e8400-e29b-41d4-a716-446655440010',
          is_read: true,
          last_message_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440021',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'Evidence Review: Helping Classmate',
          conversation_type: 'evidence_review',
          evidence_submission_id: '550e8400-e29b-41d4-a716-446655440011',
          is_read: true,
          last_message_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440022',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'Evidence Review: Creative Writing',
          conversation_type: 'evidence_review',
          evidence_submission_id: '550e8400-e29b-41d4-a716-446655440012',
          is_read: false,
          last_message_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440023',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'Evidence Review: Science Experiment',
          conversation_type: 'evidence_review',
          evidence_submission_id: '550e8400-e29b-41d4-a716-446655440013',
          is_read: false,
          last_message_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440024',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'Evidence Review: Art Project',
          conversation_type: 'evidence_review',
          evidence_submission_id: '550e8400-e29b-41d4-a716-446655440014',
          is_read: false,
          last_message_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440025',
          student_id: null,
          subject: 'Year 3 Assembly Reminder',
          conversation_type: 'announcement',
          evidence_submission_id: null,
          is_read: false,
          last_message_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          year_level: 3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440026',
          student_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          subject: 'General Question',
          conversation_type: 'general',
          evidence_submission_id: null,
          is_read: true,
          last_message_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          year_level: null
        }
      ]

      const { error: conversationsInsertError } = await supabase
        .from('conversations')
        .insert(conversations)

      if (conversationsInsertError) throw conversationsInsertError

      // Messages
      const messages = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          conversation_id: '550e8400-e29b-41d4-a716-446655440020',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'Please review your exercise routine submission.',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          conversation_id: '550e8400-e29b-41d4-a716-446655440021',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'Please review your teamwork evidence submission.',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          conversation_id: '550e8400-e29b-41d4-a716-446655440022',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'Please review your story submission. I need to see it before approving.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          conversation_id: '550e8400-e29b-41d4-a716-446655440023',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'Your volcano looks amazing! Can you explain what happened when you added the vinegar?',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          conversation_id: '550e8400-e29b-41d4-a716-446655440024',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'Great effort! Please review your art project submission.',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440006',
          conversation_id: '550e8400-e29b-41d4-a716-446655440025',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440101',
          content: 'Remember: Year 3 Assembly tomorrow at 9 AM in the main hall. Please arrive 5 minutes early.',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440007',
          conversation_id: '550e8400-e29b-41d4-a716-446655440026',
          sender_type: 'family',
          sender_id: '63a61037-19ff-48e0-b9e3-53338b46a849',
          content: 'Thanks for your help with the homework!',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440008',
          conversation_id: '550e8400-e29b-41d4-a716-446655440026',
          sender_type: 'leader',
          sender_id: '550e8400-e29b-41d4-a716-446655440100',
          content: 'You\'re very welcome! Keep up the great work.',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const { error: messagesInsertError } = await supabase
        .from('messages')
        .insert(messages)

      if (messagesInsertError) throw messagesInsertError

      setStatus(`✅ Reset complete! Created: 5 evidence submissions, 7 conversations, 8 messages`)
      
    } catch (err) {
      console.error('Reset error:', err)
      setError(`Reset failed: ${err.message}`)
      setStatus('')
    } finally {
      setIsResetting(false)
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Demo Reset</h1>
            <p className="text-gray-600">Enter password to access reset functionality</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Unlock
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/family')}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Back to Family Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Data Reset</h1>
          <p className="text-gray-600">Reset messaging test data for Riley Johnson</p>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This will delete all messaging data and recreate fresh test data for Riley. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {status && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">{status}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Reset Button */}
        <div className="text-center mb-6">
          <button
            onClick={resetDemoData}
            disabled={isResetting}
            className={`px-8 py-4 text-lg font-bold rounded-lg transition-colors ${
              isResetting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isResetting ? 'Resetting...' : 'Reset Demo Data'}
          </button>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <button
            onClick={() => navigate('/family')}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Back to Family Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminResetDemo
