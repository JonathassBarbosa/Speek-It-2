import { Router } from 'express';
import {
  getStorageHealth,
  readClientErrors,
  recordClientError,
} from '../db.js';
import { adminOnly, authMiddleware } from '../auth.js';
import { isEmailDeliveryConfigured } from '../email.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    const storage = await getStorageHealth();
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      status: 'ok',
      service: 'speek-it-api',
      timestamp: new Date().toISOString(),
      storage,
      services: {
        email: isEmailDeliveryConfigured() ? 'configured' : 'not-configured',
      },
    });
  } catch (error) {
    console.error('[health]', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      status: 'degraded',
      service: 'speek-it-api',
      timestamp: new Date().toISOString(),
    });
  }
});

router.post('/client-error', authMiddleware, async (req: any, res) => {
  const message = String(req.body?.message ?? '').trim().slice(0, 500);
  if (!message) {
    return res.status(400).json({ error: 'Mensagem de erro não informada.' });
  }

  const id = await recordClientError({
    userId: req.userId,
    message,
    stack: String(req.body?.stack ?? '').slice(0, 4000) || undefined,
    componentStack: String(req.body?.componentStack ?? '').slice(0, 4000) || undefined,
    path: String(req.body?.path ?? '').slice(0, 300) || undefined,
    userAgent: String(req.body?.userAgent ?? '').slice(0, 500) || undefined,
  });
  return res.status(202).json({ accepted: true, id });
});

router.get('/errors', authMiddleware, adminOnly, async (_req, res) => {
  const errors = await readClientErrors();
  return res.json({ errors });
});

export default router;
