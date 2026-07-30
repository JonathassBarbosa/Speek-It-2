/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TextTemplate, SpeechEvaluation } from '../types';
import { saveAudio, saveEvaluation, saveText, getTexts, getEvaluations } from '../lib/db';
import { analyzeSpeechLocally } from '../lib/speechAnalysis';

interface UseSpeechEvaluationParams {
  selectedText: TextTemplate | null;
  teleprompterTime: number;
  token: string | null;
  setTexts: (texts: TextTemplate[]) => void;
  setEvaluations: (evals: SpeechEvaluation[]) => void;
  setSelectedHistoryEval: (ev: SpeechEvaluation | null) => void;
}

// Owns the speech evaluation workflow. Runs entirely locally — using the
// heuristic analyzer against the live transcript captured client-side via the
// Web Speech API — so no external AI API or key is required.
export function useSpeechEvaluation({
  selectedText,
  teleprompterTime,
  token,
  setTexts,
  setEvaluations,
  setSelectedHistoryEval,
}: UseSpeechEvaluationParams) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<SpeechEvaluation | null>(null);

  const evaluateSpeech = async (audioBlob: Blob, realTranscript: string) => {
    if (!selectedText) return;

    setIsAnalyzing(true);
    setLatestEvaluation(null);

    setTimeout(async () => {
      const localAnalysis = analyzeSpeechLocally(
        selectedText.content,
        realTranscript,
        teleprompterTime || selectedText.estimatedDuration
      );

      const completedEval: SpeechEvaluation = {
        id: 'eval-' + Date.now(),
        textId: selectedText.id,
        textTitle: selectedText.title,
        ...localAnalysis,
        duration: teleprompterTime || 25,
        createdAt: Date.now(),
        audioBlobId: 'audio-' + Date.now(),
      };

      await saveAudio(completedEval.audioBlobId!, audioBlob);
      await saveEvaluation(completedEval);

      // Update text trained status
      const updatedText = { ...selectedText, isTrained: true };
      await saveText(updatedText);

      // Sync lists
      const allTexts = await getTexts();
      setTexts(allTexts);
      const allEvals = await getEvaluations();
      setEvaluations(allEvals);

      setLatestEvaluation(completedEval);
      setSelectedHistoryEval(completedEval);
      setIsAnalyzing(false);

      // Sync to server if logged in (for admin tracking)
      if (token) {
        fetch('/api/evaluations/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            textId: completedEval.textId,
            textTitle: completedEval.textTitle,
            score: completedEval.score,
            diccaoScore: completedEval.diccaoScore,
            ritmoScore: completedEval.ritmoScore,
            entonacaoScore: completedEval.entonacaoScore,
            pausasScore: completedEval.pausasScore,
            duration: completedEval.duration,
          }),
        }).catch(() => {}); // silent — offline is fine
      }
    }, 1200);
  };

  return {
    isAnalyzing,
    latestEvaluation,
    setLatestEvaluation,
    evaluateSpeech,
  };
}
