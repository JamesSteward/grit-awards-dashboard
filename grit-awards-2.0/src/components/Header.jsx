import React, { useState, useEffect } from 'react'
import Button from './Button'
import LoginModal from './LoginModal'

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Expose login function globally and listen for custom events
  useEffect(() => {
    // Expose function for new HomePage to call
    window.openLoginModal = () => setIsLoginModalOpen(true)
    
    // Listen for custom event
    const handleOpenLogin = () => setIsLoginModalOpen(true)
    window.addEventListener('open-login', handleOpenLogin)
    
    return () => {
      delete window.openLoginModal
      window.removeEventListener('open-login', handleOpenLogin)
    }
  }, [])
  
  return (
    <>
      <header className="sticky top-0 z-40 bg-grit-green text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/GRIT-logo-white.svg" alt="GRIT Awards" className="h-10 w-auto" />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#awards" className="hover:text-grit-gold-light transition-colors">Awards</a>
              <a href="#schools" className="hover:text-grit-gold-light transition-colors">Schools</a>
              <a href="#parents" className="hover:text-grit-gold-light transition-colors">Parents</a>
              <a href="#events" className="hover:text-grit-gold-light transition-colors">Events</a>
              <a href="#contact" className="hover:text-grit-gold-light transition-colors">Contact</a>
            </nav>
            
            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                variant="secondary"
                className="text-grit-green bg-white hover:bg-grit-gold-light"
              >
                Get Started
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-grit-gold-light"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-grit-gold-light">
              <nav className="flex flex-col space-y-4">
                <a href="#awards" className="hover:text-grit-gold-light transition-colors">Awards</a>
                <a href="#schools" className="hover:text-grit-gold-light transition-colors">Schools</a>
                <a href="#parents" className="hover:text-grit-gold-light transition-colors">Parents</a>
                <a href="#events" className="hover:text-grit-gold-light transition-colors">Events</a>
                <a href="#contact" className="hover:text-grit-gold-light transition-colors">Contact</a>
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="secondary"
                  className="mt-4 text-grit-green bg-white hover:bg-grit-gold-light"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  )
}

export default Header
