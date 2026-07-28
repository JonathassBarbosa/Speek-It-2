/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// ─── Data persistence ──────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVALS_FILE = path.join(DATA_DIR, 'evaluations.json');
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const USERS_KEY = 'speek-it:users';
const EVALS_KEY = 'speek-it:evaluations';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface DbEval {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  textId: string;
  textTitle: string;
  score: number;
  diccaoScore: number;
  ritmoScore: number;
  entonacaoScore: number;
  pausasScore: number;
  duration: number;
  createdAt: number;
}

async function redisCommand(command: string[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis de produção não configurado.');
  }
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Falha no Redis (${response.status}).`);
  const payload = await response.json() as { result?: unknown; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

async function readCollection<T>(key: string, file: string): Promise<T[]> {
  if (REDIS_URL && REDIS_TOKEN) {
    const result = await redisCommand(['GET', key]);
    return typeof result === 'string' ? JSON.parse(result) : [];
  }
  if (process.env.VERCEL) {
    throw new Error('Configure o Redis persistente antes de usar a API em produção.');
  }
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch { return []; }
}

async function writeCollection<T>(key: string, file: string, values: T[]) {
  if (REDIS_URL && REDIS_TOKEN) {
    await redisCommand(['SET', key, JSON.stringify(values)]);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error('Configure o Redis persistente antes de usar a API em produção.');
  }
  fs.writeFileSync(file, JSON.stringify(values, null, 2));
}

export function readUsers(): Promise<DbUser[]> {
  return readCollection<DbUser>(USERS_KEY, USERS_FILE);
}

export function writeUsers(users: DbUser[]): Promise<void> {
  return writeCollection(USERS_KEY, USERS_FILE, users);
}

export function readEvals(): Promise<DbEval[]> {
  return readCollection<DbEval>(EVALS_KEY, EVALS_FILE);
}

export function writeEvals(evals: DbEval[]): Promise<void> {
  return writeCollection(EVALS_KEY, EVALS_FILE, evals);
}

export async function initDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const users = await readUsers();
  if (!users.some((user) => user.role === 'admin')) {
    const adminUser: DbUser = {
      id: 'admin-001',
      email: adminEmail,
      name: 'Administrador',
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: 'admin',
      createdAt: Date.now(),
    };
    await writeUsers([...users, adminUser]);
    console.log('Administrador inicial criado a partir das variáveis de ambiente.');
  }
}
