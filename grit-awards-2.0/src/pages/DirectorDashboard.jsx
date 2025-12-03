import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const DirectorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-grit-green mb-4">
            Director Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Dashboard coming soon
          </p>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <p className="text-gray-500">
              This is where GRIT Directors will be able to oversee multiple schools, 
              manage leaders, and view comprehensive analytics for the GRIT Awards program.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DirectorDashboard





