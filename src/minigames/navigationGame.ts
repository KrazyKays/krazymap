// Mini-jeu Défis de Navigation
import type { MinigameResult } from '../game/types';

export interface NavigationGameOptions {
  question: string;
  correctAnswer: number;
  actualDistance: number;
  reward: number;
  penalty: number;
}

export class NavigationGame {
  private options: NavigationGameOptions;
  private userAnswer: number | null;
  private startTime: number;
  
  constructor(minigame: any) {
    this.options = {
      question: minigame.question || 'Combien de kilomètres devez-vous parcourir ?',
      correctAnswer: minigame.correctAnswer as number || 0,
      actualDistance: minigame.actualDistance || 0,
      reward: minigame.reward || 0,
      penalty: minigame.penalty || 0
    };
    this.userAnswer = null;
    this.startTime = Date.now();
  }
  
  getQuestion(): string {
    return this.options.question;
  }
  
  getActualDistance(): number {
    return this.options.actualDistance;
  }
  
  setUserAnswer(answer: number): void {
    this.userAnswer = answer;
  }
  
  submitAnswer(): MinigameResult {
    const timeTaken = Date.now() - this.startTime;
    
    if (this.userAnswer === null) {
      return {
        success: false,
        reward: -this.options.penalty,
        timeTaken
      };
    }
    
    // Vérifie si la réponse est correcte avec une marge d'erreur
    const tolerance = Math.max(10, this.options.actualDistance * 0.1);
    const isCorrect = Math.abs(this.userAnswer - this.options.actualDistance) <= tolerance;
    
    return {
      success: isCorrect,
      reward: isCorrect ? this.options.reward : -this.options.penalty,
      timeTaken
    };
  }
  
  getCorrectAnswer(): number {
    return this.options.correctAnswer;
  }
  
  getFeedback(): string {
    if (this.userAnswer === null) {
      return 'Entrez une distance';
    }
    
    const tolerance = Math.max(10, this.options.actualDistance * 0.1);
    const isCorrect = Math.abs(this.userAnswer - this.options.actualDistance) <= tolerance;
    
    if (isCorrect) {
      return `Excellent ! La distance est bien de ${Math.round(this.options.actualDistance)} km. +${this.options.reward} points`;
    } else {
      return `Presque ! La distance réelle est de ${Math.round(this.options.actualDistance)} km (vous avez dit ${this.userAnswer} km).`;
    }
  }
  
  // Calcule le niveau de précision (pourcentage)
  getAccuracy(): number {
    if (this.userAnswer === null) return 0;
    
    const error = Math.abs(this.userAnswer - this.options.actualDistance);
    const maxError = this.options.actualDistance * 0.5; // 50% d'erreur max pour 0%
    
    return Math.max(0, 100 - (error / maxError) * 100);
  }
}
