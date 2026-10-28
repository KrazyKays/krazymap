export const ROUNDS_PER_GAME = 5;
export const DEPARTEMENT_ROUNDS = 10;
export const MAX_POINTS_PER_ROUND = 5000;
export const POINTS_DECAY_KM = 150;
export const TIME_LIMIT_SECONDS = 30;

/** Multiplicateur de points selon le nombre d'indices utilisés (0, 1 = région, 2 = département). */
export const HINT_MULTIPLIERS = [1, 0.7, 0.4] as const;
