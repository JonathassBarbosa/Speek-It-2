/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

// Owns the "Video Creator Mode" camera preview and the combined audio+video
// MediaRecorder that runs alongside the main audio recording when active.
export function useVideoCreatorMode() {
  const [videoMode, setVideoMode] = useState(false);
  const [videoPreviewStream, setVideoPreviewStream] = useState<MediaStream | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);

  // Sync video preview element when stream is set
  useEffect(() => {
    if (videoPreviewRef.current && videoPreviewStream) {
      videoPreviewRef.current.srcObject = videoPreviewStream;
    }
  }, [videoPreviewStream]);

  // Toggle Video Creator Mode
  const toggleVideoMode = async () => {
    if (videoMode) {
      // Turn off: stop camera
      if (videoPreviewStream) {
        videoPreviewStream.getTracks().forEach((t) => t.stop());
        setVideoPreviewStream(null);
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
      }
      setVideoMode(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        setVideoPreviewStream(stream);
        setVideoMode(true);
      } catch {
        alert(
          'Não foi possível acessar a câmera. Verifique as permissões do navegador para este site.'
        );
      }
    }
  };

  // Start the combined audio+video recorder, if Video Creator Mode is active
  const startRecording = (audioTracks: MediaStreamTrack[]) => {
    if (!videoMode || !videoPreviewStream) return;

    const videoTracks = videoPreviewStream.getVideoTracks();
    const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);

    let vMime = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      vMime = 'video/webm;codecs=vp8,opus';
    }
    const videoChunks: Blob[] = [];
    const vRecorder = new MediaRecorder(combinedStream, { mimeType: vMime });
    vRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) videoChunks.push(e.data);
    };
    vRecorder.onstop = () => {
      const blob = new Blob(videoChunks, { type: vMime });
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(URL.createObjectURL(blob));
    };
    vRecorder.start(100);
    videoRecorderRef.current = vRecorder;
  };

  const stopRecording = () => {
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
      videoRecorderRef.current = null;
    }
  };

  return {
    videoMode,
    videoPreviewStream,
    recordedVideoUrl,
    videoPreviewRef,
    toggleVideoMode,
    startRecording,
    stopRecording,
  };
}
