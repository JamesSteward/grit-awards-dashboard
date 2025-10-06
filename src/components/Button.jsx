import React from 'react'

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium font-roboto-slab transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-grit-gold text-grit-green hover:bg-grit-gold-dark focus:ring-grit-gold',
    secondary: 'bg-transparent border border-grit-gold text-grit-gold hover:bg-grit-gold hover:text-grit-green focus:ring-grit-gold',
    destructive: 'bg-red-jacket text-grit-gold hover:bg-red-jacket-dark focus:ring-red-jacket'
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


