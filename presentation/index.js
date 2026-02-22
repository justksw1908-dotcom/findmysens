import { GameManager } from '../application/GameManager.js';
import { SensitivityCalculator } from '../domain/SensitivityCalculator.js';
import { ScoreSystem } from '../domain/ScoreSystem.js';
import { RankingRepository } from '../infrastructure/RankingRepository.js';
import { UIController } from './UIController.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameManager = new GameManager();
  const calculator = new SensitivityCalculator();
  const scoreSystem = new ScoreSystem();
  const rankingRepo = new RankingRepository();

  // Dependency Injection into UIController
  new UIController(gameManager, calculator, scoreSystem, rankingRepo);
});
