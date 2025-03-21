import Image from "next/image";

interface ButtonProps {
  tl: string
  isLoading?: boolean
  url?: string
  icon?: string
  leftIcon?: string
  handleClick?: () => void
}

const buttonStyle = 'cursor-pointer bg-[#022CCE] text-white px-4 py-4 rounded capitalize w-full disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center';

export default function Button({tl,isLoading,url,icon,leftIcon,handleClick}:ButtonProps) {
  if (url) {
    return (
      <a className={buttonStyle} href={url} onClick={handleClick}>
        {leftIcon && <Image src={leftIcon} className="mr-2" alt="" width={24} height={24} />}
        <span>{tl}</span>
        {icon && <Image src={icon} className="ml-2" alt="" width={28} height={28} />}
      </a>
    )
  }
  return (
    <button 
      disabled={isLoading}
      onClick={handleClick}
      className={buttonStyle}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          {leftIcon && <Image src={leftIcon} className="mr-2" alt="" width={28} height={28} />}
          <span>{tl}</span>
          {icon && <Image src={icon} alt="" width={28} height={28} />}
        </>
      )}
    </button>
  )
}