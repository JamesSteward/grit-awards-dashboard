import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  
  if (!isOpen) return null
  
  const handleUserTypeSelect = (userType) => {
    onClose()
    navigate(`/${userType}`)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* GRIT Logo */}
        <div className="flex justify-center mb-8">
          <img src="/GRIT-logo.svg" alt="GRIT Awards" className="h-12 w-auto" />
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => handleUserTypeSelect('family')}
            className="w-full"
          >
            I'm a Family Member
          </Button>
          
          <Button
            onClick={() => handleUserTypeSelect('leader')}
            className="w-full"
          >
            GRIT Leaders
          </Button>
          
          <Button
            onClick={() => handleUserTypeSelect('director')}
            className="w-full"
          >
            GRIT Directors
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleUserTypeSelect('admin')}
            className="text-sm text-[#032717] hover:text-[#054d2a] underline"
          >
            I'm a GRIT Administrator
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2 text-xs text-gray-500">
            <a href="#" className="hover:text-[#032717]">COPPA Direct Notice</a>
            <span>•</span>
            <a href="#" className="hover:text-[#032717]">Terms of Service</a>
            <span>and</span>
            <a href="#" className="hover:text-[#032717]">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-[#032717]">Browse Classroom Activities</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
