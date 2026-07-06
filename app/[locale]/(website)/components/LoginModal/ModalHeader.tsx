import { memo, type CSSProperties, type ReactNode } from 'react'
import { TfiClose } from 'react-icons/tfi'

interface HeaderProps {
  title: string
  description?: ReactNode
  compact?: boolean
  variant?: 'default' | 'previewUnlock'
}

const previewUnlockHeaderStyle: CSSProperties = {
  width: 312,
  height: 100,
  paddingTop: 12,
  boxSizing: 'border-box',
}

export const ModalHeader = memo(({
  title,
  description = 'Sign in to access your account',
  compact = false,
  variant = 'default',
}: HeaderProps) => {
  const isPreviewUnlock = variant === 'previewUnlock'

  return (
    <header
      className={`relative text-center opacity-100 ${
        isPreviewUnlock ? 'flex w-full flex-col gap-[12px]' : 'w-full'
      }`}
      style={isPreviewUnlock ? previewUnlockHeaderStyle : undefined}
    >
      <h1 className="text-[28px] leading-[36px] text-[#000]">{title}</h1>
      {description && (
        <p
          className={`text-[14px] leading-[20px] tracking-[-0.25px] text-[#666666] whitespace-pre-line ${
            isPreviewUnlock ? '' : compact ? 'mt-[12px]' : 'mt-2'
          }`}
        >
          {description}
        </p>
      )}
    </header>
  )
})

ModalHeader.displayName = 'ModalHeader'

interface CloseButtonProps {
  onClose: () => void
  iconSize?: number
}

export const CloseButton = memo(({ onClose, iconSize = 24 }: CloseButtonProps) => (
  <button
    type="button"
    onClick={onClose}
    className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors focus:outline-none z-10"
    aria-label="Close"
  >
    <TfiClose size={iconSize} aria-hidden="true" className="text-[#000000]" />
  </button>
))

CloseButton.displayName = 'CloseButton'
