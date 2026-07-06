import { memo } from 'react'
import Input from '@/app/components/common/Input'

interface CodeInputFieldProps {
  code: string
  onCodeChange: (value: string) => void
  successMessage: string
}

export const CodeInputField = memo(({ code, onCodeChange, successMessage }: CodeInputFieldProps) => {
  const handleCodeInput = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = code.split('')
    newCode[index] = value
    const newCodeValue = newCode.join('')
    onCodeChange(newCodeValue)
    
    if (value && index < 5) {
      (document.querySelectorAll('.code-input')[index + 1] as HTMLInputElement)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      (document.querySelectorAll('.code-input')[index - 1] as HTMLInputElement)?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData?.getData('text') || ''
    const digits = pastedData.replace(/\D/g, '').slice(0, 6)
    if (digits.length > 0) {
      onCodeChange(digits.padEnd(6, ''))
      const inputs = document.querySelectorAll('.code-input')
      const focusIdx = Math.min(digits.length, 5)
      ;(inputs[focusIdx] as HTMLInputElement)?.focus()
    }
  }

  return (
    <div>
      {successMessage && (
        <p className="text-center text-[14px] leading-[20px] tracking-[0.25px] text-[#666666]" role="status" aria-live="polite">
          {successMessage}
        </p>
      )}

      <div className="flex gap-[8px]">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[index] || ''}
            onChange={(e) => handleCodeInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="code-input h-[36px] w-[36px] rounded-[4px] border border-[#222222] text-center text-[14px] leading-[20px] tracking-[0.25px] text-[#222222] outline-none focus:border-[#222222] focus:ring-0"
            required
            aria-label={`Code digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
})

CodeInputField.displayName = 'CodeInputField'
