/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, TrendingUp, Mic, Clock, RefreshCw, Award, ArrowLeft } from 'lucide-react';

interface UserStat {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  totalMinutes: number;
  lastActive: number | null;
}

interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  globalAvgScore: number;
  userStats: UserStat[];
}

interface Props {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: Props) {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar dados administrativos.');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [lastRefresh]);

  const formatDate = (ts: number | null) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050507]" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                Painel Administrativo
              </p>
            </div>
            <h2 className="text-2xl font-bold text-white">Visão Geral dos Usuários</h2>
          </div>
          <button
            onClick={() => setLastRefresh(Date.now())}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Usuários</span>
                </div>
                <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                <p className="text-[10px] text-white/30 mt-1">cadastrados</p>
              </div>

              <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Treinos</span>
                </div>
                <p className="text-3xl font-black text-white">{stats.totalSessions}</p>
                <p className="text-[10px] text-white/30 mt-1">sessões totais</p>
              </div>

              <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Média Global</span>
                </div>
                <p className="text-3xl font-black text-white">
                  {stats.globalAvgScore}
                  <span className="text-sm text-white/40">/100</span>
                </p>
                <p className="text-[10px] text-white/30 mt-1">pontuação geral</p>
              </div>

              <div className="bg-[#09090d] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Engajamento</span>
                </div>
                <p className="text-3xl font-black text-white">
                  {stats.totalUsers > 0
                    ? (stats.totalSessions / stats.totalUsers).toFixed(1)
                    : '0'}
                </p>
                <p className="text-[10px] text-white/30 mt-1">treinos / usuário</p>
              </div>
            </div>

            {/* Users table */}
            <div className="bg-[#09090d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <Users className="w-4 h-4 text-white/40" />
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">
                  Ranking de Usuários
                </h3>
              </div>

              {stats.userStats.length === 0 ? (
                <div className="py-16 text-center text-white/30 text-sm">
                  Nenhum usuário cadastrado ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-white/30 px-5 py-3">#</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Usuário</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Treinos</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Média</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Recorde</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Minutos</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-3">Último acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.userStats.map((u, i) => (
                        <tr
                          key={u.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-white/20 text-xs font-mono">{i + 1}</td>
                          <td className="px-3 py-3.5">
                            <div>
                              <p className="text-sm font-semibold text-white">{u.name}</p>
                              <p className="text-[11px] text-white/35 mt-0.5">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="text-sm font-bold text-white">{u.totalSessions}</span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            {u.totalSessions > 0 ? (
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreColor(u.avgScore)}`}>
                                {u.avgScore}
                              </span>
                            ) : (
                              <span className="text-white/20 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            {u.bestScore > 0 ? (
                              <span className="text-xs font-mono font-bold text-amber-400">{u.bestScore}</span>
                            ) : (
                              <span className="text-white/20 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="text-xs text-white/50">{u.totalMinutes}min</span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="text-xs text-white/40 font-mono">{formatDate(u.lastActive)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
