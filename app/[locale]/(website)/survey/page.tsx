'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export default function SurveyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    occupation: '',
    yourAge: '',
    childrenAge: '',
    valueMost: [] as string[],
    storyIdea: '',
    confirmOriginal: false,
    confirmInspiration: false,
  })

  const [signupEmail, setSignupEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
    // 如果复选框被选中，清除对应的错误信息
    if (checked && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleValueMostSelect = (value: string) => {
    setFormData(prev => {
      const currentValues = prev.valueMost
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, valueMost: newValues }
    })
    if (errors.valueMost) {
      setErrors(prev => ({ ...prev, valueMost: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.childrenAge.trim()) {
      newErrors.childrenAge = "Children's age is required"
    }
    if (!formData.valueMost || formData.valueMost.length === 0) {
      newErrors.valueMost = 'Please select at least one value'
    }
    if (!formData.confirmOriginal) {
      newErrors.confirmOriginal = 'Please confirm that your submission is your own original idea'
    }
    if (!formData.confirmInspiration) {
      newErrors.confirmInspiration = 'Please confirm that you understand how your idea will be treated'
    }

    setErrors(newErrors)
    
    // 如果有错误，滚动到第一个错误字段
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0]
        const errorElement = document.getElementById(firstErrorField) || 
                           document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          if (errorElement instanceof HTMLElement && 'focus' in errorElement) {
            (errorElement as HTMLElement).focus()
          }
        }
      }, 100)
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Survey submission:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowSuccessModal(true)
      setFormData({
        name: '',
        email: '',
        occupation: '',
        yourAge: '',
        childrenAge: '',
        valueMost: [],
        storyIdea: '',
        confirmOriginal: false,
        confirmInspiration: false,
      })
    } catch (error) {
      console.error('Submission error:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupEmail.trim()) {
      alert('Please enter your email')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      alert('Please enter a valid email')
      return
    }

    setIsSignupSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Signup submission:', signupEmail)
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Thank you for signing up!')
      setSignupEmail('')
    } catch (error) {
      console.error('Signup error:', error)
      alert('There was an error. Please try again.')
    } finally {
      setIsSignupSubmitting(false)
    }
  }

  const valueOptions = [
    'emotional connection',
    'educational value',
    'keepsake',
    'creativity'
  ]

  return (
    <div className="bg-white">
      <style>{`
        input::placeholder,
        textarea::placeholder {
          color: #999999 !important;
        }
        input[type="checkbox"] {
          border-radius: 50% !important;
        }
        input[type="checkbox"]:checked {
          background-color: #222222 !important;
          border-color: #222222 !important;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 3L4.5 8.5L2 6' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
          background-size: 12px 12px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
      `}</style>
      {/* Survey Form Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: [
                'linear-gradient(0deg, rgba(245, 227, 227, 0) 0%, #F5E3E3 79.55%)',
                'linear-gradient(180deg, rgba(245, 227, 227, 0) 87.25%, #E6D5D5 93.66%)',
              ].join(', '),
            }}
          />
          <div className="relative w-full h-full">
            <Image
              src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/survey/bg.png"
              alt="Child reading"
              fill
              style={{
                transform: 'translateY(140px) translateX(-200px) scale(1.4)',
              }}
              className="object-contain object-right"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 container mx-auto pb-22">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Title and Subtitle */}
            <div 
              className="text-center mx-auto flex flex-col"
              style={{
                width: '1440px',
                maxWidth: '100%',
                height: '176px',
                paddingTop: '64px',
                paddingBottom: '24px',
                gap: '24px',
                borderBottomWidth: '1px',
                borderBottomColor: '#E5E5E5',
                borderBottomStyle: 'solid',
              }}
            >
              <p 
                style={{
                  fontWeight: 500,
                  fontSize: '40px',
                  lineHeight: 'normal',
                  margin: 0,
                }}
              >
                We'd Love to Hear Your Funny Inspiration!
              </p>
              <p 
                className="text-[16px] text-[#666666] tracking-wide font-normal"
                style={{
                  margin: 0,
                  lineHeight: 'normal',
                }}
              >
                That silly moment or sweet idea could become the seed of a new story.
              </p>
            </div>

            {/* Form Container */}
            <div 
              className="bg-white"
              style={{
                width: '588px',
                maxWidth: '100%',
                borderRadius: '4px',
                padding: '24px',
              }}
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                {/* Name */}
                <div
                  style={{
                    width: '540px',
                    minHeight: '68px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <label 
                    htmlFor="name" 
                    style={{
                      fontWeight: 500,
                      fontSize: '16px',
                      letterSpacing: '0.15px',
                      color: '#222222',
                      margin: 0,
                    }}
                  >
                    Name <span style={{ color: '#222222' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    style={{
                      width: '540px',
                      height: '40px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Email */}
                <div
                  style={{
                    width: '540px',
                    minHeight: '68px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <label 
                    htmlFor="email" 
                    style={{
                      fontWeight: 500,
                      fontSize: '16px',
                      letterSpacing: '0.15px',
                      color: '#222222',
                      margin: 0,
                    }}
                  >
                    Email <span style={{ color: '#222222' }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    style={{
                      width: '540px',
                      height: '40px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* Occupation */}
                <div
                  style={{
                    width: '540px',
                    minHeight: '68px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <label 
                    htmlFor="occupation" 
                    style={{
                      fontWeight: 500,
                      fontSize: '16px',
                      letterSpacing: '0.15px',
                      color: '#222222',
                      margin: 0,
                    }}
                  >
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    style={{
                      width: '540px',
                      height: '40px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Your Age */}
                <div
                  style={{
                    width: '540px',
                    minHeight: '68px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <label 
                    htmlFor="yourAge" 
                    style={{
                      fontWeight: 500,
                      fontSize: '16px',
                      letterSpacing: '0.15px',
                      color: '#222222',
                      margin: 0,
                    }}
                  >
                    Your Age
                  </label>
                  <select
                    id="yourAge"
                    name="yourAge"
                    value={formData.yourAge}
                    onChange={handleInputChange}
                    style={{
                      width: '540px',
                      height: '40px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      paddingRight: '40px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: formData.yourAge ? '#222222' : '#999999',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23222222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="" disabled>please select...</option>
                    <option value="18-24">18–24</option>
                    <option value="25-34">25–34</option>
                    <option value="35-44">35–44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>

                {/* Children's Age */}
                <div
                  style={{
                    width: '540px',
                    minHeight: '68px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <label 
                    htmlFor="childrenAge" 
                    style={{
                      fontWeight: 500,
                      fontSize: '16px',
                      letterSpacing: '0.15px',
                      color: '#222222',
                      margin: 0,
                    }}
                  >
                    Children's Age <span style={{ color: '#222222' }}>*</span>
                  </label>
                  <select
                    id="childrenAge"
                    name="childrenAge"
                    value={formData.childrenAge}
                    onChange={handleInputChange}
                    style={{
                      width: '540px',
                      height: '40px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      paddingRight: '40px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: errors.childrenAge ? '#EF4444' : '#D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: formData.childrenAge ? '#222222' : '#999999',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23222222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.childrenAge ? '#EF4444' : '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="" disabled>please select...</option>
                    <option value="under-2">under 2</option>
                    <option value="2-4">2–4</option>
                    <option value="5-7">5–7</option>
                    <option value="8-10">8–10</option>
                  </select>
                  {errors.childrenAge && <p className="text-red-500 text-sm">{errors.childrenAge}</p>}
                </div>

                {/* What do you value most */}
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700"
                  style={{
                    fontWeight: 500,
                    fontSize: '16px',
                    letterSpacing: '0.15px',
                    color: '#222222',
                    margin: 0,
                  }}
                  >
                    What do you value most in a personalized book? <span style={{ color: '#222222' }}>*</span>
                  </label>
                  <div 
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {valueOptions.map((option) => {
                      const isSelected = formData.valueMost.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleValueMostSelect(option)}
                          style={{
                            height: '40px',
                            paddingTop: '8px',
                            paddingRight: '16px',
                            paddingBottom: '8px',
                            paddingLeft: '16px',
                            borderRadius: '4px',
                            border: isSelected ? '1px solid #222222':'1px transparent solid',
                            cursor: 'pointer',
                            fontWeight: 400,
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            backgroundColor: isSelected ? '#FCF2F2' : '#F8F8F8',
                            color: '#222222',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#E5E5E5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#F8F8F8';
                            }
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {errors.valueMost && (
                    <p className="text-red-500 text-sm">
                      {errors.valueMost}
                    </p>
                  )}
                </div>

                {/* Story Idea */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="storyIdea" className="block text-sm font-medium text-gray-700"
                  style={{
                    fontWeight: 500,
                    fontSize: '16px',
                    letterSpacing: '0.15px',
                    color: '#222222',
                    margin: 0,
                  }}
                  >
                    Your Funny or Inspiring Story Idea
                  </label>
                  <textarea
                    id="storyIdea"
                    name="storyIdea"
                    value={formData.storyIdea}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    rows={5}
                    style={{
                      width: '540px',
                      height: '120px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      borderRadius: '4px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#222222';
                      e.target.style.boxShadow = '0 0 0 2px rgba(34, 34, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="confirmOriginal"
                        checked={formData.confirmOriginal}
                        onChange={handleCheckboxChange}
                        style={{
                          width: '20px',
                          height: '20px',
                          minWidth: '20px',
                          minHeight: '20px',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#D9D9D9',
                          borderRadius: '50%',
                          marginTop: '2px',
                          marginLeft: '2px',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          flexShrink: 0,
                        }}
                        className="focus:ring-[#222222] focus:ring-1"
                      />
                      <span className="text-[16px] text-[#222222] tracking-wide font-normal">
                        I confirm that my submission is my own original idea and does not infringe on the rights of others.
                      </span>
                    </label>
                    {errors.confirmOriginal && <p className="text-red-500 text-sm ml-8 mt-0">{errors.confirmOriginal}</p>}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="confirmInspiration"
                        checked={formData.confirmInspiration}
                        onChange={handleCheckboxChange}
                        style={{
                          width: '20px',
                          height: '20px',
                          minWidth: '20px',
                          minHeight: '20px',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: '#D9D9D9',
                          borderRadius: '50%',
                          marginTop: '2px',
                          marginLeft: '2px',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          flexShrink: 0,
                        }}
                        className="focus:ring-[#222222] focus:ring-1"
                      />
                      <span className="text-[16px] text-[#222222] tracking-wide font-normal">
                        I understand that my idea will be treated as inspiration only, and Dreamaze may develop similar concepts independently or receive similar ideas from other participants.
                      </span>
                    </label>
                    {errors.confirmInspiration && <p className="text-red-500 text-sm ml-8 mt-0">{errors.confirmInspiration}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#222222] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Send It In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4">
              Help Us Shape The Next Personalized Book.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Sign up to join the community, suggest ideas, and vote for upcoming themes.
            </p>

            <form onSubmit={handleSignupSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-[#F8F8F8] rounded-[4x] border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSignupSubmitting}
                  className="bg-[#222222] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSignupSubmitting ? 'Submitting...' : 'Send It In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-white rounded-[4px] p-8 max-w-md mx-4 relative"
            style={{
              width: '588px',
              maxWidth: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-[#222222] hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center" style={{ gap: '16px' }}>
              <div className="text-5xl mb-1">🌟</div>
              <h2 
                style={{
                  fontWeight: 500,
                  fontSize: '24px',
                  color: '#222222',
                  margin: 0,
                  lineHeight: 'normal',
                }}
              >
                Thank you for sharing!
              </h2>
              <div className="flex flex-col" style={{ gap: '12px', maxWidth: '480px' }}>
                <p 
                  style={{
                    fontSize: '16px',
                    color: '#666666',
                    letterSpacing: '0.15px',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Your idea means the world to us.
                </p>
                <p 
                  style={{
                    fontSize: '16px',
                    color: '#666666',
                    letterSpacing: '0.15px',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  If your inspiration becomes part of a published story, we'll reach out to give you credit—for example, an acknowledgment in the book.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-4 bg-[#222222] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-gray-800 transition-colors"
                style={{
                  width: 'auto',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

