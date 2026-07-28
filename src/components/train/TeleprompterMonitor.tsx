/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import {
  Play, Pause, RotateCcw, Mic, Square, FileText, Video, VideoOff,
} from 'lucide-react';
import { TextTemplate } from '../../types';
import { formatTimer } from '../../lib/format';

type TextToken = { text: string; isWord: boolean; wordIdx: number | null };

interface TeleprompterMonitorProps {
  selectedText: TextTemplate | null;
  textTokens: TextToken[];
  spokenUpTo: number;
  wordElRefs: MutableRefObject<Map<number, HTMLSpanElement>>;
  teleprompterContainerRef: RefObject<HTMLDivElement>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  scrollSpeed: number;
  setScrollSpeed: (speed: number) => void;
  scrollProgress: number;
  isPlaying: boolean;
  isRecording: boolean;
  teleprompterTime: number;
  videoMode: boolean;
  videoPreviewRef: RefObject<HTMLVideoElement>;
  onToggleScroll: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetTeleprompter: () => void;
  onToggleVideoMode: () => void;
}

export default function TeleprompterMonitor({
  selectedText,
  textTokens,
  spokenUpTo,
  wordElRefs,
  teleprompterContainerRef,
  fontSize,
  setFontSize,
  scrollSpeed,
  setScrollSpeed,
  scrollProgress,
  isPlaying,
  isRecording,
  teleprompterTime,
  videoMode,
  videoPreviewRef,
  onToggleScroll,
  onStartRecording,
  onStopRecording,
  onResetTeleprompter,
  onToggleVideoMode,
}: TeleprompterMonitorProps) {
  return (
    <section className="order-2 flex-1 flex flex-col bg-[#030608] lg:border-r border-white/[0.07] relative min-h-[560px] lg:min-h-0">

      {selectedText ? (
        <>
          {/* Top Guide banner */}
          <div className="min-h-12 bg-[#071014] border-b border-white/[0.07] flex items-center justify-between gap-3 px-4 sm:px-6 py-2 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#00E7FF]"></span>
              <span className="text-xs font-semibold text-white/90 truncate max-w-xs md:max-w-md">
                {selectedText.title}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span>Palavras: <strong className="text-white">{selectedText.content.split(/\s+/).length}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Tempo ideal: <strong className="text-white">{selectedText.estimatedDuration}s</strong></span>
            </div>
          </div>

          {/* Webcam overlay for Video Creator Mode */}
          {videoMode && (
            <div className="absolute top-4 right-4 z-30 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/60"
              style={{ width: 160, height: 120 }}>
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[9px] font-bold text-white/80 bg-black/40 px-1 rounded">
                  {isRecording ? 'REC' : 'CAM'}
                </span>
              </div>
            </div>
          )}

          {/* Highlight Eye Marker / Spotlight Guideline */}
          <div className="absolute top-1/2 left-0 right-0 h-16 border-y border-red-500/15 bg-red-500/[0.02] -translate-y-1/2 pointer-events-none z-20 flex items-center justify-between px-4">
            <span className="text-[10px] text-red-500/50 font-mono tracking-widest uppercase hidden md:inline">➔ LINHA DE FOCO</span>
            <span className="text-[10px] text-red-500/50 font-mono tracking-widest uppercase hidden md:inline">➔ LINHA DE FOCO</span>
          </div>

          {/* Teleprompter Text Display Container */}
          <div
            ref={teleprompterContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 xl:px-16 py-14 sm:py-20 md:py-28 space-y-6 scroll-smooth select-none relative"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Generous Padding top/bottom to allow scrolling past text end */}
            <div className="max-w-3xl mx-auto py-4 md:py-12 transition-all duration-300">
              <p
                className="font-bold leading-relaxed tracking-wide text-center select-none"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
              >
                {textTokens.map((token, i) => {
                  if (!token.isWord) {
                    return <span key={i}>{token.text}</span>;
                  }
                  const wIdx = token.wordIdx!;
                  const isSpoken = wIdx < spokenUpTo;
                  const isCurrent = wIdx === spokenUpTo;
                  return (
                    <span
                      key={i}
                      ref={el => {
                        if (el) wordElRefs.current.set(wIdx, el);
                        else wordElRefs.current.delete(wIdx);
                      }}
                      className={`transition-colors duration-100 rounded-sm ${
                        isCurrent
                          ? 'bg-blue-400/20 text-white shadow-[0_0_16px_rgba(0,231,255,0.08)]'
                          : isSpoken
                          ? 'text-white/30'
                          : 'text-[#f3f4f6]'
                      }`}
                    >
                      {token.text}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Progress Glow Bar */}
          <div className="h-1 w-full bg-white/5 relative z-20">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>

          {/* Dashboard controls footer */}
          <footer className="bg-[#071014] border-t border-white/[0.07] flex flex-col xl:flex-row items-center justify-between p-4 md:px-6 gap-4 z-30">

            {/* Size and speed controllers */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 w-full md:w-auto">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Velocidade da Rolagem</span>
                  <span className="text-[10px] font-mono text-blue-400">{scrollSpeed} px/s</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">-</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                    className="w-24 sm:w-28 md:w-36 accent-blue-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                  <span className="text-xs text-white/30">+</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Tamanho da Fonte</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setFontSize(prev => Math.max(18, prev - 4))}
                    className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded border border-white/10 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(prev => Math.min(64, prev + 4))}
                    className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded border border-white/10 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Speech Recorder Action Station */}
            <div className="flex items-center gap-4 py-1 md:py-2">
              {/* Play / Pause scroll without recording */}
              <button
                onClick={onToggleScroll}
                disabled={isRecording}
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  isRecording
                    ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5 text-white/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white active:scale-95'
                }`}
                title={isPlaying ? 'Pausar leitura' : 'Iniciar rolagem'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* Giant Central RECORD & TRAIN button */}
              {isRecording ? (
                <button
                  onClick={onStopRecording}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)] border-4 border-white/10 active:scale-95 transition-all cursor-pointer group"
                  title="Finalizar gravação e analisar"
                >
                  <Square className="w-5 h-5 fill-white text-white group-hover:scale-105 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onStartRecording}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00E7FF] shadow-[0_0_28px_rgba(0,231,255,0.3)] border-4 border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer text-[#021014]"
                  title="Gravar áudio e iniciar teleprompter"
                >
                  <Mic className="w-6 h-6" />
                </button>
              )}

              {/* Reset position button */}
              <button
                onClick={onResetTeleprompter}
                className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white active:scale-95 transition-all cursor-pointer"
                title="Reiniciar posição do texto"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Video toggle + Timer/Status share one row on mobile to save vertical space;
                md:contents unwraps this group at desktop so both revert to independent footer columns */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:contents">
              {/* Video Creator Mode Toggle */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onToggleVideoMode}
                  disabled={isRecording}
                  title={videoMode ? 'Desativar modo vídeo' : 'Ativar modo vídeo creator (câmera)'}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRecording
                      ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5 text-white/40'
                      : videoMode
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'
                  }`}
                >
                  {videoMode ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span className="hidden xl:inline text-[10px]">
                    {videoMode ? 'Câmera ON' : 'Modo Vídeo'}
                  </span>
                </button>
              </div>

              {/* Timer & Status Monitor */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Tempo Decorrido</p>
                  <p className="text-lg font-mono text-white mt-0.5">{formatTimer(teleprompterTime)}</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Status</p>
                  {isRecording ? (
                    <span className="text-xs text-red-500 font-black mt-1 uppercase flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> GRAVANDO
                    </span>
                  ) : isPlaying ? (
                    <span className="text-xs text-blue-400 font-bold mt-1 uppercase flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span> LENDO
                    </span>
                  ) : (
                    <span className="text-xs text-white/40 font-semibold mt-1 uppercase flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-white/20"></span> PRONTO
                    </span>
                  )}
                </div>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <FileText className="w-16 h-16 text-gray-700" />
          <h3 className="text-lg font-bold">Nenhum texto selecionado</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Navegue pela aba de biblioteca ou use a barra lateral para escolher um texto para iniciar seu treino.
          </p>
        </div>
      )}
    </section>
  );
}
