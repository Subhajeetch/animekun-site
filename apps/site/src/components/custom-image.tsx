"use client"
import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';

interface CustomImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholderSrc?: string;
}

export default function CustomImage({
    src,
    alt,
    className = '',
    placeholderSrc = '',
    ...props
}: CustomImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
            return;
        }

        const t = setTimeout(() => {
            if (!imgRef.current || !imgRef.current.complete) {
                setIsLoaded(true);
            }
        }, 2500);

        return () => clearTimeout(t);
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder (blur) */}
            {!isLoaded && placeholderSrc && (
                <img
                    src={placeholderSrc}
                    alt="blur-placeholder"
                    className="absolute inset-0 w-full h-full object-cover blur-lg scale-105"
                />
            )}

            {/* Real image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                {...props}
            />
        </div>
    );
}