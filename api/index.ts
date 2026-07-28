import express from 'express';
import authRoutes from '../server/routes/auth';
import adminRoutes from '../server/routes/admin';
import evaluationsRoutes from '../server/routes/evaluations';
import { initDefaultAdmin } from '../server/db';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

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
