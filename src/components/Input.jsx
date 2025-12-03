import React from 'react'

const Input = ({ 
  type = 'text', 
  id, 
  name, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  className = '', 
  disabled = false,
  required = false,
  rows,
  children, // for select options
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200'
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`.trim()

  // Handle textarea
  if (type === 'textarea') {
    return (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={combinedClasses}
        {...props}
      />
    )
  }

  // Handle select
  if (type === 'select') {
    return (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={combinedClasses}
        {...props}
      >
        {children}
      </select>
    )
  }

  // Handle all other input types (text, email, password, number, etc.)
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={combinedClasses}
      {...props}
    />
  )
}

export default Input
