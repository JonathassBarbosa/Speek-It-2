import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { after } from 'node:test';

const originalCwd = process.cwd();
const testDirectory = mkdtempSync(join(tmpdir(), 'speek-it-reset-'));
process.chdir(testDirectory);
delete process.env.VERCEL;
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const database = await import('../server/db.ts');

after(() => {
  process.chdir(originalCwd);
  rmSync(testDirectory, { recursive: true, force: true });
});

test('código de recuperação é armazenado e consumido uma única vez', async () => {
  await database.writeUsers([
    {
      id: 'user-test',
      email: 'pessoa@example.com',
      name: 'Pessoa',
      passwordHash: 'hash-antigo',
      role: 'user',
      createdAt: Date.now(),
    },
  ]);

  const created = await database.createPasswordReset(
    'pessoa@example.com',
    'codigo-correto',
    Date.now() + 60_000,
  );
  assert.equal(created, true);
  assert.equal(
    await database.verifyPasswordReset('pessoa@example.com', 'codigo-incorreto'),
    false,
  );
  assert.equal(
    await database.verifyPasswordReset('pessoa@example.com', 'codigo-correto'),
    true,
  );
  assert.equal(
    await database.verifyPasswordReset('pessoa@example.com', 'codigo-correto'),
    false,
  );
});

test('senha do usuário cadastrado pode ser atualizada', async () => {
  assert.equal(
    await database.updateUserPassword('pessoa@example.com', 'hash-novo'),
    true,
  );
  const users = await database.readUsers();
  assert.equal(users[0].passwordHash, 'hash-novo');
});
