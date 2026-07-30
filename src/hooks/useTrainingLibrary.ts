/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { TextTemplate, SpeechEvaluation } from '../types';
import {
  getTexts, saveText, deleteText,
  getEvaluations, saveEvaluation, deleteEvaluation,
  deleteAudio
} from '../lib/db';

// Owns the text bank + evaluation history data, and their IndexedDB persistence.
export function useTrainingLibrary() {
  const [texts, setTexts] = useState<TextTemplate[]>([]);
  const [evaluations, setEvaluations] = useState<SpeechEvaluation[]>([]);
  const [selectedText, setSelectedText] = useState<TextTemplate | null>(null);
  const [selectedHistoryEval, setSelectedHistoryEval] = useState<SpeechEvaluation | null>(null);

  // Fetch initial data from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const dbTexts = await getTexts();
        setTexts(dbTexts);

        const dbEvals = await getEvaluations();
        setEvaluations(dbEvals);

        if (dbTexts.length > 0) {
          setSelectedText(dbTexts[0]);
        }
      } catch (err) {
        console.error('Error loading data from database:', err);
      }
    }
    loadData();
  }, []);

  const refreshLibrary = async () => {
    const allTexts = await getTexts();
    setTexts(allTexts);
    const allEvals = await getEvaluations();
    setEvaluations(allEvals);
    return { texts: allTexts, evaluations: allEvals };
  };

  // Create or Update Custom Text
  const saveTextAndRefresh = async (newText: TextTemplate) => {
    await saveText(newText);
    const { texts: allTexts } = await refreshLibrary();

    // Select the newly added or updated text
    const saved = allTexts.find(t => t.id === newText.id);
    if (saved) {
      setSelectedText(saved);
    }
  };

  // Delete Text
  const deleteTextAndRefresh = async (id: string) => {
    await deleteText(id);
    const { texts: allTexts } = await refreshLibrary();
    if (selectedText?.id === id) {
      setSelectedText(allTexts[0] || null);
    }
  };

  // Delete Evaluation History
  const deleteEvaluationAndRefresh = async (id: string, onDeletedWasSelected?: () => void) => {
    if (confirm('Deseja excluir permanentemente este relatório do histórico?')) {
      const evalToDelete = evaluations.find(ev => ev.id === id);
      if (evalToDelete && evalToDelete.audioBlobId) {
        await deleteAudio(evalToDelete.audioBlobId);
      }
      await deleteEvaluation(id);
      const allEvals = await getEvaluations();
      setEvaluations(allEvals);

      if (selectedHistoryEval?.id === id) {
        setSelectedHistoryEval(allEvals[0] || null);
        onDeletedWasSelected?.();
      }
    }
  };

  return {
    texts, setTexts,
    evaluations, setEvaluations,
    selectedText, setSelectedText,
    selectedHistoryEval, setSelectedHistoryEval,
    refreshLibrary,
    saveTextAndRefresh,
    deleteTextAndRefresh,
    deleteEvaluationAndRefresh,
  };
}
