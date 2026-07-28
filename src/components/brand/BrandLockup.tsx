import BrandMark from './BrandMark';

interface BrandLockupProps {
  compact?: boolean;
  className?: string;
}

export default function BrandLockup({ compact = false, className = '' }: BrandLockupProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-3.5'} ${className}`}>
      <BrandMark size={compact ? 40 : 54} />
      <div className="flex flex-col">
        <span
          className={`font-display font-semibold leading-none tracking-[-0.045em] text-white ${
            compact ? 'text-[1.05rem]' : 'text-2xl'
          }`}
        >
          Speek <span className="text-[#00E7FF]">It.</span>
        </span>
        <span
          className={`font-mono uppercase text-white/35 ${
            compact
              ? 'mt-1 text-[8px] tracking-[0.2em]'
              : 'mt-1.5 text-[9px] tracking-[0.28em]'
          }`}
        >
          Sua voz em movimento
        </span>
      </div>
    </div>
  );
}
