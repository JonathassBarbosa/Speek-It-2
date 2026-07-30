/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDefaultAdmin } from './server/db';
import authRoutes from './server/routes/auth';
import adminRoutes from './server/routes/admin';
import evaluationsRoutes from './server/routes/evaluations';
import monitoringRoutes from './server/routes/monitoring';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/monitoring', monitoringRoutes);

// ─── Vite / static serving ──────────────────────────────────────────────────

async function startServer() {
  await initDefaultAdmin();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Teleprompter Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
