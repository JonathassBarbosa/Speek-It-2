import type { CSSProperties } from 'react';

interface SmokyWordmarkProps {
  text?: string;
  color?: string;
}

export default function SmokyWordmark({
  text = 'Speek It.',
  color = '#00E7FF',
}: SmokyWordmarkProps) {
  return (
    <div
      className="smoky-wordmark"
      aria-label={text}
      style={{ '--smoke-color': color } as CSSProperties}
    >
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className="smoky-character"
          style={{ animationDelay: `${100 + index * 70}ms` }}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </div>
  );
}
