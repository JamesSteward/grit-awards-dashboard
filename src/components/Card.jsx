import React from 'react'

const Card = ({ children, className = '', header, ...props }) => {
  const baseClasses = 'rounded-lg border border-grit-gold-dark shadow-md'
  
  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {header && (
        <div className="px-6 py-4 border-b border-grit-gold-dark">
          <h3 className="text-grit-gold font-semibold text-lg">{header}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default Card
