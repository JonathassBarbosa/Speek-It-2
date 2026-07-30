import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSpeechLocally, normalizeWord } from '../src/lib/speechAnalysis';

test('normalizeWord remove acentos e pontuação para comparar a fala', () => {
  assert.equal(normalizeWord('Comunicação!'), 'comunicacao');
  assert.equal(normalizeWord('PT-BR'), 'ptbr');
});

test('análise reconhece uma leitura integral do roteiro', () => {
  const result = analyzeSpeechLocally(
    'A comunicação clara transforma boas ideias em resultados.',
    'A comunicação clara transforma boas ideias em resultados',
    8,
  );

  assert.equal(result.diccaoScore, 100);
  assert.deepEqual(result.mispronouncedWords, []);
  assert.ok(result.score >= 75 && result.score <= 100);
});

test('análise identifica palavras relevantes ausentes', () => {
  const result = analyzeSpeechLocally(
    'Confiança clareza presença resultado',
    'Confiança e clareza',
    6,
  );

  assert.ok(result.diccaoScore < 100);
  assert.ok(result.mispronouncedWords.includes('presença'));
  assert.ok(result.mispronouncedWords.includes('resultado'));
});
