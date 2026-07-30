/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jwt from 'jsonwebtoken';

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') return 'speek_it_local_development_only';
  throw new Error('JWT_SECRET deve ser configurado em produção.');
}

export const JWT_SECRET = getJwtSecret();

// ─── Auth middleware ────────────────────────────────────────────────────────

export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não encontrado.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

export function adminOnly(req: any, res: any, next: any) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}
