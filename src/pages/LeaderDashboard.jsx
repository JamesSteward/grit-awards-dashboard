import React, { useState, useEffect } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import GrungeOverlay from '../components/GrungeOverlay'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts'

// Helper function to get display label for pathway
const getPathwayLabel = (pathway) => {
  if (!pathway) return ''
  const pathwayMap = {
    'independent-led': 'Parent/Carer',
    'school-led': 'School',
    'specialist-led': 'Specialist'
  }
  return pathwayMap[pathway.toLowerCase()] || pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

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
  const [composeStudentId, setComposeStudentId] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Evidence approval states
  const [approvingId, setApprovingId] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({ show: false, evidenceId: null, feedback: '' })
  const [pointsModal, setPointsModal] = useState({ show: false, evidenceId: null, submissionType: null })
  const [selectedPoints, setSelectedPoints] = useState(5)
  
  // New evidence review states
  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [reviewingSubmission, setReviewingSubmission] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  
  // Points awarded modal states
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [awardedStudentName, setAwardedStudentName] = useState('')
  const [awardedPoints, setAwardedPoints] = useState(0)
  
  // Feedback sent modal states
  const [showFeedbackSentModal, setShowFeedbackSentModal] = useState(false)
  const [feedbackSentStudentName, setFeedbackSentStudentName] = useState('')
  
  // Media modal states
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  
  // Announcement states
  const [announcementFilters, setAnnouncementFilters] = useState({
    yearLevel: 'all',        // 'all', '3', '4', '5', '6'
    completionStatus: 'all', // 'all', 'active', 'completed_3_plus'
    hasActiveChallenges: false // boolean filter
  })
  const [recipientCount, setRecipientCount] = useState(0)

  // Reports modal states
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')
  const [selectedReportStudent, setSelectedReportStudent] = useState('')
  const [reportOptions, setReportOptions] = useState({
    includeCompletionDetails: false,
    includeEvidenceSubmissions: false,
    includeAttendance: false
  })
  const [reportFormat, setReportFormat] = useState('pdf')

  // School ID - in real app, this would come from user auth
  // For now, using the school ID from our seeded data
  const schoolId = '550e8400-e29b-41d4-a716-446655440000'
  
  // Teacher ID - in real app, this would come from user auth
  // For now, using a placeholder teacher ID
  const teacherId = '750e8400-e29b-41d4-a716-446655440000'

  // Function to get category-specific colors (same as NewSchoolWizard)
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Leadership': 'bg-blue-600',
      'Kindness': 'bg-pink-500',
      'Responsibility': 'bg-green-600',
      'Generosity': 'bg-purple-500',
      'Focus': 'bg-indigo-600',
      'Perseverance': 'bg-grit-gold-dark',
      'Respect': 'bg-teal-600',
      'Curiosity': 'bg-yellow-600',
      'Problem Solving': 'bg-red-500',
      'Organization': 'bg-cyan-600',
      'Integrity': 'bg-emerald-600',
      'Creativity': 'bg-violet-600',
      'Teamwork': 'bg-lime-600',
      'Initiative': 'bg-rose-600',
      'Communication': 'bg-sky-600',
      'Empathy': 'bg-fuchsia-600',
      'Decision Making': 'bg-amber-600',
      'Community Service': 'bg-green-700',
      'Wisdom': 'bg-slate-600',
      'Courage': 'bg-red-600',
      'Inspiration': 'bg-purple-600',
      'Critical Thinking': 'bg-blue-700',
      'Preparation': 'bg-gray-600',
      'General': 'bg-grit-gold-dark',
      'Patience': 'bg-lime-600',
      'Organisation': 'bg-cyan-600',
      'Self-Reliance': 'bg-emerald-600',
      'Confidence': 'bg-purple-600',
      'Endurance': 'bg-red-600',
      'Discipline': 'bg-slate-600',
      'Boldness': 'bg-grit-gold-dark',
      'Strength': 'bg-red-700',
      'Exploration': 'bg-indigo-500',
      'Positivity': 'bg-yellow-500',
      'Independence': 'bg-teal-700',
      'Mindfulness': 'bg-violet-500',
      'Bravery': 'bg-red-500',
      'Determination': 'bg-grit-gold-dark',
      'Helpfulness': 'bg-green-500',
      'Adventure': 'bg-purple-700',
      'Appreciation': 'bg-emerald-600'
    }
    return categoryColors[category] || 'bg-grit-gold-dark'
  }

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

  // Helper function to detect if URL is a video
  const isVideoUrl = (url) => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Helper function to separate images and videos from media URLs
  const separateMedia = (mediaUrls) => {
    if (!mediaUrls || !Array.isArray(mediaUrls)) return { images: [], videos: [] };
    
    const images = mediaUrls.filter(url => !isVideoUrl(url));
    const videos = mediaUrls.filter(url => isVideoUrl(url));
    
    return { images, videos };
  };

  // Handler for opening image modal
  const handleOpenImageModal = (images, startIndex = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setShowImageModal(true);
  };

  // Handler for opening video modal
  const handleOpenVideoModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };

  // Navigation for image modal
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    fetchAllData()
    fetchPendingSubmissions()
  }, [])

  // Fetch pending evidence submissions for review
  async function fetchPendingSubmissions() {
    const { data, error } = await supabase
      .from('evidence_submissions')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name
        ),
        challenges (
          id,
          title,
          points
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return;
    }

    // Deduplicate submissions - keep only the latest for each student/challenge combination
    const deduplicatedSubmissions = [];
    const seenCombinations = new Set();

    (data || []).forEach(submission => {
      const key = `${submission.student_id}-${submission.challenge_id}`;
      
      if (!seenCombinations.has(key)) {
        seenCombinations.add(key);
        deduplicatedSubmissions.push(submission);
      }
    });

    setPendingSubmissions(deduplicatedSubmissions);
  }

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

  // New evidence approval handler as specified in prompt
  async function handleApproveEvidence(submission) {
    try {
      console.log('Approving evidence submission:', submission);
      setApprovingId(submission.id);
      
      const isGritBit = !submission.challenge_id;
      
      // Update evidence_submissions to approved
      const { error: evidenceError } = await supabase
        .from('evidence_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (evidenceError) throw evidenceError;

      // Update student_progress to approved (only for challenge evidence, not GRIT Bits)
      if (!isGritBit) {
        const { error: progressError } = await supabase
          .from('student_progress')
          .update({ 
            status: 'approved',
            completed_at: new Date().toISOString()
          })
          .eq('student_id', submission.student_id)
          .eq('objective_id', submission.challenge_id);

        if (progressError) throw progressError;
      }

      // Award points
      let pointsAwarded = 0;
      
      if (isGritBit) {
        // Award fixed points for GRIT Bits (10 points)
        pointsAwarded = 10;
        
        // Get current student points
        const { data: studentData, error: fetchError } = await supabase
          .from('students')
          .select('total_grit_points')
          .eq('id', submission.student_id)
          .single();
        
        if (fetchError) {
          // Check if error is due to column not existing
          if (fetchError.message && fetchError.message.includes('column') && fetchError.message.includes('does not exist')) {
            console.error('total_grit_points column does not exist. Please run add_total_grit_points_column.sql in Supabase SQL Editor.');
            throw new Error('Database schema update required. Please contact administrator to run migration: add_total_grit_points_column.sql');
          }
          throw fetchError;
        }
        
        // Update student's total GRIT points
        const { error: updateError } = await supabase
          .from('students')
          .update({ 
            total_grit_points: (studentData.total_grit_points || 0) + pointsAwarded
          })
          .eq('id', submission.student_id);
        
        if (updateError) throw updateError;
      } else {
        // For challenge evidence, use challenge points
        pointsAwarded = submission.challenges?.points || 0;
      }

      // Refresh data
      await fetchAllData();

      // Show custom points awarded modal
      setAwardedStudentName(submission.students.first_name);
      setAwardedPoints(pointsAwarded);
      setShowPointsModal(true);

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowPointsModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error approving evidence:', error);
      alert('Failed to approve evidence: ' + error.message);
    } finally {
      setApprovingId(null);
    }
  }

  const handleApproveEvidenceOld = async (submissionId, submissionType, challengeId) => {
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

  // New request changes handler as specified in prompt
  async function handleRequestChanges() {
    if (!feedbackText.trim()) {
      alert('Please provide feedback before requesting changes.');
      return;
    }

    try {
      console.log('Requesting changes for submission:', reviewingSubmission);
      
      const isGritBit = !reviewingSubmission.challenge_id;

      // Store feedback by prepending to evidence_text (since feedback column doesn't exist)
      const { error: submissionError } = await supabase
        .from('evidence_submissions')
        .update({ 
          status: 'needs_revision',
          text_content: `[FEEDBACK FROM LEADER]: ${feedbackText}\n\n[ORIGINAL]: ${reviewingSubmission.text_content}`
        })
        .eq('id', reviewingSubmission.id);

      if (submissionError) throw submissionError;

      // Update student_progress (only for challenge evidence, not GRIT Bits)
      if (!isGritBit) {
        const { error: progressError } = await supabase
          .from('student_progress')
          .update({ 
            status: 'submitted'  // Use allowed status value
          })
          .eq('student_id', reviewingSubmission.student_id)
          .eq('objective_id', reviewingSubmission.challenge_id);

        if (progressError) throw progressError;
      }

      setShowFeedbackModal(false);
      setFeedbackText('');
      
      // Store student name before clearing reviewingSubmission
      const studentName = reviewingSubmission.students.first_name;
      setReviewingSubmission(null);

      await fetchAllData();

      // Show custom feedback sent modal
      setFeedbackSentStudentName(studentName);
      setShowFeedbackSentModal(true);

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowFeedbackSentModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error requesting changes:', error);
      alert('Failed to send feedback: ' + error.message);
    }
  }

  const handleRequestChangesOld = async (submissionId) => {
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
    if (!composeStudentId || !composeMessage.trim()) {
      alert('Please select a student and enter a message')
      return
    }

    // DEBUG LOGGING
    console.log('=== COMPOSE MESSAGE DEBUG ===')
    console.log('composeStudentId:', composeStudentId)
    console.log('teacherId:', teacherId)
    console.log('composeMessage:', composeMessage)
    
    try {
      setSendingMessage(true)
      const now = new Date().toISOString()

      // 1) Find existing conversation for this student
      const { data: existingConversation, error: findConvError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', composeStudentId)
        .eq('conversation_type', 'general')
        .maybeSingle()

      if (findConvError) throw findConvError

      console.log('existingConversation:', existingConversation)
      console.log('findConvError:', findConvError)

      let conversationId = existingConversation?.id

      // 2) Create conversation if it doesn't exist
      if (!conversationId) {
        const selectedStudent = students.find(s => s.id === composeStudentId)
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            student_id: composeStudentId,
            conversation_type: 'general',
            subject: 'Message from GRIT Leader',
            is_read: false,
            created_at: now,
            last_message_at: now
          })
          .select('id')
          .single()

        if (convError) throw convError
        conversationId = newConversation.id
      }

      console.log('Final conversationId before insert:', conversationId)

      // 3) Insert the message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'leader',
          sender_id: teacherId,
          content: composeMessage.trim(),
          is_read: false,
          created_at: now
        })

      if (msgError) throw msgError

      // 4) Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: now })
        .eq('id', conversationId)

      setSuccessMessage('Message sent successfully!')
      setComposeMessage('')
      setComposeStudentId('')
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
      
      let conversationId = messageOrEvidence.conversation_id || messageOrEvidence.conversations?.id
      
      console.log('DEBUG: Extracted conversationId:', conversationId)
      
      // If no conversation exists, create one
      if (!conversationId) {
        console.log('No conversation found, creating new one...')
        
        const challengeTitle = messageOrEvidence.challenges?.title || messageOrEvidence.title || 'Challenge'
        
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            student_id: messageOrEvidence.student_id,
            evidence_submission_id: messageOrEvidence.id,
            conversation_type: 'evidence_review',
            subject: `Evidence: ${challengeTitle}`,
            is_read: true
          })
          .select()
          .single()
        
        if (createError) throw createError
        
        conversationId = newConversation.id
        console.log('Created new conversation:', conversationId)
        
        // Create initial message from student with their evidence submission
        const evidenceContent = messageOrEvidence.text_content || 'No description provided'
        const submissionDate = new Date(messageOrEvidence.created_at).toLocaleDateString()
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'family',
            sender_id: messageOrEvidence.student_id,
            content: `Evidence submitted for "${challengeTitle}" on ${submissionDate}:\n\n${evidenceContent}`,
            is_read: false
          })
        
        if (messageError) {
          console.error('Error creating initial message:', messageError)
          // Don't throw - conversation is created, we can continue
        }
        
        // Refresh pending evidence to include new conversation
        await fetchAllData()
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
            <p className="text-xl text-gray-900">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-md mx-auto text-center">
                <div className="text-red-jacket mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-heading font-bold text-red-jacket mb-4">
                  Error Loading Dashboard
                </h2>
                <p className="text-gray-900 mb-6">{error}</p>
                <Button onClick={fetchAllData} variant="primary">
                  Try Again
                </Button>
              </Card>
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
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Welcome, Mr Mackenzie
              </h1>
              <p className="text-gray-900-light text-lg">
                St Peter's Catholic Primary School
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-grit-gold-dark rounded-lg p-4 text-center">
                  <div className="text-gray-900-dark text-sm mb-1">Active Challenges</div>
                  <div className="text-white text-4xl font-bold">66</div>
                </div>
                <div className="bg-grit-gold-dark rounded-lg p-4 text-center">
                  <div className="text-gray-900-dark text-sm mb-1">This Week's Completions</div>
                  <div className="text-white text-4xl font-bold">17</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <Card className="mb-6">
              <div className="border-b border-grit-gold-dark">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'students', label: 'Students' },
                    { id: 'evidence', label: 'Pending Evidence', count: pendingEvidence.length },
                    { id: 'review', label: 'Review Evidence', count: pendingSubmissions.length },
                    { id: 'messages', label: 'Messages', count: messages.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-grit-green text-grit-green'
                          : 'border-transparent text-gray-900-dark hover:text-gray-900 hover:border-grit-gold-dark'
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
                          className="w-full px-4 py-2 pr-10 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900-dark pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </div>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="px-4 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent bg-white min-w-[140px]"
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
                        <div className="text-gray-900-dark text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                          No Students Found
                        </h3>
                        <p className="text-gray-900-dark">
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
                            <tr className="border-b border-grit-gold-dark">
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Year</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Current Award</th>
                              <th 
                                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-grit-green transition-colors select-none"
                                onClick={() => handleSort('progress')}
                              >
                                <div className="flex items-center gap-1">
                                  Progress
                                  <div className="flex flex-col">
                                    <svg 
                                      className={`w-3 h-3 ${sortColumn === 'progress' && sortDirection === 'asc' ? 'text-grit-green' : 'text-gray-900-dark'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    <svg 
                                      className={`w-3 h-3 -mt-1 ${sortColumn === 'progress' && sortDirection === 'desc' ? 'text-grit-green' : 'text-gray-900-dark'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                  </div>
                                </div>
                              </th>
                              <th 
                                className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:text-grit-green transition-colors select-none"
                                onClick={() => handleSort('grit_points')}
                              >
                                <div className="flex items-center gap-1">
                                  GRIT Points
                                  <div className="flex flex-col">
                                    <svg 
                                      className={`w-3 h-3 ${sortColumn === 'grit_points' && sortDirection === 'asc' ? 'text-grit-green' : 'text-gray-900-dark'}`} 
                                      viewBox="0 0 24 24" 
                                      fill="currentColor"
                                    >
                                      <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    <svg 
                                      className={`w-3 h-3 -mt-1 ${sortColumn === 'grit_points' && sortDirection === 'desc' ? 'text-grit-green' : 'text-gray-900-dark'}`} 
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
                                      <p className="font-medium text-gray-900 hover:text-grit-green transition-colors">
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
                                    <span className="text-sm text-gray-900">
                                      {student.calculated_progress || 0}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-lg font-semibold text-grit-green">
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

                {/* Review Evidence Tab */}
                {activeTab === 'review' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-grit-green mb-4">Review Evidence</h2>
                      
                      {pendingSubmissions.length === 0 ? (
                        <Card className="text-center">
                          No evidence awaiting review
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {pendingSubmissions.map(submission => (
                            <Card key={submission.id}>
                              {/* Student and Challenge Info */}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900">
                                    {submission.students.first_name} {submission.students.last_name}
                                  </h3>
                                  <p className="text-gray-900">{submission.challenges.title}</p>
                                  <p className="text-sm text-gray-900">
                                    {submission.challenges.points} points
                                  </p>
                                </div>
                                <div className="text-sm text-gray-900">
                                  {new Date(submission.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Evidence Text */}
                              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-900">{submission.text_content}</p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApproveEvidence(submission)}
                                  className="flex-1 py-2"
                                >
                                  Approve
                                </Button>
                                <button
                                  onClick={() => {
                                    setReviewingSubmission(submission);
                                    setShowFeedbackModal(true);
                                  }}
                                  className="flex-1 bg-grit-gold-dark text-white py-2 rounded-lg font-semibold hover:bg-grit-gold-dark/90"
                                >
                                  Request Changes
                                </button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pending Evidence Tab */}
                {activeTab === 'evidence' && (
                  <div>
                    {pendingEvidence.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-900-dark mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                          No Pending Evidence
                        </h3>
                        <p className="text-gray-900-dark">
                          All evidence has been reviewed. Great work!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingEvidence.map((evidence) => (
                          <Card key={evidence.id}>
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex items-start space-x-4 flex-1">
                                <img 
                                  src={`/avatars/${evidence.students?.avatar || 'avatar-pilot-001.svg'}`} 
                                  alt={`${evidence.students?.first_name} ${evidence.students?.last_name}`}
                                  className="w-12 h-12 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {evidence.students?.first_name} {evidence.students?.last_name}
                                    </h4>
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
                                      {evidence.challenges?.category && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(evidence.challenges.category)}`}>
                                          {evidence.challenges.category}
                                        </span>
                                      )}
                                      {evidence.challenges?.points && (
                                        <span className="bg-grit-gold-dark text-white px-2 py-1 rounded text-xs font-bold">
                                          {evidence.challenges.points} pts
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <p className="text-sm text-gray-900 mb-3">
                                    {evidence.text_content || 'No description provided'}
                                  </p>
                                  
                                  {/* Media thumbnails */}
                                  {evidence.media_urls && evidence.media_urls.length > 0 && (() => {
                                    const { images, videos } = separateMedia(evidence.media_urls);
                                    return (
                                      <div className="mb-3">
                                        {/* Images */}
                                        {images.length > 0 && (
                                          <div className="flex gap-2 mb-2 flex-wrap">
                                            {images.slice(0, 3).map((url, index) => (
                                              <div
                                                key={index}
                                                className="relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 flex-shrink-0"
                                                onClick={() => handleOpenImageModal(images, index)}
                                              >
                                                <img 
                                                  src={url} 
                                                  alt={`Evidence ${index + 1}`}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ))}
                                            {images.length > 3 && (
                                              <div 
                                                className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-900-dark flex-shrink-0 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleOpenImageModal(images, 0)}
                                              >
                                                +{images.length - 3} more
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Videos */}
                                        {videos.length > 0 && (
                                          <div className="flex gap-2 flex-wrap">
                                            {videos.map((url, index) => (
                                              <div
                                                key={index}
                                                className="relative w-16 h-16 bg-black rounded-lg overflow-hidden cursor-pointer hover:opacity-80 flex-shrink-0"
                                                onClick={() => handleOpenVideoModal(url)}
                                              >
                                                <video 
                                                  src={url}
                                                  className="w-full h-full object-cover"
                                                />
                                                {/* Play icon overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                  </svg>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {/* Media count text */}
                                        {(images.length > 0 || videos.length > 0) && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {images.length > 0 && `${images.length} image${images.length !== 1 ? 's' : ''}`}
                                            {images.length > 0 && videos.length > 0 && ' + '}
                                            {videos.length > 0 && `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <p className="text-sm text-gray-900-dark">
                                      {new Date(evidence.created_at).toLocaleDateString()} • {formatTimeAgo(evidence.created_at)}
                                    </p>
                                    
                                    {/* Pathway badge moved to bottom */}
                                    {evidence.submission_type === 'challenge' && evidence.challenges?.pathway && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize self-start ${
                                        evidence.challenges.pathway === 'independent-led' 
                                          ? 'bg-green-100 text-green-700' 
                                          : evidence.challenges.pathway === 'specialist-led'
                                          ? 'bg-orange-100 text-orange-700'
                                          : evidence.challenges.pathway === 'school-led'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-grit-gold text-grit-gold-dark'
                                      }`}>
                                        {getPathwayLabel(evidence.challenges.pathway)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action buttons - responsive layout */}
                              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-2 lg:min-w-[200px]">
                                <Button
                                  onClick={() => handleApproveEvidence(evidence)}
                                  disabled={approvingId === evidence.id}
                                  className="bg-grit-green text-white hover:bg-grit-green-dark px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                                  onClick={() => {
                                    setReviewingSubmission(evidence);
                                    setShowFeedbackModal(true);
                                  }}
                                  disabled={approvingId === evidence.id}
                                  className="bg-white border-2 border-gray-400 text-gray-900 hover:bg-gray-50 transition-all px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg"
                                >
                                  Request Changes
                                </button>
                                <button
                                  onClick={() => handleViewConversation(evidence)}
                                  className="bg-gray-100 border-2 border-gray-400 text-gray-900 hover:bg-gray-200 transition-all px-4 py-2 font-medium rounded-lg"
                                >
                                  View Conversation
                                </button>
                              </div>
                            </div>
                          </Card>
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
                        <div className="text-gray-900-dark mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                          No Messages Yet
                        </h3>
                        <p className="text-gray-900-dark">
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
                                  <p className="text-sm text-gray-900-dark">
                                    {message.conversations?.subject || 'Message'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-900-dark">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </p>
                                {message.unread && (
                                  <span className="inline-block w-2 h-2 bg-grit-red rounded-full mt-1"></span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 mt-2 line-clamp-2">
                              {message.content || 'Message preview...'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-8" header="Quick Actions">
              
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setActiveTab('evidence')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full bg-white border border-red-jacket text-red-jacket font-semibold px-6 py-3 rounded-xl hover:bg-red-jacket hover:text-white transition-all relative"
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
                  className="w-full bg-white border border-grit-green text-grit-green font-semibold px-6 py-3 rounded-xl hover:bg-grit-green hover:text-white transition-all"
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
                  className="w-full bg-white border-2 border-gray-400 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all"
                  onClick={() => setShowReportsModal(true)}
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
                
                {/* Year 3 Card - Bar Chart */}
                <Card className="mb-4 p-4 pb-8">
                  <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-[#032717] mb-3">Year 3 Progress Overview</h3>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: 'Completed', value: 45, fill: '#032717' },
                        { name: 'Active', value: 28, fill: '#b5aa91' },
                        { name: 'Awaiting Review', value: 12, fill: '#847147' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#032717]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </Card>

                {/* Year 4 Card - Pie Chart */}
                <Card className="mb-4 p-4 pb-8">
                  <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-[#032717] mb-3">Year 4 Pathway Distribution</h3>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Parent/Carer', value: 38 },
                            { name: 'School', value: 25 },
                            { name: 'Specialist', value: 12 }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          <Cell fill="#032717" />
                          <Cell fill="#b5aa91" />
                          <Cell fill="#847147" />
                        </Pie>
                        <Tooltip />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center" 
                          height={36}
                          wrapperStyle={{ paddingTop: 20 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-[#032717]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </Card>

                {/* Year 5 Card - Line Chart */}
                <Card className="mb-4 p-4 pb-8">
                  <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-[#032717] mb-3">Year 5 Monthly Progress (2025/26)</h3>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { month: 'Sep', completed: 15 },
                        { month: 'Oct', completed: 28 },
                        { month: 'Nov', completed: 45 },
                        { month: 'Dec', completed: 52 },
                        { month: 'Jan', completed: 68 },
                        { month: 'Feb', completed: 85 },
                        { month: 'Mar', completed: 102 },
                        { month: 'Apr', completed: 120 },
                        { month: 'May', completed: 138 },
                        { month: 'Jun', completed: 155 },
                        { month: 'Jul', completed: 170 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completed" stroke="#032717" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-[#032717]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </Card>

                {/* Year 6 Card - Scatter Chart */}
                <Card className="mb-4 p-4 pb-8">
                  <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-[#032717] mb-3">Year 6 Points by Student</h3>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number"
                          dataKey="monthIndex" 
                          name="Month"
                          domain={[0, 10]}
                          tickFormatter={(value) => {
                            const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                            return months[value] || '';
                          }}
                        />
                        <YAxis type="number" dataKey="points" name="GRIT Points" domain={[0, 500]} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value, name, props) => {
                            const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                            if (name === 'points') return [value, 'GRIT Points'];
                            return [months[props.payload.monthIndex] || '', 'Month'];
                          }}
                        />
                        <Legend />
                        <Scatter name="George" data={[
                          { monthIndex: 0, points: 40 },
                          { monthIndex: 1, points: 80 },
                          { monthIndex: 2, points: 140 },
                          { monthIndex: 3, points: 200 },
                          { monthIndex: 4, points: 280 },
                          { monthIndex: 5, points: 320 }
                        ]} fill="#032717" />
                        <Scatter name="Jack" data={[
                          { monthIndex: 0, points: 60 },
                          { monthIndex: 1, points: 120 },
                          { monthIndex: 2, points: 180 },
                          { monthIndex: 3, points: 260 },
                          { monthIndex: 4, points: 340 },
                          { monthIndex: 5, points: 420 }
                        ]} fill="#b5aa91" />
                        <Scatter name="Mia" data={[
                          { monthIndex: 0, points: 20 },
                          { monthIndex: 1, points: 50 },
                          { monthIndex: 2, points: 90 },
                          { monthIndex: 3, points: 120 },
                          { monthIndex: 4, points: 150 },
                          { monthIndex: 5, points: 180 }
                        ]} fill="#847147" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === 3 ? 'bg-[#032717]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            </Card>
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
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowComposeModal(false)
              setSelectedStudent(null)
              setComposeStudentId('')
              setComposeMessage('')
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
              <div className="text-xl font-heading font-semibold text-grit-green mb-4">Compose New Message</div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Student</label>
                <select
                  value={composeStudentId}
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value)
                    setComposeStudentId(e.target.value)
                    setSelectedStudent(student || null)
                  }}
                  className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Message</label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleComposeMessage}
                  disabled={!composeStudentId || !composeMessage.trim() || sendingMessage}
                  variant="primary"
                  className="flex-1"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  onClick={() => {
                    setShowComposeModal(false)
                    setSelectedStudent(null)
                    setComposeStudentId('')
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
        </>
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Year Level</label>
                  <select
                    value={announcementFilters.yearLevel}
                    onChange={(e) => {
                      setAnnouncementFilters(prev => ({ ...prev, yearLevel: e.target.value }))
                      setTimeout(() => updateRecipientCount(), 100)
                    }}
                    className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Completion Filter</label>
                  <select
                    value={announcementFilters.completionStatus}
                    onChange={(e) => {
                      setAnnouncementFilters(prev => ({ ...prev, completionStatus: e.target.value }))
                      setTimeout(() => updateRecipientCount(), 100)
                    }}
                    className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent"
                  >
                    <option value="all">All Students</option>
                    <option value="active">Students with Active Challenges</option>
                    <option value="completed_3_plus">Students who Completed 3+ This Week</option>
                  </select>
                </div>
                
                {/* Recipient Count Preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold text-gray-900">This will send to {recipientCount} families</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Message Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">Announcement Message</label>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-900-dark mt-1">
                {announcementMessage.length}/500 characters
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleSendAnnouncement}
                disabled={!announcementMessage.trim() || sendingMessage || recipientCount === 0}
                className="flex-1 bg-grit-green text-white hover:bg-grit-green-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                  <p className="text-sm text-gray-900-dark">
                    Conversation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConversationModal(false)}
                className="text-gray-900-dark hover:text-gray-900"
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
                      msg.sender_type === 'leader' ? 'text-gray-900-light' : 'text-gray-900-dark'
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
                className="flex-1 px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent resize-none"
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
              <label className="block text-sm font-medium text-gray-900 mb-2">Feedback Message</label>
              <textarea
                value={feedbackModal.feedback}
                onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Explain what changes are needed..."
                className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg focus:ring-2 focus:ring-grit-green focus:border-transparent h-32 resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSendFeedback}
                disabled={!feedbackModal.feedback.trim() || sendingMessage}
                className="flex-1 bg-grit-green text-white hover:bg-grit-green-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
              <p className="text-sm text-gray-900 mb-4">
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
                    className="w-4 h-4 text-grit-green focus:ring-grit-green border-grit-gold-dark"
                  />
                  <div>
                    <span className="font-medium text-gray-900">5 Points</span>
                    <p className="text-sm text-gray-900-dark">Good effort, shows some GRIT</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="points"
                    value={10}
                    checked={selectedPoints === 10}
                    onChange={(e) => setSelectedPoints(parseInt(e.target.value))}
                    className="w-4 h-4 text-grit-green focus:ring-grit-green border-grit-gold-dark"
                  />
                  <div>
                    <span className="font-medium text-gray-900">10 Points</span>
                    <p className="text-sm text-gray-900-dark">Excellent GRIT, outstanding effort</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleAwardPoints}
                disabled={approvingId === pointsModal.evidenceId}
                className="flex-1 bg-grit-green text-white hover:bg-grit-green-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

      {/* New Request Changes Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-grit-green mb-4">Request Changes</h3>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Explain what needs to be improved..."
              className="w-full px-3 py-2 border border-grit-gold-dark rounded-lg resize-none mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setReviewingSubmission(null);
                }}
                className="flex-1 px-4 py-2 border border-grit-gold-dark rounded-lg text-gray-900 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!feedbackText.trim()}
                className="flex-1 bg-grit-green text-white hover:bg-grit-green-dark py-2 rounded-lg font-semibold disabled:opacity-50 transition-all"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Awarded Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-900 mb-4">Points awarded to {awardedStudentName}</p>
            <div className="w-24 h-24 rounded-full bg-grit-gold-dark flex items-center justify-center mx-auto">
              <span className="text-4xl font-bold text-white" style={{fontFamily: 'Roboto Slab'}}>{awardedPoints}</span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Sent Modal */}
      {showFeedbackSentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-grit-green flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-grit-green mb-2">Feedback Sent!</h3>
            <p className="text-gray-900 mb-4">
              Your feedback to <span className="font-semibold text-grit-green">{feedbackSentStudentName}</span> has been sent.
            </p>
            <p className="text-sm text-gray-900">
              They will see your comments and can resubmit.
            </p>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          {/* Close button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl w-12 h-12 flex items-center justify-center"
          >
            ×
          </button>

          {/* Previous button */}
          {selectedImages.length > 1 && (
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 text-white hover:text-gray-300 text-4xl w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div className="max-w-6xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center p-8">
            <img
              src={selectedImages[currentImageIndex]}
              alt={`Evidence ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Image counter */}
            {selectedImages.length > 1 && (
              <div className="mt-4 text-white text-lg">
                {currentImageIndex + 1} of {selectedImages.length}
              </div>
            )}
          </div>

          {/* Next button */}
          {selectedImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 text-white hover:text-gray-300 text-4xl w-12 h-12 flex items-center justify-center"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          {/* Close button */}
          <button
            onClick={() => {
              setShowVideoModal(false);
              setSelectedVideo(null);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl w-12 h-12 flex items-center justify-center"
          >
            ×
          </button>

          {/* Video player */}
          <div className="max-w-6xl max-h-[90vh] w-full p-8">
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-full max-h-[80vh] rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setShowReportsModal(false)
              setSelectedReportType('')
              setSelectedReportStudent('')
              setReportOptions({
                includeCompletionDetails: false,
                includeEvidenceSubmissions: false,
                includeAttendance: false
              })
              setReportFormat('pdf')
            }}
          />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#032717] text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-['Roboto_Slab'] font-bold">Download Reports</h2>
                  <p className="text-sm text-white/80 mt-1">Generate reports for your school's GRIT programme</p>
                </div>
                <button
                  onClick={() => {
                    setShowReportsModal(false)
                    setSelectedReportType('')
                    setSelectedReportStudent('')
                    setReportOptions({
                      includeCompletionDetails: false,
                      includeEvidenceSubmissions: false,
                      includeAttendance: false
                    })
                    setReportFormat('pdf')
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Report Type Selection */}
              <div>
                <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-gray-900 mb-4">Report Type</h3>
                <div className="space-y-3">
                  {[
                    { value: 'monthly', label: 'Monthly Progress Report', description: 'Summary of student activity and completions this month' },
                    { value: 'quarterly', label: 'Quarterly Review', description: 'Detailed breakdown of progress across the term' },
                    { value: 'annual', label: 'Annual Summary', description: 'Full year overview with trends and achievements' },
                    { value: 'ofsted', label: 'OEIR (Overall Evaluation Impact Report)', description: 'Comprehensive impact report measuring programme outcomes and student development' },
                    { value: 'individual', label: 'Individual Student Report', description: 'Detailed progress report for a specific student' }
                  ].map((report) => (
                    <label
                      key={report.value}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={report.value}
                        checked={selectedReportType === report.value}
                        onChange={(e) => {
                          setSelectedReportType(e.target.value)
                          if (e.target.value !== 'individual') {
                            setSelectedReportStudent('')
                          }
                        }}
                        className="mt-1 w-4 h-4 text-[#032717] border-gray-300 focus:ring-[#032717]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{report.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{report.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Student Selection (only for individual reports) */}
              {selectedReportType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Student</label>
                  <select
                    value={selectedReportStudent}
                    onChange={(e) => setSelectedReportStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032717] focus:border-[#032717]"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} (Year {student.year_level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Additional Options */}
              <div>
                <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-gray-900 mb-4">Additional Options</h3>
                <div className="space-y-3">
                  {[
                    { key: 'includeCompletionDetails', label: 'Include challenge completion details' },
                    { key: 'includeEvidenceSubmissions', label: 'Include evidence submissions' },
                    { key: 'includeAttendance', label: 'Include attendance at GRIT Days' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportOptions[option.key]}
                        onChange={(e) => setReportOptions(prev => ({
                          ...prev,
                          [option.key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-[#032717] border-gray-300 rounded focus:ring-[#032717]"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-gray-900 mb-4">Format</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportFormat"
                      value="pdf"
                      checked={reportFormat === 'pdf'}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-4 h-4 text-[#032717] border-gray-300 focus:ring-[#032717]"
                    />
                    <span className="text-sm text-gray-700">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportFormat"
                      value="csv"
                      checked={reportFormat === 'csv'}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-4 h-4 text-[#032717] border-gray-300 focus:ring-[#032717]"
                    />
                    <span className="text-sm text-gray-700">Excel/CSV</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowReportsModal(false)
                    setSelectedReportType('')
                    setSelectedReportStudent('')
                    setReportOptions({
                      includeCompletionDetails: false,
                      includeEvidenceSubmissions: false,
                      includeAttendance: false
                    })
                    setReportFormat('pdf')
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedReportType === 'individual' && !selectedReportStudent) {
                      alert('Please select a student for individual reports.')
                      return
                    }
                    alert('Report generation coming soon. This feature will be available in the full release.')
                    setShowReportsModal(false)
                  }}
                  disabled={!selectedReportType || (selectedReportType === 'individual' && !selectedReportStudent)}
                  variant="primary"
                  className="flex-1 bg-[#032717] hover:bg-[#032717]/90"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 border-t border-grit-gold-dark py-5 mt-10">
        <div className="flex justify-center items-center gap-10 flex-wrap">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('FAQ coming soon'); }} className="flex items-center gap-2 text-gray-900 hover:text-grit-green transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5"/></svg>
            Lost? Read our FAQ
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Support request coming soon'); }} className="flex items-center gap-2 text-gray-900 hover:text-grit-green transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            Need Help? Support Request
          </a>
          <button onClick={async () => { 
            try {
              await supabase.auth.signOut()
              localStorage.removeItem('auth')
              navigate('/')
            } catch (error) {
              console.error('Error signing out:', error)
              navigate('/')
            }
          }} className="flex items-center gap-2 text-gray-900 hover:text-grit-green transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </footer>
    </div>
  )
}

export default LeaderDashboard
