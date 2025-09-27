import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    return breakpoints
      .map(bp => `${baseSrc}?w=${bp} ${bp}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-slate-800/50',
        className
      )}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      {/* Placeholder/Blur background */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-slate-700 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-800/80">
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-xs sm:text-sm">Failed to load image</span>
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <Image
          ref={imgRef}
          src={src}
          sizes={sizes}
          alt={alt}
          width={width || 800}
          height={height || 600}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            {
              'opacity-0': !isLoaded,
              'opacity-100': isLoaded,
              'object-cover': objectFit === 'cover',
              'object-contain': objectFit === 'contain',
              'object-fill': objectFit === 'fill',
              'object-none': objectFit === 'none',
              'object-scale-down': objectFit === 'scale-down'
            }
          )}
          priority={priority}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;

// Utility component for image galleries
export const ImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}> = ({ 
  images, 
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 }
}) => {
  const getGridCols = () => {
    return cn(
      `grid-cols-${columns.mobile}`,
      `sm:grid-cols-${columns.tablet}`,
      `lg:grid-cols-${columns.desktop}`
    );
  };

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {images.map((image, index) => (
        <div key={index} className="space-y-2">
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            className="rounded-lg aspect-square"
            priority={index < 3} // Prioritize first 3 images
          />
          {image.caption && (
            <p className="text-xs sm:text-sm text-slate-400 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Avatar component with responsive sizing
export const ResponsiveAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}> = ({ 
  src, 
  alt, 
  size = 'md', 
  className,
  fallback 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
    xl: 'w-12 h-12 sm:w-16 sm:h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!src) {
    return (
      <div className={cn(
        'rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium',
        sizeClasses[size],
        textSizes[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      objectFit="cover"
      priority={size === 'xl'}
    />
  );
};