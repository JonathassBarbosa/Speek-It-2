import express from 'express';
import authRoutes from '../server/routes/auth.js';
import adminRoutes from '../server/routes/admin.js';
import evaluationsRoutes from '../server/routes/evaluations.js';
import monitoringRoutes from '../server/routes/monitoring.js';
import { initDefaultAdmin } from '../server/db.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Health and client diagnostics must remain reachable even if admin
// initialization or the primary storage is degraded.
app.use('/api/monitoring', monitoringRoutes);

app.use(async (_req, _res, next) => {
  try {
    await initDefaultAdmin();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/evaluations', evaluationsRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'O serviço encontrou um erro interno.' });
});

export default app;
