import { describe, expect, it } from 'vitest';
import { dailyStreak, emptyProfile, parseProfile } from './storage';

describe('parseProfile', () => {
  it('tolerates garbage', () => {
    expect(parseProfile(null)).toEqual(emptyProfile());
    expect(parseProfile({ gamesPlayed: 'abc', discovered: [1, 'lascaux'] }).discovered).toEqual(['lascaux']);
  });

  it('keeps valid values', () => {
    const profile = parseProfile({ gamesPlayed: 3, bestByMode: { classique: 12000 }, daily: { '2026-10-28': { score: 9000, emojis: '🟩' } } });
    expect(profile.gamesPlayed).toBe(3);
    expect(profile.bestByMode.classique).toBe(12000);
    expect(profile.daily['2026-10-28'].score).toBe(9000);
  });
});

describe('dailyStreak', () => {
  it('counts consecutive days up to today or yesterday', () => {
    const profile = emptyProfile();
    const record = { score: 1, emojis: '' };
    profile.daily = { '2026-10-25': record, '2026-10-26': record, '2026-10-27': record };
    expect(dailyStreak(profile, new Date(2026, 9, 28))).toBe(3);
    expect(dailyStreak(profile, new Date(2026, 9, 27))).toBe(3);
    expect(dailyStreak(profile, new Date(2026, 9, 30))).toBe(0);
  });
});
