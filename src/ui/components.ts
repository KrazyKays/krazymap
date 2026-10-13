// Composants UI pour Krazy Map
import type { GameState } from '../game/types';
import { formatNumber, formatDuration, formatDistance, clamp } from '../utils/helpers';

export interface UIOptions {
  onNewGame: (difficulty: 'facile' | 'moyen' | 'difficile') => void;
  onMove: (lat: number, lon: number) => void;
  onEventTrigger: (eventId: string) => void;
  onMinigameResolve: (answer: string | number) => void;
  onBackToMenu: () => void;
}

export function createHomeScreen(options: UIOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'home-screen';
  container.innerHTML = `
    <header class="game-header"><h1>Krazy Map</h1><p class="subtitle">Explorez la France !</p></header>
    <main class="home-content">
      <div class="logo-container"><svg class="logo" viewBox="0 0 200 200"><defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" /><stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="90" fill="url(#logoGrad)"/><text x="100" y="120" font-size="40" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">KM</text></svg></div>
      <div class="difficulty-selector"><h2>Choisissez votre difficulté</h2>
        <div class="difficulty-buttons">
          <button class="btn btn-facile" data-difficulty="facile"><span>🏞️ Facile</span><small>100-300 km</small></button>
          <button class="btn btn-moyen" data-difficulty="moyen"><span>🌍 Moyen</span><small>200-500 km</small></button>
          <button class="btn btn-difficile" data-difficulty="difficile"><span>🔥 Difficile</span><small>400-800 km</small></button>
        </div>
      </div>
      <button class="btn btn-new-game btn-primary"><span>✨ Nouvelle Partie</span></button>
      <div class="how-to-play"><button class="btn btn-info" id="toggleHowTo">❓ Comment jouer ?</button>
        <div class="how-to-content" id="howToContent"><h3>Règles</h3><ul>
          <li><strong>Objectif</strong> : Rejoignez la ville destination</li><li><strong>Énergie</strong> : Déplacement consomme de l'énergie</li>
          <li><strong>Brouillard</strong> : Explorez pour révéler la carte</li><li><strong>Événements</strong> : Mini-jeux et défis</li>
        </ul><button class="btn btn-close" id="closeHowTo">Fermer</button></div>
      </div><div class="stats-preview" id="statsPreview"></div>
    </main>
    <footer class="game-footer"><p>© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a></p></footer>
  `;
  const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
  const difficultyBtns = container.querySelectorAll('[data-difficulty]');
  const toggleHowTo = container.querySelector('#toggleHowTo') as HTMLButtonElement;
  const closeHowTo = container.querySelector('#closeHowTo') as HTMLButtonElement;
  const howToContent = container.querySelector('#howToContent') as HTMLElement;
  let selectedDifficulty: 'facile' | 'moyen' | 'difficile' = 'moyen';
  difficultyBtns.forEach(btn => btn.addEventListener('click', () => {
    difficultyBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDifficulty = btn.getAttribute('data-difficulty') as 'facile' | 'moyen' | 'difficile';
  }));
  newGameBtn.addEventListener('click', () => options.onNewGame(selectedDifficulty));
  toggleHowTo.addEventListener('click', () => howToContent.style.display = howToContent.style.display === 'block' ? 'none' : 'block');
  closeHowTo.addEventListener('click', () => howToContent.style.display = 'none');
  const moyenBtn = container.querySelector('.btn-moyen') as HTMLButtonElement;
  if (moyenBtn) moyenBtn.classList.add('selected');
  updateStatsPreview(container);
  return container;
}

export function updateStatsPreview(container: HTMLElement): void {
  const statsPreview = container.querySelector('#statsPreview') as HTMLElement;
  if (!statsPreview) return;
  try {
    const stats = JSON.parse(localStorage.getItem('krazyMapStats') || '{}');
    statsPreview.innerHTML = `
      <h3>Statistiques</h3>
      <div class="stats-grid">
        <div class="stat-item"><span class="stat-value">${stats.totalGames || 0}</span><span class="stat-label">Parties</span></div>
        <div class="stat-item"><span class="stat-value">${stats.wins || 0}</span><span class="stat-label">Victoires</span></div>
        <div class="stat-item"><span class="stat-value">${Math.round(100 * (stats.wins || 0) / Math.max(1, stats.totalGames || 1))}%</span><span class="stat-label">Taux</span></div>
        <div class="stat-item"><span class="stat-value">${formatNumber(stats.highScore || 0)}</span><span class="stat-label">Score</span></div>
      </div>
    `;
  } catch (e) {}
}

export function createGameUI(state: GameState, options: UIOptions, _onMapClick: (lat: number, lon: number) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'game-ui';
  container.innerHTML = `
    <header class="game-header in-game">
      <div class="game-info">
        <div class="info-item"><span class="info-label">🎯</span><span class="info-value" id="targetCity">${state.targetCity}</span></div>
        <div class="info-item"><span class="info-label">⏱️</span><span class="info-value" id="timeElapsed">00:00</span></div>
        <div class="info-item"><span class="info-label">⚡</span><span class="info-value energy-value" id="energy">${Math.round(state.energy)} / ${Math.round(state.maxEnergy)}</span></div>
        <div class="info-item"><span class="info-label">📍</span><span class="info-value" id="distance">0 / ${formatDistance(state.totalDistance)}</span></div>
        <div class="info-item score-item"><span class="info-label">🏆</span><span class="info-value" id="score">${formatNumber(state.score)}</span></div>
      </div>
      <div class="game-actions"><button class="btn btn-menu" id="backToMenu">❌ Menu</button></div>
    </header>
    <main class="game-main"><div id="map"></div>
      <div class="hud-bottom">
        <div class="controls">
          <button class="btn btn-center" id="centerOnPlayer">🎯</button>
          <button class="btn btn-zoom-in" id="zoomIn">+</button>
          <button class="btn btn-zoom-out" id="zoomOut">-</button>
        </div>
        <div class="progress-container"><div class="progress-bar"><div class="progress-fill" id="progressFill" style="width: 0%"></div></div><span id="progressText">0%</span></div>
      </div>
      <div class="events-panel" id="eventsPanel"><h3>Événements</h3><div class="events-list" id="eventsList"></div></div>
    </main>
    <div class="modal-overlay" id="modalOverlay"><div class="modal" id="modal"><div class="modal-content" id="modalContent"></div></div></div>
    <div class="minigame-overlay" id="minigameOverlay"><div class="minigame-container" id="minigameContainer"></div></div>
    <div class="toast-container" id="toastContainer"></div>
  `;
  const backToMenu = container.querySelector('#backToMenu') as HTMLButtonElement;
  const centerOnPlayer = container.querySelector('#centerOnPlayer') as HTMLButtonElement;
  const zoomIn = container.querySelector('#zoomIn') as HTMLButtonElement;
  const zoomOut = container.querySelector('#zoomOut') as HTMLButtonElement;
  backToMenu.addEventListener('click', () => { if (confirm('Abandonner ?')) options.onBackToMenu(); });
  centerOnPlayer.addEventListener('click', () => container.dispatchEvent(new CustomEvent('centerOnPlayer')));
  zoomIn.addEventListener('click', () => container.dispatchEvent(new CustomEvent('zoomIn')));
  zoomOut.addEventListener('click', () => container.dispatchEvent(new CustomEvent('zoomOut')));
  updateGameUI(container, state);
  return container;
}

export function updateGameUI(container: HTMLElement, state: GameState): void {
  const energyEl = container.querySelector('#energy') as HTMLElement;
  const scoreEl = container.querySelector('#score') as HTMLElement;
  const distanceEl = container.querySelector('#distance') as HTMLElement;
  const timeEl = container.querySelector('#timeElapsed') as HTMLElement;
  const progressFill = container.querySelector('#progressFill') as HTMLElement;
  const progressText = container.querySelector('#progressText') as HTMLElement;
  if (energyEl) {
    energyEl.textContent = `${Math.round(state.energy)} / ${Math.round(state.maxEnergy)}`;
    const energyPercent = (state.energy / state.maxEnergy) * 100;
    energyEl.style.color = energyPercent < 20 ? '#ff4444' : energyPercent < 50 ? '#ffaa44' : '#44ff44';
  }
  if (scoreEl) scoreEl.textContent = formatNumber(state.score);
  if (distanceEl) distanceEl.textContent = `${formatDistance(state.distanceTraveled)} / ${formatDistance(state.totalDistance)}`;
  if (timeEl) timeEl.textContent = formatDuration(state.timeElapsed);
  if (progressFill && progressText) {
    const progress = (state.distanceTraveled / state.totalDistance) * 100;
    progressFill.style.width = `${clamp(progress, 0, 100)}%`;
    progressText.textContent = `${Math.round(clamp(progress, 0, 100))}%`;
  }
}

export function updateEventsList(container: HTMLElement, state: GameState, options: UIOptions): void {
  const eventsList = container.querySelector('#eventsList') as HTMLElement;
  if (!eventsList) return;
  const discoveredEvents = state.events.filter(e => e.discovered && !e.triggered);
  if (discoveredEvents.length === 0) { eventsList.innerHTML = '<p class="no-events">Aucun événement</p>'; return; }
  eventsList.innerHTML = discoveredEvents.map(event => {
    const typeNames: Record<string, string> = { quiz: 'Quiz', orientation: 'Orientation', observation: 'Observation', navigation: 'Navigation', ravitaillement: 'Ravitaillement', revelation: 'Révélation' };
    const typeIcons: Record<string, string> = { quiz: '📝', orientation: '🧭', observation: '👁️', navigation: '🗺️', ravitaillement: '⛽', revelation: '💡' };
    return `<button class="event-item" data-event-id="${event.id}"><span class="event-icon">${typeIcons[event.type] || '❓'}</span><span class="event-name">${typeNames[event.type] || event.type}</span></button>`;
  }).join('');
  eventsList.querySelectorAll('.event-item').forEach(btn => btn.addEventListener('click', () => {
    const eventId = btn.getAttribute('data-event-id');
    if (eventId) options.onEventTrigger(eventId);
  }));
}

export function showMinigame(container: HTMLElement, type: string, data: any, onResolve: (answer: string | number) => void): void {
  const minigameContainer = container.querySelector('#minigameContainer') as HTMLElement;
  const overlay = container.querySelector('#minigameOverlay') as HTMLElement;
  let content = '';
  switch (type) {
    case 'quiz':
      content = `<div class="minigame minigame-quiz"><h2>Quiz</h2><p class="minigame-question">${data.question}</p><div class="minigame-options">${data.options.map((opt: string, idx: number) => `<button class="minigame-option" data-value="${opt}"><span class="option-letter">${String.fromCharCode(65 + idx)}</span><span class="option-text">${opt}</span></button>`).join('')}</div></div>`; break;
    case 'orientation':
      content = `<div class="minigame minigame-orientation"><h2>Orientation</h2><p class="minigame-question">${data.question}</p><div class="minigame-options">${data.options.map((opt: string, idx: number) => `<button class="minigame-option" data-value="${opt}"><span class="option-letter">${String.fromCharCode(65 + idx)}</span><span class="option-text">${opt}</span></button>`).join('')}</div></div>`; break;
    case 'observation':
      content = `<div class="minigame minigame-observation"><h2>Observation</h2><p class="minigame-question">${data.question.replace('{shape}', data.shape || 'la forme')}</p><div class="minigame-visual"><svg width="100" height="100" viewBox="0 0 100 100">${getShapeSvg(data.shape || 'Cercle', data.color || '#FF6B6B')}</svg></div><div class="minigame-options">${data.colorOptions.map((opt: string, idx: number) => `<button class="minigame-option" data-value="${opt}"><span class="option-letter">${String.fromCharCode(65 + idx)}</span><span class="option-text">${opt}</span></button>`).join('')}</div></div>`; break;
    case 'navigation':
      content = `<div class="minigame minigame-navigation"><h2>Navigation</h2><p class="minigame-question">${data.question}</p><p class="minigame-hint">Indice: ~${Math.round(data.actualDistance || 0)} km</p><div class="minigame-input"><input type="number" id="navigationInput" placeholder="Distance en km" min="0" max="1000" /><button class="minigame-submit">Valider</button></div></div>`; break;
    default:
      content = `<div class="minigame"><h2>Événement</h2><p>${data.question || 'Événement'}</p></div>`;
  }
  minigameContainer.innerHTML = content;
  overlay.style.display = 'flex';
  if (type !== 'navigation') {
    minigameContainer.querySelectorAll('.minigame-option').forEach(btn => btn.addEventListener('click', () => {
      const answer = btn.getAttribute('data-value');
      if (answer) { onResolve(answer); closeMinigame(container); }
    }));
  } else {
    const input = minigameContainer.querySelector('#navigationInput') as HTMLInputElement;
    const submit = minigameContainer.querySelector('.minigame-submit') as HTMLButtonElement;
    submit.addEventListener('click', () => { onResolve(parseFloat(input.value) || 0); closeMinigame(container); });
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { onResolve(parseFloat(input.value) || 0); closeMinigame(container); } });
  }
}

export function closeMinigame(container: HTMLElement): void {
  (container.querySelector('#minigameOverlay') as HTMLElement).style.display = 'none';
}

export function showToast(container: HTMLElement, message: string, duration: number = 3000, type: 'success' | 'error' | 'info' = 'info'): void {
  const toastContainer = container.querySelector('#toastContainer') as HTMLElement;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`; toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
}

export function getShapeSvg(shape: string, color: string): string {
  const shapes: Record<string, string> = {
    Cercle: `<circle cx="50" cy="50" r="40" fill="${color}" />`,
    Carré: `<rect x="20" y="20" width="60" height="60" fill="${color}" />`,
    Triangle: `<polygon points="50,10 90,90 10,90" fill="${color}" />`,
    Étoile: `<path d="M50,10 L61,35 L90,35 L68,55 L79,80 L50,65 L21,80 L32,55 L10,35 L39,35 Z" fill="${color}" />`
  };
  return shapes[shape] || shapes['Cercle'];
}

export function createEndScreen(state: GameState, finalScore: number, isWin: boolean, options: UIOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'end-screen';
  container.innerHTML = `
    <header class="game-header"><h1>Krazy Map</h1></header>
    <main class="end-content">
      <div class="result-container ${isWin ? 'win' : 'lose'}">
        <h2>${isWin ? '🎉 Bravo !' : '😢 Fin'}</h2><p class="result-message">${isWin ? 'Destination atteinte !' : 'Destination non atteinte'}</p>
        <div class="score-summary">
          <div class="score-item"><span class="score-label">Score</span><span class="score-value">${formatNumber(finalScore)}</span></div>
          <div class="score-item"><span class="score-label">Distance</span><span class="score-value">${formatDistance(state.distanceTraveled)}</span></div>
          <div class="score-item"><span class="score-label">Temps</span><span class="score-value">${formatDuration(state.timeElapsed)}</span></div>
          <div class="score-item"><span class="score-label">Événements</span><span class="score-value">${state.discoveredEvents.size}</span></div>
        </div>
        <div class="result-details"><h3>Résumé</h3><p>Départ: <strong>${state.startCity}</strong></p><p>Arrivée: <strong>${state.targetCity}</strong></p></div>
        <button class="btn btn-new-game btn-primary" id="newGameBtn"><span>🎮 Nouvelle Partie</span></button>
        <button class="btn btn-menu" id="backToMenuBtn"><span>❌ Menu</span></button>
      </div>
    </main>
    <footer class="game-footer"><p>© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a></p></footer>
  `;
  (container.querySelector('#newGameBtn') as HTMLButtonElement).addEventListener('click', () => options.onNewGame(state.difficulty));
  (container.querySelector('#backToMenuBtn') as HTMLButtonElement).addEventListener('click', () => options.onBackToMenu());
  return container;
}

export function getDifficultyLabel(difficulty: string): string {
  return { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' }[difficulty] || difficulty;
}

export function createLoadingScreen(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'loading-screen';
  container.innerHTML = '<div class="loading-content"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke="#FF6B6B"/></svg><p>Chargement...</p></div>';
  return container;
}
