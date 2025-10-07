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
  
  const navigate = useNavigate()
  
  if (!isOpen) return null

  // Hardcoded challenges for each year group (fallback if database fails)
  const yearGroupChallenges = {
    'Year 3': [
      { id: 1, title: 'Help a Friend', description: 'Assist a classmate with their work', points: 20 },
      { id: 2, title: 'Clean Up', description: 'Help tidy the classroom', points: 15 },
      { id: 3, title: 'Share Something', description: 'Share materials or ideas with others', points: 25 },
      { id: 4, title: 'Listen Carefully', description: 'Pay attention during lessons', points: 20 },
      { id: 5, title: 'Try Your Best', description: 'Put effort into all activities', points: 30 },
      { id: 6, title: 'Be Kind', description: 'Show kindness to everyone', points: 25 },
      { id: 7, title: 'Follow Rules', description: 'Follow classroom and school rules', points: 15 },
      { id: 8, title: 'Ask Questions', description: 'Ask thoughtful questions', points: 20 }
    ],
    'Year 4': [
      { id: 9, title: 'Lead a Group', description: 'Take charge of a group activity', points: 30 },
      { id: 10, title: 'Solve Problems', description: 'Work through challenges independently', points: 35 },
      { id: 11, title: 'Help Others', description: 'Assist younger students', points: 25 },
      { id: 12, title: 'Organize Tasks', description: 'Plan and organize your work', points: 30 },
      { id: 13, title: 'Show Respect', description: 'Demonstrate respect for others', points: 20 },
      { id: 14, title: 'Take Responsibility', description: 'Own up to mistakes', points: 35 },
      { id: 15, title: 'Be Creative', description: 'Think outside the box', points: 30 },
      { id: 16, title: 'Work Together', description: 'Collaborate effectively', points: 25 }
    ],
    'Year 5': [
      { id: 17, title: 'Mentor Others', description: 'Guide younger students', points: 40 },
      { id: 18, title: 'Plan Events', description: 'Organize school activities', points: 35 },
      { id: 19, title: 'Resolve Conflicts', description: 'Help solve disagreements', points: 40 },
      { id: 20, title: 'Show Initiative', description: 'Take action without being asked', points: 35 },
      { id: 21, title: 'Demonstrate Integrity', description: 'Do the right thing', points: 45 },
      { id: 22, title: 'Be Persistent', description: 'Keep trying despite challenges', points: 40 },
      { id: 23, title: 'Communicate Well', description: 'Express ideas clearly', points: 30 },
      { id: 24, title: 'Show Empathy', description: 'Understand others\' feelings', points: 35 }
    ],
    'Year 6': [
      { id: 25, title: 'Lead Projects', description: 'Take charge of major projects', points: 50 },
      { id: 26, title: 'Make Decisions', description: 'Make thoughtful choices', points: 45 },
      { id: 27, title: 'Support Community', description: 'Help in the wider community', points: 50 },
      { id: 28, title: 'Show Wisdom', description: 'Make wise choices', points: 45 },
      { id: 29, title: 'Be Courageous', description: 'Stand up for what\'s right', points: 50 },
      { id: 30, title: 'Inspire Others', description: 'Motivate classmates', points: 45 },
      { id: 31, title: 'Think Critically', description: 'Analyze situations carefully', points: 40 },
      { id: 32, title: 'Prepare for Future', description: 'Get ready for secondary school', points: 45 }
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
      // Map year groups to year levels for database query
      const yearLevelMap = {
        'Year 3': 3,
        'Year 4': 4,
        'Year 5': 5,
        'Year 6': 6
      }
      
      const yearLevel = yearLevelMap[yearGroup]
      if (!yearLevel) {
        console.error('Invalid year group:', yearGroup)
        return
      }

      const { data, error } = await supabase
        .from('challenges')
        .select('id, title, description, points')
        .eq('year_group', yearLevel)
        .order('title')

      if (error) {
        console.error('Error fetching challenges:', error)
        // Fallback to hardcoded challenges if database fails
        setChallenges(yearGroupChallenges[yearGroup] || [])
      } else {
        setChallenges(data || [])
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
      // Fallback to hardcoded challenges if database fails
      setChallenges(yearGroupChallenges[yearGroup] || [])
    } finally {
      setLoadingChallenges(false)
    }
  }

  const handleYearGroupSelect = (yearGroup) => {
    setSelectedYearGroup(yearGroup)
    setSelectedChallenges([])
    fetchChallengesForYearGroup(yearGroup)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Bronze', 'Silver', 'Gold', 'Trusts'].map((plan) => (
          <Card key={plan} className={`relative ${selectedPlan === plan ? 'ring-2 ring-grit-green' : ''}`}>
            <div className="text-center">
              <h3 className="text-xl font-['Roboto_Slab'] font-bold text-grit-green mb-2">
                {plan}
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                £xxx
                <span className="text-sm text-gray-600">/month</span>
              </div>
              <ul className="text-sm text-gray-900 mb-6 space-y-2">
                <li>• Up to {plan === 'Bronze' ? '50' : plan === 'Silver' ? '150' : plan === 'Gold' ? '300' : '500'} students</li>
                <li>• {plan === 'Bronze' ? 'Basic' : plan === 'Silver' ? 'Standard' : plan === 'Gold' ? 'Advanced' : 'Premium'} reporting</li>
                <li>• {plan === 'Bronze' ? 'Email' : plan === 'Silver' ? 'Email + Phone' : plan === 'Gold' ? 'Priority' : 'Dedicated'} support</li>
                <li>• {plan === 'Bronze' ? 'Standard' : plan === 'Silver' ? 'Enhanced' : plan === 'Gold' ? 'Full' : 'Custom'} customisation</li>
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

  const renderChallengeSelectionStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-['Roboto_Slab'] font-bold text-grit-green mb-4">
          Select Challenges
        </h2>
        <p className="text-gray-900 text-lg mb-2">
          Select 5 challenges to build your school's programme (100/150 Tenacity points recommended)
        </p>
      </div>

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
          <h3 className="text-lg font-['Roboto_Slab'] font-semibold text-grit-green mb-4">
            Available Challenges ({selectedChallenges.length}/5 selected)
          </h3>
          
          {loadingChallenges ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-grit-green"></div>
              <p className="mt-2 text-gray-900">Loading challenges...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
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
                      className="mt-1 w-4 h-4 text-grit-green border-gray-300 rounded focus:ring-grit-green"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {challenge.title}
                        </h4>
                        <div className="bg-grit-gold-dark text-white px-2 py-1 rounded text-xs font-medium">
                          {challenge.points || 0} pts
                        </div>
                      </div>
                      <p className="text-sm text-gray-900">
                        {challenge.description || challenge.text}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedChallenges.length === 5 && (
        <div className="text-center">
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
