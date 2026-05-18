"use client";
import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";

interface CustomImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  /** width + height prevent CLS — always pass these */
  width?: number;
  height?: number;
  /** true for your LCP/hero image — skips lazy load, sets fetchpriority=high */
  priority?: boolean;
  /** caption text — wraps in <figure>/<figcaption> for semantic HTML */
  caption?: string;
}

export default function CustomImage({
  src,
  alt,
  className = "",
  placeholderSrc = "",
  width,
  height,
  priority = false,
  caption,
  ...props
}: CustomImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
      return;
    }

    const t = setTimeout(() => {
      if (!imgRef.current?.complete) setIsLoaded(true);
    }, 2500);

    return () => clearTimeout(t);
  }, [src]);

  const img = (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder — hidden from assistive tech, no alt needed */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-105"
        />
      )}

      {/* Real image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );

  if (caption) {
    return (
      <figure className="m-0 p-0">
        {img}
        <figcaption className="text-sm text-gray-500 mt-1">{caption}</figcaption>
      </figure>
    );
  }

  return img;
}