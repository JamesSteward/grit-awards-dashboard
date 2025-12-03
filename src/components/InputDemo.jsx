import React, { useState } from 'react'
import Input from './Input'

const InputDemo = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    message: '',
    year: '',
    name: ''
  })

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-grit-gold mb-6">Input Component Demo</h2>
      
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Name</label>
        <Input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Enter your name"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Email</label>
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="Enter your email"
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Password</label>
        <Input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="Enter your password"
        />
      </div>

      {/* Select Input */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Year Level</label>
        <Input
          type="select"
          id="year"
          value={formData.year}
          onChange={handleChange('year')}
        >
          <option value="">Choose a year...</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
          <option value="6">Year 6</option>
        </Input>
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Message</label>
        <Input
          type="textarea"
          id="message"
          value={formData.message}
          onChange={handleChange('message')}
          placeholder="Enter your message"
          rows={4}
        />
      </div>

      {/* Disabled Input */}
      <div>
        <label className="block text-sm font-medium text-grit-gold mb-2">Disabled Field</label>
        <Input
          type="text"
          id="disabled"
          value="This field is disabled"
          disabled={true}
        />
      </div>
    </div>
  )
}

export default InputDemo
