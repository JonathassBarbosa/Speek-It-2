import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateNextScrollPosition } from '../src/hooks/useTeleprompter.js';

test('teleprompter avança de acordo com tempo e velocidade', () => {
  const next = calculateNextScrollPosition(100, 1_000, 50, 40);
  assert.equal(next, 102);
});

test('teleprompter não ultrapassa o final do roteiro', () => {
  const next = calculateNextScrollPosition(998, 1_000, 100, 40);
  assert.equal(next, 1_000);
});

test('teleprompter aguarda quando o navegador ainda não calculou a rolagem', () => {
  const next = calculateNextScrollPosition(0, 0, 16, 40);
  assert.equal(next, 0);
});

test('teleprompter limita intervalos longos para não saltar o texto', () => {
  const next = calculateNextScrollPosition(100, 1_000, 2_000, 40);
  assert.equal(next, 104);
});
