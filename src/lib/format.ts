/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatTimer(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Highlight matching categories
export function getCategoryLabel(cat: string) {
  switch (cat) {
    case 'onboarding': return 'Onboarding';
    case 'vendas': return 'Vendas & Pitch';
    case 'motivacional': return 'Motivacional';
    case 'treino_rapido': return 'Treino Rápido';
    default: return 'Geral';
  }
}
