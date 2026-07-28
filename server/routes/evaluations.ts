/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { DbEval, readEvals, readUsers, writeEvals } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

// ─── Evaluations (server-side sync) ────────────────────────────────────────

router.post('/sync', authMiddleware, async (req: any, res) => {
  const { textId, textTitle, score, diccaoScore, ritmoScore, entonacaoScore, pausasScore, duration } = req.body;
  if (score === undefined || !textTitle) {
    return res.status(400).json({ error: 'Dados da avaliação incompletos.' });
  }

  const users = await readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const evals = await readEvals();
  const newEval: DbEval = {
    id: 'seval-' + Date.now(),
    userId: req.userId,
    userEmail: user.email,
    userName: user.name,
    textId: textId || 'unknown',
    textTitle,
    score: Number(score),
    diccaoScore: Number(diccaoScore) || 0,
    ritmoScore: Number(ritmoScore) || 0,
    entonacaoScore: Number(entonacaoScore) || 0,
    pausasScore: Number(pausasScore) || 0,
    duration: Number(duration) || 0,
    createdAt: Date.now(),
  };

  evals.push(newEval);
  await writeEvals(evals);
  return res.json({ success: true, id: newEval.id });
});

export default router;
