interface NextStepButtonProps {
  disabled: boolean;
  handleOnClick: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}
export default function NextStepButton({ disabled, handleOnClick, children,type='button' }: NextStepButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleOnClick}
      className="inline-block mx-auto bg-[#222222] cursor-pointer text-white py-3 px-4 rounded transition-colors hover:opacity-80"
    >
      {children}
    </button>
  )
}