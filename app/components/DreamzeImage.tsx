import Image from "next/image";

interface DreamzeImageProps {
  src:string
  alt:string
  cssClass?:string
  style?:React.CSSProperties
}
export default function DreamzeImage({src,alt,cssClass='',style}: DreamzeImageProps) {
  return (
    <Image 
      src={src} 
      alt={alt} 
      className={`object-cover ${cssClass}`} 
      style={style as React.CSSProperties} 
      fill 
      loading="lazy" 
    />
  )
}