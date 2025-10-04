import React from 'react'

const GrungeOverlay = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.6' numOctaves='6' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px'
      }}
    />
  )
}

export default GrungeOverlay
