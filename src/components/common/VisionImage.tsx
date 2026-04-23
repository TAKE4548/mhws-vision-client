import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ImageOff, Scan } from 'lucide-react';
import { resolveImageUrl } from '../../lib/api-client';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VisionImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  placeholderType?: 'monitor' | 'modal';
  fallbackText?: string;
}

/**
 * A robust image component with automatic URL resolution,
 * retry logic, and aesthetic loading/error states.
 */
export const VisionImage: React.FC<VisionImageProps> = ({
  src,
  alt = 'Vision Discovery',
  className,
  placeholderType = 'monitor',
  fallbackText = 'IMAGE NOT FOUND',
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'retrying'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const resolvedSrc = src ? resolveImageUrl(src) : '';

  useEffect(() => {
    if (!resolvedSrc) {
      setStatus('error');
      return;
    }
    setImgSrc(resolvedSrc);
    setStatus('loading');
    setRetryCount(0);
  }, [resolvedSrc]);

  const handleError = useCallback(() => {
    if (retryCount === 0) {
      setStatus('retrying');
      setRetryCount(1);
      
      // Delay retry to give backend time to finalize the file if it was just created
      setTimeout(() => {
        const cacheBuster = `t=${Date.now()}`;
        const newSrc = resolvedSrc.includes('?') 
          ? `${resolvedSrc}&${cacheBuster}` 
          : `${resolvedSrc}?${cacheBuster}`;
        
        console.log(`[VisionImage] Retrying image load: ${newSrc}`);
        setImgSrc(newSrc);
      }, 1500);
    } else {
      console.warn(`[VisionImage] Failed to load image after retry: ${resolvedSrc}`);
      setStatus('error');
    }
  }, [retryCount, resolvedSrc]);

  const handleLoad = useCallback(() => {
    setStatus('loaded');
  }, []);

  // Base dimensions and icons based on type
  const isModal = placeholderType === 'modal';
  const PlaceholderIcon = isModal ? ImageOff : Scan;

  return (
    <div className={cn(
      "relative overflow-hidden bg-surface-lowest flex items-center justify-center transition-all duration-500",
      className
    )}>
      {/* Loading Overlay / Skeleton */}
      {(status === 'loading' || status === 'retrying') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-lowest animate-pulse">
          <Loader2 className={cn("text-kinetic-blue/40 animate-spin", isModal ? "w-8 h-8" : "w-4 h-4")} />
          {status === 'retrying' && (
            <span className="mt-2 font-label-tech text-[8px] text-kinetic-blue/40 uppercase tracking-widest">
              Re-Syncing...
            </span>
          )}
        </div>
      )}

      {/* Error / Placeholder State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-lowest text-white/20 gap-2 p-4">
          <PlaceholderIcon className={cn(isModal ? "w-12 h-12" : "w-6 h-6", "opacity-40")} />
          <span className="font-label-tech text-[8px] uppercase tracking-widest text-center opacity-40">
            {fallbackText}
          </span>
        </div>
      )}

      {/* Actual Image */}
      {resolvedSrc && (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-all duration-700 ease-out",
            isModal ? "object-contain" : "object-cover",
            status === 'loaded' ? "opacity-80 scale-100" : "opacity-0 scale-105"
          )}
        />
      )}

      {/* Aesthetic Scanline (only for loaded monitor images) */}
      {status === 'loaded' && placeholderType === 'monitor' && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-kinetic-blue/5 to-transparent h-1/2 animate-scan" />
      )}
    </div>
  );
};

export default VisionImage;
