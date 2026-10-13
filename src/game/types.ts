// Types et interfaces pour le jeu Krazy Map

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GameState {
  id: string;
  startedAt: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  startCity: string;
  targetCity: string;
  playerPosition: Coordinates;
  targetPosition: Coordinates;
  energy: number;
  maxEnergy: number;
  distanceTraveled: number;
  totalDistance: number;
  exploredAreas: ExploredArea[];
  events: GameEvent[];
  discoveredEvents: Set<string>;
  score: number;
  timeElapsed: number;
  isWin: boolean;
  isGameOver: boolean;
  currentMinigame: MinigameType | null;
}

export interface ExploredArea {
  id: string;
  center: Coordinates;
  radius: number; // en mètres
  discoveredAt: number;
}

export type EventType = 
  | 'quiz'
  | 'orientation'
  | 'observation'
  | 'navigation'
  | 'ravitaillement'
  | 'revelation';

export interface GameEvent {
  id: string;
  type: EventType;
  position: Coordinates;
  radius: number; // Zone de déclenchement en mètres
  discovered: boolean;
  triggered: boolean;
  data?: any; // Données spécifiques à l'événement
}

// Type pour les mini-jeux (sans circular dependency)
export interface MinigameType {
  id: string;
  type: EventType;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  reward: number; // Récompense en énergie ou score
  penalty: number; // Pénalité si échec
}

export interface MinigameResult {
  success: boolean;
  reward: number;
  timeTaken?: number;
}

export interface GameConfig {
  initialEnergy: number;
  energyPerKm: number;
  fogRadius: number; // Rayon de brouillard en mètres
  explorationRadius: number; // Rayon de révélation en mètres
  eventRadius: number; // Rayon de déclenchement des événements
  difficultySettings: {
    facile: DifficultySettings;
    moyen: DifficultySettings;
    difficile: DifficultySettings;
  };
}

export interface DifficultySettings {
  minDistance: number; // Distance minimale en km
  maxDistance: number; // Distance maximale en km
  energyMultiplier: number;
  eventFrequency: number; // 0-1, fréquence des événements
  eventCount: number; // Nombre d'événements à générer
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

// Configuration par défaut du jeu
export const DEFAULT_CONFIG: GameConfig = {
  initialEnergy: 100,
  energyPerKm: 5,
  fogRadius: 50000, // 50 km
  explorationRadius: 2000, // 2 km
  eventRadius: 1000, // 1 km
  difficultySettings: {
    facile: {
      minDistance: 100,
      maxDistance: 300,
      energyMultiplier: 1.0,
      eventFrequency: 0.5,
      eventCount: 3,
    },
    moyen: {
      minDistance: 200,
      maxDistance: 500,
      energyMultiplier: 1.5,
      eventFrequency: 0.7,
      eventCount: 5,
    },
    difficile: {
      minDistance: 400,
      maxDistance: 800,
      energyMultiplier: 2.0,
      eventFrequency: 0.9,
      eventCount: 8,
    },
  },
};

// Bounds de la France métropolitaine (approximatifs)
export const FRANCE_BOUNDS: MapBounds = {
  minLat: 41.3,
  maxLat: 51.2,
  minLon: -5.2,
  maxLon: 9.6,
};
