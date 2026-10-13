// Mini-jeu d'Orientation
import type { MinigameResult } from '../game/types';

export interface OrientationGameOptions {
  question: string;
  options: string[];
  correctAnswer: string;
  reward: number;
  penalty: number;
  targetBearing?: number; // Direction réelle en degrés
}

export class OrientationGame {
  private options: OrientationGameOptions;
  private selectedAnswer: string | null;
  private startTime: number;
  private targetBearing: number;
  
  constructor(minigame: any) {
    this.options = {
      question: minigame.question || '',
      options: minigame.options || [],
      correctAnswer: minigame.correctAnswer as string || '',
      reward: minigame.reward || 0,
      penalty: minigame.penalty || 0
    };
    this.selectedAnswer = null;
    this.startTime = Date.now();
    
    // Génère une direction aléatoire pour la cible
    this.targetBearing = Math.floor(Math.random() * 360);
    
    // Met à jour la bonne réponse en fonction de la direction
    this.options.correctAnswer = this.bearingToDirection(this.targetBearing);
  }
  
  // Convertit un angle en degrés en direction cardinale
  private bearingToDirection(bearing: number): string {
    const directions = [
      'Nord', 'Nord-Est', 'Est', 'Sud-Est',
      'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'
    ];
    
    // Normalise l'angle
    bearing = (bearing + 360) % 360;
    
    // Divise le cercle en 8 parties
    const index = Math.floor((bearing + 22.5) / 45) % 8;
    return directions[index];
  }
  
  getQuestion(): string {
    return this.options.question || 'Dans quelle direction se trouve la cible ?';
  }
  
  getOptions(): string[] {
    return this.options.options.length > 0 ? 
      this.options.options : 
      ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
  }
  
  getTargetBearing(): number {
    return this.targetBearing;
  }
  
  selectAnswer(answer: string): void {
    this.selectedAnswer = answer;
  }
  
  submitAnswer(): MinigameResult {
    const timeTaken = Date.now() - this.startTime;
    const isCorrect = this.selectedAnswer === this.options.correctAnswer;
    
    return {
      success: isCorrect,
      reward: isCorrect ? this.options.reward : -this.options.penalty,
      timeTaken
    };
  }
  
  getCorrectAnswer(): string {
    return this.options.correctAnswer;
  }
  
  getFeedback(): string {
    if (this.selectedAnswer === null) {
      return 'Sélectionnez une direction';
    }
    
    if (this.selectedAnswer === this.options.correctAnswer) {
      return `Exact ! La cible est bien au ${this.options.correctAnswer}. +${this.options.reward} points`;
    } else {
      return `Presque ! La cible est au ${this.options.correctAnswer}, pas au ${this.selectedAnswer}.`;
    }
  }
}
