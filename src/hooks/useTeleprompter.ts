/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

// Owns teleprompter scroll/timer state and the auto-scroll animation loop.
export function useTeleprompter() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(40); // 10 to 100
  const [fontSize, setFontSize] = useState(32); // 16px to 64px
  const [scrollProgress, setScrollProgress] = useState(0);
  const [teleprompterTime, setTeleprompterTime] = useState(0);

  // Scrolling & Timing Refs
  const teleprompterContainerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRequestRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number | null>(null);

  // Sync teleprompter scroll timer
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        setTeleprompterTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle auto-scrolling frame loop
  useEffect(() => {
    // Keeps scrolling at a constant pace during recording too — word-tracking
    // (see useWordTracking) nudges the position on top of this when speech
    // recognition is available, but the teleprompter must never sit still.
    if (!isPlaying || !teleprompterContainerRef.current) {
      if (autoScrollRequestRef.current) {
        cancelAnimationFrame(autoScrollRequestRef.current);
      }
      return;
    }

    const scrollContainer = teleprompterContainerRef.current;

    const scrollLoop = (timestamp: number) => {
      if (!lastScrollTimeRef.current) {
        lastScrollTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastScrollTimeRef.current;
      lastScrollTimeRef.current = timestamp;

      // scrollSpeed determines pixels scrolled per second
      // speed range: 10 to 100
      const pixelsPerSec = scrollSpeed;
      const step = (pixelsPerSec * elapsed) / 1000;

      scrollContainer.scrollTop += step;

      // Update progress bar
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (maxScroll > 0) {
        const percentage = Math.min(100, Math.round((scrollContainer.scrollTop / maxScroll) * 100));
        setScrollProgress(percentage);
      }

      // If we reached the end of the script, stop auto-scrolling automatically
      if (scrollContainer.scrollTop >= maxScroll) {
        setIsPlaying(false);
      } else {
        autoScrollRequestRef.current = requestAnimationFrame(scrollLoop);
      }
    };

    lastScrollTimeRef.current = null;
    autoScrollRequestRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (autoScrollRequestRef.current) {
        cancelAnimationFrame(autoScrollRequestRef.current);
      }
    };
  }, [isPlaying, scrollSpeed]);

  // Pause / Resume Scroll manually
  const handleToggleScroll = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset scroll and timer
  const handleResetTeleprompter = () => {
    setIsPlaying(false);
    if (teleprompterContainerRef.current) {
      teleprompterContainerRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    setTeleprompterTime(0);
  };

  // Reset position/timer to zero and start playing — used when a recording begins
  const startPlaybackFromZero = () => {
    if (teleprompterContainerRef.current) {
      teleprompterContainerRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    setTeleprompterTime(0);
    setIsPlaying(true);
  };

  return {
    isPlaying, setIsPlaying,
    scrollSpeed, setScrollSpeed,
    fontSize, setFontSize,
    scrollProgress, setScrollProgress,
    teleprompterTime, setTeleprompterTime,
    teleprompterContainerRef,
    handleToggleScroll,
    handleResetTeleprompter,
    startPlaybackFromZero,
  };
}
