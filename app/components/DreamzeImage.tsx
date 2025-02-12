import Image from "next/image";

interface DreamzeImageProps {
  src:string
  alt:string
  cssClass?:string
}
export default function DreamzeImage({src,alt,cssClass=''}: DreamzeImageProps) {
  return (
    <Image src={src} alt={alt} className={`object-cover ${cssClass}`} fill loading="lazy" />
  )
}