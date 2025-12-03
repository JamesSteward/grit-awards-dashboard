import React, { useState, useEffect } from 'react'
import Button from '../components/Button'
import GrungeOverlay from '../components/GrungeOverlay'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const LeaderDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('students')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Data states
  const [students, setStudents] = useState([])
  const [pendingEvidence, setPendingEvidence] = useState([])
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({
    activeChallenges: 0,
    weeklyCompletions: 0
  })
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState('name') // 'name', 'progress', 'grit_points'
  const [sortDirection, setSortDirection] = useState('asc') // 'asc', 'desc'

  // Messaging states
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [composeMessage, setComposeMessage] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Evidence approval states
  const [approvingId, setApprovingId] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({ show: false, evidenceId: null, feedback: '' })
  const [pointsModal, setPointsModal] = useState({ show: false, evidenceId: null, submissionType: null })
  const [selectedPoints, setSelectedPoints] = useState(5)
  
  // Announcement states
  const [announcementFilters, setAnnouncementFilters] = useState({
    yearLevel: 'all',        // 'all', '3', '4', '5', '6'
    completionStatus: 'all', // 'all', 'active', 'completed_3_plus'
    hasActiveChallenges: false // boolean filter
  })
  const [recipientCount, setRecipientCount] = useState(0)

  // School ID - in real app, this would come from user auth
  // For now, using the school ID from our seeded data
  const schoolId = '550e8400-e29b-41d4-a716-446655440000'
  
  // Teacher ID - in real app, this would come from user auth
  // For now, using a placeholder teacher ID
  const teacherId = '750e8400-e29b-41d4-a716-446655440000'

  // Helper function to update recipient count
  const updateRecipientCount = async () => {
    try {
      // Build filtered student query
      let query = supabase
        .from('students')
        .select('id, first_name, last_name, year_level')
        .eq('school_id', schoolId)
      
      // Apply year filter
      if (announcementFilters.yearLevel !== 'all') {
        query = query.eq('year_level', announcementFilters.yearLevel)
      }
      
      const { data: filteredStudents, error: studentsError } = await query
      
      if (studentsError) {
        console.error('Error fetching students for count:', studentsError)
        setRecipientCount(0)
        return
      }
      
      // Further filter by completion status if needed
      let targetStudents = filteredStudents || []
      
      if (announcementFilters.completionStatus === 'active') {
        // Get students with active challenges
        const { data: activeProgress } = await supabase
          .from('student_progress')
          .select('student_id')
          .in('status', ['in_progress', 'submitted'])
        
        const activeStudentIds = new Set(activeProgress?.map(p => p.student_id))
        targetStudents = filteredStudents.filter(s => activeStudentIds.has(s.id))
      }
      
      if (announcementFilters.completionStatus === 'completed_3_plus') {
        // Get students who completed 3+ this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const { data: weeklyCompletions } = await supabase
          .from('student_progress')
          .select('student_id')
          .eq('status', 'approved')
          .gte('completed_at', oneWeekAgo.toISOString())
        
        // Count completions per student
        const completionCounts = {}
        weeklyCompletions?.forEach(p => {
          completionCounts[p.student_id] = (completionCounts[p.student_id] || 0) + 1
        })
        
        targetStudents = filteredStudents.filter(s => (completionCounts[s.id] || 0) >= 3)
      }
      
      setRecipientCount(targetStudents.length)
    } catch (err) {
      console.error('Error updating recipient count:', err)
      setRecipientCount(0)
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

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
    fetchAllData()
  }, [])

  // Update recipient count when announcement modal opens
  useEffect(() => {
    if (showAnnouncementModal) {
      updateRecipientCount()
    }
  }, [showAnnouncementModal])

  // Function to fetch Riley's specific data for testing
  const fetchRileyData = async () => {
    const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
    
    try {
      // Fetch Riley's student_progress records
      const { data: rileyProgress, error: rileyError } = await supabase
        .from('student_progress')
        .select('*, challenges(*)')
        .eq('student_id', rileyId)
      
      if (rileyError) {
        console.error('Error fetching Riley data:', rileyError)
        return null
      }
      
      // Count by status
      const statusCounts = {
        in_progress: rileyProgress?.filter(p => p.status === 'in_progress').length || 0,
        submitted: rileyProgress?.filter(p => p.status === 'submitted').length || 0,
        approved: rileyProgress?.filter(p => p.status === 'approved').length || 0,
        not_started: rileyProgress?.filter(p => p.status === 'not_started').length || 0
      }
      
      console.log('Riley Data Summary:', {
        total: rileyProgress?.length || 0,
        ...statusCounts,
        sampleChallenges: rileyProgress?.slice(0, 3).map(p => ({
          title: p.challenges?.title,
          trait: p.challenges?.trait,
          points: p.challenges?.points,
          status: p.status
        }))
      })
      
      return { rileyProgress, statusCounts }
    } catch (err) {
      console.error('Error in fetchRileyData:', err)
      return null
    }
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch Riley's data for testing
      await fetchRileyData()
      
      // Fetch students for this school
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
      
      if (studentsError) throw studentsError
      
      // Calculate real progress for each student
      const studentsWithCalculatedProgress = await Promise.all(
        (studentsData || []).map(async (student) => {
          try {
            // Get all progress records for this student with challenges data
            const { data: progressData, error: progressError } = await supabase
              .from('student_progress')
              .select('status, challenges(points)')
              .eq('student_id', student.id)
            
            if (progressError) {
              console.warn(`Error fetching progress for ${student.first_name}:`, progressError)
              return { ...student, calculated_progress: 0, total_challenges: 0, approved_challenges: 0, grit_points: 0 }
            }
            
            const totalChallenges = progressData?.length || 0
            const approvedChallenges = progressData?.filter(p => p.status === 'approved').length || 0
            const calculatedProgress = totalChallenges > 0 ? Math.round((approvedChallenges / totalChallenges) * 100) : 0
            
            // Calculate GRIT points from approved challenges
            const gritPoints = progressData
              ?.filter(p => p.status === 'approved')
              ?.reduce((total, progress) => total + (progress.challenges?.points || 0), 0) || 0
            
            console.log(`📊 ${student.first_name} ${student.last_name}:`, {
              total: totalChallenges,
              approved: approvedChallenges,
              calculated: calculatedProgress,
              grit_points: gritPoints,
              database: student.progress_percentage
            })
            
            return {
              ...student,
              calculated_progress: calculatedProgress,
              total_challenges: totalChallenges,
              approved_challenges: approvedChallenges,
              grit_points: gritPoints
            }
          } catch (err) {
            console.warn(`Error calculating progress for ${student.first_name}:`, err)
            return { ...student, calculated_progress: 0, total_challenges: 0, approved_challenges: 0, grit_points: 0 }
          }
        })
      )
      
      // Fetch evidence submissions without the problematic join
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence_submissions')
        .select(`
          *,
          students(id, first_name, last_name, year_level, avatar),
          challenges(id, title, trait, points, pathway, description)
        `)
        .in('status', ['pending', 'needs_revision'])
        .order('created_at', { ascending: false })

      if (evidenceError) throw evidenceError

      // Fetch conversations for these evidence submissions
      if (evidenceData && evidenceData.length > 0) {
        const evidenceIds = evidenceData.map(e => e.id)
        
        const { data: conversationsData, error: convError } = await supabase
          .from('conversations')
          .select('id, subject, evidence_submission_id')
          .in('evidence_submission_id', evidenceIds)
        
        if (!convError && conversationsData) {
          // Attach conversations to evidence objects
          evidenceData.forEach(evidence => {
            const conversation = conversationsData.find(c => c.evidence_submission_id === evidence.id)
            if (conversation) {
              evidence.conversations = {
                id: conversation.id,
                subject: conversation.subject
              }
            }
          })
        }
      }
      
      // Fetch messages (placeholder for now)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*, conversations(*, students(first_name, last_name, avatar))')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (messagesError) throw messagesError
      
      setStudents(studentsWithCalculatedProgress || [])
      setPendingEvidence(evidenceData || [])
      setMessages(messagesData || [])
      
      // Calculate real weekly completions from approved challenges in last 7 days
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: weeklyCompletionsData, error: weeklyError } = await supabase
        .from('student_progress')
        .select('id')
        .eq('status', 'approved')
        .gte('completed_at', oneWeekAgo.toISOString())
      
      if (weeklyError) {
        console.warn('Could not fetch weekly completions:', weeklyError)
      }
      
      // Calculate active challenges (in_progress + submitted)
      const { data: activeChallengesData, error: activeError } = await supabase
        .from('student_progress')
        .select('id')
        .in('status', ['in_progress', 'submitted'])
      
      if (activeError) {
        console.warn('Could not fetch active challenges:', activeError)
      }
      
      // Calculate stats
      setStats({
        activeChallenges: (activeChallengesData || []).length,
        weeklyCompletions: (weeklyCompletionsData || []).length
      })
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = yearFilter === 'all' || student.year_level.toString() === yearFilter
    
    return matchesSearch && matchesYear
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue, bValue
    
    switch (sortColumn) {
      case 'progress':
        aValue = a.calculated_progress || 0
        bValue = b.calculated_progress || 0
        break
      case 'grit_points':
        aValue = a.grit_points || 0
        bValue = b.grit_points || 0
        break
      case 'name':
      default:
        aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
        bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
        break
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, start with ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleApproveEvidence = async (submissionId, submissionType, challengeId) => {
    try {
      setApprovingId(submissionId)
      
      // For GRIT bits, show points selector modal first
      if (submissionType === 'grit_bit') {
        setPointsModal({ show: true, evidenceId: submissionId, submissionType: 'grit_bit' })
        setApprovingId(null)
        return
      }
      
      // Update evidence_submissions
      const updateData = { status: 'approved' }
      
      const { error: updateError } = await supabase
        .from('evidence_submissions')
        .update(updateData)
        .eq('id', submissionId)
      
      if (updateError) throw updateError
      
      // Create approval message in conversation
      const evidence = pendingEvidence.find(e => e.id === submissionId)
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: evidence.conversations.id,
          sender_type: 'leader',
          sender_id: teacherId,
          content: `Great work! I've approved your ${evidence.challenges?.title} challenge. Keep up the GRIT!`,
          is_read: false
        })
      
      if (messageError) throw messageError
      
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', evidence.conversations.id)
      
      setSuccessMessage('Evidence approved!')
      await fetchAllData()
    } catch (err) {
      console.error('Error approving evidence:', err)
      alert('Failed to approve. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleAwardPoints = async () => {
    try {
      setApprovingId(pointsModal.evidenceId)
      
      const evidence = pendingEvidence.find(e => e.id === pointsModal.evidenceId)
      
      // Update evidence_submissions with awarded points
      const { error: updateError } = await supabase
        .from('evidence_submissions')
        .update({ 
          status: 'approved',
          awarded_points: selectedPoints
        })
        .eq('id', pointsModal.evidenceId)
      
      if (updateError) throw updateError
      
      // Create approval message in conversation
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: evidence.conversations.id,
          sender_type: 'leader',
          sender_id: teacherId,
          content: `Amazing GRIT moment! I've awarded ${selectedPoints} points for ${evidence.title}.`,
          is_read: false
        })
      
      if (messageError) throw messageError
      
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', evidence.conversations.id)
      
      setSuccessMessage(`GRIT Bit approved with ${selectedPoints} points!`)
      setPointsModal({ show: false, evidenceId: null, submissionType: null })
      await fetchAllData()
    } catch (err) {
      console.error('Error awarding points:', err)
      alert('Failed to award points. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRequestChanges = async (submissionId) => {
    setFeedbackModal({ show: true, evidenceId: submissionId, feedback: '' })
  }

  const handleSendFeedback = async () => {
    if (!feedbackModal.feedback.trim()) return
    
    try {
      setSendingMessage(true)
      
      const evidence = pendingEvidence.find(e => e.id === feedbackModal.evidenceId)
      
      // Update evidence status
      const { error: updateError } = await supabase
        .from('evidence_submissions')
        .update({ status: 'needs_revision' })
        .eq('id', feedbackModal.evidenceId)
      
      if (updateError) throw updateError
      
      // Send feedback message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: evidence.conversations.id,
          sender_type: 'leader',
          sender_id: teacherId,
          content: feedbackModal.feedback.trim(),
          is_read: false
        })
      
      if (messageError) throw messageError
      
      // Update conversation
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          is_read: false 
        })
        .eq('id', evidence.conversations.id)
      
      setSuccessMessage('Feedback sent!')
      setFeedbackModal({ show: false, evidenceId: null, feedback: '' })
      await fetchAllData()
      
    } catch (err) {
      console.error('Error sending feedback:', err)
      alert('Failed to send feedback. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Messaging functions
  const handleComposeMessage = async () => {
    if (!selectedStudent || !composeMessage.trim()) return
    
    try {
      setSendingMessage(true)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: 'teacher-uuid', // In real app, this would be the logged-in teacher's ID
          recipient_id: selectedStudent.family_user_id,
          student_id: selectedStudent.id,
          content: composeMessage.trim(),
          message_type: 'teacher_to_family'
        })
      
      if (error) throw error
      
      setSuccessMessage(`Message sent to ${selectedStudent.first_name} ${selectedStudent.last_name}'s family!`)
      setComposeMessage('')
      setSelectedStudent(null)
      setShowComposeModal(false)
      
      // Refresh messages
      fetchAllData()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcementMessage.trim()) return
    
    try {
      setSendingMessage(true)
      
      // Build filtered student query
      let query = supabase
        .from('students')
        .select('id, first_name, last_name, year_level')
        .eq('school_id', schoolId)
      
      // Apply year filter
      if (announcementFilters.yearLevel !== 'all') {
        query = query.eq('year_level', announcementFilters.yearLevel)
      }
      
      const { data: filteredStudents, error: studentsError } = await query
      
      if (studentsError) throw studentsError
      
      // Further filter by completion status if needed
      let targetStudents = filteredStudents || []
      
      if (announcementFilters.completionStatus === 'active') {
        // Get students with active challenges
        const { data: activeProgress } = await supabase
          .from('student_progress')
          .select('student_id')
          .in('status', ['in_progress', 'submitted'])
        
        const activeStudentIds = new Set(activeProgress?.map(p => p.student_id))
        targetStudents = filteredStudents.filter(s => activeStudentIds.has(s.id))
      }
      
      if (announcementFilters.completionStatus === 'completed_3_plus') {
        // Get students who completed 3+ this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const { data: weeklyCompletions } = await supabase
          .from('student_progress')
          .select('student_id')
          .eq('status', 'approved')
          .gte('completed_at', oneWeekAgo.toISOString())
        
        // Count completions per student
        const completionCounts = {}
        weeklyCompletions?.forEach(p => {
          completionCounts[p.student_id] = (completionCounts[p.student_id] || 0) + 1
        })
        
        targetStudents = filteredStudents.filter(s => (completionCounts[s.id] || 0) >= 3)
      }
      
      if (targetStudents.length === 0) {
        alert('No students match the selected filters.')
        return
      }
      
      // Create conversations and messages for each target student
      const conversationsToInsert = targetStudents.map(student => ({
        student_id: student.id,
        evidence_submission_id: null, // Required field
        year_level: announcementFilters.yearLevel !== 'all' ? `Year ${announcementFilters.yearLevel}` : null,
        conversation_type: 'announcement',
        subject: 'Announcement from GRIT Leader',
        is_read: false
        // Remove created_at and last_message_at - let database set defaults
      }))
      
      const { data: newConversations, error: convError } = await supabase
        .from('conversations')
        .insert(conversationsToInsert)
        .select()
      
      if (convError) {
        console.error('Error creating conversations:', convError)
        throw convError
      }
      
      // Create messages for each conversation
      const messagesToInsert = newConversations.map(conv => ({
        conversation_id: conv.id,
        sender_type: 'leader',
        sender_id: teacherId,
        content: announcementMessage.trim(),
        is_read: false
      }))
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert(messagesToInsert)
      
      if (messageError) throw messageError
      
      setSuccessMessage(`Announcement sent to ${targetStudents.length} families!`)
      setAnnouncementMessage('')
      setAnnouncementFilters({
        yearLevel: 'all',
        completionStatus: 'all',
        hasActiveChallenges: false
      })
      setShowAnnouncementModal(false)
      
      await fetchAllData()
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Error sending announcement:', err)
      alert('Failed to send announcement. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleViewConversation = async (messageOrEvidence) => {
    try {
      console.log('DEBUG: messageOrEvidence object:', messageOrEvidence)
      
      const conversationId = messageOrEvidence.conversation_id || messageOrEvidence.conversations?.id
      
      console.log('DEBUG: Extracted conversationId:', conversationId)
      
      if (!conversationId) {
        throw new Error('No conversation ID found')
      }
      
      // Handle both message objects and evidence objects
      const student = messageOrEvidence.conversations?.students || messageOrEvidence.students
      
      setSelectedFamily(null) // No direct family reference in new structure
      setSelectedStudent(student)
      
      // Fetch full conversation thread
      const { data: conversationData, error } = await supabase
        .from('messages')
        .select('*, conversations(*, students(first_name, last_name, avatar))')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      setConversationMessages(conversationData || [])
      setShowConversationModal(true)
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'family')
      
    } catch (err) {
      console.error('Error fetching conversation:', err)
      alert(`Failed to load conversation: ${err.message}`)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedStudent) return
    
    try {
      setSendingMessage(true)
      
      // Get the conversation ID from the conversation modal
      const conversationId = conversationMessages[0]?.conversation_id
      
      if (!conversationId) {
        throw new Error('No conversation ID found')
      }
      
      // Insert the reply message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'leader',
          sender_id: teacherId,
          content: replyMessage.trim(),
          is_read: false
        })
      
      if (messageError) throw messageError
      
      // Update conversation timestamp
      const { error: convError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          is_read: false 
        })
        .eq('id', conversationId)
      
      if (convError) throw convError
      
      // Clear reply and refresh the conversation
      setReplyMessage('')
      
      // Reload messages in the modal
      const { data: updatedMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      setConversationMessages(updatedMessages || [])
      
    } catch (err) {
      console.error('Error sending reply:', err)
      alert(`Failed to send reply: ${err.message}`)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grit-green mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
            <h2 className="text-2xl font-heading font-bold text-grit-red mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchAllData} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-grit-green text-white rounded-lg p-8 mb-8 shadow-lg relative overflow-hidden">
          <GrungeOverlay />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div>
                <h1 className="text-4xl font-heading font-bold mb-2">
                  Welcome, Mr Mackenzie
                </h1>
                <p className="text-grit-gold-light text-lg">
                  St Peter's Catholic Primary School
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 lg:mt-0">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-grit-gold-light text-sm">Active Challenges</p>
                  <p className="text-2xl font-bold">{stats.activeChallenges}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-grit-gold-light text-sm">This Week's Completions</p>
                  <p className="text-2xl font-bold">{stats.weeklyCompletions}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'students', label: 'Students' },
                    { id: 'evidence', label: 'Pending Evidence', count: pendingEvidence.length },
                    { id: 'messages', label: 'Messages', count: messages.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-grit-green text-grit-green'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-2 bg-grit-green text-white text-xs rounded-full px-2 py-1">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div>
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </div>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent bg-white min-w-[140px]"
                      >
                        <option value="all">All Years</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                        <option value="6">Year 6</option>
                      </select>
                    </div>

                    {/* Students Table */}
                    {sortedStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
                          No Students Found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm || yearFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No students are enrolled in your school yet.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Year</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Current Award</th>
                              <th 
                                className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-grit-green transition-colors select-none"
                                onClick={() => handleSort('progress')}
                              >
                                <div className="flex items-center gap-1">
                                  Progress
                                  <div className="flex flex-col">
                                    <svg 
                                      className={`w-3 h-3 ${sortColumn === 'progress' && sortDirection === 'asc' ? 'text-grit-green' : 'text-gray-400'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    <svg 
                                      className={`w-3 h-3 -mt-1 ${sortColumn === 'progress' && sortDirection === 'desc' ? 'text-grit-green' : 'text-gray-400'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th 
                                className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-grit-green transition-colors select-none"
                                onClick={() => handleSort('grit_points')}
                              >
                                <div className="flex items-center gap-1">
                                  GRIT Points
                                  <div className="flex flex-col">
                                    <svg 
                                      className={`w-3 h-3 ${sortColumn === 'grit_points' && sortDirection === 'asc' ? 'text-grit-green' : 'text-gray-400'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    <svg 
                                      className={`w-3 h-3 -mt-1 ${sortColumn === 'grit_points' && sortDirection === 'desc' ? 'text-grit-green' : 'text-gray-400'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                  </div>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedStudents.map((student) => (
                              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-4 px-4">
                                  <div 
                                    className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                                    onClick={() => navigate(`/leader/student/${student.id}`)}
                                  >
                                    <img src={`/avatars/${student.avatar || 'avatar-astronaut-001.svg'}`} alt={student.first_name} className="w-10 h-10 rounded-full mr-3" />
                                    <div>
                                      <p className="font-medium text-gray-900 hover:text-[#032717] transition-colors">
                                        {student.first_name} {student.last_name}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="inline-block bg-grit-gold-light text-grit-green px-3 py-1 rounded-full text-sm font-medium">
                                    {student.year_level}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <p className="text-gray-900">
                                    {formatAward(student.current_award) || 'No award yet'}
                                  </p>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center">
                                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-grit-green h-2 rounded-full"
                                        style={{ width: `${student.calculated_progress || 0}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {student.calculated_progress || 0}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-lg font-semibold text-[#032717]">
                                    {student.grit_points || 0}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Evidence Tab */}
                {activeTab === 'evidence' && (
                  <div>
                    {pendingEvidence.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
                          No Pending Evidence
                        </h3>
                        <p className="text-gray-500">
                          All evidence has been reviewed. Great work!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingEvidence.map((evidence) => (
                          <div key={evidence.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <img 
                                  src={`/avatars/${evidence.students?.avatar || 'avatar-pilot-001.svg'}`} 
                                  alt={`${evidence.students?.first_name} ${evidence.students?.last_name}`}
                                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {evidence.students?.first_name} {evidence.students?.last_name}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      evidence.submission_type === 'challenge' 
                                        ? 'bg-yellow-100 text-yellow-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {evidence.submission_type === 'challenge' ? 'Challenge' : 'GRIT Bit'}
                                    </span>
                                  </div>
                                  
                                  <div className="group relative mb-2">
                                    <p className="text-lg font-semibold text-grit-green cursor-help">
                                      {evidence.submission_type === 'challenge' 
                                        ? evidence.challenges?.title || 'Challenge Title'
                                        : evidence.title || 'GRIT Bit Title'
                                      }
                                    </p>
                                    {(evidence.challenges?.description || evidence.description) && (
                                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg p-3 w-64 z-10">
                                        <p className="mb-2">
                                          {evidence.submission_type === 'challenge' 
                                            ? evidence.challenges?.description 
                                            : evidence.description
                                          }
                                        </p>
                                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Challenge Meta Information - only for challenges */}
                                  {evidence.submission_type === 'challenge' && (
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                      {evidence.challenges?.trait && (
                                        <span className="bg-gradient-to-r from-[#032717] to-[#0a5c3a] text-[#b5aa91] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                          {evidence.challenges.trait}
                                        </span>
                                      )}
                                      {evidence.challenges?.points && (
                                        <span className="bg-[#b5aa91] text-[#032717] px-2 py-1 rounded text-xs font-bold">
                                          {evidence.challenges.points} pts
                                        </span>
                                      )}
                                      {evidence.challenges?.pathway && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                          evidence.challenges.pathway === 'independent-led' 
                                            ? 'bg-green-100 text-green-700' 
                                            : evidence.challenges.pathway === 'specialist-led'
                                            ? 'bg-orange-100 text-orange-700'
                                            : evidence.challenges.pathway === 'school-led'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {evidence.challenges.pathway}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <p className="text-sm text-gray-600 mb-3">
                                    {evidence.text_content || 'No description provided'}
                                  </p>
                                  
                                  {/* Media thumbnails */}
                                  {evidence.media_urls && evidence.media_urls.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                      {evidence.media_urls.slice(0, 3).map((url, index) => (
                                        <img 
                                          key={index}
                                          src={url} 
                                          alt={`Evidence ${index + 1}`}
                                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                          onClick={() => window.open(url, '_blank')}
                                        />
                                      ))}
                                      {evidence.media_urls.length > 3 && (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                          +{evidence.media_urls.length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <p className="text-sm text-gray-500">
                                    {new Date(evidence.created_at).toLocaleDateString()} • {formatTimeAgo(evidence.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-3 ml-4">
                                <Button
                                  onClick={() => handleApproveEvidence(evidence.id, evidence.submission_type, evidence.challenge_id)}
                                  disabled={approvingId === evidence.id}
                                  className="bg-grit-green text-white hover:bg-[#054d2a] px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                  {approvingId === evidence.id ? (
                                    <div className="flex items-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Approving...
                                    </div>
                                  ) : (
                                    'Approve'
                                  )}
                                </Button>
                                <button
                                  onClick={() => handleRequestChanges(evidence.id)}
                                  disabled={approvingId === evidence.id}
                                  className="bg-white border-2 border-[#847147] text-[#5a4a2f] hover:bg-[#847147] hover:text-white transition-all px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg"
                                >
                                  Request Changes
                                </button>
                                <button
                                  onClick={() => handleViewConversation(evidence)}
                                  className="bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200 transition-all px-4 py-2 font-medium rounded-lg"
                                >
                                  View Conversation
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Recent Conversations</h3>
                      <Button 
                        variant="primary"
                        onClick={() => setShowComposeModal(true)}
                      >
                        Compose New Message
                      </Button>
                    </div>
                    
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
                          No Messages Yet
                        </h3>
                        <p className="text-gray-500">
                          Start a conversation with families to keep them updated on their child's progress.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => handleViewConversation(message)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={`/avatars/${message.conversations?.students?.avatar || 'avatar-astronaut-male.webp'}`} 
                                  alt={`${message.conversations?.students?.first_name} ${message.conversations?.students?.last_name}`}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {message.conversations?.students?.first_name} {message.conversations?.students?.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {message.conversations?.subject || 'Message'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </p>
                                {message.unread && (
                                  <span className="inline-block w-2 h-2 bg-grit-red rounded-full mt-1"></span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {message.content || 'Message preview...'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-heading font-semibold text-grit-green mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setActiveTab('evidence')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full bg-white border-2 border-[#991b1b] text-[#991b1b] font-semibold px-6 py-3 rounded-xl hover:bg-[#991b1b] hover:text-white transition-all relative"
                >
                  <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  Review Evidence
                  {stats.pendingReviews > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {stats.pendingReviews}
                    </span>
                  )}
                </button>
                
                <button 
                  className="w-full bg-white border-2 border-[#032717] text-[#032717] font-semibold px-6 py-3 rounded-xl hover:bg-[#032717] hover:text-white transition-all"
                  onClick={() => setShowAnnouncementModal(true)}
                >
                  <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                  </svg>
                  Send Announcement
                </button>
                
                <button 
                  className="w-full bg-white border-2 border-[#847147] text-[#5a4a2f] font-semibold px-6 py-3 rounded-xl hover:bg-[#847147] hover:text-white transition-all"
                >
                  <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  Download Reports
                </button>
              </div>
              
              <div className="mt-8">
                <h4 className="text-md font-heading font-semibold text-grit-green mb-4">Class Progress</h4>
                <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    <svg className="w-5 h-5 inline-block mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg><br />
                    Progress Chart<br />
                    <span className="text-sm">Coming Soon</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-grit-green text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
          {successMessage}
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowComposeModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-heading font-semibold text-grit-green mb-4">Compose New Message</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find(s => s.id === e.target.value)
                  setSelectedStudent(student)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} (Year {student.year_level})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleComposeMessage}
                disabled={!selectedStudent || !composeMessage.trim() || sendingMessage}
                variant="primary"
                className="flex-1"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </Button>
              <Button
                onClick={() => {
                  setShowComposeModal(false)
                  setSelectedStudent(null)
                  setComposeMessage('')
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowAnnouncementModal(false)
            setAnnouncementMessage('')
            setAnnouncementFilters({
              yearLevel: 'all',
              completionStatus: 'all',
              hasActiveChallenges: false
            })
          }}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-semibold text-grit-green mb-4">Send Announcement to Families</h3>
            
            {/* Recipient Filters Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recipient Filters</h4>
              
              <div className="space-y-4">
                {/* Year Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                  <select
                    value={announcementFilters.yearLevel}
                    onChange={(e) => {
                      setAnnouncementFilters(prev => ({ ...prev, yearLevel: e.target.value }))
                      setTimeout(() => updateRecipientCount(), 100)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                  >
                    <option value="all">All Years</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>
                </div>
                
                {/* Completion Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Filter</label>
                  <select
                    value={announcementFilters.completionStatus}
                    onChange={(e) => {
                      setAnnouncementFilters(prev => ({ ...prev, completionStatus: e.target.value }))
                      setTimeout(() => updateRecipientCount(), 100)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                  >
                    <option value="all">All Students</option>
                    <option value="active">Students with Active Challenges</option>
                    <option value="completed_3_plus">Students who Completed 3+ This Week</option>
                  </select>
                </div>
                
                {/* Recipient Count Preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">This will send to {recipientCount} families</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Message Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Message</label>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {announcementMessage.length}/500 characters
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleSendAnnouncement}
                disabled={!announcementMessage.trim() || sendingMessage || recipientCount === 0}
                className="flex-1 bg-grit-green text-white hover:bg-[#054d2a] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {sendingMessage ? 'Sending...' : 
                 announcementFilters.yearLevel === 'all' && announcementFilters.completionStatus === 'all' 
                   ? 'Send to All Families' 
                   : 'Send to Filtered Group'}
              </Button>
              <Button
                onClick={() => {
                  setShowAnnouncementModal(false)
                  setAnnouncementMessage('')
                  setAnnouncementFilters({
                    yearLevel: 'all',
                    completionStatus: 'all',
                    hasActiveChallenges: false
                  })
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Modal */}
      {showConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowConversationModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img 
                  src={`/avatars/${selectedStudent?.avatar || 'avatar-astronaut-male.webp'}`} 
                  alt={`${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green">
                    {selectedStudent?.first_name} {selectedStudent?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Conversation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConversationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {conversationMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'leader' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_type === 'leader'
                        ? 'bg-grit-green text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_type === 'leader' ? 'text-grit-gold-light' : 'text-gray-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendReply}
                disabled={!replyMessage.trim() || sendingMessage}
                variant="primary"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setFeedbackModal({ show: false, evidenceId: null, feedback: '' })}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-heading font-semibold text-grit-green mb-4">Request Changes</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Message</label>
              <textarea
                value={feedbackModal.feedback}
                onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Explain what changes are needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSendFeedback}
                disabled={!feedbackModal.feedback.trim() || sendingMessage}
                className="flex-1 bg-[#847147] text-white hover:bg-[#5a4a2f] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {sendingMessage ? 'Sending...' : 'Send Feedback'}
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

      {/* GRIT Bit Points Selector Modal */}
      {pointsModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setPointsModal({ show: false, evidenceId: null, submissionType: null })}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-heading font-semibold text-grit-green mb-4">Award GRIT Points</h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                How many points should this GRIT Bit receive?
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="points"
                    value={5}
                    checked={selectedPoints === 5}
                    onChange={(e) => setSelectedPoints(parseInt(e.target.value))}
                    className="w-4 h-4 text-grit-green focus:ring-grit-green border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-gray-900">5 Points</span>
                    <p className="text-sm text-gray-500">Good effort, shows some GRIT</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="points"
                    value={10}
                    checked={selectedPoints === 10}
                    onChange={(e) => setSelectedPoints(parseInt(e.target.value))}
                    className="w-4 h-4 text-grit-green focus:ring-grit-green border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-gray-900">10 Points</span>
                    <p className="text-sm text-gray-500">Excellent GRIT, outstanding effort</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleAwardPoints}
                disabled={approvingId === pointsModal.evidenceId}
                className="flex-1 bg-grit-green text-white hover:bg-[#054d2a] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {approvingId === pointsModal.evidenceId ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Awarding...
                  </div>
                ) : (
                  `Award ${selectedPoints} Points`
                )}
              </Button>
              <Button
                onClick={() => setPointsModal({ show: false, evidenceId: null, submissionType: null })}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 border-t border-gray-200 py-5 mt-10">
        <div className="flex justify-center items-center gap-10 flex-wrap">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('FAQ coming soon'); }} className="flex items-center gap-2 text-gray-600 hover:text-[#032717] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5"/></svg>
            Lost? Read our FAQ
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Support request coming soon'); }} className="flex items-center gap-2 text-gray-600 hover:text-[#032717] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            Need Help? Support Request
          </a>
          <button onClick={() => { localStorage.removeItem('auth'); navigate('/'); }} className="flex items-center gap-2 text-gray-600 hover:text-[#032717] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </footer>
    </div>
  )
}

export default LeaderDashboard
