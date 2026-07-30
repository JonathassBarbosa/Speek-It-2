/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface UseKeyboardShortcutsParams {
  activeTab: string;
  isRecording: boolean;
  isPlaying: boolean;
  handleToggleScroll: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleResetTeleprompter: () => void;
}

// Keyboard shortcuts: Space = play/pause, R = record, Esc = stop/reset
export function useKeyboardShortcuts({
  activeTab,
  isRecording,
  isPlaying,
  handleToggleScroll,
  handleStartRecording,
  handleStopRecording,
  handleResetTeleprompter,
}: UseKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;
      if (activeTab !== 'train') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRecording) handleToggleScroll();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        if (isRecording) handleStopRecording();
        else handleStartRecording();
      }
      if (e.code === 'Escape') {
        if (isRecording) handleStopRecording();
        else handleResetTeleprompter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isRecording, isPlaying]);
}
