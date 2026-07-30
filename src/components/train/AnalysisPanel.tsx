/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sparkles, Award, Volume2, CheckCircle2, RotateCcw, Camera,
} from 'lucide-react';
import { SpeechEvaluation } from '../../types';
import { formatTimer } from '../../lib/format';

interface AnalysisPanelProps {
  isAnalyzing: boolean;
  isRecording: boolean;
  audioLevels: number[];
  latestEvaluation: SpeechEvaluation | null;
  isPlayingAudio: boolean;
  onPlaySavedAudio: (audioBlobId?: string) => void;
  onResetTeleprompter: () => void;
  recordedVideoUrl: string | null;
}

export default function AnalysisPanel({
  isAnalyzing,
  isRecording,
  audioLevels,
  latestEvaluation,
  isPlayingAudio,
  onPlaySavedAudio,
  onResetTeleprompter,
  recordedVideoUrl,
}: AnalysisPanelProps) {
  return (
    <aside className="order-3 w-full lg:w-96 bg-[#061014]/90 border-t lg:border-t-0 lg:border-l border-white/[0.07] p-5 lg:p-6 flex flex-col overflow-y-auto max-h-none lg:max-h-[calc(100vh-4.5rem)] shrink-0 z-10">

      {isAnalyzing && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-wide">Gerando Relatório Vocal...</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Estamos processando sua dicção, ritmo e entonação. Aguarde um instante.
            </p>
          </div>
        </div>
      )}

      {!isAnalyzing && isRecording && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-6">
          {/* Microphone active wave lines */}
          <div className="h-16 flex items-end justify-center gap-1.5 px-6">
            {audioLevels.map((level, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full transition-all duration-75"
                style={{ height: `${level}%` }}
              ></div>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm tracking-widest uppercase">Captando Áudio</h4>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
              Fale claramente no microfone acompanhando a linha vermelha do teleprompter.
            </p>
          </div>
        </div>
      )}

      {!isAnalyzing && !isRecording && !latestEvaluation && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400">
            <Award className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Pronto para Analisar</h4>
            <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
              Toque no botão ciano de <strong className="text-white">microfone</strong> para gravar sua leitura. Ao finalizar, você receberá seu relatório vocal.
            </p>
          </div>
        </div>
      )}

      {/* Display Resulting Evaluation */}
      {!isAnalyzing && !isRecording && latestEvaluation && (
        <div className="space-y-6 animate-fade-in">

          {/* Performance Header */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 rounded-2xl p-5 border border-blue-500/15 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide">
              ANÁLISE DO TREINO
            </div>

            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Resultado do Treino</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black font-display text-white">{latestEvaluation.score}</span>
              <span className="text-xs text-white/50">/100 Geral</span>
            </div>

            {/* Progress representation */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${latestEvaluation.score}%` }}
              ></div>
            </div>
          </div>

          {/* Playback of user recording */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white/80">Sua Gravação ({formatTimer(latestEvaluation.duration)})</span>
            </div>
            <button
              onClick={() => onPlaySavedAudio(latestEvaluation.audioBlobId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {isPlayingAudio ? 'Tocando...' : 'Ouvir Áudio'}
            </button>
          </div>

          {/* Breakdown Metrics */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Métricas Detalhadas</h4>

            {/* Metrics 1: Dicção */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70 font-semibold uppercase">🎙️ Dicção</span>
                <span className="text-blue-400 font-mono font-bold">{latestEvaluation.diccaoScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${latestEvaluation.diccaoScore}%` }}></div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed pt-0.5">{latestEvaluation.diccaoFeedback}</p>
            </div>

            {/* Metrics 2: Ritmo */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70 font-semibold uppercase">🕒 Ritmo</span>
                <span className="text-emerald-400 font-mono font-bold">{latestEvaluation.ritmoScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${latestEvaluation.ritmoScore}%` }}></div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed pt-0.5">{latestEvaluation.ritmoFeedback}</p>
            </div>

            {/* Metrics 3: Entonação */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70 font-semibold uppercase">🎭 Entonação</span>
                <span className="text-purple-400 font-mono font-bold">{latestEvaluation.entonacaoScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${latestEvaluation.entonacaoScore}%` }}></div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed pt-0.5">{latestEvaluation.entonacaoFeedback}</p>
            </div>

            {/* Metrics 4: Pausas */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70 font-semibold uppercase">🧘 Pausas & Fluidez</span>
                <span className="text-indigo-400 font-mono font-bold">{latestEvaluation.pausasScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${latestEvaluation.pausasScore}%` }}></div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed pt-0.5">{latestEvaluation.pausasFeedback}</p>
            </div>
          </div>

          {/* Words to watch */}
          {latestEvaluation.mispronouncedWords && latestEvaluation.mispronouncedWords.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Palavras para Articular Melhor</h4>
              <div className="flex flex-wrap gap-1.5">
                {latestEvaluation.mispronouncedWords.map((word, i) => (
                  <span
                    key={i}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable recommendations */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Como Evoluir no Próximo Treino</h4>
            <ul className="space-y-2">
              {latestEvaluation.suggestions.map((sug, i) => (
                <li key={i} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Train Again Action */}
          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={onResetTeleprompter}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Treinar Novamente
            </button>

            {/* Download recorded video if available */}
            {recordedVideoUrl && (
              <a
                href={recordedVideoUrl}
                download={`speekit_video_${Date.now()}.webm`}
                className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Baixar Vídeo (.webm)
              </a>
            )}
          </div>

        </div>
      )}

    </aside>
  );
}
