/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';
import { TextTemplate } from './types';
import { getAudio } from './lib/db';
import { useAuth } from './contexts/AuthContext';
import { useTrainingLibrary } from './hooks/useTrainingLibrary';
import { useTeleprompter } from './hooks/useTeleprompter';
import { useWordTracking } from './hooks/useWordTracking';
import { useVideoCreatorMode } from './hooks/useVideoCreatorMode';
import { useSpeechRecorder } from './hooks/useSpeechRecorder';
import { useSpeechEvaluation } from './hooks/useSpeechEvaluation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import AppNavbar, { ActiveTab } from './components/layout/AppNavbar';
import TrainingTab from './components/train/TrainingTab';
import TextBank from './components/TextBank';
import HistoryTab from './components/history/HistoryTab';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import AppIntro from './components/brand/AppIntro';
import BrandLockup from './components/brand/BrandLockup';

export default function App() {
  const [showBrandIntro, setShowBrandIntro] = useState(
    () => sessionStorage.getItem('speek-it-intro-seen') !== 'true',
  );

  const completeBrandIntro = useCallback(() => {
    sessionStorage.setItem('speek-it-intro-seen', 'true');
    setShowBrandIntro(false);
  }, []);

  // Auth
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  // App-level UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('train');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('speekit_theme') !== 'light';
  });
  const [isRecording, setIsRecording] = useState(false);

  // Feature hooks — wired together below, each owns one concern
  const library = useTrainingLibrary();
  const teleprompter = useTeleprompter();
  const videoCreator = useVideoCreatorMode();
  const wordTracking = useWordTracking(library.selectedText, isRecording, teleprompter.teleprompterContainerRef);

  const evaluation = useSpeechEvaluation({
    selectedText: library.selectedText,
    teleprompterTime: teleprompter.teleprompterTime,
    token,
    setTexts: library.setTexts,
    setEvaluations: library.setEvaluations,
    setSelectedHistoryEval: library.setSelectedHistoryEval,
  });

  // Reset teleprompter/evaluation/history state for a fresh take
  const handleRecordingStart = () => {
    teleprompter.startPlaybackFromZero();
    library.setSelectedHistoryEval(null);
    evaluation.setLatestEvaluation(null);
  };

  const recorder = useSpeechRecorder({
    isRecording,
    setIsRecording,
    normalizedTargetWords: wordTracking.normalizedTargetWords,
    spokenUpToRef: wordTracking.spokenUpToRef,
    setSpokenUpTo: wordTracking.setSpokenUpTo,
    setWordResult: wordTracking.setWordResult,
    resetWordTracking: wordTracking.resetTracking,
    onStart: handleRecordingStart,
    onStop: () => teleprompter.setIsPlaying(false),
    onAudioReady: (blob, transcript) => evaluation.evaluateSpeech(blob, transcript),
    startVideoRecording: videoCreator.startRecording,
    stopVideoRecording: videoCreator.stopRecording,
  });

  useKeyboardShortcuts({
    activeTab,
    isRecording,
    isPlaying: teleprompter.isPlaying,
    handleToggleScroll: teleprompter.handleToggleScroll,
    handleStartRecording: recorder.handleStartRecording,
    handleStopRecording: recorder.handleStopRecording,
    handleResetTeleprompter: teleprompter.handleResetTeleprompter,
  });

  // Apply and persist the user-selected theme.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    localStorage.setItem('speekit_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Quick action: Choose Text
  const handleSelectText = (text: TextTemplate) => {
    library.setSelectedText(text);
    teleprompter.handleResetTeleprompter();
    evaluation.setLatestEvaluation(null);
    library.setSelectedHistoryEval(null);
    // Switch to training tab automatically
    setActiveTab('train');
  };

  // Trigger Playback of Recorded Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySavedAudio = async (audioBlobId?: string) => {
    if (!audioBlobId) return;
    try {
      const blob = await getAudio(audioBlobId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = url;
          audioPlayerRef.current.play();
          setIsPlayingAudio(true);
        }
      } else {
        alert('O arquivo de áudio para esta gravação não foi encontrado.');
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  const handleDeleteEval = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    library.deleteEvaluationAndRefresh(id, () => evaluation.setLatestEvaluation(null));
  };

  const handleOpenHistory = () => {
    setActiveTab('history');
    library.setSelectedHistoryEval(library.evaluations[0] || null);
  };

  if (showBrandIntro) {
    return <AppIntro onComplete={completeBrandIntro} />;
  }

  // Auth loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → show login page
  if (!user) return <LoginPage />;

  // Admin dashboard overlay
  if (showAdmin && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#050507] text-[#e0e0e0] font-sans flex flex-col">
        <nav className="h-16 flex items-center justify-between px-6 md:px-12 bg-[#0a0a0e]/85 backdrop-blur-md border-b border-white/5 z-40 sticky top-0">
          <div className="flex items-center gap-3">
            <BrandLockup compact />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>{user.name}</span>
            <button onClick={logout} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all">
              Sair
            </button>
          </div>
        </nav>
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#030608] text-[#e9fbfd] font-sans overflow-hidden flex flex-col relative selection:bg-[#00E7FF]/25 selection:text-white">
      {/* Dynamic Glow Spots for Immersive Aesthetic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <AppNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHistory={handleOpenHistory}
        evaluationsCount={library.evaluations.length}
        isMicAllowed={recorder.isMicAllowed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userName={user.name}
        isAdmin={user.role === 'admin'}
        onShowAdmin={() => setShowAdmin(true)}
        onLogout={logout}
      />

      {/* Hidden audio element for speech playback */}
      <audio
        ref={audioPlayerRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* Main Content Area */}
      <main className="min-h-0 flex-1 flex overflow-hidden z-10 relative pb-[78px] lg:pb-0">

        {/* TAB 1: TRAINING & TELEPROMPTER */}
        {activeTab === 'train' && (
          <TrainingTab
            texts={library.texts}
            selectedText={library.selectedText}
            onSelectText={handleSelectText}
            textTokens={wordTracking.textTokens}
            spokenUpTo={wordTracking.spokenUpTo}
            wordResults={wordTracking.wordResults}
            wordElRefs={wordTracking.wordElRefs}
            teleprompterContainerRef={teleprompter.teleprompterContainerRef}
            fontSize={teleprompter.fontSize}
            setFontSize={teleprompter.setFontSize}
            scrollSpeed={teleprompter.scrollSpeed}
            setScrollSpeed={teleprompter.setScrollSpeed}
            scrollProgress={teleprompter.scrollProgress}
            isPlaying={teleprompter.isPlaying}
            isRecording={isRecording}
            teleprompterTime={teleprompter.teleprompterTime}
            videoMode={videoCreator.videoMode}
            videoPreviewRef={videoCreator.videoPreviewRef}
            onToggleScroll={teleprompter.handleToggleScroll}
            onStartRecording={recorder.handleStartRecording}
            onStopRecording={recorder.handleStopRecording}
            onResetTeleprompter={teleprompter.handleResetTeleprompter}
            onToggleVideoMode={videoCreator.toggleVideoMode}
            isAnalyzing={evaluation.isAnalyzing}
            audioLevels={recorder.audioLevels}
            latestEvaluation={evaluation.latestEvaluation}
            isPlayingAudio={isPlayingAudio}
            onPlaySavedAudio={handlePlaySavedAudio}
            recordedVideoUrl={videoCreator.recordedVideoUrl}
          />
        )}

        {/* TAB 2: INTERACTIVE AI VOCAL COACH */}
        {activeTab === 'coach' && (
          <div className="flex-1 grid place-items-center p-6">
            <div className="max-w-md rounded-3xl border border-[#00E7FF]/15 bg-[#071014]/90 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#00E7FF]/20 bg-[#00E7FF]/10 text-[#00E7FF]">
                <span className="text-2xl">✦</span>
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#00E7FF]/70">
                Em aprimoramento
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">Coach IA em standby</h2>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Estamos preparando uma experiência vocal mais natural e precisa. Enquanto isso, todos os recursos de treinamento continuam disponíveis.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('train')}
                className="mt-6 rounded-xl bg-[#00E7FF] px-5 py-3 text-xs font-bold text-[#021014] transition hover:brightness-110"
              >
                Voltar ao treinamento
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LIBRARY / PRESETS */}
        {activeTab === 'library' && (
          <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-4.5rem)]">
            <div className="max-w-7xl mx-auto">
              <TextBank
                texts={library.texts}
                onSelectText={handleSelectText}
                onSaveText={library.saveTextAndRefresh}
                onDeleteText={library.deleteTextAndRefresh}
              />
            </div>
          </div>
        )}

        {/* TAB 3: ANALYSIS HISTORY */}
        {activeTab === 'history' && (
          <HistoryTab
            evaluations={library.evaluations}
            texts={library.texts}
            selectedHistoryEval={library.selectedHistoryEval}
            onSelectHistoryEval={library.setSelectedHistoryEval}
            onDeleteEval={handleDeleteEval}
            isPlayingAudio={isPlayingAudio}
            onPlaySavedAudio={handlePlaySavedAudio}
            onSelectText={handleSelectText}
          />
        )}

        {/* TAB 4: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            evaluations={library.evaluations}
            userName={user.name}
            onGoTrain={() => setActiveTab('train')}
          />
        )}

      </main>

      {/* Keyboard shortcut hint bar — only on train tab */}
      {activeTab === 'train' && (
        <div className="hidden md:flex items-center justify-center gap-6 py-1.5 bg-[#050507] border-t border-white/5 z-40">
          <span className="text-[9px] text-white/15 font-mono">
            <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mr-1">SPACE</kbd>
            Play/Pause
          </span>
          <span className="text-[9px] text-white/15 font-mono">
            <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mr-1">R</kbd>
            Gravar
          </span>
          <span className="text-[9px] text-white/15 font-mono">
            <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mr-1">ESC</kbd>
            Parar / Reiniciar
          </span>
        </div>
      )}
    </div>
  );
}
