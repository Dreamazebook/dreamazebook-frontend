interface ButtonProps {
  tl: string
  isLoading?: boolean
  url?: string
}

const buttonStyle = 'cursor-pointer bg-landing-page-btn text-white px-4 py-4 rounded uppercase w-full disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center';

export default function Button({tl,isLoading,url}:ButtonProps) {
  if (url) {
    return (
      <a className={buttonStyle} href={url}>{tl}</a>
    )
  }
  return (
    <button 
      disabled={isLoading}
      className={buttonStyle}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        tl
      )}
    </button>
  )
}