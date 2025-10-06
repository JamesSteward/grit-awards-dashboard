import React, { useState } from 'react'
import Button from './Button'
import LoginModal from './LoginModal'

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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
              <a href="#awards" className="font-roboto-slab hover:text-gray-900-light transition-colors">Awards</a>
              <a href="#schools" className="font-roboto-slab hover:text-gray-900-light transition-colors">Schools</a>
              <a href="#parents" className="font-roboto-slab hover:text-gray-900-light transition-colors">Parents</a>
              <a href="#contact" className="font-roboto-slab hover:text-gray-900-light transition-colors">Contact</a>
            </nav>
            
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => alert("Demo request feature coming soon")}
                className="bg-transparent border border-white text-white px-6 py-2 rounded-md hover:bg-white hover:text-[#032717] transition-all duration-200"
              >
                Request a Demo
              </button>
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                variant="secondary"
                className="text-grit-green bg-white hover:bg-grit-gold-light px-6 py-2"
              >
                Log In
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-900-light"
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
                <a href="#awards" className="font-roboto-slab hover:text-gray-900-light transition-colors">Awards</a>
                <a href="#schools" className="font-roboto-slab hover:text-gray-900-light transition-colors">Schools</a>
                <a href="#parents" className="font-roboto-slab hover:text-gray-900-light transition-colors">Parents</a>
                <a href="#contact" className="font-roboto-slab hover:text-gray-900-light transition-colors">Contact</a>
                <div className="flex flex-col space-y-3 mt-4">
                  <button
                    onClick={() => alert("Demo request feature coming soon")}
                    className="bg-transparent border border-white text-white px-6 py-2 rounded-md hover:bg-white hover:text-[#032717] transition-all duration-200"
                  >
                    Request a Demo
                  </button>
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant="secondary"
                    className="text-grit-green bg-white hover:bg-grit-gold-light px-6 py-2"
                  >
                    Log In
                  </Button>
                </div>
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
