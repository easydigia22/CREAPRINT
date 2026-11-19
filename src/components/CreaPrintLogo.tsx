import React from 'react';
import { cn } from '@/src/lib/utils';

interface CreaPrintLogoProps {
  variant?: 'light' | 'dark';
  showSignature?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreaPrintMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top-left Yellow leaf */}
      <path d="M5 10.5C5 7.46 7.46 5 10.5 5H19V19H5V10.5Z" fill="#F5D84C" />
      {/* Top-right Rose leaf */}
      <path d="M21 5H29.5C32.54 5 35 7.46 35 10.5V19H21V5Z" fill="#F17B9B" />
      {/* Bottom-left Cyan leaf */}
      <path d="M5 21H19V35H10.5C7.46 35 5 32.54 5 29.5V21Z" fill="#56B9E8" />
      {/* Bottom-right Slate-blue leaf */}
      <path d="M21 21H35V29.5C35 32.54 32.54 35 29.5 35H21V21Z" fill="#70849A" />
      {/* Subtle folded sheet diagonal highlight */}
      <path d="M19 5H21V35H19V5Z" fill="#151515" fillOpacity="0.18" />
    </svg>
  );
}

export function CreaPrintLogo({
  variant = 'light',
  showSignature = false,
  size = 'md',
  className,
}: CreaPrintLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#151515]';
  const sigColor = variant === 'light' ? 'text-[#A8B4C2]' : 'text-[#70849A]';

  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';
  const markSize =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div className={cn('inline-flex flex-col leading-none select-none', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 font-display font-extrabold tracking-tight whitespace-nowrap shrink-0',
          textSize,
          textColor
        )}
      >
        <span>Crea</span>
        <CreaPrintMark className={cn(markSize, 'inline-block shrink-0')} />
        <span>Print</span>
      </span>
      {showSignature && (
        <span
          className={cn(
            'mt-1.5 text-[10px] font-medium tracking-[0.26em] whitespace-nowrap',
            sigColor
          )}
        >
          DESIGN &amp; IMPRESSION
        </span>
      )}
    </div>
  );
}
