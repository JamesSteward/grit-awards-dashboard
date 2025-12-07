import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../Button'

const WarningModal = ({ isOpen, onClose, onConfirm, challengeId, warnings }) => {
  const [warningDetails, setWarningDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (isOpen && warnings && warnings.length > 0) {
      fetchWarningDetails()
      setAcknowledged(false) // Reset checkbox when modal opens
    }
  }, [isOpen, warnings])

  const fetchWarningDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('warning_types')
        .select('code, title, description, icon')
        .in('code', warnings)

      if (error) throw error
      setWarningDetails(data || [])
    } catch (error) {
      console.error('Error fetching warning details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!acknowledged) return

    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        alert('User not authenticated. Please log in again.')
        return
      }

      // Insert acknowledgement record
      const { error } = await supabase
        .from('challenge_acknowledgements')
        .insert({
          challenge_id: challengeId,
          user_id: user.id
        })

      if (error) throw error

      // Call the onConfirm callback to proceed with beginning the challenge
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error acknowledging warning:', error)
      alert('Failed to save acknowledgement. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="bg-[#032717] text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Safety Information</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032717]"></div>
              <p className="mt-4 text-gray-600">Loading safety information...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6">
                This challenge requires special attention to safety. Please review the following information:
              </p>

              {/* Warning List */}
              <div className="space-y-4 mb-6">
                {warningDetails.map((warning) => (
                  <div key={warning.code} className="border-l-4 border-[#F59E0B] bg-amber-50 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      {warning.icon && (
                        <div className="flex-shrink-0 w-8 h-8 text-[#F59E0B] flex items-center justify-center">
                          {warning.icon.startsWith('http') || warning.icon.startsWith('/') ? (
                            <img src={warning.icon} alt={warning.title} className="w-8 h-8" />
                          ) : warning.icon.startsWith('<svg') ? (
                            <div dangerouslySetInnerHTML={{ __html: warning.icon }} className="w-8 h-8" />
                          ) : (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d={warning.icon} />
                            </svg>
                          )}
                        </div>
                      )}
                      {/* Warning content */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{warning.title}</h3>
                        <p className="text-sm text-gray-700">{warning.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acknowledgement Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#032717] border-gray-300 rounded focus:ring-[#032717] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm an adult has reviewed this information and approves this challenge
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!acknowledged}
                  className={`flex-1 bg-[#032717] text-white hover:bg-[#032717]/90 ${
                    !acknowledged ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Confirm & Begin
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default WarningModal

