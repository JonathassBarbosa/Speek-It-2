/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export type ActiveTab = 'train' | 'coach' | 'library' | 'history' | 'dashboard';

interface AppNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHistory: () => void;
  evaluationsCount: number;
  isMicAllowed: boolean | null;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  userName: string;
  isAdmin: boolean;
  onShowAdmin: () => void;
  onLogout: () => void;
}

export default function AppNavbar({
  activeTab,
  onSelectTab,
  onOpenHistory,
  evaluationsCount,
  isMicAllowed,
  darkMode,
  setDarkMode,
  userName,
  isAdmin,
  onShowAdmin,
  onLogout,
}: AppNavbarProps) {
  return (
    <>
      {/* Main Header / Navigation */}
      <nav className="h-20 flex items-center justify-between px-6 md:px-12 bg-[#0a0a0e]/85 backdrop-blur-md border-b border-white/5 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10">
            <span className="text-white font-black text-sm font-display tracking-wider">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm md:text-base font-display text-white">
              SPEEK<span className="text-blue-500">-IT</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest">SPEECH TELEPROMPTER</span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onSelectTab('train')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'train'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Treinamento & Leitura
          </button>
          <button
            onClick={() => onSelectTab('coach')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coach'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Coach IA
          </button>
          <button
            onClick={() => onSelectTab('library')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Meus Roteiros
          </button>
          <button
            onClick={onOpenHistory}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Histórico de Treinos
            {evaluationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#050507]">
                {evaluationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </div>

        {/* Right Corner Utility Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2.5 h-2.5 rounded-full ${isMicAllowed ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-mono text-white/70">
              {isMicAllowed ? 'MICROFONE: PRONTO' : 'MICROFONE: BLOQUEADO'}
            </span>
          </div>

          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

          {/* Compact icon-only Admin/Logout for mobile, where there's no room for labeled buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={onShowAdmin}
                title="Admin"
                className="w-9 h-9 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 rounded-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onLogout}
              title="Sair"
              className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* User info + logout */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onShowAdmin}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
              >
                Admin
              </button>
            )}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-mono text-white/60 max-w-[120px] truncate">{userName}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-bold rounded-lg transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex bg-[#08080c] border-b border-white/5 p-2 gap-1 justify-center z-30">
        <button
          onClick={() => onSelectTab('train')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
            activeTab === 'train' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400'
          }`}
        >
          Treino
        </button>
        <button
          onClick={() => onSelectTab('coach')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
            activeTab === 'coach' ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20' : 'text-gray-400'
          }`}
        >
          Coach IA
        </button>
        <button
          onClick={() => onSelectTab('library')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
            activeTab === 'library' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400'
          }`}
        >
          Roteiros
        </button>
        <button
          onClick={onOpenHistory}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
            activeTab === 'history' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400'
          }`}
        >
          Histórico ({evaluationsCount})
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400'
          }`}
        >
          Dashboard
        </button>
      </div>
    </>
  );
}
