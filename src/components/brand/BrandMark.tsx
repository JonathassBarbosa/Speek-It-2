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
      <text
        x="24"
        y="38"
        fill="#00E7FF"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="43"
        fontWeight="600"
        letterSpacing="-2"
        textAnchor="middle"
      >
        S
      </text>
    </svg>
  );
}
