const STORAGE_KEY = 'krazymap:v2';

export interface Stats {
  bestScore: number;
  gamesPlayed: number;
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Stats>;
      return {
        bestScore: Number(parsed.bestScore) || 0,
        gamesPlayed: Number(parsed.gamesPlayed) || 0,
      };
    }
  } catch {
    // Stockage indisponible (navigation privée, quota) : on repart à zéro.
  }
  return { bestScore: 0, gamesPlayed: 0 };
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Stockage indisponible : le score reste affiché pour la session.
  }
}
