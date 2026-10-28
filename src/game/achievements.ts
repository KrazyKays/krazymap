import { ANECDOTES } from '../data/anecdotes';
import type { RoundResult } from './evaluate';
import type { ModeId } from './modes';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'premiere', emoji: '🎒', title: 'Premier voyage', description: 'Terminer une partie.' },
  { id: 'mille', emoji: '🎯', title: 'Dans le mille', description: 'Placer un point à moins de 10 km d’une anecdote.' },
  { id: 'instinct', emoji: '🧭', title: 'À l’instinct', description: 'Marquer 60 % des points sans aucun indice.' },
  { id: 'sans-faute', emoji: '🌟', title: 'Sans faute', description: 'Réussir « Excellent » ou mieux à chaque manche.' },
  { id: 'eclair', emoji: '⚡', title: 'Éclair', description: 'Marquer 60 % des points en contre-la-montre.' },
  { id: 'quotidien', emoji: '📅', title: 'Rendez-vous quotidien', description: 'Terminer un défi du jour.' },
  { id: 'fidele', emoji: '🔥', title: 'Fidèle au poste', description: 'Terminer 7 défis du jour.' },
  { id: 'prefet', emoji: '🧩', title: 'Préfet', description: 'Trouver au moins 8 départements dans une partie.' },
  { id: 'explorateur', emoji: '🗺️', title: 'Explorateur', description: 'Découvrir 50 anecdotes différentes.' },
  { id: 'tour-de-france', emoji: '🚲', title: 'Tour de France', description: 'Découvrir toutes les anecdotes.' },
  { id: 'habitue', emoji: '🏅', title: 'Habitué', description: 'Jouer 20 parties.' },
];

export interface AchievementContext {
  mode: ModeId;
  results: RoundResult[];
  total: number;
  maxScore: number;
  gamesPlayed: number;
  dailyCount: number;
  discoveredCount: number;
}

const CHECKS: Record<string, (ctx: AchievementContext) => boolean> = {
  premiere: () => true,
  mille: (ctx) => ctx.results.some((r) => !r.round.wholeDepartement && r.distanceKm !== null && r.distanceKm < 10),
  instinct: (ctx) => ctx.results.every((r) => r.hintsUsed === 0) && ctx.total >= ctx.maxScore * 0.6,
  'sans-faute': (ctx) => ctx.results.every((r) => r.points >= 3500),
  eclair: (ctx) => ctx.mode === 'chrono' && ctx.total >= ctx.maxScore * 0.6,
  quotidien: (ctx) => ctx.dailyCount >= 1,
  fidele: (ctx) => ctx.dailyCount >= 7,
  prefet: (ctx) => ctx.mode === 'departements' && ctx.results.filter((r) => r.distanceKm === 0).length >= 8,
  explorateur: (ctx) => ctx.discoveredCount >= 50,
  'tour-de-france': (ctx) => ctx.discoveredCount >= ANECDOTES.length,
  habitue: (ctx) => ctx.gamesPlayed >= 20,
};

export function unlockedAchievements(ctx: AchievementContext, already: readonly string[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !already.includes(a.id) && CHECKS[a.id](ctx));
}
