import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'
import Input from './Input'
import { supabase } from '../lib/supabaseClient'

const NewSchoolWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState('pricing') // 'pricing', 'schoolDetails', 'csvUpload', 'challengeSelection'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [schoolDetails, setSchoolDetails] = useState({
    firstName: '',
    lastName: '',
    schoolName: '',
    contactNumber: '',
    address: ''
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedYearGroup, setSelectedYearGroup] = useState(null)
  const [selectedChallenges, setSelectedChallenges] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loadingChallenges, setLoadingChallenges] = useState(false)
  const [expandedPathways, setExpandedPathways] = useState(['specialist-led']) // Default: first pathway expanded
  const [expandedSubcategories, setExpandedSubcategories] = useState({}) // Track expanded subcategories per pathway
  
  const navigate = useNavigate()
  
  // Function to get category-specific colors
  const getCategoryColor = (category) => {
    console.log('Getting color for category:', category)
    
    const categoryColors = {
      // Exact matches
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
      
      // Additional categories from database
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
      
      // Common variations
      'LEADERSHIP': 'bg-blue-600',
      'KINDNESS': 'bg-pink-500',
      'RESPONSIBILITY': 'bg-green-600',
      'GENEROSITY': 'bg-purple-500',
      'FOCUS': 'bg-indigo-600',
      'PERSEVERANCE': 'bg-grit-gold-dark',
      'RESPECT': 'bg-teal-600',
      'CURIOSITY': 'bg-yellow-600',
      'PROBLEM SOLVING': 'bg-red-500',
      'ORGANIZATION': 'bg-cyan-600',
      'INTEGRITY': 'bg-emerald-600',
      'CREATIVITY': 'bg-violet-600',
      'TEAMWORK': 'bg-lime-600',
      'INITIATIVE': 'bg-rose-600',
      'COMMUNICATION': 'bg-sky-600',
      'EMPATHY': 'bg-fuchsia-600',
      'DECISION MAKING': 'bg-amber-600',
      'COMMUNITY SERVICE': 'bg-green-700',
      'WISDOM': 'bg-slate-600',
      'COURAGE': 'bg-red-600',
      'INSPIRATION': 'bg-purple-600',
      'CRITICAL THINKING': 'bg-blue-700',
      'PREPARATION': 'bg-gray-600',
      'GENERAL': 'bg-grit-gold-dark',
      
      // Additional uppercase variations
      'PATIENCE': 'bg-lime-600',
      'ORGANISATION': 'bg-cyan-600',
      'SELF-RELIANCE': 'bg-emerald-600',
      'CONFIDENCE': 'bg-purple-600',
      'ENDURANCE': 'bg-red-600',
      'DISCIPLINE': 'bg-slate-600',
      'BOLDNESS': 'bg-grit-gold-dark',
      'STRENGTH': 'bg-red-700',
      'EXPLORATION': 'bg-indigo-500',
      'POSITIVITY': 'bg-yellow-500',
      'INDEPENDENCE': 'bg-teal-700',
      'MINDFULNESS': 'bg-violet-500',
      'BRAVERY': 'bg-red-500',
      'DETERMINATION': 'bg-grit-gold-dark',
      'HELPFULNESS': 'bg-green-500',
      'ADVENTURE': 'bg-purple-700'
    }
    
    const color = categoryColors[category] || 'bg-grit-gold-dark'
    console.log('Selected color for', category, ':', color)
    return color
  }
  
  if (!isOpen) return null

  // Hardcoded challenges for each year group (fallback if database fails)
  const yearGroupChallenges = {
    'Year 3': [
      { id: 1, title: 'Help a Friend', description: 'Assist a classmate with their work', tenacity: 20, category: 'Kindness' },
      { id: 2, title: 'Clean Up', description: 'Help tidy the classroom', tenacity: 15, category: 'Responsibility' },
      { id: 3, title: 'Share Something', description: 'Share materials or ideas with others', tenacity: 25, category: 'Generosity' },
      { id: 4, title: 'Listen Carefully', description: 'Pay attention during lessons', tenacity: 20, category: 'Focus' },
      { id: 5, title: 'Try Your Best', description: 'Put effort into all activities', tenacity: 30, category: 'Perseverance' },
      { id: 6, title: 'Be Kind', description: 'Show kindness to everyone', tenacity: 25, category: 'Kindness' },
      { id: 7, title: 'Follow Rules', description: 'Follow classroom and school rules', tenacity: 15, category: 'Respect' },
      { id: 8, title: 'Ask Questions', description: 'Ask thoughtful questions', tenacity: 20, category: 'Curiosity' }
    ],
    'Year 4': [
      { id: 9, title: 'Lead a Group', description: 'Take charge of a group activity', tenacity: 30, category: 'Leadership' },
      { id: 10, title: 'Solve Problems', description: 'Work through challenges independently', tenacity: 35, category: 'Problem Solving' },
      { id: 11, title: 'Help Others', description: 'Assist younger students', tenacity: 25, category: 'Kindness' },
      { id: 12, title: 'Organize Tasks', description: 'Plan and organize your work', tenacity: 30, category: 'Organization' },
      { id: 13, title: 'Show Respect', description: 'Demonstrate respect for others', tenacity: 20, category: 'Respect' },
      { id: 14, title: 'Take Responsibility', description: 'Own up to mistakes', tenacity: 35, category: 'Integrity' },
      { id: 15, title: 'Be Creative', description: 'Think outside the box', tenacity: 30, category: 'Creativity' },
      { id: 16, title: 'Work Together', description: 'Collaborate effectively', tenacity: 25, category: 'Teamwork' }
    ],
    'Year 5': [
      { id: 17, title: 'Mentor Others', description: 'Guide younger students', tenacity: 40, category: 'Leadership' },
      { id: 18, title: 'Plan Events', description: 'Organize school activities', tenacity: 35, category: 'Organization' },
      { id: 19, title: 'Resolve Conflicts', description: 'Help solve disagreements', tenacity: 40, category: 'Problem Solving' },
      { id: 20, title: 'Show Initiative', description: 'Take action without being asked', tenacity: 35, category: 'Initiative' },
      { id: 21, title: 'Demonstrate Integrity', description: 'Do the right thing', tenacity: 45, category: 'Integrity' },
      { id: 22, title: 'Be Persistent', description: 'Keep trying despite challenges', tenacity: 40, category: 'Perseverance' },
      { id: 23, title: 'Communicate Well', description: 'Express ideas clearly', tenacity: 30, category: 'Communication' },
      { id: 24, title: 'Show Empathy', description: 'Understand others\' feelings', tenacity: 35, category: 'Empathy' }
    ],
    'Year 6': [
      { id: 25, title: 'Lead Projects', description: 'Take charge of major projects', tenacity: 50, category: 'Leadership' },
      { id: 26, title: 'Make Decisions', description: 'Make thoughtful choices', tenacity: 45, category: 'Decision Making' },
      { id: 27, title: 'Support Community', description: 'Help in the wider community', tenacity: 50, category: 'Community Service' },
      { id: 28, title: 'Show Wisdom', description: 'Make wise choices', tenacity: 45, category: 'Wisdom' },
      { id: 29, title: 'Be Courageous', description: 'Stand up for what\'s right', tenacity: 50, category: 'Courage' },
      { id: 30, title: 'Inspire Others', description: 'Motivate classmates', tenacity: 45, category: 'Inspiration' },
      { id: 31, title: 'Think Critically', description: 'Analyze situations carefully', tenacity: 40, category: 'Critical Thinking' },
      { id: 32, title: 'Prepare for Future', description: 'Get ready for secondary school', tenacity: 45, category: 'Preparation' }
    ]
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    if (plan === 'Gold') {
      setCurrentStep('schoolDetails')
    }
  }

  const handleSchoolDetailsChange = (field, value) => {
    setSchoolDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleCsvUpload = () => {
    setCurrentStep('csvUpload')
    setUploadProgress(0)
    
    // Simulate progress over 4 seconds
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setCurrentStep('challengeSelection')
          return 100
        }
        return prev + 2.5 // 100% over 4 seconds (100/40 = 2.5)
      })
    }, 100)
  }

  const fetchChallengesForYearGroup = async (yearGroup) => {
    setLoadingChallenges(true)
    try {
      console.log('Attempting to fetch challenges from database for year group:', yearGroup)
      
      // First, let's check if the challenges table exists and what data is in it
      const { data: allData, error: allError } = await supabase
        .from('challenges')
        .select('*')
        .limit(3)

      console.log('Sample of all challenges data:', allData, 'Error:', allError)

      // Fetch all challenges from database (no year group filtering needed)
      const { data, error } = await supabase
        .from('challenges')
        .select('*')

      console.log('Full query result - Data:', data, 'Error:', error)
      console.log('Number of challenges found:', data?.length || 0)

      if (error) {
        console.error('Error fetching challenges:', error)
        console.log('Falling back to hardcoded challenges')
        setChallenges(yearGroupChallenges[yearGroup] || [])
      } else if (!data || data.length === 0) {
        console.log('No challenges found in database, using fallback')
        setChallenges(yearGroupChallenges[yearGroup] || [])
      } else {
        console.log('Successfully fetched', data.length, 'challenges from database')
        
        // Process the data to ensure we have the right fields
        const processedChallenges = data.map(challenge => ({
          id: challenge.id,
          title: challenge.title || challenge.name || 'Untitled Challenge',
          description: challenge.description || challenge.text || 'No description available',
          tenacity: challenge.tenacity || challenge.points || 0,
          category: challenge.category || challenge.trait || 'General',
          pathway: challenge.pathway || 'independent-led', // Default to independent-led if not specified
          subcategory: challenge.subcategory || 'General'
        }))
        
        console.log('Processed challenges for', yearGroup, ':', processedChallenges)
        setChallenges(processedChallenges)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
      console.log('Exception caught, using fallback challenges')
      setChallenges(yearGroupChallenges[yearGroup] || [])
    } finally {
      setLoadingChallenges(false)
    }
  }

  const handleYearGroupSelect = (yearGroup) => {
    setSelectedYearGroup(yearGroup)
    setSelectedChallenges([])
    setExpandedPathways(['specialist-led']) // Reset to first pathway expanded
    setExpandedSubcategories({}) // Reset expanded subcategories
    fetchChallengesForYearGroup(yearGroup)
  }

  const togglePathway = (pathway) => {
    setExpandedPathways(prev => 
      prev.includes(pathway) 
        ? prev.filter(p => p !== pathway)
        : [...prev, pathway]
    )
  }

  const toggleSubcategory = (pathway, subcategory) => {
    const key = `${pathway}-${subcategory}`
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Organize challenges by pathway and subcategory
  const organizeChallengesByPathway = (challenges) => {
    const pathways = {
      'specialist-led': {
        name: 'Specialist Challenges',
        description: 'Delivered by UKMS veterans during GRIT Days',
        subcategories: {
          'Mapping & Navigation': [],
          'CPR & First Aid': [],
          'Fitness, Military & Outdoor Performance': [],
          'STEM – Go-Kart Engineering': [],
          'Team Building & Leadership': []
        }
      },
      'school-led': {
        name: 'School Challenges',
        description: "Integrated into your school's curriculum",
        subcategories: {
          'English': [],
          'Maths': [],
          'Science': [],
          'History': [],
          'Geography': [],
          'Art / Design + Technology': [],
          'PE, Health & Sport': [],
          'PSHE & Citizenship': []
        }
      },
      'independent-led': {
        name: 'Parent/Carer Challenges',
        description: 'Completed at home with family support',
        subcategories: {
          'Home & Daily Living': [],
          'Personal Organisation & Self-Care': [],
          'Community, Relationships & Character': [],
          'Money, Travel & Responsibility': [],
          'Outdoor & Nature': [],
          'Practical Hands-On Skills': [],
          'Life Experience & Personal Growth': []
        }
      }
    }

    // Group challenges by pathway and subcategory
    challenges.forEach(challenge => {
      // Normalize pathway key (handle various formats)
      let pathwayKey = challenge.pathway?.toLowerCase().replace(/\s+/g, '-') || 'independent-led'
      
      // Map common variations
      if (pathwayKey.includes('specialist')) pathwayKey = 'specialist-led'
      else if (pathwayKey.includes('school')) pathwayKey = 'school-led'
      else if (pathwayKey.includes('independent') || pathwayKey.includes('home') || pathwayKey.includes('family')) {
        pathwayKey = 'independent-led'
      }
      
      const pathway = pathways[pathwayKey] || pathways['independent-led']
      
      const subcategory = challenge.subcategory || 'General'
      // Find matching subcategory (case-insensitive, flexible matching)
      let matchingSubcategory = Object.keys(pathway.subcategories).find(
        sc => sc.toLowerCase() === subcategory.toLowerCase() || 
              subcategory.toLowerCase().includes(sc.toLowerCase()) ||
              sc.toLowerCase().includes(subcategory.toLowerCase())
      )
      
      // If no match found, try to match by partial string
      if (!matchingSubcategory) {
        matchingSubcategory = Object.keys(pathway.subcategories).find(
          sc => {
            const scLower = sc.toLowerCase()
            const subLower = subcategory.toLowerCase()
            return scLower.includes(subLower) || subLower.includes(scLower)
          }
        )
      }
      
      // Default to first subcategory if still no match
      if (!matchingSubcategory) {
        matchingSubcategory = Object.keys(pathway.subcategories)[0]
      }
      
      if (pathway.subcategories[matchingSubcategory]) {
        pathway.subcategories[matchingSubcategory].push(challenge)
      }
    })

    return pathways
  }

  const getSelectedCountForPathway = (pathwayData) => {
    return Object.values(pathwayData.subcategories).flat().filter(c => selectedChallenges.includes(c.id)).length
  }

  const getTotalCountForPathway = (pathwayData) => {
    return Object.values(pathwayData.subcategories).flat().length
  }

  const getSelectedCountForSubcategory = (subcategoryChallenges) => {
    return subcategoryChallenges.filter(c => selectedChallenges.includes(c.id)).length
  }

  const handleChallengeToggle = (challengeId) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(id => id !== challengeId)
      } else {
        return [...prev, challengeId]
      }
    })
  }

  const handleConfirmAndViewLogin = () => {
    onClose()
    navigate('/grit-leader-login')
  }

  const renderPricingStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-900 text-lg">
          Select the perfect plan for your school's GRIT Awards implementation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Bronze', 'Silver', 'Gold'].map((plan) => (
          <Card key={plan} className={`relative ${selectedPlan === plan ? 'ring-2 ring-grit-green' : ''}`}>
            <div className="text-center">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-2">
                {plan === 'Bronze' ? 'Op Resilience Package' : 
                 plan === 'Silver' ? 'Mission Leadership Package' : 
                 'Life Ready Package'}
              </h3>
              <div className="text-sm font-bold text-grit-gold-dark mb-4">
                {plan === 'Bronze' ? 'from £12,500 + VAT per academic year' :
                 plan === 'Silver' ? 'from £16,500 + VAT per academic year' :
                 'from £19,500 + VAT per academic year'}
              </div>
              <ul className="text-sm text-gray-900 mb-6 space-y-2">
                {plan === 'Bronze' && (
                  <>
                    <li>• 70 Challenges</li>
                    <li>• 10 UKMS Specialist Days</li>
                    <li>• 1 Cohort (up to 30 pupils)</li>
                    <li>• Email Support</li>
                  </>
                )}
                {plan === 'Silver' && (
                  <>
                    <li>• 100 Challenges</li>
                    <li>• 15 UKMS Specialist Days</li>
                    <li>• 2 Cohorts up to 60 Pupils</li>
                    <li>• Email + Phone support</li>
                  </>
                )}
                {plan === 'Gold' && (
                  <>
                    <li>• Customisable Full Grit Awards Pathway</li>
                    <li>• 120 Plus Challenges</li>
                    <li>• 20 UKMS Specialist Day</li>
                    <li>• Unlimited Cohorts | Pupils</li>
                  </>
                )}
              </ul>
              <Button
                variant={plan === 'Gold' ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handlePlanSelect(plan)}
                disabled={plan !== 'Gold'}
              >
                Get Started
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSchoolDetailsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
          School Details
        </h2>
        <p className="text-gray-900 text-lg">
          Tell us about your school to get started with GRIT Awards
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                First Name *
              </label>
              <Input
                value={schoolDetails.firstName}
                onChange={(e) => handleSchoolDetailsChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Last Name *
              </label>
              <Input
                value={schoolDetails.lastName}
                onChange={(e) => handleSchoolDetailsChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              School Name *
            </label>
            <Input
              value={schoolDetails.schoolName}
              onChange={(e) => handleSchoolDetailsChange('schoolName', e.target.value)}
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contact Number *
            </label>
            <Input
              value={schoolDetails.contactNumber}
              onChange={(e) => handleSchoolDetailsChange('contactNumber', e.target.value)}
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address *
            </label>
            <Input
              value={schoolDetails.address}
              onChange={(e) => handleSchoolDetailsChange('address', e.target.value)}
              placeholder="Enter school address"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-grit-green mb-4">
              Complete Setup
            </h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-3"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Complete with Google Classroom
              </Button>

              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-3"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Complete with Microsoft SSO
              </Button>

              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-3"
                onClick={handleCsvUpload}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                </svg>
                Upload as CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderCsvUploadStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
          Uploading Students
        </h2>
        <p className="text-gray-900 text-lg">
          Processing your CSV file...
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-grit-green h-3 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-900">
            {uploadProgress}% Complete
          </p>
        </div>
      </Card>
    </div>
  )

  const renderChallengeSelectionStep = () => {
    const organizedChallenges = selectedYearGroup && challenges.length > 0 
      ? organizeChallengesByPathway(challenges)
      : null

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
            Select Challenges
          </h2>
          <p className="text-gray-900 text-lg mb-2">
            {selectedYearGroup 
              ? `Select challenges for ${selectedYearGroup}. We recommend a mix from each pathway for a well-rounded programme.`
              : "Select challenges to build your school's programme"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Total Selected: {selectedChallenges.length}
          </p>
        </div>

        {/* Year Group Tabs */}
        <div className="mb-6">
          <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-grit-green mb-4">
            Year Group
          </h3>
          <div className="flex gap-3 flex-wrap">
            {['Year 3', 'Year 4', 'Year 5', 'Year 6'].map((yearGroup) => (
              <Button
                key={yearGroup}
                variant={selectedYearGroup === yearGroup ? 'primary' : 'secondary'}
                onClick={() => handleYearGroupSelect(yearGroup)}
              >
                {yearGroup}
              </Button>
            ))}
          </div>
        </div>

        {selectedYearGroup && (
          <div className="mb-6">
            {loadingChallenges ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-grit-green"></div>
                <p className="mt-2 text-gray-900">Loading challenges...</p>
              </div>
            ) : organizedChallenges ? (
              <div className="space-y-4">
                {Object.entries(organizedChallenges).map(([pathwayKey, pathwayData]) => {
                  const isExpanded = expandedPathways.includes(pathwayKey)
                  const selectedCount = getSelectedCountForPathway(pathwayData)
                  const totalCount = getTotalCountForPathway(pathwayData)

                  return (
                    <div key={pathwayKey} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Pathway Header */}
                      <button
                        onClick={() => togglePathway(pathwayKey)}
                        className="w-full bg-[#032717] text-white px-6 py-4 flex items-center justify-between hover:bg-[#032717]/90 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <svg 
                            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="text-left">
                            <h3 className="font-['Roboto_Slab'] font-semibold text-lg">
                              {pathwayData.name} ({selectedCount}/{totalCount} selected)
                            </h3>
                            <p className="text-sm text-white/80 mt-1">{pathwayData.description}</p>
                          </div>
                        </div>
                      </button>

                      {/* Pathway Content */}
                      {isExpanded && (
                        <div className="bg-white p-4 space-y-3 transition-all duration-300 ease-in-out">
                          {Object.entries(pathwayData.subcategories).map(([subcategory, subcategoryChallenges]) => {
                            if (subcategoryChallenges.length === 0) return null
                            
                            const subcategoryKey = `${pathwayKey}-${subcategory}`
                            const isSubcategoryExpanded = expandedSubcategories[subcategoryKey]
                            const subcategorySelectedCount = getSelectedCountForSubcategory(subcategoryChallenges)

                            return (
                              <div key={subcategory} className="border-l-4 border-[#032717] bg-gray-50 rounded-r-lg overflow-hidden">
                                {/* Subcategory Header */}
                                <button
                                  onClick={() => toggleSubcategory(pathwayKey, subcategory)}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <svg 
                                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isSubcategoryExpanded ? 'rotate-90' : ''}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="font-medium text-gray-900">
                                      {subcategory} ({subcategorySelectedCount}/{subcategoryChallenges.length})
                                    </span>
                                  </div>
                                </button>

                                {/* Subcategory Challenges */}
                                {isSubcategoryExpanded && (
                                  <div className="px-4 pb-4 pt-2 transition-all duration-300 ease-in-out">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {subcategoryChallenges.map((challenge) => (
                                        <Card 
                                          key={challenge.id} 
                                          className={`cursor-pointer transition-all ${
                                            selectedChallenges.includes(challenge.id) 
                                              ? 'ring-2 ring-grit-green bg-grit-green/5' 
                                              : 'hover:shadow-lg'
                                          }`}
                                          onClick={() => handleChallengeToggle(challenge.id)}
                                        >
                                          <div className="flex items-start gap-3">
                                            <input
                                              type="checkbox"
                                              checked={selectedChallenges.includes(challenge.id)}
                                              onChange={() => handleChallengeToggle(challenge.id)}
                                              onClick={(e) => e.stopPropagation()}
                                              className="mt-1 w-4 h-4 text-grit-gold-dark border-gray-300 rounded focus:ring-grit-gold-dark"
                                              style={{ accentColor: '#847147' }}
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900 text-sm">
                                                  {challenge.title}
                                                </h4>
                                                {challenge.category && (
                                                  <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(challenge.category)}`}>
                                                    {challenge.category}
                                                  </div>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-600 line-clamp-2">
                                                {challenge.description || challenge.text}
                                              </p>
                                            </div>
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No challenges available for this year group.
              </div>
            )}
          </div>
        )}

        {selectedChallenges.length >= 5 && (
          <div className="text-center mt-8">
            <Button
              variant="primary"
              className="px-8 py-3 text-lg"
              onClick={handleConfirmAndViewLogin}
            >
              Confirm and View Login
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-6xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900-dark text-xl font-bold z-10"
        >
          ×
        </button>

        {/* Content */}
        <div className="p-8">
          {currentStep === 'pricing' && renderPricingStep()}
          {currentStep === 'schoolDetails' && renderSchoolDetailsStep()}
          {currentStep === 'csvUpload' && renderCsvUploadStep()}
          {currentStep === 'challengeSelection' && renderChallengeSelectionStep()}
        </div>
      </div>
    </div>
  )
}

export default NewSchoolWizard
