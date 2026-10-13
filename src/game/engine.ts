// Moteur principal du jeu Krazy Map
import type { 
  GameState, GameEvent, MinigameType as Minigame, MinigameResult, 
  Coordinates, ExploredArea, EventType, GameConfig 
} from './types';
import { 
  DEFAULT_CONFIG, 
  FRANCE_BOUNDS 
} from './types';
import { generateId } from '../utils/helpers';

// Générateur de nombres aléatoires avec seed pour la reproductibilité
export class SeededRandom {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
  }
  
  random(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
  
  range(min: number, max: number): number {
    return min + (max - min) * this.random();
  }
  
  pick<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }
  
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Générateur d'événements aléatoires
export class EventGenerator {
  private random: SeededRandom;
  private config: GameConfig;
  
  constructor(seed?: number, config: GameConfig = DEFAULT_CONFIG) {
    this.random = new SeededRandom(seed);
    this.config = config;
  }
  
  private generatePointBetween(start: Coordinates, end: Coordinates, spread: number = 0.3): Coordinates {
    const lat = start.lat + (end.lat - start.lat) * this.random.range(0, 1);
    const lon = start.lon + (end.lon - start.lon) * this.random.range(0, 1);
    const latSpread = (end.lat - start.lat) * spread * this.random.range(-0.5, 0.5);
    const lonSpread = (end.lon - start.lon) * spread * this.random.range(-0.5, 0.5);
    return {
      lat: Math.max(FRANCE_BOUNDS.minLat, Math.min(FRANCE_BOUNDS.maxLat, lat + latSpread)),
      lon: Math.max(FRANCE_BOUNDS.minLon, Math.min(FRANCE_BOUNDS.maxLon, lon + lonSpread))
    };
  }
  
  private generateRandomEvent(position: Coordinates): GameEvent {
    const types: EventType[] = ['quiz', 'orientation', 'observation', 'navigation', 'ravitaillement', 'revelation'];
    const specialTypes: EventType[] = ['ravitaillement', 'revelation'];
    const isSpecial = this.random.random() < 0.2;
    const finalType = isSpecial ? this.random.pick(specialTypes) : this.random.pick(types);
    return {
      id: generateId(),
      type: finalType,
      position,
      radius: this.config.eventRadius,
      discovered: false,
      triggered: false,
      data: this.generateEventData(finalType)
    };
  }
  
  private generateEventData(type: EventType): any {
    switch (type) {
      case 'quiz':
        return this.generateQuizData();
      case 'orientation':
        return this.generateOrientationData();
      case 'observation':
        return this.generateObservationData();
      case 'navigation':
        return this.generateNavigationData();
      case 'ravitaillement':
        return { energyAmount: this.random.range(20, 50) };
      case 'revelation':
        return { revealRadius: this.random.range(5000, 15000) };
      default:
        return {};
    }
  }
  
  private generateQuizData(): any {
    const cities = this.random.shuffle([
      { name: 'Paris', region: 'Île-de-France' },
      { name: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur' },
      { name: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
      { name: 'Toulouse', region: 'Occitanie' },
      { name: 'Nice', region: 'Provence-Alpes-Côte d\'Azur' },
      { name: 'Nantes', region: 'Pays de la Loire' },
      { name: 'Montpellier', region: 'Occitanie' },
      { name: 'Strasbourg', region: 'Grand Est' }
    ]).slice(0, 4);
    const correctCity = this.random.pick(cities);
    const questions = [
      `Quelle est la ville la plus au nord parmi ces propositions ?`,
      `Quelle est la ville la plus à l'est parmi ces propositions ?`,
      `Quelle ville est située dans la région ${correctCity.region} ?`,
      `Quelle est la capitale de la région ${correctCity.region} ?`,
      `Laquelle de ces villes est la plus peuplée ?`,
    ];
    const question = this.random.pick(questions);
    const options = cities.map(c => c.name);
    const correctAnswer = correctCity.name;
    return { question, options, correctAnswer };
  }
  
  private generateOrientationData(): any {
    const directions = ['Nord', 'Sud', 'Est', 'Ouest'];
    const correctDirection = this.random.pick(directions);
    const options = this.random.shuffle([...directions]);
    return { question: `Dans quelle direction se trouve Paris depuis ici ?`, options, correctAnswer: correctDirection };
  }
  
  private generateObservationData(): any {
    const colors = ['Rouge', 'Bleu', 'Vert', 'Jaune'];
    const shapes = ['Cercle', 'Carré', 'Triangle', 'Étoile'];
    const correctColor = this.random.pick(colors);
    const correctShape = this.random.pick(shapes);
    return { question: `Quelle couleur a la forme sur la carte ?`, correctAnswer: correctColor, shape: correctShape };
  }
  
  private generateNavigationData(): any {
    const distance = this.random.range(50, 200);
    const direction = this.random.pick(['Nord', 'Sud', 'Est', 'Ouest']);
    return {
      question: `Combien de kilomètres devez-vous parcourir vers le ${direction} ?`,
      correctAnswer: Math.round(distance),
      actualDistance: distance
    };
  }
  
  generateEvents(start: Coordinates, end: Coordinates, difficulty: 'facile' | 'moyen' | 'difficile', count?: number): GameEvent[] {
    const settings = this.config.difficultySettings[difficulty];
    const eventCount = count || settings.eventCount;
    const events: GameEvent[] = [];
    for (let i = 0; i < eventCount; i++) {
      events.push(this.generateRandomEvent(this.generatePointBetween(start, end, 0.5)));
    }
    for (let i = 0; i < Math.floor(eventCount * 0.5); i++) {
      const position = {
        lat: this.random.range(FRANCE_BOUNDS.minLat, FRANCE_BOUNDS.maxLat),
        lon: this.random.range(FRANCE_BOUNDS.minLon, FRANCE_BOUNDS.maxLon)
      };
      events.push(this.generateRandomEvent(position));
    }
    return events;
  }
}

const frenchCitiesList = [
  { id: 'paris', name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { id: 'marseille', name: 'Marseille', lat: 43.2965, lon: 5.3698 },
  { id: 'lyon', name: 'Lyon', lat: 45.7640, lon: 4.8357 },
  { id: 'toulouse', name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
  { id: 'nice', name: 'Nice', lat: 43.7102, lon: 7.2620 },
  { id: 'nantes', name: 'Nantes', lat: 47.2184, lon: -1.5536 },
  { id: 'montpellier', name: 'Montpellier', lat: 43.6109, lon: 3.8772 },
  { id: 'strasbourg', name: 'Strasbourg', lat: 48.5734, lon: 7.7521 },
  { id: 'bordeaux', name: 'Bordeaux', lat: 44.8378, lon: -0.5792 },
  { id: 'lille', name: 'Lille', lat: 50.6292, lon: 3.0573 },
  { id: 'rennes', name: 'Rennes', lat: 48.0986, lon: -1.6828 },
  { id: 'reims', name: 'Reims', lat: 49.2583, lon: 4.0317 },
  { id: 'le-havre', name: 'Le Havre', lat: 49.4939, lon: 0.1079 },
];

export class GameEngine {
  private state: GameState | null = null;
  private config: GameConfig;
  private random: SeededRandom;
  private eventGenerator: EventGenerator;
  
  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.random = new SeededRandom();
    this.eventGenerator = new EventGenerator(undefined, config);
  }
  
  createGame(difficulty: 'facile' | 'moyen' | 'difficile'): GameState {
    const cities = frenchCitiesList;
    let startCity: any, targetCity: any;
    let attempts = 0;
    do {
      startCity = this.random.pick(cities);
      targetCity = this.random.pick(cities);
      attempts++;
    } while (startCity.id === targetCity.id && attempts < 100);
    if (startCity.id === targetCity.id) {
      targetCity = this.random.pick(cities.filter((c: any) => c.id !== startCity.id));
    }
    const startPos: Coordinates = { lat: startCity.lat, lon: startCity.lon };
    const targetPos: Coordinates = { lat: targetCity.lat, lon: targetCity.lon };
    const distance = this.haversineDistance(startPos, targetPos);
    const settings = this.config.difficultySettings[difficulty];
    if (distance < settings.minDistance / 10) {
      return this.createGame(difficulty);
    }
    const events = this.eventGenerator.generateEvents(startPos, targetPos, difficulty, settings.eventCount);
    const energyMultiplier = settings.energyMultiplier;
    this.state = {
      id: generateId(),
      startedAt: Date.now(),
      difficulty,
      startCity: startCity.name,
      targetCity: targetCity.name,
      playerPosition: { ...startPos },
      targetPosition: { ...targetPos },
      energy: this.config.initialEnergy * energyMultiplier,
      maxEnergy: this.config.initialEnergy * energyMultiplier,
      distanceTraveled: 0,
      totalDistance: distance * 1000,
      exploredAreas: [{
        id: generateId(),
        center: { ...startPos },
        radius: this.config.explorationRadius,
        discoveredAt: Date.now()
      }],
      events,
      discoveredEvents: new Set(),
      score: 0,
      timeElapsed: 0,
      isWin: false,
      isGameOver: false,
      currentMinigame: null
    };
    return { ...this.state };
  }
  
  private haversineDistance(pos1: Coordinates, pos2: Coordinates): number {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lon - pos1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  movePlayer(newPosition: Coordinates): { success: boolean; message: string; state: GameState } {
    if (!this.state || this.state.isWin || this.state.isGameOver) {
      return { success: false, message: 'Partie terminée', state: this.createGame('moyen') };
    }
    const distance = this.haversineDistance(this.state.playerPosition, newPosition);
    const distanceMeters = distance * 1000;
    const energyCost = (distance * this.config.energyPerKm) * this.config.difficultySettings[this.state.difficulty].energyMultiplier;
    if (this.state.energy < energyCost) {
      return { success: false, message: `Pas assez d'énergie ! Il faut ${Math.round(energyCost)} unités, vous en avez ${Math.round(this.state.energy)}.`, state: this.state };
    }
    this.state.playerPosition = newPosition;
    this.state.distanceTraveled += distanceMeters;
    this.state.energy -= energyCost;
    this.state.timeElapsed = (Date.now() - this.state.startedAt) / 1000;
    const newArea: ExploredArea = {
      id: generateId(),
      center: { ...newPosition },
      radius: this.config.explorationRadius,
      discoveredAt: Date.now()
    };
    this.state.exploredAreas.push(newArea);
    this.checkNearbyEvents(newPosition);
    if (this.haversineDistance(newPosition, this.state.targetPosition) < 5) {
      this.state.isWin = true;
      this.state.score += 100;
      return { success: true, message: 'Félicitations ! Vous avez atteint la destination !', state: { ...this.state } };
    }
    if (this.state.energy <= 0) {
      this.state.isGameOver = true;
      return { success: false, message: 'Partie terminée : plus d\'énergie !', state: { ...this.state } };
    }
    this.state.score += Math.floor(distance * 2);
    return { success: true, message: `Déplacement de ${distance.toFixed(1)} km. Énergie : ${Math.round(this.state.energy)}`, state: { ...this.state } };
  }
  
  private checkNearbyEvents(position: Coordinates): void {
    if (!this.state) return;
    for (const event of this.state.events) {
      if (event.discovered || event.triggered) continue;
      const distance = this.haversineDistance(position, event.position) * 1000;
      if (distance <= event.radius) {
        event.discovered = true;
        this.state.discoveredEvents.add(event.id);
      }
    }
  }
  
  triggerEvent(eventId: string): { minigame: Minigame | null; message: string } {
    if (!this.state) {
      return { minigame: null, message: 'Aucune partie en cours' };
    }
    const event = this.state.events.find(e => e.id === eventId);
    if (!event || event.triggered) {
      return { minigame: null, message: 'Événement introuvable ou déjà déclenché' };
    }
    let minigame: Minigame | null = null;
    switch (event.type) {
      case 'quiz':
        minigame = { id: generateId(), type: 'quiz', question: event.data.question, options: event.data.options, correctAnswer: event.data.correctAnswer, reward: this.random.range(15, 30), penalty: this.random.range(5, 15) };
        break;
      case 'orientation':
        minigame = { id: generateId(), type: 'orientation', question: event.data.question, options: event.data.options, correctAnswer: event.data.correctAnswer, reward: this.random.range(10, 25), penalty: this.random.range(5, 10) };
        break;
      case 'observation':
        minigame = { id: generateId(), type: 'observation', question: event.data.question, correctAnswer: event.data.correctAnswer, reward: this.random.range(10, 20), penalty: this.random.range(5, 10) };
        break;
      case 'navigation':
        minigame = { id: generateId(), type: 'navigation', question: event.data.question, correctAnswer: event.data.correctAnswer, reward: this.random.range(20, 40), penalty: this.random.range(10, 20) };
        break;
      case 'ravitaillement':
        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + event.data.energyAmount);
        return { minigame: null, message: `Ravitaillement ! +${event.data.energyAmount} énergie` };
      case 'revelation':
        this.state.score += 50;
        return { minigame: null, message: `Révélation temporaire ! +50 points` };
    }
    if (minigame) {
      event.triggered = true;
      this.state.currentMinigame = minigame;
      return { minigame, message: 'Mini-jeu déclenché !' };
    }
    return { minigame: null, message: 'Événement traité' };
  }
  
  resolveMinigame(_minigameId: string, answer: string | number): { success: boolean; result: MinigameResult; message: string } {
    if (!this.state || !this.state.currentMinigame) {
      return { success: false, result: { success: false, reward: 0 }, message: 'Aucun mini-jeu en cours' };
    }
    const minigame = this.state.currentMinigame;
    const isCorrect = answer === minigame.correctAnswer;
    if (isCorrect) {
      this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + minigame.reward);
      this.state.score += minigame.reward * 2;
      return { success: true, result: { success: true, reward: minigame.reward }, message: `Bonne réponse ! +${minigame.reward} énergie` };
    } else {
      this.state.energy = Math.max(0, this.state.energy - minigame.penalty);
      return { success: false, result: { success: false, reward: -minigame.penalty }, message: `Mauvaise réponse ! -${minigame.penalty} énergie` };
    }
  }
  
  cancelMinigame(): void {
    if (this.state) {
      this.state.currentMinigame = null;
    }
  }
  
  updateTime(): void {
    if (this.state) {
      this.state.timeElapsed = (Date.now() - this.state.startedAt) / 1000;
    }
  }
  
  getState(): GameState | null {
    return this.state ? { ...this.state } : null;
  }
  
  reset(): void {
    this.state = null;
    this.random = new SeededRandom();
  }
  
  getFinalScore(): number {
    if (!this.state) return 0;
    let score = this.state.score;
    score += Math.max(0, 1000 - this.state.timeElapsed * 10);
    score += (this.state.energy / this.state.maxEnergy) * 500;
    score += this.state.discoveredEvents.size * 10;
    score += { facile: 0, moyen: 100, difficile: 300 }[this.state.difficulty];
    return Math.round(score);
  }
}
