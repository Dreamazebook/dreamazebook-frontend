interface NextStepButtonProps {
  disabled: boolean;
  handleOnClick: () => void;
  text: string;
}
export default function NextStepButton({ disabled, handleOnClick, text }: NextStepButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={handleOnClick}
      className="inline-block bg-[#222222] cursor-pointer text-white py-3 px-4 rounded transition-colors hover:opacity-80"
    >
      {text}
    </button>
  )
}