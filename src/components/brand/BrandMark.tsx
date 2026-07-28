import { useId } from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
  label?: string;
}

export default function BrandMark({
  size = 44,
  className = '',
  label = 'Speek It',
}: BrandMarkProps) {
  const id = useId().replace(/:/g, '');
  const gradientId = `brand-gradient-${id}`;
  const glowId = `brand-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="10" y1="8" x2="39" y2="40">
          <stop stopColor="#7DF5FF" />
          <stop offset="0.5" stopColor="#00E7FF" />
          <stop offset="1" stopColor="#4CA7FF" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x="3.5"
        y="3.5"
        width="41"
        height="41"
        rx="14"
        fill="#061015"
        stroke={`url(#${gradientId})`}
        strokeOpacity="0.24"
      />
      <path
        d="M34 14.4C30.9 10.7 23.9 9.6 18.8 11.9C13.5 14.3 12.3 20 16.6 22.5C20.8 24.9 29.1 22.5 32.4 26.1C36.2 30.2 32.6 36.4 26.1 37.1C20.6 37.7 15.4 35.3 13 32.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />
      <path
        d="M10.5 27.3C12.1 25.8 13.8 25.8 15.4 27.3C17 28.8 18.6 28.8 20.2 27.3"
        stroke="#00E7FF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.48"
      />
      <circle cx="37.2" cy="35.8" r="2.15" fill="#00E7FF" />
    </svg>
  );
}
