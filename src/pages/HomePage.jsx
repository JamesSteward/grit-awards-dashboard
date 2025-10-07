import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import GrungeOverlay from '../components/GrungeOverlay'
import NewSchoolWizard from '../components/NewSchoolWizard'

const HomePage = () => {
  const [showSchoolWizard, setShowSchoolWizard] = useState(false)

  const handleOpenSchoolWizard = () => {
    setShowSchoolWizard(true)
  }

  const handleCloseSchoolWizard = () => {
    setShowSchoolWizard(false)
  }
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-grit-green to-grit-green-dark text-white py-20 overflow-hidden">
        <GrungeOverlay />
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/grit-hero.webp" 
            alt="GRIT Awards Hero" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            Building Life-Ready Children.
          </h1>
          <p className="text-xl md:text-2xl text-gray-900-light mb-8 max-w-3xl mx-auto">
            The GRIT Awards program empowers students with essential life skills through 
            structured achievement recognition and character development.
          </p>
          <Button
            variant="secondary"
            className="text-grit-green bg-white hover:bg-grit-gold-light text-lg px-8 py-4"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Product Highlight Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              Why GRIT Awards?
            </h2>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto">
              Our comprehensive program helps schools develop well-rounded students 
              ready for life's challenges through structured achievement recognition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="w-16 h-16 bg-grit-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Achievement Recognition
              </h3>
              <p className="text-gray-900">
                Structured award system that recognizes student growth in character, 
                leadership, and life skills.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="w-16 h-16 bg-grit-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Comprehensive Tracking
              </h3>
              <p className="text-gray-900">
                Complete digital platform for tracking student progress and 
                managing award distribution.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md text-center">
              <div className="w-16 h-16 bg-grit-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">👥</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Community Engagement
              </h3>
              <p className="text-gray-900">
                Involve families and communities in celebrating student 
                achievements and character development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selector */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              Who Are You?
            </h2>
            <p className="text-xl text-gray-900">
              Choose your role to get started with GRIT Awards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-3xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                Parent
              </h3>
              <p className="text-gray-900 text-sm mb-4">
                Track your child's achievements and celebrate their growth
              </p>
              <Button variant="primary" className="w-full">
                Get Started
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-3xl">👩‍🏫</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                Teacher
              </h3>
              <p className="text-gray-900 text-sm mb-4">
                Manage your class and award student achievements
              </p>
              <Button variant="primary" className="w-full">
                Get Started
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-3xl">👨‍💼</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                Head
              </h3>
              <p className="text-gray-900 text-sm mb-4">
                Oversee school-wide implementation and analytics
              </p>
              <Button variant="primary" className="w-full">
                Get Started
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-grit-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                Veteran
              </h3>
              <p className="text-gray-900 text-sm mb-4">
                Share your experience and mentor students
              </p>
              <Button variant="primary" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-900">
              Everything you need to implement and manage GRIT Awards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Digital Badges
              </h3>
              <p className="text-gray-900 mb-4">
                Award digital badges for achievements in character, leadership, 
                and life skills development.
              </p>
              <ul className="text-sm text-gray-900-dark space-y-1">
                <li>• Bronze, Silver, Gold, Platinum levels</li>
                <li>• Customizable criteria</li>
                <li>• Automated tracking</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Progress Analytics
              </h3>
              <p className="text-gray-900 mb-4">
                Comprehensive reporting and analytics to track student growth 
                and program effectiveness.
              </p>
              <ul className="text-sm text-gray-900-dark space-y-1">
                <li>• Individual student reports</li>
                <li>• Class and school analytics</li>
                <li>• Parent engagement metrics</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-3">
                Family Engagement
              </h3>
              <p className="text-gray-900 mb-4">
                Keep families informed and engaged with their child's 
                character development journey.
              </p>
              <ul className="text-sm text-gray-900-dark space-y-1">
                <li>• Real-time notifications</li>
                <li>• Achievement celebrations</li>
                <li>• Progress sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              Our Goals
            </h2>
            <p className="text-xl text-gray-900">
              Building character and life skills for tomorrow's leaders
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Character Development
                  </h3>
                  <p className="text-gray-900">
                    Foster essential character traits like integrity, responsibility, 
                    and respect through structured recognition programs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Life Skills Mastery
                  </h3>
                  <p className="text-gray-900">
                    Develop practical life skills including communication, 
                    problem-solving, and leadership abilities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Community Building
                  </h3>
                  <p className="text-gray-900">
                    Create stronger school communities through shared values 
                    and collective achievement recognition.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Academic Excellence
                  </h3>
                  <p className="text-gray-900">
                    Support academic achievement by recognizing effort, 
                    improvement, and scholarly character.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Future Readiness
                  </h3>
                  <p className="text-gray-900">
                    Prepare students for success in higher education, 
                    careers, and civic engagement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-grit-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-grit-green mb-2">
                    Positive Recognition
                  </h3>
                  <p className="text-gray-900">
                    Celebrate every student's unique strengths and 
                    contributions to their community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              What People Say
            </h2>
            <p className="text-xl text-gray-900">
              Hear from educators and families using GRIT Awards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-900 mb-4 italic">
                "GRIT Awards has transformed our school culture. Students are more 
                engaged and motivated to demonstrate positive character traits."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-grit-gold-light rounded-full flex items-center justify-center mr-4">
                  <span className="text-grit-green font-bold">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-grit-green">Sarah Miller</p>
                  <p className="text-sm text-gray-900-dark">Principal, Lincoln Elementary</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-900 mb-4 italic">
                "My daughter's confidence has grown tremendously since her school 
                started using GRIT Awards. She's proud of her achievements!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-grit-gold-light rounded-full flex items-center justify-center mr-4">
                  <span className="text-grit-green font-bold">JD</span>
                </div>
                <div>
                  <p className="font-semibold text-grit-green">Jennifer Davis</p>
                  <p className="text-sm text-gray-900-dark">Parent</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-900 mb-4 italic">
                "The platform makes it easy to track and celebrate student growth. 
                It's become an essential part of our character education program."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-grit-gold-light rounded-full flex items-center justify-center mr-4">
                  <span className="text-grit-green font-bold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-grit-green">Michael Rodriguez</p>
                  <p className="text-sm text-gray-900-dark">Teacher, Roosevelt Middle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-grit-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Making a Difference
            </h2>
            <p className="text-xl text-gray-900-light">
              GRIT Awards impact across schools and communities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900-light mb-2">500+</div>
              <p className="text-gray-900-light">Schools</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900-light mb-2">50K+</div>
              <p className="text-gray-900-light">Students</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900-light mb-2">100K+</div>
              <p className="text-gray-900-light">Awards Given</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900-light mb-2">95%</div>
              <p className="text-gray-900-light">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-grit-green mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-900">
              The passionate educators and developers behind GRIT Awards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="w-24 h-24 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-2xl font-bold">JD</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-2">
                Dr. Jane Smith
              </h3>
              <p className="text-gray-900-dark font-medium mb-2">Founder & CEO</p>
              <p className="text-gray-900 text-sm">
                Former principal with 20+ years in education, passionate about 
                character development and student success.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="w-24 h-24 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-2xl font-bold">MJ</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-2">
                Michael Johnson
              </h3>
              <p className="text-gray-900-dark font-medium mb-2">CTO</p>
              <p className="text-gray-900 text-sm">
                Technology leader with expertise in educational platforms and 
                user experience design.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="w-24 h-24 bg-grit-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-grit-green text-2xl font-bold">SW</span>
              </div>
              <h3 className="text-xl font-heading font-semibold text-grit-green mb-2">
                Sarah Williams
              </h3>
              <p className="text-gray-900-dark font-medium mb-2">Head of Education</p>
              <p className="text-gray-900 text-sm">
                Curriculum specialist focused on character education and 
                life skills development programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer onGetStarted={handleOpenSchoolWizard} />

      {/* New School Wizard Modal */}
      <NewSchoolWizard 
        isOpen={showSchoolWizard} 
        onClose={handleCloseSchoolWizard} 
      />
    </div>
  )
}

export default HomePage
