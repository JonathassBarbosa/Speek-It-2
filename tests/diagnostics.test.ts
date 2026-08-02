import assert from 'node:assert/strict';
import test from 'node:test';
import { getDiagnosticsSnapshot, runServerDiagnostic } from '../server/diagnostics.js';

test('painel retorna os diagnósticos essenciais sem expor segredos', async () => {
  const checks = await getDiagnosticsSnapshot();
  const ids = checks.map((check) => check.id);

  for (const id of ['api', 'storage', 'jwt', 'admin', 'email', 'coach-config', 'coach-end-to-end']) {
    assert.ok(ids.includes(id), `diagnóstico ${id} ausente`);
  }

  const serialized = JSON.stringify(checks);
  assert.equal(serialized.includes(process.env.JWT_SECRET || '__segredo_inexistente__'), false);
  assert.ok(checks.every((check) => Boolean(check.checkedAt)));
});

test('painel rejeita a execução de um diagnóstico desconhecido', async () => {
  await assert.rejects(() => runServerDiagnostic('inexistente'), /não reconhecido/i);
});
