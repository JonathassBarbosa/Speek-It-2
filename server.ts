/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vocalise_pro_dev_secret_2024_change_in_production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Data persistence ──────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVALS_FILE = path.join(DATA_DIR, 'evaluations.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: number;
}

interface DbEval {
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

function readUsers(): DbUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch { return []; }
}

function writeUsers(users: DbUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readEvals(): DbEval[] {
  try {
    if (!fs.existsSync(EVALS_FILE)) return [];
    return JSON.parse(fs.readFileSync(EVALS_FILE, 'utf-8'));
  } catch { return []; }
}

function writeEvals(evals: DbEval[]) {
  fs.writeFileSync(EVALS_FILE, JSON.stringify(evals, null, 2));
}

function initDefaultAdmin() {
  const users = readUsers();
  if (users.length === 0) {
    const adminUser: DbUser = {
      id: 'admin-001',
      email: 'admin@vocalise.com',
      name: 'Administrador',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      createdAt: Date.now(),
    };
    writeUsers([adminUser]);
    console.log('');
    console.log('  Admin padrão criado:');
    console.log('  Email: admin@vocalise.com');
    console.log('  Senha: admin123');
    console.log('  (Altere a senha após o primeiro acesso)');
    console.log('');
  }
}

// ─── Auth middleware ────────────────────────────────────────────────────────

function authMiddleware(req: any, res: any, next: any) {
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

function adminOnly(req: any, res: any, next: any) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}

// ─── Auth routes ────────────────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const users = readUsers();
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
  writeUsers(users);

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const users = readUsers();
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

app.get('/api/auth/me', authMiddleware, (req: any, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

// ─── Evaluations (server-side sync) ────────────────────────────────────────

app.post('/api/evaluations/sync', authMiddleware, (req: any, res) => {
  const { textId, textTitle, score, diccaoScore, ritmoScore, entonacaoScore, pausasScore, duration } = req.body;
  if (score === undefined || !textTitle) {
    return res.status(400).json({ error: 'Dados da avaliação incompletos.' });
  }

  const users = readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const evals = readEvals();
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
  writeEvals(evals);
  return res.json({ success: true, id: newEval.id });
});

// ─── Admin routes ───────────────────────────────────────────────────────────

app.get('/api/admin/stats', authMiddleware, adminOnly, (_req: any, res) => {
  const users = readUsers();
  const evals = readEvals();

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

// ─── Gemini AI evaluation ───────────────────────────────────────────────────

let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required.');
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return ai;
}

app.post('/api/evaluate', async (req, res) => {
  try {
    const { audio, mimeType, targetText, duration, textId, textTitle } = req.body;

    if (!audio) return res.status(400).json({ error: 'Nenhum áudio foi enviado para análise.' });
    if (!targetText) return res.status(400).json({ error: 'O texto original para comparação é obrigatório.' });

    let geminiClient;
    try {
      geminiClient = getGeminiClient();
    } catch (err: any) {
      console.log('Gemini key check:', err.message);
      return res.status(503).json({
        error: 'Erro de Configuração do Sistema',
        message: 'A chave de API do Gemini (GEMINI_API_KEY) não foi encontrada ou está incorreta.',
        details: err.message,
      });
    }

    console.log(`Analisando áudio com Gemini (tipo: ${mimeType}, tamanho: ${audio.length} chars)`);

    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Você é um avaliador e fonoaudiólogo especialista em oratória e comunicação de alta performance.
Analise a gravação de áudio em anexo, onde o usuário lê em voz alta o seguinte texto de referência:

"${targetText}"

Gere um relatório completo de oratória analisando os seguintes critérios:
1. Dicção (pronúncia correta, clareza das sílabas, detecção de termos mal pronunciados ou omitidos)
2. Ritmo (velocidade de fala, dinamismo, se está rápido demais, lento ou monótono)
3. Entonação (expressividade vocal, modulação da voz, prevenção de tons planos/robóticos)
4. Pausas (uso adequado de pausas naturais para respirar e enfatizar pontos chaves, fluidez geral)

Instruções críticas:
- Se o áudio estiver vazio, contiver apenas ruído estático, ou não contiver fala perceptível em português que se alinhe remotamente ao texto, atribua uma nota baixa e indique que a gravação não foi clara no feedback de Dicção.
- O feedback DEVE ser redigido em português amigável, direto, construtivo e profissional.
- Retorne obrigatoriamente um objeto JSON com o formato exato especificado no esquema.`,
            },
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audio,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Nota geral de 0 a 100.' },
            diccaoScore: { type: Type.INTEGER, description: 'Nota de dicção de 0 a 100.' },
            diccaoFeedback: { type: Type.STRING },
            ritmoScore: { type: Type.INTEGER, description: 'Nota de ritmo de 0 a 100.' },
            ritmoFeedback: { type: Type.STRING },
            entonacaoScore: { type: Type.INTEGER, description: 'Nota de entonação de 0 a 100.' },
            entonacaoFeedback: { type: Type.STRING },
            pausasScore: { type: Type.INTEGER, description: 'Nota de pausas de 0 a 100.' },
            pausasFeedback: { type: Type.STRING },
            mispronouncedWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'score', 'diccaoScore', 'diccaoFeedback',
            'ritmoScore', 'ritmoFeedback',
            'entonacaoScore', 'entonacaoFeedback',
            'pausasScore', 'pausasFeedback',
            'mispronouncedWords', 'suggestions',
          ],
        },
      },
    });

    if (!response.text) throw new Error('O modelo não retornou um resultado válido.');
    const report = JSON.parse(response.text.trim());
    return res.json(report);

  } catch (error: any) {
    const errString = error?.message || String(error);
    const isLeakedKey =
      errString.toLowerCase().includes('leaked') ||
      errString.toLowerCase().includes('leak') ||
      errString.includes('403') ||
      errString.includes('PERMISSION_DENIED') ||
      error?.status === 403;

    if (isLeakedKey) {
      return res.status(503).json({
        error: 'CONFIG_ERROR',
        message: 'Sua chave de API do Gemini foi reportada como vazada ou inválida.',
        details: errString,
      });
    }

    console.log('Erro no processamento de fala:', errString);
    return res.status(500).json({
      error: 'Falha na análise do áudio',
      message: error.message || 'Erro desconhecido durante o processamento.',
    });
  }
});

// ─── Vite / static serving ──────────────────────────────────────────────────

async function startServer() {
  initDefaultAdmin();

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
