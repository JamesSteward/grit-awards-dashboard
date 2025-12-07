import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Button from '../components/Button'
import GrungeOverlay from '../components/GrungeOverlay'
import { supabase } from '../lib/supabaseClient'
import confetti from 'canvas-confetti'
import ImageCarousel from '../components/ImageCarousel'

const FamilyDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [allChallenges, setAllChallenges] = useState([]) // All challenges from database
  const [selectedPathway, setSelectedPathway] = useState('all') // Filter by pathway
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAllAvailable, setShowAllAvailable] = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'challenges', 'progress', 'awards', 'messages'
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [availableChallengesToShow, setAvailableChallengesToShow] = useState(10)
  const [completedChallengesToShow, setCompletedChallengesToShow] = useState(10)
  const [expandedChallenge, setExpandedChallenge] = useState(null)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showGritBitModal, setShowGritBitModal] = useState(false)
  const [showGritBitSuccessModal, setShowGritBitSuccessModal] = useState(false)
  const [evidenceText, setEvidenceText] = useState('')
  const [evidenceImages, setEvidenceImages] = useState([])
  const [evidenceVideo, setEvidenceVideo] = useState(null)
  const [submittingEvidence, setSubmittingEvidence] = useState(false)
  const [gritBitText, setGritBitText] = useState('')
  const [gritBitImages, setGritBitImages] = useState([])
  const [gritBitVideo, setGritBitVideo] = useState(null)
  const [submittingGritBit, setSubmittingGritBit] = useState(false)
  const [stats, setStats] = useState({
    progressPercentage: 0,
    completedCount: 0,
    inProgressCount: 0,
    gritPoints: 0
  })

  // Messaging state
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [evidenceSubmission, setEvidenceSubmission] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)

  // Awards state
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [selectedReward, setSelectedReward] = useState(null)
  const [confettiLaunched, setConfettiLaunched] = useState(false)

  useEffect(() => {
    fetchStudent()
    fetchAllChallenges() // Fetch all challenges on component mount
    if (activeTab === 'messages') {
      fetchConversations()
    }
    if (activeTab === 'awards' && !confettiLaunched) {
      launchConfetti()
      setConfettiLaunched(true)
    }
  }, [activeTab])

  // Reset pagination when search query changes or tab changes
  useEffect(() => {
    setAvailableChallengesToShow(10)
    setCompletedChallengesToShow(10)
  }, [searchQuery, activeTab])

  useEffect(() => {
    if (student?.id) {
      fetchStudentChallenges()
    }
  }, [student?.id])

  useEffect(() => {
    if (student?.id && activeTab === 'home') {
      fetchHomeStats()
    }
  }, [student, activeTab])

  const fetchHomeStats = async () => {
    console.log('Fetching stats for student:', student?.id)
    
    try {
      if (!student?.id) {
        console.log('No student ID found')
        return
      }
      
      const { data: progress, error } = await supabase
        .from('student_progress')
        .select('status, objective_id')
        .eq('student_id', student.id)
      
      console.log('Progress data:', progress)
      console.log('Progress error:', error)
      
      if (!progress || progress.length === 0) {
        console.log('No progress found for student')
        return
      }
      
      const total = progress.length
      const completed = progress.filter(p => p.status === 'approved').length
      const inProgress = progress.filter(p => p.status === 'in_progress' || p.status === 'submitted').length
      
      console.log('Completed:', completed, 'In Progress:', inProgress, 'Total:', total)
      
      // Get points for approved challenges
      const approvedIds = progress.filter(p => p.status === 'approved').map(p => p.objective_id)
      
      if (approvedIds.length > 0) {
        const { data: challenges } = await supabase
          .from('challenges')
          .select('points')
          .in('id', approvedIds)
        
        console.log('Challenges:', challenges)
        
        const points = challenges?.reduce((sum, c) => sum + (c.points || 0), 0) || 0
        
        setStats({
          progressPercentage: Math.round((completed / total) * 100),
          completedCount: completed,
          inProgressCount: inProgress,
          gritPoints: points
        })
      } else {
        setStats({
          progressPercentage: 0,
          completedCount: 0,
          inProgressCount: inProgress,
          gritPoints: 0
        })
      }
    } catch (error) {
      console.error('Error fetching home stats:', error)
    }
  }

  const calculateStats = (progressData) => {
    if (!progressData || progressData.length === 0) {
      return { completed: 0, inProgress: 0, gritPoints: 0 }
    }
    
    const completed = progressData.filter(p => p.status === 'approved').length
    const inProgress = progressData.filter(p => p.status === 'in_progress' || p.status === 'submitted').length
    
    // Calculate GRIT points from completed challenges
    const gritPoints = progressData
      .filter(p => p.status === 'approved' && p.challenges?.points)
      .reduce((total, p) => total + (p.challenges.points || 0), 0)
    
    return {
      completed,
      inProgress,
      gritPoints
    }
  }

  const fetchAllChallenges = async () => {
    try {
      const { data: allChallenges, error } = await supabase
        .from('challenges')
        .select('*')
        .order('pathway')
        .order('subcategory')
        .order('sort_order')
      
      if (error) throw error
      
      setAllChallenges(allChallenges || [])
      console.log(`Fetched ${allChallenges?.length || 0} challenges from database`)
    } catch (error) {
      console.error('Error fetching all challenges:', error)
      setAllChallenges([])
    }
  }

  const fetchStudentChallenges = async () => {
    try {
      if (!student?.id) return
      
      const { data, error } = await supabase
        .from('student_progress')
        .select('*, challenges(*)')
        .eq('student_id', student.id)
      
      if (error) throw error
      
      setChallenges(data || [])
      const calculatedStats = calculateStats(data)
      setStats(calculatedStats)
      
    } catch (error) {
      console.error('Error fetching challenges:', error)
    }
  }

  // Begin Challenge functionality
  const handleBeginChallenge = async (challengeId) => {
    console.log('Begin Challenge clicked');
    console.log('Challenge ID:', challengeId);
    console.log('Student ID:', student?.id);
    
    try {
      // Check if student_progress record exists
      const { data: existingProgress } = await supabase
        .from('student_progress')
        .select('id')
        .eq('student_id', student.id)
        .eq('objective_id', challengeId)
        .single();

      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('student_progress')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('student_progress')
          .insert({
            student_id: student.id,
            objective_id: challengeId,
            status: 'in_progress',
            started_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      console.log('Refreshing challenges...');
      await fetchStudentChallenges();
      
      console.log('Refreshing stats...');
      await fetchHomeStats();
      
      console.log('Closing expanded view...');
      setExpandedChallenge(null);
      
      console.log('Switching to home tab...');
      setActiveTab('home');
      
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('Failed to start challenge: ' + error.message);
    }
  }

  const handleCompleteChallenge = async (challengeId) => {
    setShowEvidenceModal(true);
  }

  async function handleSubmitEvidence() {
    if (!evidenceText.trim()) {
      alert('Please provide a description');
      return;
    }

    setSubmittingEvidence(true);

    try {
      const mediaUrls = [];
      
      // Find the challenge and get the correct challenge ID
      const challenge = challenges.find(c => {
        const progressId = c.id; // student_progress id
        const challengeId = c.challenges?.id || c.objective_id;
        return progressId === expandedChallenge || challengeId === expandedChallenge;
      });

      // Extract the actual challenge ID from the challenges table
      const actualChallengeId = challenge?.challenges?.id || challenge?.objective_id;
      
      console.log('Challenge found:', challenge);
      console.log('Using challenge ID:', actualChallengeId);
      console.log('Expanded challenge was:', expandedChallenge);

      if (!actualChallengeId) {
        throw new Error('Could not find challenge ID');
      }

      // Upload images to Supabase Storage
      if (evidenceImages.length > 0) {
        for (const image of evidenceImages) {
          const fileName = `${student.id}/${Date.now()}_${image.name}`;
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, image);
          
          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw uploadError;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName);
          
          mediaUrls.push(publicUrl);
        }
      }

      // Upload video to Supabase Storage
      if (evidenceVideo) {
        const fileName = `${student.id}/${Date.now()}_${evidenceVideo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, evidenceVideo);
        
        if (uploadError) {
          console.error('Video upload error:', uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        
        mediaUrls.push(publicUrl);
      }

      const { error: submitError } = await supabase
        .from('evidence_submissions')
        .insert({
          student_id: student.id,
          challenge_id: actualChallengeId,  // Use the correct challenges.id
          submission_type: 'challenge',
          title: challenge?.challenges?.title || challenge?.title || 'Challenge Evidence',
          text_content: evidenceText,
          media_urls: mediaUrls,
          status: 'pending'
        });

      if (submitError) throw submitError;

      // Update progress using the correct objective_id
      const { error: updateError } = await supabase
        .from('student_progress')
        .update({ status: 'submitted' })
        .eq('student_id', student.id)
        .eq('objective_id', actualChallengeId);

      if (updateError) throw updateError;

      setEvidenceText('');
      setEvidenceImages([]);
      setEvidenceVideo(null);

      await fetchStudentChallenges();
      await fetchHomeStats();

      setShowSuccessModal(true);
      // Don't close the evidence modal yet - let success modal handle it
      
    } catch (error) {
      console.error('Error submitting evidence:', error);
      alert('Failed to submit evidence: ' + error.message);
    } finally {
      setSubmittingEvidence(false);
    }
  }

  // Filter challenges by status
  const activeChallenges = challenges.filter(c => c.status === 'in_progress' || c.status === 'submitted')
  const availableChallenges = challenges.filter(c => c.status === 'not_started')
  const completedChallenges = challenges.filter(c => c.status === 'approved')

  // Search filtering function for student progress challenges
  const filterChallengesBySearch = (challengeList) => {
    if (!searchQuery.trim()) return challengeList
    return challengeList.filter(challenge => 
      challenge.challenges?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.challenges?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.challenges?.trait?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Filter all challenges from database by search query and pathway
  const filteredAllChallenges = allChallenges.filter(challenge => {
    // Filter by pathway
    if (selectedPathway !== 'all' && challenge.pathway !== selectedPathway) {
      return false
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      challenge.title?.toLowerCase().includes(query) ||
      challenge.description?.toLowerCase().includes(query) ||
      challenge.trait?.toLowerCase().includes(query) ||
      challenge.pathway?.toLowerCase().includes(query) ||
      challenge.subcategory?.toLowerCase().includes(query)
    )
  })

  // Get unique pathways for filter dropdown
  const pathways = ['all', ...new Set(allChallenges.map(c => c.pathway).filter(Boolean))]

  // Group filtered challenges by pathway
  const challengesByPathway = filteredAllChallenges.reduce((acc, challenge) => {
    const pathway = challenge.pathway || 'uncategorized'
    if (!acc[pathway]) {
      acc[pathway] = []
    }
    acc[pathway].push(challenge)
    return acc
  }, {})

  // Apply search filter to all challenge lists
  const filteredActiveChallenges = filterChallengesBySearch(activeChallenges)
  const filteredAvailableChallenges = filterChallengesBySearch(availableChallenges)
  const filteredCompletedChallenges = filterChallengesBySearch(completedChallenges)

  // Pagination
  const displayedAvailable = filteredAvailableChallenges.slice(0, availableChallengesToShow)
  const displayedCompleted = filteredCompletedChallenges.slice(0, completedChallengesToShow)

  // Show more functions
  const showMoreAvailable = () => {
    setAvailableChallengesToShow(prev => Math.min(prev + 10, filteredAvailableChallenges.length))
  }

  const showMoreCompleted = () => {
    setCompletedChallengesToShow(prev => Math.min(prev + 10, filteredCompletedChallenges.length))
  }

  const fetchStudent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setError('User not authenticated')
        return
      }
      
      // Get the user record from users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (userError || !userRecord) {
        setError('User record not found')
        return
      }
      
      // Find the student record where family_user_id matches this user id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_name, year_level, current_award, progress_percentage, current_streak, total_badges, avatar, school_id, family_user_id')
        .eq('family_user_id', userRecord.id)
        .single()
      
      if (studentError || !studentData) {
        setError('Student record not found')
        return
      }
      
      setStudent(studentData)
      console.log('Student data loaded:', studentData)
      console.log('Avatar field:', studentData?.avatar)
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
      if (!student?.id) return
      
      // Get student's individual conversations, their year level announcements, and whole school announcements
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`student_id.eq.${student.id},and(student_id.is.null,year_level.eq.${student.year_level}),and(student_id.is.null,year_level.is.null)`)
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
          sender_id: student.id,
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
    setShowConversationList(false) // Hide conversation list on mobile
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
      general: { text: 'General', color: 'bg-gray-100 text-gray-900' }
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
      description: 'Odeon Cinema - 2 Child tickets',
      icon: (
        <img src="/odeon.svg" alt="Odeon" className="w-6 h-6" />
      ),
      available: true
    },
    {
      id: 2,
      title: 'Leon Voucher',
      description: '£20 voucher for family meal',
      icon: (
        <img src="/leon.svg" alt="Leon" className="w-6 h-6" />
      ),
      available: true
    },
    {
      id: 3,
      title: 'Waterstones Book Token',
      description: '£15 token for educational books',
      icon: (
        <img src="/waterstones.svg" alt="Waterstones" className="w-6 h-6" />
      ),
      available: true
    },
    {
      id: 4,
      title: 'Sports Direct Discount',
      description: '20% off sports equipment',
      icon: (
        <img src="/sportsdirect.svg" alt="Sports Direct" className="w-6 h-6" />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grit-green mx-auto mb-4"></div>
            <p className="text-xl text-gray-900">Loading dashboard...</p>
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
            <p className="text-gray-900 mb-6">{error}</p>
            <Button onClick={fetchStudent} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear any stored data
      localStorage.removeItem('selectedUserType')
      // Redirect to homepage
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if signout fails
      navigate('/')
    }
  }

  const handleSubmitGritBit = async () => {
    if (!gritBitText.trim()) {
      alert('Please describe what you did to earn GRIT points!')
      return
    }

    setSubmittingGritBit(true)
    
    try {
      const mediaUrls = []
      
      // Upload images to Supabase Storage
      if (gritBitImages.length > 0) {
        for (const image of gritBitImages) {
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
      if (gritBitVideo) {
        const fileName = `${student.id}/${Date.now()}_${gritBitVideo.name}`
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, gritBitVideo)
        
        if (uploadError) {
          console.error('Video upload error:', uploadError)
          throw uploadError
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName)
        
        mediaUrls.push(publicUrl)
      }

      // Insert GRIT Bit as evidence submission
      const { error } = await supabase
        .from('evidence_submissions')
        .insert({
          student_id: student.id,
          challenge_id: null,
          submission_type: 'grit_bit',
          title: 'GRIT Bit',
          text_content: gritBitText.trim(),
          media_urls: mediaUrls,
          status: 'pending'
        })

      if (error) throw error

      // Success - show success modal
      setShowGritBitSuccessModal(true)
      // Don't close submission modal yet - success modal will handle it
      
      // Refresh stats
      fetchHomeStats()
      
    } catch (error) {
      console.error('Error submitting GRIT Bit:', error)
      alert('Failed to submit GRIT Bit. Please try again.')
    } finally {
      setSubmittingGritBit(false)
    }
  }

  const ProfileModal = () => {

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowProfileModal(false)} />
        <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
          {/* Close button */}
          <button 
            onClick={() => setShowProfileModal(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900-dark text-xl font-bold"
          >
            ×
          </button>

          {/* Profile section */}
          <div className="text-center p-8 pb-6">
            <img src={`/avatars/${student?.avatar || 'avatar-pilot-001.svg'}`} alt={student?.first_name} className="w-20 h-20 rounded-full mx-auto mb-4" onError={(e) => { e.target.src = '/avatars/avatar-pilot-001.svg' }} />
            <h2 className="text-2xl font-['Roboto_Slab'] font-bold text-grit-green mb-2">{student?.first_name} {student?.last_name}</h2>
            <div className="text-gray-900 text-sm mb-1">St Peter's Catholic Primary School</div>
            <div className="text-gray-900-dark text-xs mb-2">St Peter's Way, Noctorum, Birkenhead, Prenton CH43 9QR</div>
            <div className="text-gray-900-dark text-xs">GRIT Leader: Mr A Mackenzie</div>
          </div>

          {/* Menu items */}
          <div className="border-t border-gray-200">
            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              <span className="text-gray-900 font-medium">Account Settings</span>
            </button>

            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
              </svg>
              <span className="text-gray-900 font-medium">Privacy & Safety</span>
            </button>

            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11,18h2v-2h-2v2M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10-4.48,10-10S17.52,2 12,2zM13,16h-2v-6h2v6zM13,8h-2V6h2v2z"/>
              </svg>
              <span className="text-gray-900 font-medium">Help & Support</span>
            </button>

            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-200 rounded-b-2xl"
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
        {/* Student Profile Header */}
        <section className="bg-grit-green text-white relative overflow-hidden">
          <GrungeOverlay />
          <div className="relative z-10">
            {/* Header Top Bar */}
            <div className="flex justify-between items-center px-5 py-4">
              <img src="/GRIT-logo-white.svg" alt="GRIT Awards" className="h-10 w-auto" />
              <button onClick={() => setShowProfileModal(true)} className="cursor-pointer">
                <img src={`/avatars/${student?.avatar || 'avatar-pilot-001.svg'}`} alt={student?.first_name} className="w-12 h-12 rounded-full" onError={(e) => { e.target.src = '/avatars/avatar-pilot-001.svg' }} />
              </button>
            </div>
            
            {/* Child Info Section */}
            <div className="text-center pb-8">
              <h1 className="text-2xl font-['Roboto_Slab'] font-bold mb-2">
                {student?.first_name} {student?.last_name}
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
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <div className="pb-20 px-4">
            {/* Progress Bar - Overlapping Header */}
            <div className="relative -mt-8 z-20 px-4">
              <div className="bg-white rounded-lg p-4 mb-4 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">Overall Progress</span>
                  <span className="text-sm font-bold text-grit-green">{stats.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-grit-green to-grit-green-dark h-3 rounded-full"
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>
                </div>
              </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-grit-green">{stats.completedCount || 0}</div>
                <div className="text-xs text-gray-900 mt-1">Completed</div>
            </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-grit-green">{stats.inProgressCount || 0}</div>
                <div className="text-xs text-gray-900 mt-1">In Progress</div>
          </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-grit-green">{stats.gritPoints || 0}</div>
                <div className="text-xs text-gray-900 mt-1">GRIT Points</div>
              </div>
            </div>


            {/* Recent Activity Section */}
            <div className="mb-8">
              <h2 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student?.first_name} completed 'Tie shoelaces'</p>
                    <p className="text-sm text-gray-900-dark">2 hours ago</p>
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
                    <p className="text-sm text-gray-900-dark">Yesterday</p>
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
                    <p className="text-sm text-gray-900-dark">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Challenges Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Challenges</h2>
              {activeChallenges.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeChallenges.map(challenge => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      status="active" 
                      isExpanded={expandedChallenge === challenge.id}
                      onExpand={() => setExpandedChallenge(challenge.id)}
                      onCollapse={() => setExpandedChallenge(null)}
                      onBeginChallenge={handleBeginChallenge}
                      onCompleteChallenge={handleCompleteChallenge}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                  <p>No active challenges. Visit the Challenges tab to begin one!</p>
                </div>
              )}
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <h2 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Quick Actions
              </h2>
              <div className="space-y-3 mb-8">
                <Button 
                  onClick={() => setShowGritBitModal(true)}
                  className="w-full px-6 py-3 flex items-center justify-center bg-grit-gold-dark text-white hover:bg-grit-gold-dark/90"
                >
                  <img src="/SUBMITTED.svg" alt="Submit" className="w-5 h-5 mr-2" />
                  Submit GRIT BIT
                </Button>
                <Button 
                  onClick={() => {
                    setActiveTab('messages');
                    // Clear any selected conversation to show conversation list
                    setSelectedConversation(null);
                    setShowConversationList(true);
                  }}
                  className="w-full px-6 py-3 flex items-center justify-center bg-white border-2 border-grit-green text-grit-green hover:bg-grit-green hover:text-white transition-colors"
                  style={{ color: '#032717' }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Message GRIT Lead
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <>
            {/* Search Bar - Always Visible */}
            <div className="relative -mt-8 z-20 px-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenges by name, description, or trait..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Pathway Filter */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by pathway:</label>
                  <select
                    value={selectedPathway}
                    onChange={(e) => setSelectedPathway(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
                  >
                    <option value="all">All Pathways</option>
                    {pathways.filter(p => p !== 'all').map(pathway => (
                      <option key={pathway} value={pathway}>
                        {pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Search Results Count */}
                <div className="mt-3 text-sm text-gray-900">
                  {searchQuery || selectedPathway !== 'all' 
                    ? `Found ${filteredAllChallenges.length} challenge${filteredAllChallenges.length !== 1 ? 's' : ''}`
                    : `Showing all ${filteredAllChallenges.length} challenges`
                  }
                </div>
              </div>
            </div>

            {/* Challenge Cards - Grouped by Pathway */}
            <div className="px-4 pb-6">
              {Object.keys(challengesByPathway).length > 0 ? (
                Object.entries(challengesByPathway).map(([pathway, pathwayChallenges]) => (
                  <div key={pathway} className="mb-8">
                    <h2 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      {pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pathwayChallenges.map(challenge => {
                        // Check if student has progress on this challenge
                        const studentProgress = challenges.find(c => c.challenges?.id === challenge.id || c.objective_id === challenge.id)
                        const status = studentProgress?.status || 'not_started'
                        
                        // Determine display status
                        let displayStatus = 'available'
                        if (status === 'approved') displayStatus = 'completed'
                        else if (status === 'in_progress' || status === 'submitted') displayStatus = 'active'
                        
                        // Create a normalized challenge object that ChallengeCard can use
                        const normalizedChallenge = studentProgress || {
                          id: `challenge-${challenge.id}`, // Use a unique ID for challenges without progress
                          status: 'not_started',
                          challenges: challenge // Wrap challenge in challenges property
                        }
                        
                        return (
                          <ChallengeCard 
                            key={challenge.id} 
                            challenge={normalizedChallenge} 
                            status={displayStatus}
                            isExpanded={expandedChallenge === normalizedChallenge.id}
                            onExpand={() => setExpandedChallenge(normalizedChallenge.id)}
                            onCollapse={() => setExpandedChallenge(null)}
                            onBeginChallenge={handleBeginChallenge}
                            onCompleteChallenge={handleCompleteChallenge}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery || selectedPathway !== 'all' 
                    ? 'No challenges found matching your search.' 
                    : 'Loading challenges...'}
                </div>
              )}
            </div>

          </>
        )}

        {activeTab === 'progress' && (
          <div className="px-5 py-6">
            <h2 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              Progress Overview
            </h2>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Badges */}
              <div className="bg-grit-green rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">6</div>
                    <div className="text-sm opacity-90">Total Badges</div>
                  </div>
                </div>
                <div className="text-sm opacity-80">Earned through challenges</div>
              </div>

              {/* Day Streak */}
              <div className="bg-grit-gold rounded-2xl p-6 text-grit-green shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-grit-green/20 rounded-full p-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">7</div>
                    <div className="text-sm opacity-90">Day Streak</div>
                  </div>
                </div>
                <div className="text-sm opacity-80">Keep it going!</div>
              </div>

              {/* GRIT Points */}
              <div className="bg-grit-gold-dark rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stats.gritPoints || 0}</div>
                    <div className="text-sm opacity-90">GRIT Points</div>
                  </div>
                </div>
                <div className="text-sm opacity-80">Total earned</div>
              </div>
            </div>

            {/* Overall Progress Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-grit-gold-dark mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-['Roboto_Slab'] font-bold text-grit-green mb-2">Overall Progress</h3>
                <p className="text-gray-900">Your journey through GRIT challenges</p>
              </div>

              {/* Circular Progress */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 mb-6">
                  {/* Background Circle */}
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#032717"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.progressPercentage || 0) / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-grit-green mb-1">
                      {stats.progressPercentage || 0}%
                    </div>
                    <div className="text-sm text-gray-900">Complete</div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-grit-gold-dark mb-1">{stats.completedCount || 0}</div>
                    <div className="text-sm text-gray-900">Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-grit-green mb-1">{stats.inProgressCount || 0}</div>
                    <div className="text-sm text-gray-900">In Progress</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-500 mb-1">{challenges.length - (stats.completedCount || 0) - (stats.inProgressCount || 0)}</div>
                    <div className="text-sm text-gray-900">Yet to Start</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-grit-gold-dark">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Recent Achievements
              </h3>
              
              <div className="space-y-4">
                {badges.filter(badge => badge.earned).slice(0, 3).map((badge, index) => (
                  <div key={badge.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-grit-green/5 to-grit-gold/5 rounded-lg border border-grit-gold/20">
                    <div className="bg-grit-green text-white rounded-full p-3">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-grit-green mb-1">{badge.name}</h4>
                      <p className="text-sm text-gray-900">{badge.description}</p>
                    </div>
                    <div className="text-grit-gold-dark">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'awards' && (
          <div className="px-5 py-6">
            {/* Celebration Content - Overlapping Header */}
            <div className="relative -mt-8 z-20 px-4 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 text-center">
                <div className="text-2xl font-bold text-grit-green mb-2">Congratulations {student?.first_name}!</div>
                <div className="text-base text-gray-900 max-w-md mx-auto">You've shown <strong className="text-grit-green">Growth</strong>, built <strong className="text-grit-green">Resilience</strong>, developed <strong className="text-grit-green">Integrity</strong> & <strong className="text-grit-green">Independence</strong>, and experienced a true <strong className="text-grit-green">Transformation for good.</strong></div>
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
                  <h3 className="text-sm font-medium text-gray-900-dark uppercase tracking-wider mb-2">
                    Certificate of Achievement
                  </h3>
                  
                  {/* Award Title */}
                  <h4 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-6">
                    Captain's Award
                  </h4>
                  
                  {/* Awarded To */}
                  <p className="text-sm text-gray-900-dark uppercase tracking-wider mb-2">
                    Awarded to
                  </p>
                  <p className="text-2xl font-bold text-grit-green mb-6 border-b-2 border-grit-green pb-2 inline-block">
                    {student?.first_name} {student?.last_name}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-900 mb-6 max-w-md mx-auto leading-relaxed italic">
                    For demonstrating exceptional resilience and determination in completing challenges and encouraging fellow students at St Peter's Catholic Primary School.
                  </p>
                  
                  {/* Date */}
                  <p className="text-sm text-gray-900-dark mb-6">
                    Year {student?.year_level || 3} | September 2025
                  </p>
                  
                  {/* Signature Line */}
                  <div className="border-t border-grit-gold-dark pt-4">
                    <div className="text-grit-green font-bold text-lg">Mrs S Parry</div>
                  </div>
                </div>
                
                {/* Certificate Icon */}
                <img src="/cert.webp" alt="Certificate" className="absolute -bottom-20 -left-16 w-56 h-auto z-20" />
              </div>
            </div>


            {/* Achievement Badges */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green">
                Achievement Badges
              </h3>
                <div className="bg-grit-gold-dark text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  6
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-300 hover:scale-105 animate-[fadeInUp_0.6s_ease-out_${3 + (index * 0.1)}s_both] ${
                      badge.earned 
                        ? 'bg-white border border-grit-green shadow-sm hover:shadow-md' 
                        : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div className={`${badge.earned ? 'text-grit-green' : 'text-gray-900-dark'} mb-2 flex items-center justify-center`}>
                      {badge.icon}
                    </div>
                    <div className={`text-xs font-medium ${badge.earned ? 'text-grit-green' : 'text-gray-900-dark'}`}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Section */}
            <div className="mb-6">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Rewards & Prizes
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      onClick={() => handleRewardClick(reward)}
                      className={`flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        !reward.available ? 'opacity-50' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        reward.available ? 'bg-grit-green/10 text-grit-green' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {reward.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${reward.available ? 'text-gray-900' : 'text-gray-500'}`}>{reward.title}</h4>
                        <p className={`text-sm ${reward.available ? 'text-gray-900' : 'text-gray-500'}`}>{reward.description}</p>
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
          <div className="px-5 py-6 pb-32">
            <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-300px)] lg:h-[calc(100vh-300px)]">
              {/* Left Sidebar - Conversation List */}
              <div className={`w-full lg:w-[30%] bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${
                showConversationList ? 'block' : 'hidden lg:block'
              }`}>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Conversations
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-900-dark">
                      <div className="mb-2">
                        <svg className="w-12 h-12 mx-auto text-gray-900-dark" fill="currentColor" viewBox="0 0 24 24">
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <h3 className={`font-medium text-sm sm:text-base ${
                                    !conversation.is_read ? 'font-bold' : 'font-normal'
                                  }`}>
                                    {conversation.subject}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${badge.color} self-start sm:self-center`}>
                                    {badge.text}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-900 mb-1 leading-relaxed">
                                  {conversation.last_message_preview || 'No messages yet'}
                                </p>
                                
                                <p className="text-xs text-gray-900-dark">
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
              <div className="w-full lg:flex-1 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col min-h-[400px] lg:h-full">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b border-gray-200">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setShowConversationList(true)}
                        className="lg:hidden mb-3 flex items-center gap-2 text-grit-green hover:text-grit-green-dark transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                        Back to Conversations
                      </button>
                      
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
                          <h4 className="font-medium text-gray-900 mb-2">
                            {evidenceSubmission.title || evidenceSubmission.challenges?.title}
                          </h4>
                          {evidenceSubmission.text_content && (
                            <p className="text-gray-900 text-sm mb-2">{evidenceSubmission.text_content}</p>
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
                        <div className="text-center text-gray-900-dark py-8">
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
                                  ? 'bg-grit-gold-dark text-white'
                                  : message.sender_type === 'announcement'
                                  ? 'bg-yellow-100 text-gray-900 border border-yellow-200'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_type === 'family' ? 'text-grit-gold' : 'text-gray-900-dark'
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
                      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent text-base"
                            disabled={sending}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="px-6 py-3 bg-grit-green text-white rounded-lg hover:bg-grit-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[80px]"
                          >
                            {sending ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-900-dark">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-900-dark" fill="currentColor" viewBox="0 0 24 24">
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

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-grit-gold-dark z-50">
        <div className="flex justify-around py-3">
          {/* Home */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'home' 
                ? 'bg-grit-green/10 text-grit-green border-b-2 border-grit-gold-dark' 
                : 'text-gray-900-dark hover:bg-grit-green/5'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">Home</span>
          </button>

          {/* Challenges */}
          <button 
            onClick={() => setActiveTab('challenges')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'challenges' 
                ? 'bg-grit-green/10 text-grit-green border-b-2 border-grit-gold-dark' 
                : 'text-gray-900-dark hover:bg-grit-green/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">Challenges</span>
          </button>

          {/* Progress */}
          <button 
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'progress' 
                ? 'bg-grit-green/10 text-grit-green border-b-2 border-grit-gold-dark' 
                : 'text-gray-900-dark hover:bg-grit-green/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">Progress</span>
          </button>

          {/* Awards */}
          <button 
            onClick={() => setActiveTab('awards')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'awards' 
                ? 'bg-grit-green/10 text-grit-green border-b-2 border-grit-gold-dark' 
                : 'text-gray-900-dark hover:bg-grit-green/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">Awards</span>
          </button>

          {/* Messages */}
          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'messages' 
                ? 'bg-grit-green/10 text-grit-green border-b-2 border-grit-gold-dark' 
                : 'text-gray-900-dark hover:bg-grit-green/5'
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 whitespace-nowrap">Messages</span>
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
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900-dark"
            >
              ×
            </button>
            <div className="p-8 text-center">
              <div className="text-grit-green mb-4 flex justify-center">
                <div className="w-16 h-16">
                  {selectedBadge.icon}
                </div>
              </div>
              <h3 className="text-2xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
                {selectedBadge.name}
              </h3>
              <p className="text-gray-900 mb-6">{selectedBadge.description}</p>
              <div className={`px-6 py-3 rounded-full text-sm font-medium ${
                selectedBadge.earned 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-900-dark'
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
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900-dark"
            >
              ×
            </button>
            <div className="p-8 text-center">
              <div className="text-grit-green mb-4 flex justify-center">
                <div className="w-16 h-16">
                  {selectedReward.icon}
                </div>
              </div>
              <h3 className="text-2xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
                {selectedReward.title}
              </h3>
              <p className="text-gray-900 mb-6">{selectedReward.description}</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">How to Claim:</h4>
                <p className="text-sm text-gray-900">
                  Contact your GRIT leader (Mr A Mackenzie) to arrange collection. 
                  Present your student ID and mention this reward.
                </p>
              </div>
              <button className="w-full bg-grit-green text-white py-3 rounded-lg font-medium hover:bg-grit-green-dark transition-colors">
                Contact Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal />}

      {/* Evidence Submission Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-grit-green mb-4">Submit your Evidence</h3>
            
            {/* Description Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description: <span className="text-red-600">*</span>
              </label>
              <textarea
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder="Describe what you did for this challenge..."
                className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Images (Max 3):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files).slice(0, 3);
                  setEvidenceImages(files);
                }}
                className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
              />
              {evidenceImages.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {evidenceImages.length} image(s) selected
                </p>
              )}
            </div>

            {/* Video Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Video (Optional, Max 30MB):
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 30 * 1024 * 1024) {
                    alert('Video file size must be less than 30MB');
                    e.target.value = '';
                    return;
                  }
                  setEvidenceVideo(file);
                }}
                className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
              />
              {evidenceVideo && (
                <p className="text-sm text-gray-600 mt-1">
                  Video selected: {evidenceVideo.name} ({(evidenceVideo.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEvidenceModal(false);
                  setEvidenceText('');
                  setEvidenceImages([]);
                  setEvidenceVideo(null);
                }}
                className="flex-1 px-4 py-2 border border-grit-gold-dark rounded-lg text-gray-900 font-semibold hover:bg-gray-50"
                disabled={submittingEvidence}
              >
                Cancel
              </button>
              <Button
                onClick={handleSubmitEvidence}
                disabled={!evidenceText.trim() || submittingEvidence}
                className="flex-1 py-2"
              >
                {submittingEvidence ? 'Submitting...' : 'Submit Evidence'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            {/* Close X button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setShowEvidenceModal(false);
                setExpandedChallenge(null);
              }}
              className="absolute top-4 right-4 text-gray-900-dark hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>

            {/* Animated SUBMITTED stamp */}
            <div className="flex justify-center mb-6">
              <img 
                src="/SUBMITTED.svg" 
                alt="Submitted" 
                className="w-32 h-32 animate-bounce"
              />
            </div>

            {/* Success message with student and teacher names */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-900 leading-relaxed">
                Well done, <span className="font-bold text-grit-green">{student?.first_name}</span>!
                <br />
                Your evidence has been submitted successfully!
                <br />
                <br />
                Your GRIT Lead <span className="font-bold text-grit-green">Mr Mackenzie</span> will review your challenge soon.
                <br />
                <br />
                Good luck!
              </p>
            </div>

            {/* Begin New Challenge button */}
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setShowEvidenceModal(false);
                setExpandedChallenge(null);
                setActiveTab('challenges');
              }}
              className="w-full py-3"
            >
              Begin a New Challenge
            </Button>
          </div>
        </div>
      )}

      {/* GRIT Bit Submission Modal */}
      {showGritBitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-grit-green mb-4">Submit GRIT BIT</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Tell us about something you did outside of challenges that shows GRIT! 
              Your GRIT Lead will review and award points.
            </p>
            
            {/* Description Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What did you do? <span className="text-red-600">*</span>
              </label>
              <textarea
                value={gritBitText}
                onChange={(e) => setGritBitText(e.target.value)}
                placeholder="E.g., I helped my neighbor carry groceries, I practiced piano for 30 minutes, I cleaned my room without being asked..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Images (Max 3):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files).slice(0, 3)
                  setGritBitImages(files)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
              />
              {gritBitImages.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {gritBitImages.length} image(s) selected
                </p>
              )}
            </div>

            {/* Video Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Video (Optional, Max 30MB):
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file && file.size > 30 * 1024 * 1024) {
                    alert('Video file size must be less than 30MB')
                    e.target.value = ''
                    return
                  }
                  setGritBitVideo(file)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-green/20 focus:border-grit-green"
              />
              {gritBitVideo && (
                <p className="text-sm text-gray-600 mt-1">
                  Video selected: {gritBitVideo.name} ({(gritBitVideo.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGritBitModal(false)
                  setGritBitText('')
                  setGritBitImages([])
                  setGritBitVideo(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submittingGritBit}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGritBit}
                disabled={!gritBitText.trim() || submittingGritBit}
                className="flex-1 px-4 py-2 bg-grit-gold-dark text-white rounded-lg hover:bg-grit-gold-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingGritBit ? 'Submitting...' : 'Submit GRIT BIT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRIT Bit Success Modal */}
      {showGritBitSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            {/* Close X button */}
            <button
              onClick={() => {
                setShowGritBitSuccessModal(false);
                setShowGritBitModal(false);
                setGritBitText('');
                setGritBitImages([]);
                setGritBitVideo(null);
              }}
              className="absolute top-4 right-4 text-gray-900-dark hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>

            {/* Animated SUBMITTED stamp */}
            <div className="flex justify-center mb-6">
              <img 
                src="/SUBMITTED.svg" 
                alt="Submitted" 
                className="w-32 h-32 animate-bounce"
              />
            </div>

            {/* Success message with student and teacher names */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-900 leading-relaxed">
                Well done, <span className="font-bold text-grit-green">{student?.first_name}</span>!
                <br />
                Your GRIT Bit has been submitted successfully!
                <br />
                <br />
                Your GRIT Lead <span className="font-bold text-grit-green">Mr Mackenzie</span> will review your submission soon.
                <br />
                <br />
                Good luck!
              </p>
            </div>

            {/* Submit Another GRIT Bit button */}
            <Button
              onClick={() => {
                setShowGritBitSuccessModal(false);
                setShowGritBitModal(false);
                setGritBitText('');
                setGritBitImages([]);
                setGritBitVideo(null);
                setActiveTab('home');
              }}
              className="w-full py-3"
            >
              Submit Another GRIT Bit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const ChallengeCard = ({ challenge, status: displayStatus, isExpanded, onExpand, onCollapse, onBeginChallenge, onCompleteChallenge }) => {
  const trait = challenge.challenges?.trait || challenge.trait
  const points = challenge.challenges?.points || challenge.points
  const pathway = challenge.challenges?.pathway || challenge.pathway
  const status = challenge.status
  
  // Log challenge structure when expanded
  if (isExpanded) {
    console.log('Expanded challenge structure:', challenge);
  }
  
  const traitColors = {
    'COURAGE': { bg: 'bg-red-500', text: 'text-white', border: 'border-l-red-500' },
    'KINDNESS': { bg: 'bg-pink-500', text: 'text-white', border: 'border-l-pink-500' },
    'RESILIENCE': { bg: 'bg-orange-500', text: 'text-white', border: 'border-l-orange-500' },
    'INTEGRITY': { bg: 'bg-green-500', text: 'text-white', border: 'border-l-green-500' },
    'RESPECT': { bg: 'bg-purple-500', text: 'text-white', border: 'border-l-purple-500' },
    'RESPONSIBILITY': { bg: 'bg-indigo-500', text: 'text-white', border: 'border-l-indigo-500' },
    'PERSEVERANCE': { bg: 'bg-teal-500', text: 'text-white', border: 'border-l-teal-500' },
    'EMPATHY': { bg: 'bg-rose-500', text: 'text-white', border: 'border-l-rose-500' },
    'CREATIVITY': { bg: 'bg-yellow-500', text: 'text-black', border: 'border-l-yellow-500' },
    'LEADERSHIP': { bg: 'bg-lime-500', text: 'text-black', border: 'border-l-lime-500' },
    'HONESTY': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-l-emerald-500' },
    'COMPASSION': { bg: 'bg-fuchsia-500', text: 'text-white', border: 'border-l-fuchsia-500' },
    'DETERMINATION': { bg: 'bg-violet-500', text: 'text-white', border: 'border-l-violet-500' },
    'COOPERATION': { bg: 'bg-amber-500', text: 'text-black', border: 'border-l-amber-500' },
    'PATIENCE': { bg: 'bg-slate-500', text: 'text-white', border: 'border-l-slate-500' },
    'FAIRNESS': { bg: 'bg-stone-500', text: 'text-white', border: 'border-l-stone-500' },
    // Database traits from console
    'OPENNESS': { bg: 'bg-sky-500', text: 'text-white', border: 'border-l-sky-500' },
    'BRAVERY': { bg: 'bg-red-600', text: 'text-white', border: 'border-l-red-600' },
    'JUSTICE': { bg: 'bg-blue-600', text: 'text-white', border: 'border-l-blue-600' },
    'CONFIDENCE': { bg: 'bg-yellow-600', text: 'text-black', border: 'border-l-yellow-600' },
    'INDEPENDENCE': { bg: 'bg-blue-500', text: 'text-white', border: 'border-l-blue-500' },
    'WISDOM': { bg: 'bg-indigo-600', text: 'text-white', border: 'border-l-indigo-600' },
    'SKILL': { bg: 'bg-green-600', text: 'text-white', border: 'border-l-green-600' },
    'COMMUNICATION': { bg: 'bg-cyan-500', text: 'text-white', border: 'border-l-cyan-500' },
    'ARTISTRY': { bg: 'bg-pink-600', text: 'text-white', border: 'border-l-pink-600' },
    'AWARENESS': { bg: 'bg-teal-600', text: 'text-white', border: 'border-l-teal-600' },
    'INNOVATION': { bg: 'bg-purple-600', text: 'text-white', border: 'border-l-purple-600' },
    'LOGIC': { bg: 'bg-gray-600', text: 'text-white', border: 'border-l-gray-600' },
    'CURIOSITY': { bg: 'bg-orange-600', text: 'text-white', border: 'border-l-orange-600' },
    'ORGANISATION': { bg: 'bg-emerald-600', text: 'text-white', border: 'border-l-emerald-600' },
    'POSITIVITY': { bg: 'bg-lime-600', text: 'text-black', border: 'border-l-lime-600' },
    'REFLECTION': { bg: 'bg-violet-600', text: 'text-white', border: 'border-l-violet-600' },
    'MINDFULNESS': { bg: 'bg-rose-600', text: 'text-white', border: 'border-l-rose-600' },
    'SELF-CONTROL': { bg: 'bg-slate-600', text: 'text-white', border: 'border-l-slate-600' },
    'KNOWLEDGE': { bg: 'bg-blue-700', text: 'text-white', border: 'border-l-blue-700' },
    'SERVICE': { bg: 'bg-green-700', text: 'text-white', border: 'border-l-green-700' },
    'DISCIPLINE': { bg: 'bg-gray-700', text: 'text-white', border: 'border-l-gray-700' },
    'PERSISTENCE': { bg: 'bg-red-700', text: 'text-white', border: 'border-l-red-700' },
    'INITIATIVE': { bg: 'bg-purple-700', text: 'text-white', border: 'border-l-purple-700' },
    'APPRECIATION': { bg: 'bg-yellow-700', text: 'text-black', border: 'border-l-yellow-700' },
    'ADVENTURE': { bg: 'bg-orange-700', text: 'text-white', border: 'border-l-orange-700' },
    'THOUGHTFULNESS': { bg: 'bg-pink-700', text: 'text-white', border: 'border-l-pink-700' },
    'STORYTELLING': { bg: 'bg-indigo-700', text: 'text-white', border: 'border-l-indigo-700' }
  }
  
  const colors = traitColors[trait] || traitColors['RESILIENCE']
  
  // Debug: Log the trait value to see what we're getting
  console.log('Trait value:', trait, 'Colors:', colors)
  
  // Completed challenges styling
  const isCompleted = displayStatus === 'completed'
  const isActive = displayStatus === 'active'
  
  const cardClasses = isCompleted 
    ? 'bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-gray-300 opacity-70'
    : isActive
    ? `bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border}`
    : `bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border}`
  
  // Collapsed view
  if (!isExpanded) {
  return (
      <div className={`${cardClasses} transition-all duration-300 ease-in-out`} onClick={() => onExpand()}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
            <span className={`${isCompleted ? 'bg-gray-200 text-gray-900' : colors.bg + ' ' + colors.text} px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide`}>
            {trait}
          </span>
          {points && (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                isCompleted ? 'bg-gray-300 text-gray-900' : 'bg-grit-gold-dark text-white'
              }`}>
                {points} Points
            </span>
          )}
          {pathway && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
                isCompleted ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
              <div className="w-6 h-6 rounded-full border border-[#991b1b] bg-white flex items-center justify-center">
                <img src="/ACTIVE.svg" alt="" className="w-4 h-4" />
            </div>
          )}
          {isCompleted && (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <img src="/COMPLETED.svg" alt="" className="w-4 h-4" />
            </div>
          )}
            {!isActive && !isCompleted && (
              <div className="w-6 h-6 rounded-full border border-grit-gold-dark bg-white"></div>
            )}
        </div>
      </div>
      
      <h3 className={`font-['Roboto_Slab'] font-semibold text-base mb-2 uppercase tracking-wide ${
          isCompleted ? 'text-gray-900-dark' : 'text-grit-green'
      }`}>
        {challenge.challenges?.title || challenge.title}
      </h3>
      
      <p className={`text-sm leading-relaxed mb-3 ${
          isCompleted ? 'text-gray-900-dark' : 'text-gray-900'
      }`}>
        {challenge.challenges?.description || challenge.description}
      </p>
      
      {displayStatus === 'available' && (
          <button className="w-full bg-grit-green text-white font-medium py-2 px-4 rounded-lg hover:bg-grit-green-dark transition-colors text-sm">
          Investigate Challenge
        </button>
      )}
    </div>
  )
}

  // Expanded view
    return (
    <div 
      className={`border-l-4 ${colors.border} rounded-lg p-4 bg-white shadow-lg transition-all duration-300 ease-in-out cursor-pointer`}
      onClick={onCollapse}
    >
      {/* Header - same as collapsed */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-semibold`}>
            {trait}
          </span>
          <span className="bg-grit-gold-dark text-white px-3 py-1 rounded-full text-xs font-semibold">
            {points} Points
          </span>
          {pathway && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
      </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="w-6 h-6 rounded-full border border-[#991b1b] bg-white flex items-center justify-center">
              <img src="/ACTIVE.svg" alt="" className="w-4 h-4" />
            </div>
          )}
          {isCompleted && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <img src="/COMPLETED.svg" alt="" className="w-4 h-4" />
            </div>
          )}
          {!isActive && !isCompleted && (
            <div className="w-6 h-6 rounded-full border border-grit-gold-dark bg-white"></div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-grit-green mb-2">{challenge.challenges?.title || challenge.title}</h3>
      
      {/* Description - Always shown */}
      <p className="text-sm text-gray-900 mb-4 leading-relaxed">
        {challenge.challenges?.description || challenge.description}
      </p>

      {/* Hero Image/Carousel */}
      {((challenge.challenges?.hero_image_url || challenge.hero_image_url) || (challenge.challenges?.additional_images?.length > 0 || challenge.additional_images?.length > 0)) && (
        <div className="mb-4 rounded-lg overflow-hidden">
          {/* If only hero_image_url, show single image */}
          {!(challenge.challenges?.additional_images?.length || challenge.additional_images?.length) && (
            <img 
              src={challenge.challenges?.hero_image_url || challenge.hero_image_url} 
              alt={challenge.challenges?.title || challenge.title}
              className="w-full h-48 object-cover"
            />
          )}
          
          {/* If additional_images exist, show carousel */}
          {(challenge.challenges?.additional_images?.length > 0 || challenge.additional_images?.length > 0) && (
            <ImageCarousel 
              images={[
                challenge.challenges?.hero_image_url || challenge.hero_image_url, 
                ...(challenge.challenges?.additional_images || challenge.additional_images || [])
              ]} 
            />
          )}
        </div>
      )}

      {/* More Information and Tips Section - Only show if detailed_description or hints exist */}
      {(() => {
        const description = challenge.challenges?.description || challenge.description || ''
        const detailedDescription = challenge.challenges?.detailed_description || challenge.detailed_description || ''
        const hints = challenge.challenges?.hints || challenge.hints || []
        const hasDetailedDescription = detailedDescription && detailedDescription.trim() !== '' && detailedDescription !== description
        const hasHints = Array.isArray(hints) && hints.length > 0
        
        // Only show this section if we have detailed description or hints
        if (!hasDetailedDescription && !hasHints) {
          return null
        }
        
        return (
          <div className="mb-4 space-y-4">
            {/* More Information - Only if detailed_description exists and is different from description */}
            {hasDetailedDescription && (
              <div>
                <h4 className="font-semibold text-sm text-grit-green mb-2">More Information:</h4>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {detailedDescription}
                </p>
              </div>
            )}

            {/* Tips - Only if hints array has items */}
            {hasHints && (
              <div>
                <h4 className="font-semibold text-sm text-grit-green mb-2">Tips:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {hints.map((hint, index) => (
                    <li key={index} className="text-sm text-gray-900">{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })()}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {(status === 'not_started' || displayStatus === 'available') && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Begin button clicked, challenge:', challenge);
              const challengeId = challenge.challenges?.id || challenge.id;
              onBeginChallenge(challengeId);
            }}
            className="flex-1 py-3"
          >
            Begin Challenge
          </Button>
        )}
        
        {(status === 'in_progress' || status === 'submitted') && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const challengeId = challenge.challenges?.id || challenge.id;
              onCompleteChallenge(challengeId);
            }}
            className="flex-1 py-3 bg-grit-green"
          >
            Submit Evidence
          </Button>
        )}
      </div>
      </div>
    )
}


export default FamilyDashboard
