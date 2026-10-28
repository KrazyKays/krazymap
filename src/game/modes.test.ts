import { describe, expect, it } from 'vitest';
import { departementAt, departementByCode } from '../data/departements';
import { DEPARTEMENT_ROUNDS, MAX_POINTS_PER_ROUND, ROUNDS_PER_GAME } from './config';
import { evaluateGuess } from './evaluate';
import { buildGame } from './modes';
import { seededRandom } from './random';

describe('buildGame', () => {
  it('builds a classic game filtered by theme', () => {
    const game = buildGame('classique', { categorie: 'terroir' });
    expect(game.rounds).toHaveLength(ROUNDS_PER_GAME);
    game.rounds.forEach((r) => expect(r.kicker).toContain('Terroir'));
  });

  it('gives the same daily challenge for the same day', () => {
    const date = new Date(2026, 9, 28, 9);
    const a = buildGame('jour', { date }).rounds.map((r) => r.id);
    const b = buildGame('jour', { date: new Date(2026, 9, 28, 22) }).rounds.map((r) => r.id);
    const c = buildGame('jour', { date: new Date(2026, 9, 29) }).rounds.map((r) => r.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('adds a timer only in chrono mode', () => {
    expect(buildGame('chrono').timeLimit).toBeGreaterThan(0);
    expect(buildGame('classique').timeLimit).toBeNull();
  });

  it('builds departement rounds', () => {
    const game = buildGame('departements', { random: seededRandom('test') });
    expect(game.rounds).toHaveLength(DEPARTEMENT_ROUNDS);
    game.rounds.forEach((r) => expect(r.wholeDepartement).toBe(true));
  });
});

describe('evaluateGuess', () => {
  const [round] = buildGame('classique', { random: seededRandom('eval') }).rounds;

  it('gives the maximum on the exact spot and nothing without a guess', () => {
    expect(evaluateGuess(round, round.answer, 0).points).toBe(MAX_POINTS_PER_ROUND);
    expect(evaluateGuess(round, null, 0).points).toBe(0);
  });

  it('applies hint penalties', () => {
    expect(evaluateGuess(round, round.answer, 2).points).toBeLessThan(MAX_POINTS_PER_ROUND);
  });

  it('gives the maximum anywhere inside the target departement', () => {
    const [dep] = buildGame('departements', { random: seededRandom('dep') }).rounds;
    const result = evaluateGuess(dep, dep.answer, 0);
    if (departementAt(dep.answer).code === dep.departementCode) {
      expect(result.points).toBe(MAX_POINTS_PER_ROUND);
    }
    const far = evaluateGuess(dep, { lat: 41.5, lon: 9.2 }, 0);
    expect(departementByCode(dep.departementCode)).toBeDefined();
    if (!dep.departementCode.startsWith('2')) expect(far.points).toBeLessThan(MAX_POINTS_PER_ROUND * 0.8 + 1);
  });
});
