// Mini-jeu Quiz Géographique
import type { MinigameResult } from '../game/types';

export interface QuizGameOptions {
  question: string;
  options: string[];
  correctAnswer: string;
  reward: number;
  penalty: number;
}

export class QuizGame {
  private options: QuizGameOptions;
  private selectedAnswer: string | null;
  private startTime: number;
  
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
  }
  
  getQuestion(): string {
    return this.options.question;
  }
  
  getOptions(): string[] {
    return [...this.options.options];
  }
  
  selectAnswer(answer: string): void {
    this.selectedAnswer = answer;
  }
  
  submitAnswer(): MinigameResult {
    const timeTaken = Date.now() - this.startTime;
    const isCorrect = this.selectedAnswer === this.options.correctAnswer;
    
    if (isCorrect) {
      // Bonus de temps
      const timeBonus = Math.max(0, 10 - Math.floor(timeTaken / 1000));
      return {
        success: true,
        reward: this.options.reward + timeBonus,
        timeTaken
      };
    } else {
      return {
        success: false,
        reward: -this.options.penalty,
        timeTaken
      };
    }
  }
  
  getCorrectAnswer(): string {
    return this.options.correctAnswer;
  }
  
  getFeedback(): string {
    if (this.selectedAnswer === null) {
      return 'Sélectionnez une réponse';
    }
    
    if (this.selectedAnswer === this.options.correctAnswer) {
      return `Bonne réponse ! +${this.options.reward} points`;
    } else {
      return `Mauvaise réponse. La bonne réponse était: ${this.options.correctAnswer}`;
    }
  }
}
