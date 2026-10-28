import { ANECDOTES, CATEGORIES, type Anecdote, type Categorie } from '../data/anecdotes';
import { DEPARTEMENTS, departementAt, departementCenter, regionOf } from '../data/departements';
import type { LonLat } from '../geo/projection';
import { DEPARTEMENT_ROUNDS, MAX_POINTS_PER_ROUND, ROUNDS_PER_GAME, TIME_LIMIT_SECONDS } from './config';
import { dayKey, seededRandom } from './random';
import { pickRandom } from './rounds';

export type ModeId = 'classique' | 'jour' | 'chrono' | 'departements';

export interface ModeInfo {
  id: ModeId;
  emoji: string;
  title: string;
  description: string;
}

export const MODES: ModeInfo[] = [
  { id: 'classique', emoji: '🗺️', title: 'Classique', description: `${ROUNDS_PER_GAME} anecdotes, à votre rythme. Choisissez un thème.` },
  { id: 'jour', emoji: '📅', title: 'Défi du jour', description: 'Les mêmes 5 anecdotes pour tout le monde, une fois par jour.' },
  { id: 'chrono', emoji: '⏱️', title: 'Contre-la-montre', description: `${TIME_LIMIT_SECONDS} secondes par anecdote. Pas le temps d'hésiter !` },
  { id: 'departements', emoji: '🧩', title: 'Départements', description: `${DEPARTEMENT_ROUNDS} départements à retrouver sur une carte muette.` },
];

export interface Round {
  id: string;
  kicker: string;
  titre: string;
  texte: string;
  question: string;
  lieu: string;
  revelation: string;
  answer: LonLat;
  /** Département où se trouve la réponse. */
  departementCode: string;
  /** En mode Départements, toute la surface du département rapporte le maximum. */
  wholeDepartement: boolean;
  anecdoteId?: string;
}

export interface GameSetup {
  mode: ModeId;
  categorie?: Categorie;
  rounds: Round[];
  timeLimit: number | null;
  seedKey?: string;
  maxScore: number;
}

function anecdoteRound(anecdote: Anecdote): Round {
  const cat = CATEGORIES[anecdote.categorie];
  return {
    id: anecdote.id,
    kicker: `${cat.emoji} ${cat.label}`,
    titre: anecdote.titre,
    texte: anecdote.texte,
    question: 'Où se déroule cette anecdote ?',
    lieu: anecdote.lieu,
    revelation: anecdote.revelation,
    answer: { lat: anecdote.lat, lon: anecdote.lon },
    departementCode: departementAt(anecdote).code,
    wholeDepartement: false,
    anecdoteId: anecdote.id,
  };
}

export function anecdotesFor(categorie?: Categorie): Anecdote[] {
  return categorie ? ANECDOTES.filter((a) => a.categorie === categorie) : ANECDOTES;
}

export function buildGame(
  mode: ModeId,
  options: { categorie?: Categorie; date?: Date; random?: () => number } = {},
): GameSetup {
  const random = options.random ?? Math.random;
  switch (mode) {
    case 'jour': {
      const seedKey = dayKey(options.date);
      const rounds = pickRandom(ANECDOTES, ROUNDS_PER_GAME, seededRandom(`krazymap-${seedKey}`)).map(anecdoteRound);
      return { mode, rounds, timeLimit: null, seedKey, maxScore: rounds.length * MAX_POINTS_PER_ROUND };
    }
    case 'departements': {
      const rounds = pickRandom(DEPARTEMENTS, DEPARTEMENT_ROUNDS, random).map<Round>((dep) => ({
        id: `dep-${dep.code}`,
        kicker: '🧩 Département',
        titre: dep.nom,
        texte: 'Cliquez à l’intérieur du département pour marquer le maximum de points.',
        question: 'Où se trouve ce département ?',
        lieu: `${dep.nom} (${dep.code})`,
        revelation: `Le département n° ${dep.code} fait partie de la région ${regionOf(dep.code)}.`,
        answer: departementCenter(dep),
        departementCode: dep.code,
        wholeDepartement: true,
      }));
      return { mode, rounds, timeLimit: null, maxScore: rounds.length * MAX_POINTS_PER_ROUND };
    }
    case 'chrono':
    case 'classique': {
      const pool = anecdotesFor(mode === 'classique' ? options.categorie : undefined);
      const rounds = pickRandom(pool, ROUNDS_PER_GAME, random).map(anecdoteRound);
      return {
        mode,
        categorie: mode === 'classique' ? options.categorie : undefined,
        rounds,
        timeLimit: mode === 'chrono' ? TIME_LIMIT_SECONDS : null,
        maxScore: rounds.length * MAX_POINTS_PER_ROUND,
      };
    }
  }
}
