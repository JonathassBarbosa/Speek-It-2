/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChartNoAxesCombined,
  History,
  LibraryBig,
  LogOut,
  Mic2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import BrandLockup from '../brand/BrandLockup';

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

interface NavigationItem {
  id: ActiveTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: 'train', label: 'Treinamento', mobileLabel: 'Treinar', icon: Mic2 },
  { id: 'coach', label: 'Coach IA', mobileLabel: 'Coach', icon: Sparkles },
  { id: 'library', label: 'Meus roteiros', mobileLabel: 'Roteiros', icon: LibraryBig },
  { id: 'history', label: 'Histórico', mobileLabel: 'Histórico', icon: History },
  { id: 'dashboard', label: 'Evolução', mobileLabel: 'Evolução', icon: ChartNoAxesCombined },
];

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
  const navigate = (item: NavigationItem) => {
    if (item.disabled) return;
    if (item.id === 'history') onOpenHistory();
    else onSelectTab(item.id);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-[72px] border-b border-white/[0.07] bg-[#05080b]/90 px-4 backdrop-blur-xl md:px-7 xl:px-10">
        <div className="mx-auto flex h-full max-w-[1680px] items-center justify-between gap-5">
          <BrandLockup compact />

          <nav
            className="hidden items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-1.5 lg:flex"
            aria-label="Navegação principal"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item)}
                  disabled={item.disabled}
                  title={item.disabled ? 'Coach IA em standby' : item.label}
                  className={`relative flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[11px] font-semibold transition-all xl:px-4 ${
                    selected
                      ? 'bg-[#00E7FF] text-[#021014] shadow-[0_0_24px_rgba(0,231,255,0.18)]'
                      : item.disabled
                        ? 'cursor-not-allowed text-white/25'
                        : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.disabled && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[7px] uppercase tracking-wider text-white/35">
                      Pausa
                    </span>
                  )}
                  {item.id === 'history' && evaluationsCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[8px] font-black text-black">
                      {evaluationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-2 xl:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  isMicAllowed ? 'bg-[#00E7FF] shadow-[0_0_8px_#00E7FF]' : 'bg-white/20'
                }`}
              />
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {isMicAllowed ? 'Microfone pronto' : 'Microfone aguardando'}
              </span>
            </div>

            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

            {isAdmin && (
              <button
                type="button"
                onClick={onShowAdmin}
                aria-label="Abrir administração"
                className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/[0.07] text-amber-300 transition hover:bg-amber-400/15"
              >
                <ShieldCheck className="h-4 w-4" />
              </button>
            )}

            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] py-1.5 pl-3 pr-1.5 md:flex">
              <span className="max-w-28 truncate text-[10px] font-medium text-white/50">{userName}</span>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sair"
                className="grid h-7 w-7 place-items-center rounded-lg text-white/35 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Sair"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-white/45 md:hidden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.35rem] border border-white/10 bg-[#071014]/95 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden"
        aria-label="Navegação móvel"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const selected = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => navigate(item)}
              className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-semibold transition ${
                selected
                  ? 'bg-[#00E7FF] text-[#021014]'
                  : item.disabled
                    ? 'text-white/20'
                    : 'text-white/45 active:bg-white/10'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.mobileLabel}</span>
              {item.disabled && <span className="absolute right-2 top-1 text-[6px] uppercase">Pausa</span>}
              {item.id === 'history' && evaluationsCount > 0 && (
                <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[8px] font-black text-black">
                  {evaluationsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
