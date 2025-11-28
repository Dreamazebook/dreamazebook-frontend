'use client'

import { Link } from '@/i18n/routing'
import React from 'react'
import { useState } from 'react'
import { HELLO_EMAIL } from '@/constants/text'
import { CONTACT_US_URL } from '@/constants/links'

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

const faqData: FAQItem[] = [
  {
    question: "Where is Dreamaze based?",
    answer: "Dreamaze is based in Paris, France, and we ship worldwide."
  },
  {
    question: "What ages are Dreamaze books designed for?",
    answer: "Our books are created for ages 0–99. Each story is centered around the child, but made to bring joy to siblings, parents, grandparents, and everyone who loves them. We hope every family member feels a little happiness through these books."
  },
  {
    question: "How do I place an order?",
    answer: "Choose a book → click Personalize → fill in the details. We'll process your order within 48 hours and send you a preview by email. You'll have 24 hours to review and confirm before we print."
  },
  {
    question: "Do I need to send you photos?",
    answer: (
      <div className="space-y-3">
        <p>Yes. To create true personalization and ensure your child recognizes themselves in the story, we ask for 1–3 clear, front-facing photos.</p>
        <p>Your privacy matters deeply to us:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your photos are only used for book creation</li>
          <li>They are automatically deleted within 7 days after your book is completed</li>
          <li>We strictly follow data-protection standards (GDPR)</li>
        </ul>
      </div>
    )
  },
  {
    question: "How fast will I receive my order?",
    answer: (
      <div className="space-y-3">
        <p>At checkout, you'll see the estimated delivery time for your address based on the shipping option you choose. Some locations receive their books in as fast as 3–5 days.</p>
        <p>You can also visit our Delivery Information page for more details.</p>
      </div>
    )
  },
  {
    question: "Do you offer books for more than one child?",
    answer: "Currently, our books are designed for one child per story. Multi-child editions are under development — we can't wait to share them with you soon!"
  },
  {
    question: "Are your books AI-generated?",
    answer: "No. All Dreamaze books are hand-illustrated by real artists, and every story is original. AI is only used in the final step to gently transform the main character into your child — a little touch of magic that doesn't affect the beauty, detail, or authenticity of the illustrations."
  },
  {
    question: "I made a mistake in my order. How can I correct it?",
    answer: (
      <div className="space-y-3">
        <p>You have:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>4 hours after checkout to correct your information</li>
          <li>24 hours after receiving your preview to request a change</li>
        </ul>
        <p>Please contact us through Contact Us if you need help. Once the 24-hour preview window has passed, your book will enter printing and can no longer be changed.</p>
      </div>
    )
  },
  {
    question: "Do you offer books in different languages?",
    answer: "Yes — we're expanding! If your preferred language isn't available yet, feel free to let us know. We prioritize based on customer requests, and your input truly helps shape our roadmap."
  },
  {
    question: "Do you ship worldwide?",
    answer: "Yes, we ship globally. As long as you can place an order, we can deliver to you. We strongly recommend adding a phone number to ensure smooth delivery."
  },
  {
    question: "Why did I receive a payment error message?",
    answer: (
      <div className="space-y-3">
        <p>A payment error usually means something went wrong during the transaction. Common reasons include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>insufficient funds</li>
          <li>A typo in the card details</li>
          <li>Your bank blocking the transaction</li>
        </ul>
        <p>We accept PayPal and credit cards (MasterCard, Visa, American Express, Diners Club). If the issue continues, contacting your bank or trying another payment method may help.</p>
      </div>
    )
  },
  {
    question: "Can I customize the story content freely?",
    answer: "To balance creativity and ease of use, each Dreamaze book includes a specific set of personalization options. Our library continues to grow, so you'll always find stories with customization that fits your needs."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Blue Curved Shape - Left Side */}
      <div className="absolute left-0 top-[600px] w-48 h-96 opacity-90">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <path
            d="M 0 0 Q 150 100 150 200 Q 150 300 0 400 L 0 400 Z"
            fill="#3B82F6"
            opacity="0.9"
          />
          <circle cx="150" cy="150" r="60" fill="white" />
        </svg>
      </div>

      {/* Decorative Circular Outlines - Right Side */}
      <div className="absolute right-0 top-20 w-64 h-[600px] opacity-20">
        <svg viewBox="0 0 300 700" className="w-full h-full">
          <circle cx="150" cy="150" r="120" fill="none" stroke="#D1D5DB" strokeWidth="2" />
          <circle cx="200" cy="400" r="180" fill="none" stroke="#D1D5DB" strokeWidth="2" />
          <path
            d="M 150 500 Q 200 550 250 600"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            FAQ's
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-4 text-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900">
              Hi, we'd like to help!
            </h2>
            <p className="text-lg leading-relaxed">
              Welcome — we're so glad our paths have crossed!
            </p>
            <p className="leading-relaxed">
              Here you'll find answers to some of our most frequently asked questions, thoughtfully prepared to give you a hand whenever you need it.
            </p>
            <p className="leading-relaxed">
              If you don't see the answer you're looking for, don't hesitate to reach out.
            </p>
            <p className="leading-relaxed">
              Click <Link href={CONTACT_US_URL} className="text-primary font-semibold">Contact Us</Link> or email{' '}
              <a 
                href={`mailto:${HELLO_EMAIL}`} 
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                {HELLO_EMAIL}
              </a>
            </p>
            <p className="leading-relaxed">
              We'll get back to you with care within 1–2 business days.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 mb-20">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                data-testid={`faq-question-${index}`}
              >
                <span className="text-lg font-medium text-gray-900 pr-4">
                  {index + 1}. {faq.question}
                </span>
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {openIndex === index ? (
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </span>
              </button>

              {/* Answer Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-[1000px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                  {typeof faq.answer === 'string' ? (
                    <p>{faq.answer}</p>
                  ) : (
                    faq.answer
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
