import { memo } from 'react'

interface HeaderProps {
  title: string
  showBackButton: boolean
  onBackClick: () => void
}

export const ModalHeader = memo(({ title, showBackButton, onBackClick }: HeaderProps) => (
  <header className="w-full flex items-center justify-center relative">
    {showBackButton && (
      <button
        type="button"
        onClick={onBackClick}
        className="absolute left-0 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
        aria-label="Go back"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    )}
    <h1 className="text-[28px] text-[#000]">{title}</h1>
  </header>
))

ModalHeader.displayName = 'ModalHeader'

interface CloseButtonProps {
  onClose: () => void
}

export const CloseButton = memo(({ onClose }: CloseButtonProps) => (
  <button
    type="button"
    onClick={onClose}
    className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors focus:outline-none z-10"
    aria-label="Close"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
))

CloseButton.displayName = 'CloseButton'
