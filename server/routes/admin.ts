/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { readEvals, readUsers } from '../db';
import { adminOnly, authMiddleware } from '../auth';

const router = Router();

// ─── Admin routes ───────────────────────────────────────────────────────────

router.get('/stats', authMiddleware, adminOnly, async (_req: any, res) => {
  const users = await readUsers();
  const evals = await readEvals();

  const userStats = users
    .filter(u => u.role !== 'admin')
    .map(u => {
      const ue = evals.filter(e => e.userId === u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        totalSessions: ue.length,
        avgScore: ue.length > 0 ? Math.round(ue.reduce((s, e) => s + e.score, 0) / ue.length) : 0,
        bestScore: ue.length > 0 ? Math.max(...ue.map(e => e.score)) : 0,
        totalMinutes: Math.round(ue.reduce((s, e) => s + e.duration, 0) / 60),
        lastActive: ue.length > 0 ? Math.max(...ue.map(e => e.createdAt)) : null,
      };
    })
    .sort((a, b) => b.totalSessions - a.totalSessions);

  return res.json({
    totalUsers: users.filter(u => u.role !== 'admin').length,
    totalSessions: evals.length,
    globalAvgScore: evals.length > 0
      ? Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length)
      : 0,
    userStats,
  });
});

export default router;
