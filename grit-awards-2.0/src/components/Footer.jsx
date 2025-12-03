import React from 'react'

const Footer = () => {
  return (
    <footer id="get-started" className="bg-grit-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* For Schools */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">For Schools</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#get-started" className="hover:text-grit-gold-light transition-colors">Get Started</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Implementation Guide</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Training Resources</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Award Levels */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Award Levels</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Bronze Level</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Silver Level</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Gold Level</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Platinum Level</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Requirements</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Best Practices</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Community</a></li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-grit-gold-light transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-grit-gold-light">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-grit-gold-light">
              © 2025 GRIT Awards App (UKMS). All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-grit-gold-light hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-grit-gold-light hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-grit-gold-light hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
