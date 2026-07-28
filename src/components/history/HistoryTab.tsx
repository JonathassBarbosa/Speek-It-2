/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MouseEvent } from 'react';
import {
  Trash2, Award, Volume2, Download, CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';
import { TextTemplate, SpeechEvaluation } from '../../types';

interface HistoryTabProps {
  evaluations: SpeechEvaluation[];
  texts: TextTemplate[];
  selectedHistoryEval: SpeechEvaluation | null;
  onSelectHistoryEval: (evaluation: SpeechEvaluation) => void;
  onDeleteEval: (id: string, e: MouseEvent) => void;
  isPlayingAudio: boolean;
  onPlaySavedAudio: (audioBlobId?: string) => void;
  onSelectText: (text: TextTemplate) => void;
}

export default function HistoryTab({
  evaluations,
  texts,
  selectedHistoryEval,
  onSelectHistoryEval,
  onDeleteEval,
  isPlayingAudio,
  onPlaySavedAudio,
  onSelectText,
}: HistoryTabProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden w-full">

      {/* Left side: list of evaluations */}
      <aside className="w-full lg:w-80 bg-[#071014]/85 border-b lg:border-b-0 lg:border-r border-cyan-400/10 flex flex-col p-4 sm:p-5 space-y-4 shrink-0 lg:max-h-[calc(100vh-4.5rem)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Minhas Gravações</span>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            {evaluations.length} total
          </span>
        </div>

        <div className="flex lg:block gap-3 lg:space-y-2 max-h-56 lg:max-h-none overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 pr-1">
          {evaluations.map((evalObj) => (
            <div
              key={evalObj.id}
              onClick={() => onSelectHistoryEval(evalObj)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                selectedHistoryEval?.id === evalObj.id
                  ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-blue-500/40'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
              } min-w-[240px] lg:min-w-0`}
            >
              <div className="flex justify-between items-start gap-1">
                <p className="text-[10px] font-mono text-white/40">
                  {new Date(evalObj.createdAt).toLocaleDateString('pt-BR')}
                </p>

                <button
                  onClick={(e) => onDeleteEval(evalObj.id, e)}
                  className="w-8 h-8 -m-1.5 flex items-center justify-center text-gray-500 hover:text-red-400 rounded transition-colors"
                  title="Deletar este treino"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-white mt-1 truncate pr-4">
                {evalObj.textTitle}
              </h4>

              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-white/40">Duração: {evalObj.duration}s</span>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  evalObj.score >= 85 ? 'bg-green-500/10 text-green-400' :
                  evalObj.score >= 70 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  Nota: {evalObj.score}
                </span>
              </div>
            </div>
          ))}

          {evaluations.length === 0 && (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/5">
              <Award className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/50">Nenhum treino gravado ainda.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right side: Selected Evaluation Details */}
      <div className="flex-1 bg-[#030608] p-4 sm:p-6 md:p-10 overflow-y-auto lg:max-h-[calc(100vh-4.5rem)]">
        {selectedHistoryEval ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

            {/* Performance Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  RELATÓRIO DE DESEMPENHO VOCAL
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-white mt-3">
                  {selectedHistoryEval.textTitle}
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Realizado em {new Date(selectedHistoryEval.createdAt).toLocaleString('pt-BR')} • Treino de {selectedHistoryEval.duration} segundos
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#0a0a0e] p-4 rounded-2xl border border-white/5 self-start md:self-auto">
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Pontuação Geral</p>
                  <p className="text-4xl font-black font-display text-white mt-1">{selectedHistoryEval.score}<span className="text-xs text-white/40">/100</span></p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
                  {selectedHistoryEval.score >= 85 ? 'A' : selectedHistoryEval.score >= 70 ? 'B' : 'C'}
                </div>
              </div>
            </div>

            {/* Play audio clip and export button row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onPlaySavedAudio(selectedHistoryEval.audioBlobId)}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                {isPlayingAudio ? 'Reproduzindo...' : 'Escutar Gravação'}
              </button>

              <button
                onClick={() => {
                  const content = `RELATÓRIO DE ORATÓRIA - SPEEK-IT\n` +
                    `Texto: ${selectedHistoryEval.textTitle}\n` +
                    `Data: ${new Date(selectedHistoryEval.createdAt).toLocaleString('pt-BR')}\n` +
                    `Nota Geral: ${selectedHistoryEval.score}/100\n\n` +
                    `METRICAS:\n` +
                    `- Dicção: ${selectedHistoryEval.diccaoScore}/100\n  ${selectedHistoryEval.diccaoFeedback}\n` +
                    `- Ritmo: ${selectedHistoryEval.ritmoScore}/100\n  ${selectedHistoryEval.ritmoFeedback}\n` +
                    `- Entonação: ${selectedHistoryEval.entonacaoScore}/100\n  ${selectedHistoryEval.entonacaoFeedback}\n` +
                    `- Pausas: ${selectedHistoryEval.pausasScore}/100\n  ${selectedHistoryEval.pausasFeedback}\n\n` +
                    `PALAVRAS PARA MELHORAR:\n` +
                    `${selectedHistoryEval.mispronouncedWords.join(', ') || 'Nenhuma palavra destacada.'}\n\n` +
                    `SUGESTÕES:\n` +
                    `${selectedHistoryEval.suggestions.map((s, i) => `${i+1}. ${s}`).join('\n')}`;

                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Relatorio_SpeekIt_${selectedHistoryEval.textId}.txt`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório (.txt)
              </button>
            </div>

            {/* Detailed Analysis Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1: Dicção */}
              <div className="bg-[#09090d] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">🎙️ Dicção</span>
                  <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {selectedHistoryEval.diccaoScore}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedHistoryEval.diccaoScore}%` }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{selectedHistoryEval.diccaoFeedback}</p>
              </div>

              {/* Card 2: Ritmo */}
              <div className="bg-[#09090d] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">🕒 Ritmo de Fala</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedHistoryEval.ritmoScore}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedHistoryEval.ritmoScore}%` }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{selectedHistoryEval.ritmoFeedback}</p>
              </div>

              {/* Card 3: Entonação */}
              <div className="bg-[#09090d] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">🎭 Modulação & Entonação</span>
                  <span className="text-sm font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {selectedHistoryEval.entonacaoScore}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedHistoryEval.entonacaoScore}%` }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{selectedHistoryEval.entonacaoFeedback}</p>
              </div>

              {/* Card 4: Pausas */}
              <div className="bg-[#09090d] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">🧘 Pausas & Silêncios</span>
                  <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedHistoryEval.pausasScore}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedHistoryEval.pausasScore}%` }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{selectedHistoryEval.pausasFeedback}</p>
              </div>

            </div>

            {/* Suggestions list */}
            <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/10 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Recomendações Personalizadas
              </h3>
              <ul className="space-y-3">
                {selectedHistoryEval.suggestions.map((sug, i) => (
                  <li key={i} className="text-xs text-white/85 flex items-start gap-3 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Words of concern */}
            {selectedHistoryEval.mispronouncedWords && selectedHistoryEval.mispronouncedWords.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Palavras que merecem atenção na pronúncia</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHistoryEval.mispronouncedWords.map((word, i) => (
                    <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Button to reload this text and retrain */}
            <div className="pt-4">
              <button
                onClick={() => {
                  const targetText = texts.find(t => t.id === selectedHistoryEval.textId);
                  if (targetText) {
                    onSelectText(targetText);
                  } else {
                    // Create temporary text
                    onSelectText({
                      id: selectedHistoryEval.textId,
                      title: selectedHistoryEval.textTitle,
                      content: 'Texto não encontrado no banco de dados. Insira-o novamente se desejar.',
                      category: 'onboarding',
                      isFavorite: false,
                      isTrained: true,
                      estimatedDuration: 40,
                      createdAt: Date.now(),
                      isCustom: true
                    });
                  }
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                Carregar no Teleprompter e Treinar de Novo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
            <Award className="w-16 h-16 text-gray-700" />
            <h3 className="text-lg font-bold">Nenhum treino selecionado</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Escolha uma das leituras salvas na lista lateral para visualizar a análise completa e escutar a gravação.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
