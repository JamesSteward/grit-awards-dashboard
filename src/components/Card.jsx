import React from 'react'

const Card = ({ children, className = '', header, ...props }) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-md'
  
  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-gray-900 font-semibold text-lg">{header}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default Card
