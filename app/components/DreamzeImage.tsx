import Image from "next/image";

interface DreamzeImageProps {
  src: string;
  alt: string;
  cssClass?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  /** Set to true for video content */
  isVideo?: boolean;
}

export default function DreamzeImage({
  src,
  alt,
  cssClass = '',
  style,
  unoptimized = false,
  isVideo = false,
}: DreamzeImageProps) {
  if (isVideo) {
    return (
      <video
        src={src}
        className={`object-cover ${cssClass}`}
        style={style}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`object-cover ${cssClass}`}
      style={style as React.CSSProperties}
      fill
      loading="lazy"
      unoptimized={unoptimized}
      sizes="(max-width: 768px) 100vw, 100vw"
    />
  );
}