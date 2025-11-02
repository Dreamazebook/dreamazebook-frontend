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
        .title-section {
          min-height: 176px;
        }
        .bg-gradient-overlay {
          background: linear-gradient(0deg, rgba(245, 227, 227, 0) 0%, #F5E3E3 79.55%), linear-gradient(180deg, rgba(245, 227, 227, 0) 87.25%, #E6D5D5 93.66%);
        }
        .input-focus:focus {
          border-color: #222222 !important;
          box-shadow: 0 0 0 2px rgba(34, 34, 34, 0.1) !important;
        }
        .select-dropdown {
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23222222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }
        @media (max-width: 768px) {
          .title-section {
            min-height: auto;
            padding-top: 32px !important;
            padding-bottom: 16px !important;
          }
          .title-section-h1 {
            font-weight: 600 !important;
            font-size: 24px !important;
            text-align: center !important;
          }
          .title-section-p {
            font-size: 14px !important;
          }
        }
      `}</style>
      {/* Survey Form Section */}
      <section className="relative overflow-hidden px-[18px] md:p-0">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-overlay" />
          <div className="relative w-full h-full">
            <Image
              src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/survey/bg.png"
              alt="Child reading"
              fill
              className="object-contain object-right translate-x-[-325px] translate-y-[300px] scale-[2.5] md:translate-y-[300px] md:translate-x-[200px] md:scale-[2.5] lg:translate-y-[140px] lg:-translate-x-[200px] lg:scale-[1.5]"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 container mx-auto pb-22">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Title and Subtitle */}
            <div className="text-center mx-auto flex flex-col title-section w-[1440px] max-w-full min-h-[176px] pt-16 pb-6 gap-6 border-b border-[#E5E5E5]">
              <p className="title-section-h1 font-medium text-[40px] leading-normal m-0">
                We'd Love to Hear Your Funny Inspiration!
              </p>
              <p className="text-[16px] text-[#666666] tracking-wide font-normal title-section-p m-0 leading-normal">
                That silly moment or sweet idea could become the seed of a new story.
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-white w-[588px] max-w-full rounded-[4px] p-6">
              <form id="survey-form" onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
                {/* Name */}
                <div className="w-full md:w-[540px] min-h-[68px] flex flex-col gap-1">
                  <label 
                    htmlFor="name" 
                    className="font-medium text-base tracking-[0.15px] text-[#222222] m-0"
                  >
                    Name <span className="text-[#222222]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    className="w-full md:w-[540px] h-10 py-2 px-4 rounded-[4px] border border-[#D1D5DB] outline-none input-focus"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="w-full md:w-[540px] min-h-[68px] flex flex-col gap-1">
                  <label 
                    htmlFor="email" 
                    className="font-medium text-base tracking-[0.15px] text-[#222222] m-0"
                  >
                    Email <span className="text-[#222222]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    className="w-full md:w-[540px] h-10 py-2 px-4 rounded-[4px] border border-[#D1D5DB] outline-none input-focus"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* Occupation */}
                <div className="w-full md:w-[540px] min-h-[68px] flex flex-col gap-1">
                  <label 
                    htmlFor="occupation" 
                    className="font-medium text-base tracking-[0.15px] text-[#222222] m-0"
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
                    className="w-full md:w-[540px] h-10 py-2 px-4 rounded-[4px] border border-[#D1D5DB] outline-none input-focus"
                  />
                </div>

                {/* Your Age */}
                <div className="w-full md:w-[540px] min-h-[68px] flex flex-col gap-1">
                  <label 
                    htmlFor="yourAge" 
                    className="font-medium text-base tracking-[0.15px] text-[#222222] m-0"
                  >
                    Your Age
                  </label>
                  <select
                    id="yourAge"
                    name="yourAge"
                    value={formData.yourAge}
                    onChange={handleInputChange}
                    className={`w-full md:w-[540px] h-10 py-2 pl-4 pr-10 rounded-[4px] border border-[#D1D5DB] outline-none bg-white cursor-pointer appearance-none select-dropdown input-focus ${formData.yourAge ? 'text-[#222222]' : 'text-[#999999]'}`}
                  >
                    <option value="" disabled>please select...</option>
                    <option value="18-24">18–24</option>
                    <option value="25-34">25–34</option>
                    <option value="35-44">35–44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>

                {/* Children's Age */}
                <div className="w-full md:w-[540px] min-h-[68px] flex flex-col gap-1">
                  <label 
                    htmlFor="childrenAge" 
                    className="font-medium text-base tracking-[0.15px] text-[#222222] m-0"
                  >
                    Children's Age <span className="text-[#222222]">*</span>
                  </label>
                  <select
                    id="childrenAge"
                    name="childrenAge"
                    value={formData.childrenAge}
                    onChange={handleInputChange}
                    className={`w-full md:w-[540px] h-10 py-2 pl-4 pr-10 rounded-[4px] border outline-none bg-white cursor-pointer appearance-none select-dropdown input-focus ${errors.childrenAge ? 'border-[#EF4444]' : 'border-[#D1D5DB]'} ${formData.childrenAge ? 'text-[#222222]' : 'text-[#999999]'}`}
                    onFocus={(e) => {
                      if (!errors.childrenAge) {
                        e.target.classList.add('border-[#222222]');
                        e.target.classList.remove('border-[#D1D5DB]');
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.childrenAge) {
                        e.target.classList.remove('border-[#222222]');
                        e.target.classList.add('border-[#D1D5DB]');
                      }
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
                  <label className="font-medium text-base tracking-[0.15px] text-[#222222] m-0">
                    What do you value most in a personalized book? <span className="text-[#222222]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {valueOptions.map((option) => {
                      const isSelected = formData.valueMost.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleValueMostSelect(option)}
                          className={`h-10 py-2 px-4 rounded-[4px] cursor-pointer font-normal text-sm transition-all duration-200 text-[#222222] ${
                            isSelected 
                              ? 'border border-[#222222] bg-[#FCF2F2]' 
                              : 'border border-transparent bg-[#F8F8F8] hover:bg-[#E5E5E5]'
                          }`}
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
                  <label htmlFor="storyIdea" className="font-medium text-base tracking-[0.15px] text-[#222222] m-0">
                    Your Funny or Inspiring Story Idea
                  </label>
                  <textarea
                    id="storyIdea"
                    name="storyIdea"
                    value={formData.storyIdea}
                    onChange={handleInputChange}
                    placeholder="please enter..."
                    rows={5}
                    className="w-full md:w-[540px] h-[120px] py-2 px-4 rounded-[4px] border border-[#D1D5DB] outline-none resize-none font-inherit input-focus"
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
                        className="w-5 h-5 min-w-[20px] min-h-[20px] border border-[#D9D9D9] rounded-full mt-[2px] ml-[2px] cursor-pointer bg-transparent appearance-none flex-shrink-0 focus:ring-[#222222] focus:ring-1"
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
                        className="w-5 h-5 min-w-[20px] min-h-[20px] border border-[#D9D9D9] rounded-full mt-[2px] ml-[2px] cursor-pointer bg-transparent appearance-none flex-shrink-0 focus:ring-[#222222] focus:ring-1"
                      />
                      <span className="text-[16px] text-[#222222] tracking-wide font-normal">
                        I understand that my idea will be treated as inspiration only, and Dreamaze may develop similar concepts independently or receive similar ideas from other participants.
                      </span>
                    </label>
                    {errors.confirmInspiration && <p className="text-red-500 text-sm ml-8 mt-0">{errors.confirmInspiration}</p>}
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }}
              disabled={isSubmitting}
              className="bg-[#222222] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Send It In'}
            </button>
          </div>
        </div>
      </section>

      {/* Sign-up Section */}
      <section className="bg-white mx-auto text-center flex flex-col py-12 md:py-22 px-4 md:px-[105px] w-[1440px] max-w-full signup-section">
        <div className="mx-auto text-center flex flex-col w-full max-w-full gap-6 opacity-100 signup-content">
            <h2 className="font-family-roboto text-[24px] md:text-[40px] font-semibold md:font-medium text-[#222222]">
              Help Us Shape The Next Personalized Book.
            </h2>
            <p className="font-family-roboto text-[14px] md:text-[20px] font-normal md:font-light text-[#222222]">
              Sign up to join the community, suggest ideas, and vote for upcoming themes.
            </p>

            <form 
              onSubmit={handleSignupSubmit} 
              className="flex justify-center"
            >
              <div
                className="w-[480px] max-w-full h-[104px] flex flex-col gap-4"
              >
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-9 px-4 bg-gray-100 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#222222] focus:border-transparent text-[#999999]"
                />
                <button
                  type="submit"
                  disabled={isSignupSubmitting}
                  className="bg-[#222222] text-[#F5E3E3] h-9 px-4 rounded-[2px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {isSignupSubmitting ? 'Submitting...' : 'Send It In'}
                </button>
              </div>
            </form>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-white rounded-[4px] p-8 max-w-md mx-4 relative w-[588px] max-w-[90%]"
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
            <div className="flex flex-col items-center text-center gap-4">
              <div className="text-5xl mb-1">🌟</div>
              <h2 className="font-medium text-2xl text-[#222222] m-0 leading-normal">
                Thank you for sharing!
              </h2>
              <div className="flex flex-col gap-3 max-w-[480px]">
                <p className="text-base text-[#666666] tracking-[0.15px] leading-[1.5] m-0">
                  Your idea means the world to us.
                </p>
                <p className="text-base text-[#666666] tracking-[0.15px] leading-[1.5] m-0">
                  If your inspiration becomes part of a published story, we'll reach out to give you credit—for example, an acknowledgment in the book.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-4 bg-[#222222] text-white px-8 py-3 rounded-[4px] font-medium hover:bg-gray-800 transition-colors w-auto"
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

