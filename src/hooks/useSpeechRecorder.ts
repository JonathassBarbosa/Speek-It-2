/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { normalizeWord } from '../lib/speechAnalysis';

interface UseSpeechRecorderParams {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  normalizedTargetWords: string[];
  spokenUpToRef: MutableRefObject<number>;
  setSpokenUpTo: (idx: number) => void;
  resetWordTracking: () => void;
  // Called synchronously right before a new take starts recording — resets
  // teleprompter position/timer, evaluation panel and history selection.
  onStart: () => void;
  // Called when the user stops recording — pauses the teleprompter scroll.
  onStop: () => void;
  // Called once the final audio blob is ready, to trigger speech evaluation.
  onAudioReady: (audioBlob: Blob, transcript: string) => void;
  startVideoRecording: (audioTracks: MediaStreamTrack[]) => void;
  stopVideoRecording: () => void;
}

// Owns microphone recording: MediaRecorder lifecycle, live Web Speech API
// transcription (for word-by-word teleprompter tracking), and the audio
// spectrum visualizer.
export function useSpeechRecorder({
  isRecording,
  setIsRecording,
  normalizedTargetWords,
  spokenUpToRef,
  setSpokenUpTo,
  resetWordTracking,
  onStart,
  onStop,
  onAudioReady,
  startVideoRecording,
  stopVideoRecording,
}: UseSpeechRecorderParams) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);
  const [realTranscript, setRealTranscript] = useState<string>('');

  // Refs for tracking active objects and recognition to prevent memory & execution leaks
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null); // dedicated audio-only stream, for cleanup

  // Audio Spectrum / Waveform UI State
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(16).fill(5));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Request Microphone permissions upfront — runs only once on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setIsMicAllowed(true))
      .catch(() => setIsMicAllowed(false));
  }, []);

  // Cleanup allocated URLs and recognition on unmount / recordedUrl change
  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Failed aborting speech recognition on unmount:', e);
        }
      }
    };
  }, [recordedUrl]);

  // Audio spectrum rendering logic
  const startMicVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      const updateSpectrum = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Map 32 bins to our 16 visual wave bars
        const nextLevels = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArrayRef.current[i * 2] || 0;
          // Scale 0-255 to a nice visual height (2 to 96%)
          const height = Math.max(5, Math.round((val / 255) * 100));
          nextLevels.push(height);
        }
        setAudioLevels(nextLevels);
        animationFrameRef.current = requestAnimationFrame(updateSpectrum);
      };

      updateSpectrum();
    } catch (e) {
      console.error('Error starting audio visualizer:', e);
    }
  };

  const stopMicVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setAudioLevels(Array(16).fill(5));
  };

  // Start Voice Recording & Auto-scroll together
  const handleStartRecording = async () => {
    try {
      // Always get a dedicated audio stream for analysis/recording
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = audioStream;
      setIsMicAllowed(true);

      // If Video Creator Mode is active, also start video recording
      startVideoRecording(audioStream.getAudioTracks());

      // Use audioStream (audio only) for the existing recorder + visualizer
      const stream = audioStream;

      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        // Fallback for standard browsers
        recorder = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });

        if (recordedUrl) {
          URL.revokeObjectURL(recordedUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);

        // Automatically request speech analysis
        onAudioReady(audioBlob, realTranscript);
      };

      // Reset Teleprompter positions, timer, transcription and word tracking
      onStart();
      setRealTranscript('');
      resetWordTracking();

      // Start Web Speech API Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'pt-BR';

          let fullText = '';
          rec.onresult = (event: any) => {
            let newFinal = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                newFinal += event.results[i][0].transcript + ' ';
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            fullText += newFinal;
            setRealTranscript(fullText + interim);

            // ── Word-by-word teleprompter tracking ────────────────────────
            if (newFinal.trim() && normalizedTargetWords.length > 0) {
              const spokenWords = newFinal.trim().split(/\s+/).map(normalizeWord).filter(Boolean);
              let pos = spokenUpToRef.current + 1;

              for (const spoken of spokenWords) {
                const searchEnd = Math.min(pos + 10, normalizedTargetWords.length);
                for (let j = pos; j < searchEnd; j++) {
                  const target = normalizedTargetWords[j];
                  // Accept if at least 3 chars match at start (handles contractions, etc.)
                  const matchLen = Math.min(3, Math.min(spoken.length, target.length));
                  if (
                    target === spoken ||
                    (matchLen >= 3 && target.startsWith(spoken.slice(0, matchLen))) ||
                    (matchLen >= 3 && spoken.startsWith(target.slice(0, matchLen)))
                  ) {
                    pos = j + 1;
                    spokenUpToRef.current = j;
                    setSpokenUpTo(j);
                    break;
                  }
                }
              }
            }
          };

          rec.onerror = (e: any) => {
            console.warn('Speech recognition warning or issue:', e);
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (recognitionErr) {
          console.warn('Speech recognition initialization failed:', recognitionErr);
        }
      }

      // Start all
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Start spectrum visualizer
      startMicVisualizer(stream);

    } catch (err) {
      console.error('Error starting microphone recording:', err);
      setIsMicAllowed(false);
      alert('Por favor, conceda permissão de microfone para poder gravar seu áudio de treino.');
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      // Stop all tracks in the audio recording stream to free the microphone
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    // Stop video recorder if active
    stopVideoRecording();

    // Clean up dedicated audio stream ref
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    // Stop Speech Recognition cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (recognitionErr) {
        console.warn('Error stopping speech recognition:', recognitionErr);
      }
    }

    setIsRecording(false);
    onStop();
    stopMicVisualizer();
  };

  return {
    isMicAllowed,
    realTranscript,
    audioLevels,
    handleStartRecording,
    handleStopRecording,
  };
}
