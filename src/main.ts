// Point d'entrée principal de Krazy Map
import * as L from 'leaflet';
import { 
  GameEngine
} from './game/engine';
import { MapManager } from './game/mapManager';
import type { GameState } from './game/types';
import { 
  createHomeScreen,
  createGameUI,
  createEndScreen,
  createLoadingScreen,
  updateGameUI,
  showMinigame,
  closeMinigame,
  showToast
} from './ui/components';
import { StatsManager } from './utils/helpers';
import { DEFAULT_CONFIG } from './game/types';
import './styles.css';

// Variables globales
let gameEngine: GameEngine | null = null;
let mapManager: MapManager | null = null;
let currentState: GameState | null = null;
let currentScreen: 'home' | 'game' | 'end' = 'home';
let appContainer: HTMLElement | null = null;
let homeScreen: HTMLElement | null = null;
let gameScreen: HTMLElement | null = null;
let endScreen: HTMLElement | null = null;
let loadingScreen: HTMLElement | null = null;

// Interface des options pour l'UI
interface UIOptions {
  onNewGame: (difficulty: 'facile' | 'moyen' | 'difficile') => void;
  onMove: (lat: number, lon: number) => void;
  onEventTrigger: (eventId: string) => void;
  onMinigameResolve: (answer: string | number) => void;
  onBackToMenu: () => void;
}

// Options de l'UI
const uiOptions: UIOptions = {
  onNewGame: startNewGame,
  onMove: movePlayer,
  onEventTrigger: triggerEvent,
  onMinigameResolve: resolveMinigame,
  onBackToMenu: backToMenu
};

// Fonction d'initialisation
document.addEventListener('DOMContentLoaded', () => {
  appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Affiche l'écran de chargement
  loadingScreen = createLoadingScreen();
  appContainer.appendChild(loadingScreen);
  
  // Initialise le jeu
  setTimeout(() => {
    initGame();
  }, 500);
});

// Initialise le jeu
function initGame(): void {
  if (!appContainer) return;
  
  // Crée le moteur du jeu
  gameEngine = new GameEngine(DEFAULT_CONFIG);
  
  // Crée le gestionnaire de carte
  mapManager = new MapManager('map');
  
  // Crée l'écran d'accueil
  homeScreen = createHomeScreen(uiOptions);
  
  // Remplace l'écran de chargement par l'écran d'accueil
  if (appContainer) {
    appContainer.innerHTML = '';
    appContainer.appendChild(homeScreen);
  }
  currentScreen = 'home';
  
  // Met à jour les statistiques
  updateStatsDisplay();
}

// Met à jour l'affichage des statistiques
function updateStatsDisplay(): void {
  if (homeScreen) {
    const statsPreview = homeScreen.querySelector('#statsPreview') as HTMLElement;
    if (statsPreview) {
      try {
        const stats = JSON.parse(localStorage.getItem('krazyMapStats') || '{}');
        const totalGames = stats.totalGames || 0;
        const wins = stats.wins || 0;
        const highScore = stats.highScore || 0;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        
        statsPreview.innerHTML = `
          <h3>Statistiques</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">${totalGames}</span>
              <span class="stat-label">Parties jouées</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${wins}</span>
              <span class="stat-label">Victoires</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${winRate}%</span>
              <span class="stat-label">Taux de réussite</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${highScore.toLocaleString()}</span>
              <span class="stat-label">Meilleur score</span>
            </div>
          </div>
        `;
      } catch (e) {
        // Ignore les erreurs
      }
    }
  }
}

// Démarre une nouvelle partie
function startNewGame(difficulty: 'facile' | 'moyen' | 'difficile'): void {
  if (!appContainer || !gameEngine) return;
  
  // Nettoie l'écran actuel
  appContainer.innerHTML = '';
  
  // Crée une nouvelle partie
  currentState = gameEngine.createGame(difficulty);
  
  // Initialise la carte
  if (mapManager) {
    mapManager.initialize(currentState.playerPosition.lat, currentState.playerPosition.lon, 6);
  }
  
  // Crée l'UI de jeu
  gameScreen = createGameUI(currentState, uiOptions, movePlayer);
  appContainer.appendChild(gameScreen);
  currentScreen = 'game';
  
  // Met à jour la carte avec la position du joueur
  updateMap();
  
  // Met à jour l'UI
  if (gameScreen) {
    updateGameUI(gameScreen, currentState);
  }
  
  // Met à jour régulièrement l'UI
  startGameLoop();
  
  // Gestion des événements de la carte
  const map = mapManager?.getMap();
  if (map) {
    map.on('click', (e: L.LeafletMouseEvent) => {
      // Déplace le joueur vers la position cliquée
      movePlayer(e.latlng.lat, e.latlng.lng);
    });
    
    // Gestion du zoom
    if (gameScreen) {
      gameScreen.addEventListener('zoomIn', () => {
        map.zoomIn();
      });
      
      gameScreen.addEventListener('zoomOut', () => {
        map.zoomOut();
      });
      
      gameScreen.addEventListener('centerOnPlayer', () => {
        if (currentState) {
          map.setView([currentState.playerPosition.lat, currentState.playerPosition.lon], map.getZoom());
        }
      });
    }
    
    // Gestion du double clic pour zoomer
    map.on('dblclick', (e) => {
      e.originalEvent.preventDefault();
      map.zoomIn();
    });
  }
}

// Met à jour la carte
function updateMap(): void {
  if (!currentState || !mapManager) return;
  
  // Met à jour la position du joueur
  mapManager.updatePlayerPosition(currentState.playerPosition);
  
  // Met à jour la position de la cible (masquée par le brouillard)
  mapManager.updateTargetPosition(currentState.targetPosition);
  
  // Met à jour les zones explorées
  mapManager.updateExploredAreas(currentState.exploredAreas);
  
  // Met à jour les marqueurs des événements
  mapManager.updateEventMarkers(currentState.events.map(e => ({
    id: e.id,
    position: e.position,
    discovered: e.discovered,
    type: e.type
  })));
  
  // Vérifie si le joueur est proche de la cible pour la révéler
  const map = mapManager.getMap();
  if (map && currentState) {
    const playerLatLng = L.latLng(currentState.playerPosition.lat, currentState.playerPosition.lon);
    const targetLatLng = L.latLng(currentState.targetPosition.lat, currentState.targetPosition.lon);
    const distance = playerLatLng.distanceTo(targetLatLng);
    
    // Si le joueur est proche, révèle la cible
    if (distance < 5000) { // 5 km
      mapManager.showTarget();
    }
  }
}

// Déplace le joueur
function movePlayer(lat: number, lon: number): void {
  if (!currentState || !gameEngine) return;
  
  // Calcule le nouveau déplacement
  const result = gameEngine.movePlayer({ lat, lon });
  
  if (result.success) {
    currentState = result.state;
    updateMap();
    if (gameScreen) {
      updateGameUI(gameScreen, currentState);
    }
    
    // Vérifie si la partie est terminée
    if (currentState && (currentState.isWin || currentState.isGameOver)) {
      endGame(currentState.isWin);
      return;
    }
    
    // Affiche un toast de confirmation
    if (gameScreen) {
      showToast(gameScreen, result.message, 2000, 'success');
    }
  } else {
    // Affiche un message d'erreur
    if (gameScreen) {
      showToast(gameScreen, result.message, 3000, 'error');
    }
  }
}

// Déclenche un événement
function triggerEvent(eventId: string): void {
  if (!gameEngine || !currentState) return;
  
  const result = gameEngine.triggerEvent(eventId);
  
  if (result.minigame && gameScreen) {
    // Affiche le mini-jeu
    showMinigame(gameScreen, result.minigame.type, result.minigame, (answer) => {
      resolveMinigame(answer);
    });
  } else {
    // Affiche le résultat de l'événement
    if (gameScreen) {
      showToast(gameScreen, result.message, 3000, 'info');
    }
    
    // Met à jour l'état
    currentState = gameEngine.getState();
    if (currentState && gameScreen) {
      updateGameUI(gameScreen, currentState);
    }
    updateMap();
  }
}

// Résout un mini-jeu
function resolveMinigame(answer: string | number): void {
  if (!gameEngine || !currentState) return;
  
  // Ferme le mini-jeu
  if (gameScreen) {
    closeMinigame(gameScreen);
  }
  
  // Résout le mini-jeu
  const result = gameEngine.resolveMinigame(
    currentState.currentMinigame?.id || '',
    answer
  );
  
  // Met à jour l'état
  currentState = gameEngine.getState();
  
  // Affiche le résultat
  if (gameScreen && currentState) {
    showToast(gameScreen, result.message, 3000, result.success ? 'success' : 'error');
    updateGameUI(gameScreen, currentState);
  }
  updateMap();
  
  // Vérifie si la partie est terminée
  if (currentState && (currentState.isWin || currentState.isGameOver)) {
    endGame(currentState.isWin);
  }
}

// Retour au menu
function backToMenu(): void {
  // Nettoie le jeu actuel
  if (mapManager) {
    mapManager.destroy();
  }
  
  if (gameEngine) {
    gameEngine.reset();
  }
  currentState = null;
  currentScreen = 'home';
  
  // Recrée l'écran d'accueil
  if (appContainer) {
    appContainer.innerHTML = '';
    homeScreen = createHomeScreen(uiOptions);
    appContainer.appendChild(homeScreen);
  }
  
  // Met à jour les statistiques
  updateStatsDisplay();
}

// Termine la partie
function endGame(isWin: boolean): void {
  if (!currentState || !gameEngine || !appContainer) return;
  
  // Enregistre les statistiques
  const state = currentState;
  const finalScore = gameEngine.getFinalScore();
  StatsManager.recordGame(
    state.difficulty,
    finalScore,
    isWin,
    state.timeElapsed
  );
  
  // Nettoie la carte
  if (mapManager) {
    mapManager.destroy();
  }
  
  currentScreen = 'end';
  
  // Crée l'écran de fin
  endScreen = createEndScreen(state, finalScore, isWin, uiOptions);
  appContainer.innerHTML = '';
  appContainer.appendChild(endScreen);
  
  // Met à jour l'écran d'accueil pour la prochaine fois
  updateStatsDisplay();
}

// Boucle de jeu principale
let gameLoopInterval: number | null = null;

function startGameLoop(): void {
  // Arrête la boucle précédente si elle existe
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
  
  // Met à jour régulièrement
  gameLoopInterval = window.setInterval(() => {
    if (currentState && gameEngine && currentScreen === 'game') {
      // Met à jour le temps
      gameEngine.updateTime();
      const newState = gameEngine.getState();
      if (newState) {
        currentState = newState;
        
        // Met à jour l'UI
        if (gameScreen) {
          updateGameUI(gameScreen, currentState);
        }
        
        // Vérifie si la partie est terminée
        if (currentState.isWin || currentState.isGameOver) {
          endGame(currentState.isWin);
        }
      }
    }
  }, 1000);
}

// Gestion de la fermeture de la fenêtre
window.addEventListener('beforeunload', () => {
  // Sauvegarde les statistiques automatiquement
  if (currentState && currentScreen === 'game') {
    // On ne sauvegarde pas la partie active, juste les statistiques
    StatsManager.recordGame(
      currentState.difficulty,
      currentState.score,
      currentState.isWin,
      currentState.timeElapsed
    );
  }
});
