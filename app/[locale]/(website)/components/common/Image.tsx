interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Priority loading for above-the-fold images (LCP). Defaults to false. */
  priority?: boolean;
}

export default function Image({ src, alt, className, width, height, priority = false }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' } : {})}
    />
  );
}