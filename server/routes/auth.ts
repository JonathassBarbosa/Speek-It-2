/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomInt } from 'crypto';
import {
  createPasswordReset,
  DbUser,
  readUsers,
  updateUserPassword,
  verifyPasswordReset,
  writeUsers,
} from '../db.js';
import { authMiddleware, JWT_SECRET } from '../auth.js';
import { isEmailDeliveryConfigured, sendPasswordResetEmail } from '../email.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  const users = await readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Este email já está cadastrado.' });
  }

  const newUser: DbUser = {
    id: 'user-' + Date.now(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
    createdAt: Date.now(),
  };

  users.push(newUser);
  await writeUsers(users);

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const users = await readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.get('/me', authMiddleware, async (req: any, res) => {
  const users = await readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

const RESET_RESPONSE = {
  message: 'Se o e-mail estiver cadastrado, enviaremos um código de recuperação.',
};
const RESET_EXPIRATION_MINUTES = 10;

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase().slice(0, 254);
}

function hashResetCode(email: string, code: string) {
  return createHash('sha256')
    .update(`${email}:${code}:${JWT_SECRET}`)
    .digest('hex');
}

router.post('/password/forgot', async (req, res) => {
  if (!isEmailDeliveryConfigured()) {
    return res.status(503).json({
      error: 'A recuperação por e-mail está temporariamente indisponível.',
    });
  }

  const email = normalizeEmail(req.body?.email);
  if (!email || !email.includes('@')) return res.json(RESET_RESPONSE);

  const users = await readUsers();
  const user = users.find((item) => item.email === email);
  if (!user) return res.json(RESET_RESPONSE);

  const code = String(randomInt(100000, 1000000));
  const created = await createPasswordReset(
    email,
    hashResetCode(email, code),
    Date.now() + RESET_EXPIRATION_MINUTES * 60_000,
  );

  if (created) {
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        code,
        expiresInMinutes: RESET_EXPIRATION_MINUTES,
      });
    } catch (error) {
      console.error('[password-reset-email]', error);
    }
  }

  return res.json(RESET_RESPONSE);
});

router.post('/password/reset', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code ?? '').replace(/\D/g, '').slice(0, 6);
  const password = String(req.body?.password ?? '');

  if (!email || code.length !== 6 || password.length < 8) {
    return res.status(400).json({
      error: 'Informe o código de seis dígitos e uma senha com pelo menos oito caracteres.',
    });
  }

  const valid = await verifyPasswordReset(email, hashResetCode(email, code));
  if (!valid) {
    return res.status(400).json({
      error: 'Código inválido ou expirado. Solicite um novo código.',
    });
  }

  const updated = await updateUserPassword(email, bcrypt.hashSync(password, 12));
  if (!updated) {
    return res.status(400).json({ error: 'Não foi possível redefinir a senha.' });
  }

  return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
});

export default router;
