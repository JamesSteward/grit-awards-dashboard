import React from 'react'

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-grit-green text-white hover:bg-opacity-90 focus:ring-grit-green',
    secondary: 'bg-grit-gold-light text-grit-green hover:bg-grit-gold-dark hover:text-white focus:ring-grit-gold-dark'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button





