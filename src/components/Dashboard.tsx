/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { SpeechEvaluation } from '../types';
import { Award, TrendingUp, Clock, Zap, Target, Mic, Trophy } from 'lucide-react';

interface Props {
  evaluations: SpeechEvaluation[];
  onGoTrain: () => void;
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
  icon: string;
  label: string;
  description: string;
  earned: boolean;
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
      icon: '🎯',
      label: 'Primeiro Treino',
      description: 'Complete sua primeira sessão',
      earned: total >= 1,
    },
    {
      id: 'five',
      icon: '🔥',
      label: '5 Treinos',
      description: 'Complete 5 sessões de treinamento',
      earned: total >= 5,
    },
    {
      id: 'ten',
      icon: '💎',
      label: '10 Treinos',
      description: 'Complete 10 sessões de treinamento',
      earned: total >= 10,
    },
    {
      id: 'twenty',
      icon: '🚀',
      label: '20 Treinos',
      description: 'Complete 20 sessões de treinamento',
      earned: total >= 20,
    },
    {
      id: 'score85',
      icon: '⭐',
      label: 'Nota 85+',
      description: 'Alcance 85 ou mais em uma análise',
      earned: bestScore >= 85,
    },
    {
      id: 'score90',
      icon: '🏆',
      label: 'Nota 90+',
      description: 'Alcance nota 90 ou mais em uma análise',
      earned: bestScore >= 90,
    },
    {
      id: 'diccao95',
      icon: '🎓',
      label: 'Mestre da Dicção',
      description: 'Alcance 95+ em dicção',
      earned: bestDiccao >= 95,
    },
    {
      id: 'ritmo90',
      icon: '🎵',
      label: 'Ritmo Perfeito',
      description: 'Alcance 90+ em ritmo de fala',
      earned: bestRitmo >= 90,
    },
    {
      id: 'streak3',
      icon: '⚡',
      label: 'Série de 3 Dias',
      description: 'Treine por 3 dias consecutivos',
      earned: streak >= 3,
    },
    {
      id: 'streak7',
      icon: '🌟',
      label: 'Semana Completa',
      description: 'Treine por 7 dias seguidos',
      earned: streak >= 7,
    },
    {
      id: 'time30',
      icon: '⏱️',
      label: '30 Minutos',
      description: 'Acumule 30 minutos de treino total',
      earned: totalSecs >= 1800,
    },
    {
      id: 'time60',
      icon: '🕐',
      label: '1 Hora',
      description: 'Acumule 1 hora de treino total',
      earned: totalSecs >= 3600,
    },
  ];
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

export default function Dashboard({ evaluations, onGoTrain }: Props) {
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

          {/* Medals — 1/3 width */}
          <div className="bg-[#09090d] rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Conquistas
              <span className="text-amber-400 ml-1">
                {earnedMedals.length}/{medals.length}
              </span>
            </h3>

            {/* Medal grid */}
            <div className="grid grid-cols-4 gap-2">
              {medals.map((medal) => (
                <div
                  key={medal.id}
                  title={`${medal.label}: ${medal.description}`}
                  className={`aspect-square flex items-center justify-center rounded-xl text-lg transition-all cursor-default ${
                    medal.earned
                      ? 'bg-white/10 border border-white/15 shadow-sm'
                      : 'bg-white/[0.03] border border-white/5 opacity-25 grayscale'
                  }`}
                >
                  {medal.icon}
                </div>
              ))}
            </div>

            {/* Next medal to earn */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Próximas conquistas
              </p>
              {medals
                .filter((m) => !m.earned)
                .slice(0, 3)
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-[11px] text-white/40">
                    <span className="text-base grayscale">{m.icon}</span>
                    <span className="leading-tight">{m.description}</span>
                  </div>
                ))}
              {medals.filter((m) => !m.earned).length === 0 && (
                <p className="text-[11px] text-emerald-400 font-bold">
                  🎉 Todas as conquistas desbloqueadas!
                </p>
              )}
            </div>
          </div>
        </div>

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
