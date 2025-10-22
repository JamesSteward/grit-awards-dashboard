import React from 'react'

const Footer = ({ onGetStarted }) => {
  return (
    <footer className="bg-grit-green py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6">
          {/* For Schools */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">For Schools</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#get-started" className="[color:#D5C59F] hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); onGetStarted?.(); }}>Get Started</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Implementation Guide</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Training Resources</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Award Levels */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">Award Levels</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#award-levels" className="[color:#D5C59F] hover:text-white transition-colors">Hastings Award</a></li>
              <li><a href="#award-levels" className="[color:#D5C59F] hover:text-white transition-colors">Trafalgar Award</a></li>
              <li><a href="#award-levels" className="[color:#D5C59F] hover:text-white transition-colors">Waterloo Award</a></li>
              <li><a href="#award-levels" className="[color:#D5C59F] hover:text-white transition-colors">Requirements</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Best Practices</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="[color:#D5C59F] hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-6">About</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="[color:#D5C59F] hover:text-white transition-colors">Our Mission</a></li>
              <li><a href="#about" className="[color:#D5C59F] hover:text-white transition-colors">Team</a></li>
              <li><a href="#about" className="[color:#D5C59F] hover:text-white transition-colors">Careers</a></li>
              <li><a href="#about" className="[color:#D5C59F] hover:text-white transition-colors">Press</a></li>
              <li><a href="#about" className="[color:#D5C59F] hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t [border-color:rgba(213,197,159,0.25)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm [color:#D5C59F]">
              © 2025 GRIT Awards App (UKMS). All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm [color:#D5C59F] hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm [color:#D5C59F] hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm [color:#D5C59F] hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
