/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextTemplate } from '../types';
import { normalizeWord } from '../lib/speechAnalysis';

// Tokenizes the selected script and tracks which word has been spoken so far,
// auto-scrolling the teleprompter to keep the current word in view while recording.
export function useWordTracking(
  selectedText: TextTemplate | null,
  isRecording: boolean,
  teleprompterContainerRef: RefObject<HTMLDivElement>
) {
  const [spokenUpTo, setSpokenUpTo] = useState(-1);
  const spokenUpToRef = useRef(-1);
  const wordElRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Tokenize the selected text into words and non-words
  const textTokens = useMemo(() => {
    if (!selectedText) return [] as { text: string; isWord: boolean; wordIdx: number | null }[];
    const segs = selectedText.content.match(/\w+|[^\w]+/g) || [];
    let wIdx = 0;
    return segs.map(seg => {
      const isWord = /\w+/.test(seg);
      return { text: seg, isWord, wordIdx: isWord ? wIdx++ : null };
    });
  }, [selectedText?.id]);

  const normalizedTargetWords = useMemo(
    () => textTokens.filter(t => t.isWord).map(t => normalizeWord(t.text)),
    [textTokens]
  );

  const resetTracking = useCallback(() => {
    setSpokenUpTo(-1);
    spokenUpToRef.current = -1;
    wordElRefs.current.clear();
  }, []);

  // Reset word position when text changes
  useEffect(() => {
    resetTracking();
  }, [selectedText?.id]);

  // Scroll to a word element inside the teleprompter container
  const scrollToWordEl = useCallback((wordIdx: number) => {
    const el = wordElRefs.current.get(wordIdx);
    const container = teleprompterContainerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    // Place word at ~38% from top of container
    const offset = container.scrollTop + (eRect.top - cRect.top) - cRect.height * 0.38;
    container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }, []);

  // Auto-scroll to current word whenever it advances
  useEffect(() => {
    if (spokenUpTo >= 0 && isRecording) {
      scrollToWordEl(spokenUpTo);
    }
  }, [spokenUpTo]);

  return {
    textTokens,
    normalizedTargetWords,
    spokenUpTo,
    setSpokenUpTo,
    spokenUpToRef,
    wordElRefs,
    resetTracking,
  };
}
