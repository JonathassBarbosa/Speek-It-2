import { getStorageHealth } from './db.js';
import { isEmailDeliveryConfigured } from './email.js';

export type DiagnosticStatus = 'operational' | 'warning' | 'error';

export interface DiagnosticResult {
  id: string;
  label: string;
  category: 'backend' | 'data' | 'security' | 'integration';
  status: DiagnosticStatus;
  message: string;
  latencyMs?: number;
  checkedAt: string;
  canRun?: boolean;
  mayConsumeExternalUsage?: boolean;
}

const now = () => new Date().toISOString();

function coachUrl() {
  return process.env.VITE_COACH_API_URL?.trim() || process.env.VITE_N8N_API_URL?.trim() || '';
}

function configurationResult(
  id: string,
  label: string,
  category: DiagnosticResult['category'],
  configured: boolean,
  configuredMessage: string,
  missingMessage: string,
): DiagnosticResult {
  return {
    id,
    label,
    category,
    status: configured ? 'operational' : 'warning',
    message: configured ? configuredMessage : missingMessage,
    checkedAt: now(),
  };
}

export async function getDiagnosticsSnapshot(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [
    {
      id: 'api',
      label: 'API do Speek It',
      category: 'backend',
      status: 'operational',
      message: 'Servidor respondeu e a sessão administrativa foi validada.',
      checkedAt: now(),
    },
    configurationResult(
      'jwt',
      'Segurança da sessão',
      'security',
      Boolean(process.env.JWT_SECRET),
      'Chave de autenticação configurada.',
      process.env.NODE_ENV === 'production'
        ? 'JWT_SECRET não está configurado em produção.'
        : 'Usando a chave exclusiva do ambiente local.',
    ),
    configurationResult(
      'admin',
      'Conta administrativa',
      'security',
      Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
      'Credenciais administrativas configuradas no ambiente.',
      'ADMIN_EMAIL ou ADMIN_PASSWORD não configurado.',
    ),
    configurationResult(
      'email',
      'Recuperação por e-mail',
      'integration',
      isEmailDeliveryConfigured(),
      'Resend e remetente de recuperação configurados.',
      'Envio de códigos por e-mail não está configurado.',
    ),
    {
      ...configurationResult(
        'coach-config',
        'Coach IA — configuração',
        'integration',
        Boolean(coachUrl()),
        `Webhook configurado em ${safeHost(coachUrl())}.`,
        'URL do webhook do Coach não configurada.',
      ),
      canRun: Boolean(coachUrl()),
    },
    {
      id: 'coach-end-to-end',
      label: 'Coach IA — resposta completa',
      category: 'integration',
      status: coachUrl() ? 'warning' : 'error',
      message: coachUrl()
        ? 'Teste manual disponível. Ele envia uma mensagem real ao Coach.'
        : 'Configure o webhook antes de executar o teste completo.',
      checkedAt: now(),
      canRun: Boolean(coachUrl()),
      mayConsumeExternalUsage: true,
    },
  ];

  const startedAt = Date.now();
  try {
    const storage = await getStorageHealth();
    results.splice(1, 0, {
      id: 'storage',
      label: 'Banco de dados',
      category: 'data',
      status: process.env.VERCEL && storage.backend !== 'redis' ? 'warning' : 'operational',
      message: `${storage.backend === 'redis' ? 'Redis persistente' : 'Armazenamento local'} acessível · ${storage.users} usuários · ${storage.evaluations} avaliações.`,
      latencyMs: storage.latencyMs,
      checkedAt: now(),
      canRun: true,
    });
  } catch (error) {
    results.splice(1, 0, {
      id: 'storage',
      label: 'Banco de dados',
      category: 'data',
      status: 'error',
      message: error instanceof Error ? error.message : 'Não foi possível acessar os dados.',
      latencyMs: Date.now() - startedAt,
      checkedAt: now(),
      canRun: true,
    });
  }

  return results;
}

export async function runServerDiagnostic(id: string): Promise<DiagnosticResult> {
  if (id === 'storage') {
    const startedAt = Date.now();
    try {
      const storage = await getStorageHealth();
      return {
        id,
        label: 'Banco de dados',
        category: 'data',
        status: 'operational',
        message: `Leitura concluída no ${storage.backend === 'redis' ? 'Redis persistente' : 'armazenamento local'}.`,
        latencyMs: Date.now() - startedAt,
        checkedAt: now(),
        canRun: true,
      };
    } catch (error) {
      return failure(id, 'Banco de dados', 'data', error, Date.now() - startedAt);
    }
  }

  if (id === 'coach-config') return probeCoachConnectivity();
  if (id === 'coach-end-to-end') return runCoachEndToEnd();
  throw new Error('Diagnóstico não reconhecido.');
}

async function probeCoachConnectivity(): Promise<DiagnosticResult> {
  const url = coachUrl();
  if (!url) {
    return failure('coach-config', 'Coach IA — conectividade', 'integration', new Error('Webhook não configurado.'));
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal, redirect: 'follow' });
    return {
      id: 'coach-config',
      label: 'Coach IA — conectividade',
      category: 'integration',
      status: response.status >= 500 ? 'error' : 'operational',
      message: response.status >= 500
        ? `O servidor do Coach respondeu com erro ${response.status}.`
        : `Servidor do Coach alcançável em ${safeHost(url)} (HTTP ${response.status}).`,
      latencyMs: Date.now() - startedAt,
      checkedAt: now(),
      canRun: true,
    };
  } catch (error) {
    return failure('coach-config', 'Coach IA — conectividade', 'integration', error, Date.now() - startedAt);
  } finally {
    clearTimeout(timeout);
  }
}

async function runCoachEndToEnd(): Promise<DiagnosticResult> {
  const url = coachUrl();
  if (!url) {
    return failure('coach-end-to-end', 'Coach IA — resposta completa', 'integration', new Error('Webhook não configurado.'));
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const form = new FormData();
    form.append('action', 'chat');
    form.append('sessionId', `diagnostico-admin-${Date.now()}`);
    form.append('text', 'Teste técnico do painel administrativo. Responda somente: Coach operacional.');
    const response = await fetch(url, { method: 'POST', body: form, signal: controller.signal });
    const responseText = await response.text();
    if (!response.ok) throw new Error(`Webhook respondeu HTTP ${response.status}.`);
    if (!responseText.trim()) throw new Error('Webhook respondeu sem conteúdo.');

    let payload: { textResponse?: string; error?: string };
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error('Resposta do Coach não é um JSON válido.');
    }
    if (payload.error) throw new Error(payload.error);
    if (!payload.textResponse?.trim()) throw new Error('Coach não retornou resposta em texto.');

    return {
      id: 'coach-end-to-end',
      label: 'Coach IA — resposta completa',
      category: 'integration',
      status: 'operational',
      message: `Resposta válida recebida: “${payload.textResponse.trim().slice(0, 100)}”`,
      latencyMs: Date.now() - startedAt,
      checkedAt: now(),
      canRun: true,
      mayConsumeExternalUsage: true,
    };
  } catch (error) {
    return {
      ...failure('coach-end-to-end', 'Coach IA — resposta completa', 'integration', error, Date.now() - startedAt),
      canRun: true,
      mayConsumeExternalUsage: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function failure(
  id: string,
  label: string,
  category: DiagnosticResult['category'],
  error: unknown,
  latencyMs?: number,
): DiagnosticResult {
  const aborted = error instanceof Error && error.name === 'AbortError';
  return {
    id,
    label,
    category,
    status: 'error',
    message: aborted
      ? 'O teste excedeu o tempo máximo de resposta.'
      : error instanceof Error ? error.message : 'O teste falhou.',
    latencyMs,
    checkedAt: now(),
    canRun: true,
  };
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return 'endereço inválido';
  }
}
