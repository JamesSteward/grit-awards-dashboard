import React from 'react'
import { FaFacebook, FaXTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa6'

const Footer = ({ onGetStarted }) => {
  return (
    <footer className="bg-grit-green py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6">
          {/* For Schools */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">For Schools</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#get-started" className="text-white hover:text-grit-gold-light transition-colors" onClick={(e) => { e.preventDefault(); onGetStarted?.(); }}>Get Started</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Implementation Guide</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Training Resources</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Award Levels */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">Award Levels</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#award-levels" className="text-white hover:text-grit-gold-light transition-colors">Hastings Award</a></li>
              <li><a href="#award-levels" className="text-white hover:text-grit-gold-light transition-colors">Trafalgar Award</a></li>
              <li><a href="#award-levels" className="text-white hover:text-grit-gold-light transition-colors">Waterloo Award</a></li>
              <li><a href="#award-levels" className="text-white hover:text-grit-gold-light transition-colors">Requirements</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Documentation</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Best Practices</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Case Studies</a></li>
              <li><a href="#" className="text-white hover:text-grit-gold-light transition-colors">Community</a></li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">About</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="text-white hover:text-grit-gold-light transition-colors">Our Mission</a></li>
              <li><a href="#about" className="text-white hover:text-grit-gold-light transition-colors">Team</a></li>
              <li><a href="#about" className="text-white hover:text-grit-gold-light transition-colors">Careers</a></li>
              <li><a href="#about" className="text-white hover:text-grit-gold-light transition-colors">Press</a></li>
              <li><a href="#about" className="text-white hover:text-grit-gold-light transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-grit-gold/25">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-grit-gold">
              © 2025 GRIT Awards App (UKMS). All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-grit-gold hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-grit-gold hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-grit-gold hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="mt-10">
          <div className="flex items-center justify-center space-x-6">
            <a 
              href="https://www.facebook.com/UKMSTeam" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-grit-gold hover:text-white transition-colors"
              aria-label="Visit our Facebook page"
            >
              <FaFacebook className="text-2xl md:text-3xl" />
            </a>
            <a 
              href="https://x.com/UKMilSchool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-grit-gold hover:text-white transition-colors"
              aria-label="Follow us on X (Twitter)"
            >
              <FaXTwitter className="text-2xl md:text-3xl" />
            </a>
            <a 
              href="https://www.linkedin.com/company/uk-military-school/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-grit-gold hover:text-white transition-colors"
              aria-label="Connect with us on LinkedIn"
            >
              <FaLinkedin className="text-2xl md:text-3xl" />
            </a>
            <a 
              href="https://www.youtube.com/@theukmilitaryschool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-grit-gold hover:text-white transition-colors"
              aria-label="Subscribe to our YouTube channel"
            >
              <FaYoutube className="text-2xl md:text-3xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
