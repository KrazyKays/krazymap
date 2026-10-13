// Fonctions utilitaires pour Krazy Map

// Génère un ID unique
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Formate un nombre avec des séparateurs de milliers
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Formate une durée en secondes en un string lisible
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Formate une distance en mètres
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else {
    return `${Math.round(meters)} m`;
  }
}

// Clamp une valeur entre un min et un max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Interpole linéairement entre deux valeurs
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Calcule la distance euclidienne entre deux points (simplifiée)
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Convertit des coordonnées géographiques en coordonnées écran (simplifié)
export function latLonToScreen(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  zoom: number
): { x: number; y: number } {
  const scale = Math.pow(2, zoom);
  const x = (lon - centerLon) * scale * 100;
  const y = (lat - centerLat) * scale * 100;
  return { x, y };
}

// Gère les erreurs de manière élégante
export class ErrorHandler {
  static handleError(error: Error, context: string = 'unknown'): void {
    console.error(`[${context}] Erreur:`, error.message);
    console.error('Stack:', error.stack);
    // Dans un vrai jeu, on pourrait afficher un message à l'utilisateur
  }
  
  static tryCatch<T>(fn: () => T, context: string, fallback: T): T {
    try {
      return fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallback;
    }
  }
}

// Stocke et récupère des données dans localStorage
export class StorageManager {
  static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de sauvegarder dans localStorage:', error);
    }
  }
  
  static load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.warn('Impossible de charger depuis localStorage:', error);
      return defaultValue;
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Impossible de supprimer depuis localStorage:', error);
    }
  }
}

// Statistiques du jeu
export interface GameStats {
  totalGames: number;
  wins: number;
  highScore: number;
  lastScore: number;
  lastDifficulty: string;
  totalTimePlayed: number;
}

export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  highScore: 0,
  lastScore: 0,
  lastDifficulty: 'moyen',
  totalTimePlayed: 0
};

// Gère les statistiques du jeu
export class StatsManager {
  static STORAGE_KEY = 'krazyMapStats';
  
  static getStats(): GameStats {
    return StorageManager.load<GameStats>(this.STORAGE_KEY, DEFAULT_STATS);
  }
  
  static updateStats(newStats: Partial<GameStats>): GameStats {
    const stats = this.getStats();
    const updated = { ...stats, ...newStats };
    StorageManager.save(this.STORAGE_KEY, updated);
    return updated;
  }
  
  static recordGame(difficulty: string, score: number, isWin: boolean, timePlayed: number): void {
    const stats = this.getStats();
    
    stats.totalGames++;
    stats.lastScore = score;
    stats.lastDifficulty = difficulty;
    stats.totalTimePlayed += timePlayed;
    
    if (isWin) {
      stats.wins++;
    }
    
    if (score > stats.highScore) {
      stats.highScore = score;
    }
    
    StorageManager.save(this.STORAGE_KEY, stats);
  }
}
