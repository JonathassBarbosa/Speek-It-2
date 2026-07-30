/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  TrendingUp,
  Mic,
  RefreshCw,
  Award,
  ArrowLeft,
  Database,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

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

interface BackupSummary {
  id: string;
  createdAt: number;
  createdBy: string;
  schemaVersion: number;
  userCount: number;
  evaluationCount: number;
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
  const [backups, setBackups] = useState<BackupSummary[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);

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

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar backups.');
      const data = await res.json();
      setBackups(data.backups ?? []);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar os backups.');
    }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao criar o backup.');
      await fetchBackups();
    } catch (err: any) {
      setError(err.message || 'Não foi possível criar o backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreBackup = async (backup: BackupSummary) => {
    const date = new Date(backup.createdAt).toLocaleString('pt-BR');
    if (!window.confirm(`Restaurar o backup de ${date}? Um snapshot do estado atual será criado antes da restauração.`)) {
      return;
    }

    setBackupLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/backups/${encodeURIComponent(backup.id)}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao restaurar o backup.');
      await Promise.all([fetchBackups(), fetchStats()]);
    } catch (err: any) {
      setError(err.message || 'Não foi possível restaurar o backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchBackups()]);
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

            {/* Backups */}
            <section className="rounded-2xl border border-white/5 bg-[#09090d] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-[#00E7FF]/20 bg-[#00E7FF]/10 p-2.5">
                    <Database className="h-4 w-4 text-[#00E7FF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Backup e restauração</h3>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      Até 14 snapshots criptograficamente identificados no Redis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={createBackup}
                  disabled={backupLoading}
                  className="flex items-center gap-2 rounded-xl border border-[#00E7FF]/25 bg-[#00E7FF]/10 px-4 py-2 text-xs font-bold text-[#7DF5FF] transition-colors hover:bg-[#00E7FF]/15 disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {backupLoading ? 'Processando...' : 'Criar backup agora'}
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-white/30">
                  Nenhum backup criado. Gere o primeiro snapshot antes de liberar novos usuários.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {backups.slice(0, 5).map((backup) => (
                    <div key={backup.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {new Date(backup.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">
                          {backup.userCount} usuários · {backup.evaluationCount} avaliações
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => restoreBackup(backup)}
                        disabled={backupLoading}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

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
