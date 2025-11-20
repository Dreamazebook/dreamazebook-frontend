'use client'

import { useState, FormEvent } from 'react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  issueType: string
  orderNumber: string
  subject: string
  message: string
}

const issueTypes = [
  'I want to change or edit my order',
  'I want to check my delivery status',
  'I want to resolve a payment issue',
  'I want help placing an order',
  'I want to report a damaged order',
  'I want to report a wrong item or a printing mistake',
  'I want to ask about something else',
  'I want to give feedback for Dreamaze Book'
]

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    issueType: '',
    orderNumber: '',
    subject: '',
    message: ''
  })

  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...files])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Form submitted:', formData)
    console.log('Attachments:', attachments)

    setSubmitSuccess(true)
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        issueType: '',
        orderNumber: '',
        subject: '',
        message: ''
      })
      setAttachments([])
      setSubmitSuccess(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute left-0 top-[400px] w-40 h-80 opacity-20">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="#3B82F6" opacity="0.3" />
          <circle cx="50" cy="250" r="60" fill="#8B5CF6" opacity="0.3" />
        </svg>
      </div>

      <div className="absolute right-0 top-20 w-56 h-[500px] opacity-15">
        <svg viewBox="0 0 300 600" className="w-full h-full">
          <circle cx="200" cy="150" r="100" fill="none" stroke="#3B82F6" strokeWidth="2" />
          <circle cx="150" cy="350" r="120" fill="none" stroke="#8B5CF6" strokeWidth="2" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hi, we are here to help!
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-3 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Behind every book and every order, the Dreamaze team is right here ready to support you with our very best.
            </p>
            <p className="text-lg">
              Share a few details with us below, and we'll reply with care within <span className="font-semibold">1–2 business days</span>.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-center">
                ✓ Thank you! Your message has been sent successfully. We'll get back to you within 1-2 business days.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                  data-testid="contact-first-name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                  data-testid="contact-last-name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
                data-testid="contact-email"
              />
            </div>

            {/* Issue Type Dropdown */}
            <div>
              <label htmlFor="issueType" className="block text-sm font-semibold text-gray-700 mb-2">
                What can we help you with? <span className="text-red-500">*</span>
              </label>
              <select
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                data-testid="contact-issue-type"
              >
                <option value="">Please select...</option>
                {issueTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Number (Optional) */}
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Order Number <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., #12345"
                data-testid="contact-order-number"
              />
              <p className="mt-1 text-xs text-gray-500">
                If your inquiry is related to a specific order, please provide the order number
              </p>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief summary of your request"
                data-testid="contact-subject"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                How can we help? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Please provide as much detail as possible so we can help you better..."
                data-testid="contact-message"
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attachments <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </span>
                </label>
              </div>

              {/* Display uploaded files */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Please attach any relevant photos or documents that might help us assist you better
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                data-testid="contact-submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            You can also reach us directly at{' '}
            <a
              href="mailto:hello@dreamazebook.com"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              hello@dreamazebook.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
