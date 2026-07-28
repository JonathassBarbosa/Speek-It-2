/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import { TextTemplate, SpeechEvaluation } from '../../types';
import ScriptSidebar from './ScriptSidebar';
import TeleprompterMonitor from './TeleprompterMonitor';
import AnalysisPanel from './AnalysisPanel';

type TextToken = { text: string; isWord: boolean; wordIdx: number | null };

interface TrainingTabProps {
  texts: TextTemplate[];
  selectedText: TextTemplate | null;
  onSelectText: (text: TextTemplate) => void;

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

  isAnalyzing: boolean;
  audioLevels: number[];
  latestEvaluation: SpeechEvaluation | null;
  isPlayingAudio: boolean;
  onPlaySavedAudio: (audioBlobId?: string) => void;
  recordedVideoUrl: string | null;
}

export default function TrainingTab({
  texts,
  selectedText,
  onSelectText,
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
  isAnalyzing,
  audioLevels,
  latestEvaluation,
  isPlayingAudio,
  onPlaySavedAudio,
  recordedVideoUrl,
}: TrainingTabProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden w-full">
      <ScriptSidebar texts={texts} selectedText={selectedText} onSelectText={onSelectText} />

      <TeleprompterMonitor
        selectedText={selectedText}
        textTokens={textTokens}
        spokenUpTo={spokenUpTo}
        wordElRefs={wordElRefs}
        teleprompterContainerRef={teleprompterContainerRef}
        fontSize={fontSize}
        setFontSize={setFontSize}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
        scrollProgress={scrollProgress}
        isPlaying={isPlaying}
        isRecording={isRecording}
        teleprompterTime={teleprompterTime}
        videoMode={videoMode}
        videoPreviewRef={videoPreviewRef}
        onToggleScroll={onToggleScroll}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onResetTeleprompter={onResetTeleprompter}
        onToggleVideoMode={onToggleVideoMode}
      />

      <AnalysisPanel
        isAnalyzing={isAnalyzing}
        isRecording={isRecording}
        audioLevels={audioLevels}
        latestEvaluation={latestEvaluation}
        isPlayingAudio={isPlayingAudio}
        onPlaySavedAudio={onPlaySavedAudio}
        onResetTeleprompter={onResetTeleprompter}
        recordedVideoUrl={recordedVideoUrl}
      />
    </div>
  );
}
