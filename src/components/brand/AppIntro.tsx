import { useEffect } from 'react';
import SmokyWordmark from './SmokyWordmark';

interface AppIntroProps {
  onComplete: () => void;
}

export default function AppIntro({ onComplete }: AppIntroProps) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(onComplete, reducedMotion ? 700 : 2900);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="brand-intro" role="status" aria-label="Iniciando Speek It">
      <div className="brand-intro__aura" aria-hidden="true" />
      <div className="brand-intro__content">
        <SmokyWordmark />
        <p className="brand-intro__tagline">Sua voz em movimento</p>
      </div>
      <button className="brand-intro__skip" type="button" onClick={onComplete}>
        Pular abertura
      </button>
    </div>
  );
}
