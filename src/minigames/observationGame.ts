// Mini-jeu d'Observation Cartographique
import type { MinigameResult } from '../game/types';

export interface ObservationGameOptions {
  question: string;
  correctAnswer: string;
  shape: string;
  reward: number;
  penalty: number;
  color: string;
}

export class ObservationGame {
  private options: ObservationGameOptions;
  private selectedAnswer: string | null;
  private startTime: number;
  
  constructor(minigame: any) {
    this.options = {
      question: minigame.question || 'Quelle couleur a la forme sur la carte ?',
      correctAnswer: minigame.correctAnswer as string || '',
      shape: minigame.shape || 'Cercle',
      reward: minigame.reward || 0,
      penalty: minigame.penalty || 0,
      color: this.getColorForShape(minigame.shape || 'Cercle')
    };
    this.selectedAnswer = null;
    this.startTime = Date.now();
  }
  
  // Génère une couleur pour une forme donnée
  private getColorForShape(shape: string): string {
    const colors: Record<string, string> = {
      Cercle: '#FF6B6B',
      Carré: '#4ECDC4',
      Triangle: '#45B7D1',
      Étoile: '#FFBE0B'
    };
    return colors[shape] || '#FF6B6B';
  }
  
  getQuestion(): string {
    return this.options.question.replace('{shape}', this.options.shape);
  }
  
  getShape(): string {
    return this.options.shape;
  }
  
  getColor(): string {
    return this.options.color;
  }
  
  getColorOptions(): string[] {
    return ['Rouge', 'Bleu', 'Vert', 'Jaune'];
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
      return 'Sélectionnez une couleur';
    }
    
    if (this.selectedAnswer === this.options.correctAnswer) {
      return `Correct ! La forme ${this.options.shape} est bien ${this.options.correctAnswer.toLowerCase()}. +${this.options.reward} points`;
    } else {
      return `Erreur ! La forme ${this.options.shape} est ${this.options.correctAnswer.toLowerCase()}, pas ${this.selectedAnswer.toLowerCase()}.`;
    }
  }
}
