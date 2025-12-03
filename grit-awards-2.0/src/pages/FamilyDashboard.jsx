import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Button from '../components/Button'
import GrungeOverlay from '../components/GrungeOverlay'
import { supabase } from '../lib/supabaseClient'
import confetti from 'canvas-confetti'

const FamilyDashboard = () => {
  const location = useLocation()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAllAvailable, setShowAllAvailable] = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState('challenges') // 'challenges', 'progress', 'awards', 'messages'
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    gritPoints: 240
  })

  // Messaging state
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [evidenceSubmission, setEvidenceSubmission] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Awards state
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [selectedReward, setSelectedReward] = useState(null)
  const [confettiLaunched, setConfettiLaunched] = useState(false)

  // Evidence submission state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [evidenceText, setEvidenceText] = useState('')
  const [evidenceImages, setEvidenceImages] = useState([])
  const [evidenceVideo, setEvidenceVideo] = useState(null)
  const [submittingEvidence, setSubmittingEvidence] = useState(false)

  useEffect(() => {
    fetchStudent()
    fetchRileyChallenges()
    if (activeTab === 'messages') {
      fetchConversations()
    }
    if (activeTab === 'awards' && !confettiLaunched) {
      launchConfetti()
      setConfettiLaunched(true)
    }
  }, [activeTab])

  const calculateStats = (progressData) => {
    if (!progressData || progressData.length === 0) {
      return { completed: 0, inProgress: 0, gritPoints: 240 }
    }
    
    const completed = progressData.filter(p => p.status === 'approved').length
    const inProgress = progressData.filter(p => p.status === 'in_progress' || p.status === 'submitted').length
    
    return {
      completed,
      inProgress,
      gritPoints: 240
    }
  }

  const fetchRileyChallenges = async () => {
    try {
      const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
      
      const { data, error } = await supabase
        .from('student_progress')
        .select('*, challenges(*)')
        .eq('student_id', rileyId)
      
      if (error) throw error
      
      setChallenges(data || [])
      const calculatedStats = calculateStats(data)
      setStats(calculatedStats)
      
    } catch (error) {
      console.error('Error fetching challenges:', error)
    }
  }

  // Filter challenges by status
  const activeChallenges = challenges.filter(c => c.status === 'in_progress' || c.status === 'submitted')
  const availableChallenges = challenges.filter(c => c.status === 'not_started')
  const completedChallenges = challenges.filter(c => c.status === 'approved')

  // Pagination
  const displayedAvailable = showAllAvailable ? availableChallenges : availableChallenges.slice(0, 3)
  const displayedCompleted = showAllCompleted ? completedChallenges : completedChallenges.slice(0, 3)

  const fetchStudent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, fetch Riley by his specific ID since we know it
      const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
      
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, year_level, current_award, progress_percentage, current_streak, total_badges, avatar, school_id, family_user_id')
        .eq('id', rileyId)
        .single()
      
      if (error) {
        console.error('Error fetching student:', error)
        setError(error.message)
        setLoading(false)
        return
      }
      
      setStudent(data)
    } catch (err) {
      console.error('Error fetching student:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Messaging functions
  const fetchConversations = async () => {
    try {
      const rileyId = '63a61037-19ff-48e0-b9e3-53338b46a849'
      
      // Get Riley's individual conversations, Year 3 announcements, and whole school announcements
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`student_id.eq.${rileyId},and(student_id.is.null,year_level.eq.3),and(student_id.is.null,year_level.is.null)`)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  // Fetch evidence submission details
  const fetchEvidenceSubmission = async (evidenceSubmissionId) => {
    if (!evidenceSubmissionId) return

    try {
      const { data, error } = await supabase
        .from('evidence_submissions')
        .select('*, challenges(title)')
        .eq('id', evidenceSubmissionId)
        .single()

      if (error) throw error
      setEvidenceSubmission(data)
    } catch (err) {
      console.error('Error fetching evidence submission:', err)
    }
  }

  // Mark conversation and messages as read
  const markAsRead = async (conversationId) => {
    try {
      // Mark conversation as read
      await supabase
        .from('conversations')
        .update({ is_read: true })
        .eq('id', conversationId)

      // Mark all leader messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'leader')

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, is_read: true } : conv
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  // Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSending(true)
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: 'family',
          sender_id: '63a61037-19ff-48e0-b9e3-53338b46a849', // Riley's ID
          content: newMessage.trim()
        })

      if (error) throw error

      // Update last_message_at for conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)

      // Refresh messages
      await fetchMessages(selectedConversation.id)
      await fetchConversations() // Refresh conversation list
      
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id)
    
    // Fetch evidence submission if needed
    if (conversation.conversation_type === 'evidence_review') {
      await fetchEvidenceSubmission(conversation.evidence_submission_id)
    } else {
      setEvidenceSubmission(null)
    }

    // Mark as read
    if (!conversation.is_read) {
      await markAsRead(conversation.id)
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  // Format message timestamp
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  // Get conversation type badge
  const getConversationTypeBadge = (type) => {
    const badges = {
      evidence_review: { text: 'Evidence Review', color: 'bg-yellow-100 text-yellow-800' },
      announcement: { text: 'Announcement', color: 'bg-blue-100 text-blue-800' },
      general: { text: 'General', color: 'bg-gray-100 text-gray-800' }
    }
    return badges[type] || badges.general
  }

  // Awards functions
  const launchConfetti = () => {
    setTimeout(() => {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']
      })

      // Continuous bursts for 5 seconds
      const duration = 5000
      const animationEnd = Date.now() + duration

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          return
        }

        const particleCount = 50
        confetti({
          particleCount,
          startVelocity: 30,
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']
        })

        confetti({
          particleCount,
          startVelocity: 30,
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']
        })
      }, 200)
    }, 500)
  }

  const badges = [
    { 
      id: 1, 
      name: 'First Steps', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ), 
      description: 'Completed your first GRIT challenge', 
      earned: true 
    },
    { 
      id: 2, 
      name: 'Resilience Rookie', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ), 
      description: 'Showed determination in challenging tasks', 
      earned: true 
    },
    { 
      id: 3, 
      name: 'Team Player', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ), 
      description: 'Helped classmates and worked collaboratively', 
      earned: true 
    },
    { 
      id: 4, 
      name: 'Week Warrior', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      ), 
      description: 'Maintained a 7-day streak of progress', 
      earned: true 
    },
    { 
      id: 5, 
      name: 'Integrity Champion', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ), 
      description: 'Demonstrated honesty and strong moral values', 
      earned: true 
    },
    { 
      id: 6, 
      name: 'Growth Guru', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 20h10"/>
          <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
        </svg>
      ), 
      description: 'Showed continuous improvement and learning', 
      earned: true 
    },
    { 
      id: 7, 
      name: 'Independence Ace', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ), 
      description: 'Completed tasks independently with confidence', 
      earned: false 
    },
    { 
      id: 8, 
      name: 'Transformation Master', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>
        </svg>
      ), 
      description: 'Achieved significant personal transformation', 
      earned: false 
    },
    { 
      id: 9, 
      name: 'GRIT Champion', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>
      ), 
      description: 'Mastered all GRIT principles and challenges', 
      earned: false 
    }
  ]

  const rewards = [
    {
      id: 1,
      title: 'Family Cinema Tickets',
      description: 'Birkenhead Cinema - 4 tickets',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      available: true
    },
    {
      id: 2,
      title: 'Pizza Express Voucher',
      description: '£20 voucher for family meal',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      available: true
    },
    {
      id: 3,
      title: 'Waterstones Book Token',
      description: '£15 token for educational books',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      available: true
    },
    {
      id: 4,
      title: 'Sports Direct Discount',
      description: '20% off sports equipment',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      available: false
    }
  ]

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge)
    setShowBadgeModal(true)
  }

  const handleRewardClick = (reward) => {
    setSelectedReward(reward)
    setShowRewardModal(true)
  }

  const handleSubmitEvidence = async () => {
    if (!evidenceText.trim()) return
    
    setSubmittingEvidence(true)
    try {
      const mediaUrls = []
      
      // Upload images to Supabase Storage
      if (evidenceImages.length > 0) {
        for (const image of evidenceImages) {
          const fileName = `${student.id}/${Date.now()}_${image.name}`
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, image)
          
          if (uploadError) {
            console.error('Image upload error:', uploadError)
            throw uploadError
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)
          
          mediaUrls.push(publicUrl)
        }
      }
      
      // Upload video to Supabase Storage
      if (evidenceVideo) {
        const fileName = `${student.id}/${Date.now()}_${evidenceVideo.name}`
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, evidenceVideo)
        
        if (uploadError) {
          console.error('Video upload error:', uploadError)
          throw uploadError
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName)
        
        mediaUrls.push(publicUrl)
      }
      
      // Submit evidence to database
      const { error: submitError } = await supabase
        .from('evidence_submissions')
        .insert({
          student_id: student.id,
          challenge_id: null, // You may want to link this to a specific challenge
          submission_type: 'challenge',
          title: 'Challenge Evidence',
          text_content: evidenceText,
          media_urls: mediaUrls,
          status: 'pending_review',
          submitted_at: new Date().toISOString()
        })
      
      if (submitError) {
        console.error('Evidence submission error:', submitError)
        throw submitError
      }
      
      // Reset form and close modal
      setEvidenceText('')
      setEvidenceImages([])
      setEvidenceVideo(null)
      setShowEvidenceModal(false)
      
      // Show success message
      alert('Evidence submitted successfully!')
      
    } catch (error) {
      console.error('Error submitting evidence:', error)
      alert('Failed to submit evidence. Please try again.')
    } finally {
      setSubmittingEvidence(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
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
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h2 className="text-2xl font-heading font-bold text-grit-red mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchStudent} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const ProfileModal = () => {
    const handleSignOut = () => {
      // Clear any stored data
      localStorage.removeItem('selectedUserType')
      // Redirect to homepage
      window.location.href = '/'
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowProfileModal(false)} />
        <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
          {/* Close button */}
          <button 
            onClick={() => setShowProfileModal(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ×
          </button>

          {/* Profile section */}
          <div className="text-center p-8 pb-6">
            <img src={`/avatars/${student?.avatar || 'avatar-pilot-001.svg'}`} alt={student?.first_name} className="w-20 h-20 rounded-full bg-[#b5aa91] p-2 mx-auto mb-4" />
            <h2 className="text-2xl font-['Roboto_Slab'] font-bold text-[#032717] mb-2">Riley Johnson</h2>
            <div className="text-gray-600 text-sm mb-1">St Peter's Catholic Primary School</div>
            <div className="text-gray-500 text-xs mb-2">St Peter's Way, Noctorum, Birkenhead, Prenton CH43 9QR</div>
            <div className="text-gray-500 text-xs">GRIT Leader: Mr A Mackenzie</div>
          </div>

          {/* Menu items */}
          <div className="border-t border-gray-100">
            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              <span className="text-gray-700 font-medium">Account Settings</span>
            </button>

            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
              </svg>
              <span className="text-gray-700 font-medium">Privacy & Safety</span>
            </button>

            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11,18h2v-2h-2v2M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10-4.48,10-10S17.52,2 12,2zM13,16h-2v-6h2v6zM13,8h-2V6h2v2z"/>
              </svg>
              <span className="text-gray-700 font-medium">Help & Support</span>
            </button>

            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-100 rounded-b-2xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full pb-24">
        {/* Riley Johnson Profile Header */}
        <section className="bg-gradient-to-br from-[#032717] to-[#054d2a] text-white relative overflow-hidden">
          <GrungeOverlay />
          <div className="relative z-10">
            {/* Header Top Bar */}
            <div className="flex justify-between items-center px-5 py-4">
              <img src="/GRIT-logo-white.svg" alt="GRIT Awards" className="h-8 w-auto" />
              <button onClick={() => setShowProfileModal(true)} className="cursor-pointer">
                <img src={`/avatars/${student?.avatar || 'avatar-pilot-001.svg'}`} alt={student?.first_name} className="w-10 h-10 rounded-full bg-[#b5aa91] p-1" />
              </button>
            </div>
            
            {/* Child Info Section */}
            <div className="text-center pb-8">
              <h1 className="text-2xl font-['Roboto_Slab'] font-bold mb-2">
                Riley Johnson
              </h1>
              <p className="text-base opacity-90 mb-1">
                St Peter's Catholic Primary School
              </p>
              <p className="text-sm opacity-80 mb-2">
                St Peter's Way, Noctorum, Birkenhead, Prenton CH43 9QR
              </p>
              <p className="text-sm opacity-80 mb-5">
                GRIT Leader: Mr A Mackenzie
              </p>
              
              {/* Stats Row */}
              <div className="flex justify-around max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{stats.completed}</div>
                  <div className="text-xs uppercase opacity-80 tracking-wider">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{stats.inProgress}</div>
                  <div className="text-xs uppercase opacity-80 tracking-wider">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{stats.gritPoints}</div>
                  <div className="text-xs uppercase opacity-80 tracking-wider">GRIT Points</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'challenges' && (
          <>
            {/* Active Challenges Section */}
            {activeChallenges.length > 0 && (
              <div className="px-5 py-6">
                <h2 className="text-xl font-['Roboto_Slab'] font-bold text-[#032717] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  Active Challenges
                  <div className="flex items-center justify-center w-5 h-5 bg-yellow-400 rounded-full">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                  </div>
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeChallenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} status="active" />
                  ))}
                </div>
              </div>
            )}

            {/* Available Challenges Section */}
            {availableChallenges.length > 0 && (
              <div className="px-5 py-6">
                <h2 className="text-xl font-['Roboto_Slab'] font-bold text-[#032717] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Available Challenges
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                  {displayedAvailable.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} status="available" />
                  ))}
                </div>

                {availableChallenges.length > 3 && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAllAvailable(!showAllAvailable)}
                      className="bg-white border-2 border-[#032717] text-[#032717] font-medium px-6 py-2 rounded-xl hover:bg-[#032717] hover:text-white transition-all"
                    >
                      {showAllAvailable ? 'Show Less' : `See More (${availableChallenges.length - 3} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Completed Challenges Section */}
            {completedChallenges.length > 0 && (
              <div className="px-5 py-6">
                <h2 className="text-xl font-['Roboto_Slab'] font-bold text-gray-600 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Completed Challenges
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                  {displayedCompleted.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} status="completed" />
                  ))}
                </div>

                {completedChallenges.length > 3 && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAllCompleted(!showAllCompleted)}
                      className="bg-white border-2 border-gray-400 text-gray-600 font-medium px-6 py-2 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      {showAllCompleted ? 'Show Less' : `See More (${completedChallenges.length - 3} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'progress' && (
          <div className="px-5 py-6">
            <h2 className="text-xl font-['Roboto_Slab'] font-bold text-[#032717] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              Progress Overview
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-center">Progress view coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'awards' && (
          <div className="px-5 py-6">
            {/* Celebration Content */}
            <div className="relative bg-gradient-to-br from-[#032717] to-[#054d2a] text-white overflow-hidden rounded-lg mb-6">
              <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='25' cy='25' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='75' cy='75' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='50' cy='10' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='10' cy='60' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='90' cy='40' r='1' fill='white' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grain)'/%3E%3C/svg%3E")`}}></div>
              <div className="relative z-10 px-6 py-8 text-center">
                <div className="text-2xl font-bold mb-2">Congratulations Riley!</div>
                <div className="text-base opacity-90 max-w-md mx-auto">You've shown <strong>Growth</strong>, built <strong>Resilience</strong>, developed <strong>Integrity</strong> & <strong>Independence</strong>, and experienced a true <strong>Transformation for good.</strong></div>
              </div>
            </div>

            {/* Certificate */}
            <div className="overflow-visible mb-6">
              <div 
                className="bg-white p-8 relative overflow-hidden animate-[certificateReveal_1s_ease-out_forwards] mx-auto"
                style={{
                  maxWidth: '420px',
                  aspectRatio: '1 / 1.414',
                  boxShadow: '0 0 0 1px #847147, 0 0 0 3px white, 0 0 0 4px #847147, 0 12px 40px rgba(0,0,0,0.15)',
                  background: "linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")"
                }}
              >
                {/* Certificate Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full bg-gradient-to-br from-[#032717] to-[#b5aa91]"></div>
                </div>
                
                {/* Certificate Content */}
                <div className="relative z-10 text-center">
                  {/* GRIT Logo */}
                  <div className="mb-6">
                    <img 
                      src="/GRIT-logo.svg" 
                      alt="GRIT Awards" 
                      className="w-20 h-auto mx-auto mb-5" 
                      onError={(e) => { e.target.src = '/GRIT-logo-white.svg'; }}
                    />
                  </div>
                  
                  {/* Certificate Header */}
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Certificate of Achievement
                  </h3>
                  
                  {/* Award Title */}
                  <h4 className="text-3xl font-['Roboto_Slab'] font-bold text-[#032717] mb-6">
                    Captain's Award
                  </h4>
                  
                  {/* Awarded To */}
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    Awarded to
                  </p>
                  <p className="text-2xl font-bold text-[#032717] mb-6 border-b-2 border-[#032717] pb-2 inline-block">
                    {student?.first_name} {student?.last_name}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed italic">
                    For demonstrating exceptional resilience and determination in completing challenges and encouraging fellow students at St Peter's Catholic Primary School.
                  </p>
                  
                  {/* Date */}
                  <p className="text-sm text-gray-500 mb-6">
                    Year {student?.year_level || 3} | September 2025
                  </p>
                  
                  {/* Signature Line */}
                  <div className="border-t border-gray-300 pt-4">
                    <div className="text-[#032717] font-bold text-lg">Mrs S Parry</div>
                  </div>
                </div>
                
                {/* Certificate Icon */}
                <img src="/cert.webp" alt="Certificate" className="absolute -bottom-20 -left-16 w-56 h-auto z-20" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm animate-[fadeInUp_0.6s_ease-out_2.5s_both]">
                  <div className="text-2xl font-bold text-[#032717] mb-1">9</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Total Badges</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm animate-[fadeInUp_0.6s_ease-out_2.7s_both]">
                  <div className="text-2xl font-bold text-[#032717] mb-1">7</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Day Streak</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm animate-[fadeInUp_0.6s_ease-out_2.9s_both]">
                  <div className="text-2xl font-bold text-[#032717] mb-1">240</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">GRIT Points</div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="mb-6">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-gray-900 mb-4">
                Achievement Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-300 hover:scale-105 animate-[fadeInUp_0.6s_ease-out_${3 + (index * 0.1)}s_both] ${
                      badge.earned 
                        ? 'bg-white border-2 border-[#032717] shadow-sm hover:shadow-md' 
                        : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div className={`${badge.earned ? 'text-[#032717]' : 'text-gray-400'} mb-2`}>
                      {badge.icon}
                    </div>
                    <div className={`text-xs font-medium ${badge.earned ? 'text-[#032717]' : 'text-gray-400'}`}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Section */}
            <div className="mb-6">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-gray-900 mb-4">
                Rewards & Prizes
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      onClick={() => handleRewardClick(reward)}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-[#032717]/10 rounded-full flex items-center justify-center text-[#032717]">
                        {reward.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reward.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {reward.available ? 'Available' : 'Locked'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
              @keyframes certificateReveal {
                0% {
                  transform: scale(0.3) rotate(-10deg);
                  opacity: 0;
                }
                100% {
                  transform: scale(1) rotate(0deg);
                  opacity: 1;
                }
              }
              
              @keyframes fadeInUp {
                0% {
                  transform: translateY(20px);
                  opacity: 0;
                }
                100% {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="px-5 py-6">
            <div className="flex gap-6 h-[calc(100vh-300px)]">
              {/* Left Sidebar - Conversation List */}
              <div className="w-[30%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="mb-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                      </div>
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {conversations.map((conversation) => {
                        const badge = getConversationTypeBadge(conversation.conversation_type)
                        const isActive = selectedConversation?.id === conversation.id
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => handleConversationSelect(conversation)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              isActive 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Unread indicator */}
                              {!conversation.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-medium truncate ${
                                    !conversation.is_read ? 'font-bold' : 'font-normal'
                                  }`}>
                                    {conversation.subject}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                                    {badge.text}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate mb-1">
                                  {conversation.last_message_preview || 'No messages yet'}
                                </p>
                                
                                <p className="text-xs text-gray-500">
                                  {formatTimeAgo(conversation.last_message_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Conversation Thread */}
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedConversation.subject}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          getConversationTypeBadge(selectedConversation.conversation_type).color
                        }`}>
                          {getConversationTypeBadge(selectedConversation.conversation_type).text}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Submission Details */}
                    {evidenceSubmission && (
                      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                        <h3 className="font-medium text-gray-900 mb-2">Evidence Submission</h3>
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-800 mb-2">
                            {evidenceSubmission.title || evidenceSubmission.challenges?.title}
                          </h4>
                          {evidenceSubmission.text_content && (
                            <p className="text-gray-600 text-sm mb-2">{evidenceSubmission.text_content}</p>
                          )}
                          {evidenceSubmission.media_urls && evidenceSubmission.media_urls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {evidenceSubmission.media_urls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                                  onClick={() => window.open(url, '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <div className="text-4xl mb-2">💭</div>
                          <p>No messages in this conversation</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'family' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender_type === 'family'
                                  ? 'bg-blue-500 text-white'
                                  : message.sender_type === 'announcement'
                                  ? 'bg-yellow-100 text-gray-800 border border-yellow-200'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_type === 'family' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    {selectedConversation.conversation_type !== 'announcement' && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                            disabled={sending}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="px-4 py-2 bg-grit-green text-white rounded-lg hover:bg-[#054d2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {sending ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                      <p>Choose a conversation from the sidebar to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Section */}
        <section className="mb-8">
          <h2 className="text-xl font-['Roboto_Slab'] font-bold text-gray-900 mb-4 flex items-center gap-2 px-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            Recent Activity
          </h2>
          <div className="px-5 space-y-3">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Riley completed 'Tie shoelaces'</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Badge earned: Week Warrior</p>
                  <p className="text-sm text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">New message from Mr Mackenzie</p>
                  <p className="text-sm text-gray-500">3 days ago</p>
                </div>
              </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-['Roboto_Slab'] font-bold text-gray-900 mb-4 flex items-center gap-2 px-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Quick Actions
          </h2>
          <div className="px-5 space-y-3 mb-8">
            <button className="w-full bg-white border-2 border-[#991b1b] text-[#7f1d1d] font-medium px-6 py-3 rounded-xl hover:bg-[#991b1b] hover:text-white transition-all flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Upload Evidence
            </button>
            <button className="w-full bg-[#032717] text-white font-medium px-6 py-3 rounded-xl hover:bg-[#054d2a] transition-all flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message Teacher
            </button>
            <button className="w-full bg-white border-2 border-[#847147] text-[#5a4a2f] font-medium px-6 py-3 rounded-xl hover:bg-[#847147] hover:text-white transition-all flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              View All Challenges
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-3">
          {/* Challenges */}
          <button 
            onClick={() => setActiveTab('challenges')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'challenges' 
                ? 'bg-[#032717]/10 text-[#032717] border-b-2 border-[#847147]' 
                : 'text-gray-500 hover:bg-[#032717]/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Challenges</span>
          </button>

          {/* Progress */}
          <button 
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'progress' 
                ? 'bg-[#032717]/10 text-[#032717] border-b-2 border-[#847147]' 
                : 'text-gray-500 hover:bg-[#032717]/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Progress</span>
          </button>

          {/* Awards */}
          <button 
            onClick={() => setActiveTab('awards')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'awards' 
                ? 'bg-[#032717]/10 text-[#032717] border-b-2 border-[#847147]' 
                : 'text-gray-500 hover:bg-[#032717]/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Awards</span>
          </button>

          {/* Messages */}
          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'messages' 
                ? 'bg-[#032717]/10 text-[#032717] border-b-2 border-[#847147]' 
                : 'text-gray-500 hover:bg-[#032717]/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Messages</span>
          </button>
        </div>
      </nav>

      {/* Badge Modal */}
      {showBadgeModal && selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowBadgeModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <button 
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            >
              ×
            </button>
            <div className="p-8 text-center">
              <div className="text-[#032717] mb-4 flex justify-center">
                <div className="w-16 h-16">
                  {selectedBadge.icon}
                </div>
              </div>
              <h3 className="text-2xl font-['Roboto_Slab'] font-bold text-[#032717] mb-4">
                {selectedBadge.name}
              </h3>
              <p className="text-gray-600 mb-6">{selectedBadge.description}</p>
              <div className={`px-6 py-3 rounded-full text-sm font-medium ${
                selectedBadge.earned 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {selectedBadge.earned ? 'Earned!' : 'Locked'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowRewardModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <button 
              onClick={() => setShowRewardModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            >
              ×
            </button>
            <div className="p-8 text-center">
              <div className="text-[#032717] mb-4 flex justify-center">
                <div className="w-16 h-16">
                  {selectedReward.icon}
                </div>
              </div>
              <h3 className="text-2xl font-['Roboto_Slab'] font-bold text-[#032717] mb-4">
                {selectedReward.title}
              </h3>
              <p className="text-gray-600 mb-6">{selectedReward.description}</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">How to Claim:</h4>
                <p className="text-sm text-gray-600">
                  Contact your GRIT leader (Mr A Mackenzie) to arrange collection. 
                  Present your student ID and mention this reward.
                </p>
              </div>
              <button className="w-full bg-[#032717] text-white py-3 rounded-lg font-medium hover:bg-[#054d2a] transition-colors">
                Contact Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal />}
    </div>
  )
}

const ChallengeCard = ({ challenge, status: displayStatus }) => {
  const trait = challenge.challenges?.trait
  const points = challenge.challenges?.points
  const pathway = challenge.challenges?.pathway
  const status = challenge.status
  
  const traitColors = {
    'COURAGE': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-500' },
    'KINDNESS': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-l-pink-500' },
    'RESILIENCE': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-500' },
    'INTEGRITY': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-500' },
    'RESPECT': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-500' },
    'RESPONSIBILITY': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-500' },
    'PERSEVERANCE': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-l-indigo-500' },
    'EMPATHY': { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-l-teal-500' }
  }
  
  const colors = traitColors[trait] || traitColors['RESILIENCE']
  
  // Completed challenges styling
  const isCompleted = displayStatus === 'completed'
  const isActive = displayStatus === 'active'
  
  const cardClasses = isCompleted 
    ? 'bg-gray-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-gray-300 opacity-70 grayscale'
    : isActive
    ? `bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-[#032717] ${colors.border}`
    : `bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border}`
  
  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${isCompleted ? 'bg-gray-200 text-gray-500' : colors.bg + ' ' + colors.text} px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide`}>
            {trait}
          </span>
          {points && (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              isCompleted ? 'bg-gray-300 text-gray-600' : 'bg-[#b5aa91] text-[#032717]'
            }`}>
              {points} pts
            </span>
          )}
          {pathway && (
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
              isCompleted 
                ? 'bg-gray-200 text-gray-500'
                : pathway === 'independent-led' 
                ? 'bg-green-100 text-green-700' 
                : pathway === 'specialist-led'
                ? 'bg-orange-100 text-orange-700'
                : pathway === 'school-led'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {pathway}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          )}
          <StatusBadge status={status} />
        </div>
      </div>
      
      <h3 className={`font-['Roboto_Slab'] font-semibold text-base mb-2 uppercase tracking-wide ${
        isCompleted ? 'text-gray-500' : 'text-[#032717]'
      }`}>
        {challenge.challenges?.title}
      </h3>
      
      <p className={`text-sm leading-relaxed mb-3 ${
        isCompleted ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {challenge.challenges?.description}
      </p>
      
      {displayStatus === 'available' && (
        <button className="w-full bg-[#032717] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#054d2a] transition-colors text-sm">
          Start Challenge
        </button>
      )}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  if (status === 'approved') {
    return (
      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    )
  }
  return <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full"></div>
}

export default FamilyDashboard
