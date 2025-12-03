import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import GrungeOverlay from '../components/GrungeOverlay'
import { supabase } from '../lib/supabaseClient'

const StudentDetail = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  
  // Data states
  const [student, setStudent] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI states
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [showAllAvailable, setShowAllAvailable] = useState(false)
  const [approvingId, setApprovingId] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({ show: false, evidenceId: null, feedback: '' })
  const [successMessage, setSuccessMessage] = useState('')

  // Teacher ID for approvals
  const teacherId = '750e8400-e29b-41d4-a716-446655440000'

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
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (studentError) throw studentError

      // Fetch student progress with challenges
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*, challenges(*)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (progressError) throw progressError

      // Calculate real progress
      const totalChallenges = progressData?.length || 0
      const approvedChallenges = progressData?.filter(p => p.status === 'approved').length || 0
      const calculatedProgress = totalChallenges > 0 ? Math.round((approvedChallenges / totalChallenges) * 100) : 0

      // Add calculated progress to student data
      const studentWithProgress = {
        ...studentData,
        calculated_progress: calculatedProgress,
        total_challenges: totalChallenges,
        approved_challenges: approvedChallenges
      }

      setStudent(studentWithProgress)
      setChallenges(progressData || [])

      // Generate recent activity from progress data
      const activity = (progressData || []).slice(0, 10).map(progress => ({
        id: progress.id,
        type: progress.status === 'approved' ? 'completed' : 
              progress.status === 'submitted' ? 'submitted' : 
              progress.status === 'in_progress' ? 'started' : 'added',
        challenge: progress.challenges,
        timestamp: progress.status === 'approved' ? progress.completed_at : progress.created_at,
        status: progress.status
      }))

      setRecentActivity(activity)

    } catch (err) {
      console.error('Error fetching student data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveEvidence = async (progressId) => {
    try {
      setApprovingId(progressId)
      
      const { error } = await supabase
        .from('student_progress')
        .update({ 
          status: 'approved',
          approved_by: teacherId,
          completed_at: new Date().toISOString()
        })
        .eq('id', progressId)
      
      if (error) throw error
      
      setSuccessMessage('Evidence approved!')
      await fetchStudentData()
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Error approving evidence:', err)
      alert('Failed to approve evidence. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRequestChanges = async () => {
    if (!feedbackModal.feedback.trim()) return
    
    try {
      const { error } = await supabase
        .from('student_progress')
        .update({ 
          status: 'in_progress',
          feedback: feedbackModal.feedback.trim()
        })
        .eq('id', feedbackModal.evidenceId)
      
      if (error) throw error
      
      setSuccessMessage('Feedback sent!')
      setFeedbackModal({ show: false, evidenceId: null, feedback: '' })
      await fetchStudentData()
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Error sending feedback:', err)
      alert('Failed to send feedback. Please try again.')
    }
  }

  // Filter challenges by status
  const activeChallenges = challenges.filter(c => c.status === 'in_progress' || c.status === 'submitted')
  const completedChallenges = challenges.filter(c => c.status === 'approved')
  const availableChallenges = challenges.filter(c => c.status === 'not_started')

  // Pagination for completed and available
  const displayedCompleted = showAllCompleted ? completedChallenges : completedChallenges.slice(0, 5)
  const displayedAvailable = showAllAvailable ? availableChallenges : availableChallenges.slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032717] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Student</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchStudentData()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/leader')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Not Found</h2>
          <button 
            onClick={() => navigate('/leader')}
            className="bg-[#032717] text-white px-6 py-2 rounded-lg hover:bg-[#054d2a]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Student Header */}
      <div className="bg-gradient-to-br from-[#032717] to-[#054d2a] text-white py-8 px-5 relative overflow-hidden">
        <GrungeOverlay />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/leader')}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-right">
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#b5aa91] flex items-center justify-center shadow-lg">
                <img 
                  src={`/avatars/${student.avatar || 'avatar-pilot-001.svg'}`} 
                  alt={`${student.first_name} ${student.last_name}`}
                  className="w-20 h-20 rounded-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {student.first_name} {student.last_name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  Year {student.year_level}
                </span>
                <span className="bg-[#847147] px-3 py-1 rounded-full text-sm font-medium">
                  {formatAward(student.current_award)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{student.calculated_progress || 0}%</div>
                  <div className="text-sm opacity-75">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{student.current_streak || 0}</div>
                  <div className="text-sm opacity-75">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{student.total_badges || 0}</div>
                  <div className="text-sm opacity-75">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Challenge Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Active Challenges */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#032717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800">Active Challenges</h2>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {activeChallenges.length}
              </span>
            </div>
            <div className="space-y-3">
              {activeChallenges.length > 0 ? (
                activeChallenges.map(challenge => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">
                          {challenge.challenges?.title || 'Unknown Challenge'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {challenge.challenges?.description || 'No description available'}
                        </p>
                        <div className="flex gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {challenge.challenges?.trait || 'N/A'}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            {challenge.challenges?.points || 0} pts
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {challenge.challenges?.pathway || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            challenge.status === 'in_progress' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {challenge.status === 'in_progress' ? 'In Progress' : 'Submitted'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Started: {new Date(challenge.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {challenge.status === 'submitted' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleApproveEvidence(challenge.id)}
                            variant="primary"
                            disabled={approvingId === challenge.id}
                          >
                            {approvingId === challenge.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => setFeedbackModal({ show: true, evidenceId: challenge.id, feedback: '' })}
                            variant="secondary"
                          >
                            Request Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No active challenges</p>
              )}
            </div>
          </div>

          {/* Completed Challenges */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800">Completed Challenges</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {completedChallenges.length}
              </span>
            </div>
            <div className="space-y-3">
              {displayedCompleted.map(challenge => (
                <div key={challenge.id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {challenge.challenges?.title || 'Unknown Challenge'}
                      </h3>
                      <div className="flex gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {challenge.challenges?.trait || 'N/A'}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          {challenge.challenges?.points || 0} pts
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Completed: {challenge.completed_at ? new Date(challenge.completed_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ))}
              {completedChallenges.length > 5 && (
                <button
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="w-full text-center py-2 text-[#032717] hover:text-[#054d2a] font-medium"
                >
                  {showAllCompleted ? 'Show Less' : `See More (${completedChallenges.length - 5} more)`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Available Challenges */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Available Challenges</h2>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {availableChallenges.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {displayedAvailable.map(challenge => (
              <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-1">
                  {challenge.challenges?.title || 'Unknown Challenge'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {challenge.challenges?.description || 'No description available'}
                </p>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {challenge.challenges?.trait || 'N/A'}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {challenge.challenges?.points || 0} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
          {availableChallenges.length > 5 && (
            <button
              onClick={() => setShowAllAvailable(!showAllAvailable)}
              className="w-full text-center py-2 text-[#032717] hover:text-[#054d2a] font-medium mt-4"
            >
              {showAllAvailable ? 'Show Less' : `See More (${availableChallenges.length - 5} more)`}
            </button>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#032717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'completed' ? 'bg-green-100' :
                  activity.type === 'submitted' ? 'bg-blue-100' :
                  activity.type === 'started' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'completed' ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : activity.type === 'submitted' ? (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : activity.type === 'started' ? (
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">
                      {activity.type === 'completed' ? 'Completed' :
                       activity.type === 'submitted' ? 'Submitted' :
                       activity.type === 'started' ? 'Started' : 'Added'}
                    </span>
                    {' '}
                    <span className="font-medium">{activity.challenge?.title || 'Unknown Challenge'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Request Changes</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback for student:
              </label>
              <textarea
                value={feedbackModal.feedback}
                onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Explain what changes are needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRequestChanges}
                variant="primary"
                className="flex-1"
              >
                Send Feedback
              </Button>
              <Button
                onClick={() => setFeedbackModal({ show: false, evidenceId: null, feedback: '' })}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDetail
