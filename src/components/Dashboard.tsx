/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { SpeechEvaluation } from '../types';
import {
  Award,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Mic,
  Trophy,
  Share2,
  X,
  LockKeyhole,
  Check,
} from 'lucide-react';

interface Props {
  evaluations: SpeechEvaluation[];
  onGoTrain: () => void;
  userName: string;
}

// Calculates current streak in consecutive days
function calculateStreak(evals: SpeechEvaluation[]): number {
  if (evals.length === 0) return 0;

  // Unique training days
  const daySet = new Set(
    evals.map((e) => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const days = Array.from(daySet)
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => b - a); // descending (most recent first)

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    expected.setHours(0, 0, 0, 0);

    const diff = Math.round(Math.abs(days[i] - expected.getTime()) / 86400000);
    if (diff === 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

interface Medal {
  id: string;
  code: string;
  label: string;
  description: string;
  earned: boolean;
  current: number;
  target: number;
  unit: string;
  accent: string;
}

function getMedals(evals: SpeechEvaluation[]): Medal[] {
  const total = evals.length;
  const totalSecs = evals.reduce((s, e) => s + e.duration, 0);
  const bestScore = total > 0 ? Math.max(...evals.map((e) => e.score)) : 0;
  const bestDiccao = total > 0 ? Math.max(...evals.map((e) => e.diccaoScore)) : 0;
  const bestRitmo = total > 0 ? Math.max(...evals.map((e) => e.ritmoScore)) : 0;
  const streak = calculateStreak(evals);

  return [
    {
      id: 'first',
      code: '01',
      label: 'Primeiro Treino',
      description: 'Complete sua primeira sessão',
      earned: total >= 1,
      current: Math.min(total, 1), target: 1, unit: 'sessão', accent: '#00E7FF',
    },
    {
      id: 'five',
      code: '05',
      label: '5 Treinos',
      description: 'Complete 5 sessões de treinamento',
      earned: total >= 5,
      current: Math.min(total, 5), target: 5, unit: 'sessões', accent: '#22C55E',
    },
    {
      id: 'ten',
      code: '10',
      label: '10 Treinos',
      description: 'Complete 10 sessões de treinamento',
      earned: total >= 10,
      current: Math.min(total, 10), target: 10, unit: 'sessões', accent: '#3B82F6',
    },
    {
      id: 'twenty',
      code: '20',
      label: '20 Treinos',
      description: 'Complete 20 sessões de treinamento',
      earned: total >= 20,
      current: Math.min(total, 20), target: 20, unit: 'sessões', accent: '#8B5CF6',
    },
    {
      id: 'score85',
      code: '85',
      label: 'Nota 85+',
      description: 'Alcance 85 ou mais em uma análise',
      earned: bestScore >= 85,
      current: Math.min(bestScore, 85), target: 85, unit: 'pontos', accent: '#EAB308',
    },
    {
      id: 'score90',
      code: '90',
      label: 'Nota 90+',
      description: 'Alcance nota 90 ou mais em uma análise',
      earned: bestScore >= 90,
      current: Math.min(bestScore, 90), target: 90, unit: 'pontos', accent: '#F97316',
    },
    {
      id: 'diccao95',
      code: 'DIC',
      label: 'Mestre da Dicção',
      description: 'Alcance 95+ em dicção',
      earned: bestDiccao >= 95,
      current: Math.min(bestDiccao, 95), target: 95, unit: 'dicção', accent: '#EC4899',
    },
    {
      id: 'ritmo90',
      code: 'RIT',
      label: 'Ritmo Perfeito',
      description: 'Alcance 90+ em ritmo de fala',
      earned: bestRitmo >= 90,
      current: Math.min(bestRitmo, 90), target: 90, unit: 'ritmo', accent: '#14B8A6',
    },
    {
      id: 'streak3',
      code: '3D',
      label: 'Série de 3 Dias',
      description: 'Treine por 3 dias consecutivos',
      earned: streak >= 3,
      current: Math.min(streak, 3), target: 3, unit: 'dias', accent: '#F59E0B',
    },
    {
      id: 'streak7',
      code: '7D',
      label: 'Semana Completa',
      description: 'Treine por 7 dias seguidos',
      earned: streak >= 7,
      current: Math.min(streak, 7), target: 7, unit: 'dias', accent: '#84CC16',
    },
    {
      id: 'time30',
      code: '30M',
      label: '30 Minutos',
      description: 'Acumule 30 minutos de treino total',
      earned: totalSecs >= 1800,
      current: Math.min(Math.floor(totalSecs / 60), 30), target: 30, unit: 'minutos', accent: '#6366F1',
    },
    {
      id: 'time60',
      code: '1H',
      label: '1 Hora',
      description: 'Acumule 1 hora de treino total',
      earned: totalSecs >= 3600,
      current: Math.min(Math.floor(totalSecs / 60), 60), target: 60, unit: 'minutos', accent: '#F43F5E',
    },
  ];
}

function AchievementBadge({ medal, compact = false }: { medal: Medal; compact?: boolean }) {
  const progress = Math.round((medal.current / medal.target) * 100);
  return (
    <div
      className={`relative grid place-items-center ${compact ? 'h-10 w-10' : 'h-20 w-20'}`}
      style={{ color: medal.earned ? medal.accent : '#5b6670' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 108" className="absolute inset-0 h-full w-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]">
        <defs>
          <linearGradient id={`badge-${medal.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={medal.earned ? medal.accent : '#273038'} stopOpacity=".32" />
            <stop offset="100%" stopColor="#071014" stopOpacity=".98" />
          </linearGradient>
        </defs>
        <path d="M48 3 88 20v34c0 25-16 41-40 51C24 95 8 79 8 54V20L48 3Z" fill={`url(#badge-${medal.id})`} stroke="currentColor" strokeWidth="2.5" />
        <path d="M48 12 79 25v28c0 19-11 32-31 42-20-10-31-23-31-42V25L48 12Z" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <path d="M26 69h44" stroke="currentColor" strokeOpacity=".55" />
        {medal.earned && <circle cx="48" cy="48" r="25" fill="none" stroke="currentColor" strokeOpacity=".18" />}
      </svg>
      <span className={`${compact ? 'text-[8px]' : 'text-[15px]'} relative -mt-1 font-black tracking-[0.08em]`}>
        {medal.code}
      </span>
      {!medal.earned && <LockKeyhole className={`absolute ${compact ? 'h-3 w-3' : 'h-4 w-4'} bottom-[16%] text-white/30`} />}
      {medal.earned && !compact && (
        <span className="absolute -bottom-1 rounded-full border border-current bg-[#071014] px-1.5 text-[7px] font-black tracking-wider">
          {progress}%
        </span>
      )}
    </div>
  );
}

async function createAchievementPng(
  medal: Medal,
  userName: string,
  stats: { sessions: number; average: number; best: number; streak: number }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  const background = ctx.createLinearGradient(0, 0, 1200, 1500);
  background.addColorStop(0, '#020608');
  background.addColorStop(0.58, '#071014');
  background.addColorStop(1, `${medal.accent}26`);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1200, 1500);

  ctx.strokeStyle = `${medal.accent}1F`;
  ctx.lineWidth = 2;
  for (let x = -400; x < 1500; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 700, 1500);
    ctx.stroke();
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#00E7FF';
  ctx.font = '800 44px system-ui, sans-serif';
  ctx.fillText('SPEEK IT.', 80, 100);
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.font = '600 18px system-ui, sans-serif';
  ctx.fillText('SUA VOZ EM MOVIMENTO', 82, 140);

  ctx.save();
  ctx.translate(600, 470);
  ctx.shadowColor = medal.accent;
  ctx.shadowBlur = 42;
  ctx.beginPath();
  ctx.moveTo(0, -190);
  ctx.lineTo(175, -115);
  ctx.lineTo(175, 45);
  ctx.quadraticCurveTo(175, 175, 0, 245);
  ctx.quadraticCurveTo(-175, 175, -175, 45);
  ctx.lineTo(-175, -115);
  ctx.closePath();
  const shield = ctx.createLinearGradient(-180, -180, 180, 240);
  shield.addColorStop(0, `${medal.accent}70`);
  shield.addColorStop(1, '#061116');
  ctx.fillStyle = shield;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = medal.accent;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 5, 112, 0, Math.PI * 2);
  ctx.strokeStyle = `${medal.accent}55`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = medal.accent;
  ctx.textAlign = 'center';
  ctx.font = `900 ${medal.code.length > 2 ? 68 : 98}px system-ui, sans-serif`;
  ctx.fillText(medal.code, 0, 36);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = medal.accent;
  ctx.font = '800 20px system-ui, sans-serif';
  ctx.fillText('CONQUISTA DESBLOQUEADA', 600, 785);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 58px system-ui, sans-serif';
  ctx.fillText(medal.label, 600, 865);
  ctx.fillStyle = medal.accent;
  ctx.font = '700 30px system-ui, sans-serif';
  ctx.fillText(userName, 600, 920);
  ctx.fillStyle = 'rgba(255,255,255,.58)';
  ctx.font = '400 27px system-ui, sans-serif';
  ctx.fillText(medal.description, 600, 970);

  const cards = [
    ['SESSÕES', stats.sessions.toString()],
    ['MÉDIA', `${stats.average}/100`],
    ['RECORDE', `${stats.best}/100`],
    ['SEQUÊNCIA', `${stats.streak} dias`],
  ];
  cards.forEach(([label, value], index) => {
    const x = 80 + (index % 2) * 530;
    const y = 1060 + Math.floor(index / 2) * 155;
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    ctx.beginPath();
    ctx.roundRect(x, y, 490, 125, 24);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,.42)';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText(label, x + 28, y + 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px system-ui, sans-serif';
    ctx.fillText(value, x + 28, y + 87);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,.34)';
  ctx.font = '500 18px system-ui, sans-serif';
  ctx.fillText(`Emitida em ${new Date().toLocaleDateString('pt-BR')} • Speek It`, 600, 1435);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar PNG'))), 'image/png')
  );
}

// Pure SVG line chart — no external libs needed
function ScoreChart({ evaluations }: { evaluations: SpeechEvaluation[] }) {
  const data = useMemo(
    () =>
      [...evaluations]
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-15),
    [evaluations]
  );

  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <TrendingUp className="w-8 h-8 text-white/10" />
        <p className="text-white/30 text-xs text-center">
          Faça pelo menos 2 treinos para ver sua evolução aqui
        </p>
      </div>
    );
  }

  const W = 560;
  const H = 160;
  const PX = 36;
  const PY = 16;

  const getX = (i: number) =>
    PX + (i / Math.max(data.length - 1, 1)) * (W - PX * 2);
  const getY = (v: number) =>
    H - PY - ((v / 100) * (H - PY * 2));

  const scorePoints = data.map((e, i) => ({ x: getX(i), y: getY(e.score), v: e.score }));
  const diccaoPoints = data.map((e, i) => ({ x: getX(i), y: getY(e.diccaoScore), v: e.diccaoScore }));
  const ritmoPoints = data.map((e, i) => ({ x: getX(i), y: getY(e.ritmoScore), v: e.ritmoScore }));

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaD = `${toPath(scorePoints)} L ${scorePoints[scorePoints.length - 1].x.toFixed(1)} ${(H - PY).toFixed(1)} L ${scorePoints[0].x.toFixed(1)} ${(H - PY).toFixed(1)} Z`;

  const gridLines = [25, 50, 75, 100];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 160, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((v) => (
          <g key={v}>
            <line
              x1={PX}
              y1={getY(v)}
              x2={W - PX}
              y2={getY(v)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <text
              x={PX - 6}
              y={getY(v) + 4}
              fill="rgba(255,255,255,0.2)"
              fontSize="10"
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Score area fill */}
        <path d={areaD} fill="url(#scoreAreaGrad)" />

        {/* Ritmo line */}
        <path
          d={toPath(ritmoPoints)}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          opacity="0.5"
        />

        {/* Dicção line */}
        <path
          d={toPath(diccaoPoints)}
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.5"
        />

        {/* Score line */}
        <path
          d={toPath(scorePoints)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Score dots + labels */}
        {scorePoints.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#050507" stroke="#3b82f6" strokeWidth="2" />
            {data.length <= 8 && (
              <text
                x={p.x}
                y={p.y - 9}
                fill="rgba(255,255,255,0.65)"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                {p.v}
              </text>
            )}
          </g>
        ))}

        {/* X axis date labels — show max 6 labels */}
        {data.map((e, i) => {
          const step = Math.ceil(data.length / 6);
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={getX(i)}
              y={H + 12}
              fill="rgba(255,255,255,0.22)"
              fontSize="9"
              textAnchor="middle"
            >
              {new Date(e.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-5 mt-3 justify-end">
        {[
          { color: '#3b82f6', label: 'Geral', dash: false },
          { color: '#a855f7', label: 'Dicção', dash: true },
          { color: '#10b981', label: 'Ritmo', dash: true },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <svg width="16" height="4">
              <line
                x1="0"
                y1="2"
                x2="16"
                y2="2"
                stroke={l.color}
                strokeWidth="2"
                strokeDasharray={l.dash ? '4 3' : undefined}
              />
            </svg>
            <span className="text-[10px] text-white/35">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ evaluations, onGoTrain, userName }: Props) {
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const totalSessions = evaluations.length;
  const avgScore =
    totalSessions > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / totalSessions)
      : 0;
  const bestScore = totalSessions > 0 ? Math.max(...evaluations.map((e) => e.score)) : 0;
  const totalSeconds = evaluations.reduce((s, e) => s + e.duration, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const streak = calculateStreak(evaluations);
  const medals = getMedals(evaluations);
  const earnedMedals = medals.filter((m) => m.earned);

  const shareAchievement = async (medal: Medal) => {
    setIsSharing(true);
    try {
      const blob = await createAchievementPng(medal, userName, {
        sessions: totalSessions,
        average: avgScore,
        best: bestScore,
        streak,
      });
      const filename = `speek-it-conquista-${medal.id}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      setIsSharing(false);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Conquista Speek It — ${medal.label}`,
          text: `Desbloqueei a conquista “${medal.label}” no Speek It.`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Não foi possível compartilhar a conquista:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Trend: compare last 5 vs previous 5
  const sorted = [...evaluations].sort((a, b) => a.createdAt - b.createdAt);
  const recent5 = sorted.slice(-5);
  const prev5 = sorted.slice(-10, -5);
  const recentAvg =
    recent5.length > 0
      ? Math.round(recent5.reduce((s, e) => s + e.score, 0) / recent5.length)
      : 0;
  const prevAvg =
    prev5.length > 0
      ? Math.round(prev5.reduce((s, e) => s + e.score, 0) / prev5.length)
      : 0;
  const trend = prev5.length > 0 ? recentAvg - prevAvg : 0;

  const metrics = [
    {
      label: 'Dicção',
      key: 'diccaoScore' as const,
      color: '#3b82f6',
      bg: 'bg-blue-500',
      text: 'text-blue-400',
    },
    {
      label: 'Ritmo',
      key: 'ritmoScore' as const,
      color: '#10b981',
      bg: 'bg-emerald-500',
      text: 'text-emerald-400',
    },
    {
      label: 'Entonação',
      key: 'entonacaoScore' as const,
      color: '#a855f7',
      bg: 'bg-purple-500',
      text: 'text-purple-400',
    },
    {
      label: 'Pausas',
      key: 'pausasScore' as const,
      color: '#6366f1',
      bg: 'bg-indigo-500',
      text: 'text-indigo-400',
    },
  ];

  if (totalSessions === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Seu dashboard está vazio</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed">
            Complete seu primeiro treino para começar a ver sua evolução aqui. Cada sessão é
            registrada!
          </p>
        </div>
        <button
          onClick={onGoTrain}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all"
        >
          Começar primeiro treino
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4.5rem)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">
            Dashboard de Evolução
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">Seu Progresso em Oratória</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Sessões
              </span>
            </div>
            <p className="text-3xl font-black text-white">{totalSessions}</p>
            <p className="text-[10px] text-white/30 mt-1">treinos concluídos</p>
          </div>

          <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Média
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              {avgScore}
              <span className="text-sm text-white/40">/100</span>
            </p>
            {trend !== 0 ? (
              <p
                className={`text-[10px] mt-1 font-bold ${
                  trend > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend > 0 ? `↑ +${trend}` : `↓ ${trend}`} vs. anteriores
              </p>
            ) : (
              <p className="text-[10px] text-white/30 mt-1">pontuação média geral</p>
            )}
          </div>

          <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Recorde
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              {bestScore}
              <span className="text-sm text-white/40">/100</span>
            </p>
            <p className="text-[10px] text-white/30 mt-1">melhor nota obtida</p>
          </div>

          <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Sequência
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              {streak}
              <span className="text-sm text-white/40"> dias</span>
            </p>
            <p className="text-[10px] text-white/30 mt-1">{totalMinutes} min. treinados</p>
          </div>
        </div>

        {/* Chart + Medals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart — 2/3 width */}
          <div className="lg:col-span-2 bg-[#09090d] rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Evolução das Notas (últimas {Math.min(15, totalSessions)} sessões)
            </h3>
            <ScoreChart evaluations={evaluations} />
          </div>

          {/* Professional achievement insignias — 1/3 width */}
          <div className="bg-[#09090d] rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Conquistas
              <span className="text-cyan-400 ml-1">
                {earnedMedals.length}/{medals.length}
              </span>
            </h3>

            <p className="text-[11px] leading-5 text-white/35">
              Insígnias oficiais do seu progresso. Selecione uma conquista desbloqueada para compartilhar.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {medals.map((medal) => (
                <button
                  type="button"
                  key={medal.id}
                  onClick={() => medal.earned && setSelectedMedal(medal)}
                  disabled={!medal.earned}
                  title={`${medal.label}: ${medal.description}`}
                  className={`group flex min-h-28 flex-col items-center justify-center rounded-2xl border p-2 transition-all ${
                    medal.earned
                      ? 'cursor-pointer border-white/10 bg-white/[0.035] hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]'
                      : 'cursor-not-allowed border-white/5 bg-white/[0.015] opacity-60'
                  }`}
                  style={!medal.earned ? { borderBottomColor: `${medal.accent}55` } : undefined}
                >
                  <AchievementBadge medal={medal} />
                  <span className="mt-2 line-clamp-2 text-center text-[9px] font-bold leading-3 text-white/55">
                    {medal.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Próximas conquistas
              </p>
              {medals
                .filter((m) => !m.earned)
                .slice(0, 3)
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2 text-[11px] text-white/45">
                    <AchievementBadge medal={m} compact />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-white/60">{m.label}</span>
                      <span className="leading-tight">{m.current}/{m.target} {m.unit}</span>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-400/55"
                          style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              {medals.filter((m) => !m.earned).length === 0 && (
                <p className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Todas as conquistas desbloqueadas
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedMedal && (
          <div
            className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={`Compartilhar conquista ${selectedMedal.label}`}
            onClick={() => setSelectedMedal(null)}
          >
            <div
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#061014] shadow-[0_30px_100px_rgba(0,0,0,.65)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedMedal(null)}
                aria-label="Fechar"
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/30 text-white/60 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative overflow-hidden p-7 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,231,255,.12),transparent_48%)]" />
                <div className="relative">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Insígnia oficial Speek It</p>
                  <div className="mx-auto mt-5 w-fit scale-125">
                    <AchievementBadge medal={selectedMedal} />
                  </div>
                  <h3 className="mt-7 text-2xl font-black text-white">{selectedMedal.label}</h3>
                  <p className="mt-2 text-sm font-bold" style={{ color: selectedMedal.accent }}>
                    {userName}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/45">{selectedMedal.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                    {[
                      ['Sessões', totalSessions],
                      ['Média', `${avgScore}/100`],
                      ['Recorde', `${bestScore}/100`],
                      ['Sequência', `${streak} dias`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">{label}</p>
                        <p className="mt-1 text-base font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-white/8 bg-black/20 p-4">
                <button
                  type="button"
                  onClick={() => shareAchievement(selectedMedal)}
                  disabled={isSharing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-[#021014] transition hover:bg-cyan-300 disabled:opacity-60"
                >
                  <Share2 className="h-4 w-4" />
                  {isSharing ? 'Preparando imagem...' : 'Compartilhar conquista em PNG'}
                </button>
                <p className="mt-2 text-center text-[10px] text-white/30">
                  PNG vertical 1200 × 1500, pronto para redes sociais.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance breakdown by metric */}
        <div className="bg-[#09090d] rounded-2xl p-6 border border-white/5 space-y-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            Médias por Métrica — todos os treinos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {metrics.map((metric) => {
              const avg = Math.round(
                evaluations.reduce((s, e) => s + e[metric.key], 0) / totalSessions
              );
              const best = Math.max(...evaluations.map((e) => e[metric.key]));
              const worst = Math.min(...evaluations.map((e) => e[metric.key]));
              return (
                <div key={metric.key} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className={`text-xs font-bold ${metric.text}`}>{metric.label}</span>
                    <div className="flex items-center gap-3 text-[10px] text-white/35">
                      <span>↓ {worst}</span>
                      <span className={`font-mono font-bold text-sm ${metric.text}`}>{avg}</span>
                      <span>↑ {best}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metric.bg} rounded-full transition-all`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most practiced texts */}
        {(() => {
          const textCounts: Record<string, { title: string; count: number; avgScore: number }> = {};
          for (const e of evaluations) {
            if (!textCounts[e.textId]) {
              textCounts[e.textId] = { title: e.textTitle, count: 0, avgScore: 0 };
            }
            textCounts[e.textId].count++;
            textCounts[e.textId].avgScore += e.score;
          }
          const top = Object.values(textCounts)
            .map((t) => ({ ...t, avgScore: Math.round(t.avgScore / t.count) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

          return (
            <div className="bg-[#09090d] rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">
                Roteiros Mais Praticados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {top.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/5"
                  >
                    <span className="text-xl font-black text-white/20 w-5 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">
                        {t.count}x praticado · média {t.avgScore}/100
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        t.avgScore >= 85
                          ? 'bg-green-500/10 text-green-400'
                          : t.avgScore >= 70
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {t.avgScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
