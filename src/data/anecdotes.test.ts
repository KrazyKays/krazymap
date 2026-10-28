import { describe, expect, it } from 'vitest';
import { MAP_VIEWBOX, project } from '../geo/projection';
import { ANECDOTES, CATEGORIES, type Categorie } from './anecdotes';
import { ROUNDS_PER_GAME } from '../game/config';

describe('ANECDOTES', () => {
  it('has enough entries for a full game', () => {
    expect(ANECDOTES.length).toBeGreaterThanOrEqual(100);
  });

  it('has enough entries in every theme for a full game', () => {
    for (const categorie of Object.keys(CATEGORIES) as Categorie[]) {
      expect(ANECDOTES.filter((a) => a.categorie === categorie).length, categorie).toBeGreaterThanOrEqual(ROUNDS_PER_GAME * 3);
    }
  });

  it('has unique ids', () => {
    const ids = ANECDOTES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has complete text fields', () => {
    for (const a of ANECDOTES) {
      expect(a.titre.trim(), a.id).not.toBe('');
      expect(a.texte.trim(), a.id).not.toBe('');
      expect(a.lieu.trim(), a.id).not.toBe('');
      expect(a.revelation.trim(), a.id).not.toBe('');
    }
  });

  it('places every anecdote inside the map', () => {
    for (const a of ANECDOTES) {
      const { x, y } = project(a);
      expect(x, a.id).toBeGreaterThanOrEqual(MAP_VIEWBOX.x);
      expect(x, a.id).toBeLessThanOrEqual(MAP_VIEWBOX.x + MAP_VIEWBOX.width);
      expect(y, a.id).toBeGreaterThanOrEqual(MAP_VIEWBOX.y);
      expect(y, a.id).toBeLessThanOrEqual(MAP_VIEWBOX.y + MAP_VIEWBOX.height);
    }
  });
});
