/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star } from 'lucide-react';
import { TextTemplate } from '../../types';
import { getCategoryLabel } from '../../lib/format';

interface ScriptSidebarProps {
  texts: TextTemplate[];
  selectedText: TextTemplate | null;
  onSelectText: (text: TextTemplate) => void;
}

export default function ScriptSidebar({ texts, selectedText, onSelectText }: ScriptSidebarProps) {
  return (
    <aside className="order-3 lg:order-1 w-full lg:w-80 bg-[#08080a]/70 border-r border-white/5 flex flex-col p-5 space-y-4 shrink-0 lg:max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Selecione o Roteiro</span>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
          {texts.length} disponíveis
        </span>
      </div>

      <div className="space-y-2 max-h-48 lg:max-h-none overflow-y-auto pr-1">
        {texts.map((text) => (
          <div
            key={text.id}
            onClick={() => onSelectText(text)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedText?.id === text.id
                ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-blue-500/40 shadow-md shadow-blue-500/5'
                : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start gap-1">
              <p className={`text-xs font-bold uppercase tracking-wide px-1.5 py-0.2 rounded ${
                text.category === 'treino_rapido' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/60'
              }`}>
                {text.category === 'treino_rapido' ? 'RÁPIDO' : getCategoryLabel(text.category)}
              </p>
              {text.isTrained && (
                <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
                  ✓ Treinado
                </span>
              )}
            </div>
            <p className={`text-sm font-semibold mt-1.5 truncate ${selectedText?.id === text.id ? 'text-white' : 'text-white/80'}`}>
              {text.title}
            </p>
            <div className="flex justify-between items-center mt-2 text-[10px] text-white/40">
              <span>Tempo estimado: ~{text.estimatedDuration}s</span>
              {text.isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="hidden lg:block mt-auto bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-2xl p-4 border border-white/5">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Dica do Fonoaudiólogo</span>
        <p className="text-xs text-white/70 leading-relaxed italic">
          "Articule bem as vogais. Manter a postura ereta e relaxar os ombros abre o diafragma e melhora a entonação."
        </p>
      </div>
    </aside>
  );
}
