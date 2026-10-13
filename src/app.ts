import { ANECDOTES, type Anecdote } from './data/anecdotes';
import { MAX_POINTS_PER_ROUND, ROUNDS_PER_GAME } from './game/config';
import { pickRandom } from './game/rounds';
import { haversineKm, pointsForDistance } from './game/scoring';
import type { LonLat } from './geo/projection';
import { loadStats, saveStats, type Stats } from './storage';
import { createMap, type MapHandle } from './ui/map';

interface RoundResult {
  anecdote: Anecdote;
  guess: LonLat;
  distanceKm: number;
  points: number;
}

interface Game {
  anecdotes: Anecdote[];
  index: number;
  results: RoundResult[];
}

const formatNumber = (value: number) => value.toLocaleString('fr-FR');

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function startApp(root: HTMLElement): void {
  let stats: Stats = loadStats();
  let game: Game | null = null;
  let currentMap: MapHandle | null = null;
  let guess: LonLat | null = null;
  let validated = false;

  const showHome = () => {
    game = null;
    root.innerHTML = `
      <main class="screen home">
        <h1>Krazy Map</h1>
        <p class="lead">Une anecdote locale, un point sur la carte de France. Plus vous êtes près du lieu, plus vous gagnez de points.</p>
        <ul class="rules">
          <li>${ROUNDS_PER_GAME} anecdotes par partie, tirées au hasard</li>
          <li>Cliquez sur la carte pour placer votre point, puis validez</li>
          <li>Jusqu'à ${formatNumber(MAX_POINTS_PER_ROUND)} points par manche, selon la distance au lieu</li>
        </ul>
        <p class="best">Meilleur score : <strong>${formatNumber(stats.bestScore)}</strong> pts · Parties jouées : ${stats.gamesPlayed}</p>
        <button type="button" class="primary" data-action="start">Jouer</button>
      </main>`;
    root.querySelector<HTMLButtonElement>('[data-action="start"]')!.addEventListener('click', startGame);
  };

  const startGame = () => {
    game = {
      anecdotes: pickRandom(ANECDOTES, ROUNDS_PER_GAME),
      index: 0,
      results: [],
    };
    showRound();
  };

  const totalScore = () => game?.results.reduce((sum, r) => sum + r.points, 0) ?? 0;

  const showRound = () => {
    if (!game) return;
    const anecdote = game.anecdotes[game.index];
    guess = null;
    validated = false;

    root.innerHTML = `
      <main class="screen round">
        <header class="round-header">
          <span>Manche ${game.index + 1} / ${ROUNDS_PER_GAME}</span>
          <span>Score : <strong>${formatNumber(totalScore())}</strong></span>
        </header>
        <article class="anecdote">
          <h2>${escapeHtml(anecdote.titre)}</h2>
          <p>${escapeHtml(anecdote.texte)}</p>
          <p class="question">Où se déroule cette anecdote ?</p>
        </article>
        <div class="map-slot"></div>
        <footer class="round-footer">
          <p class="feedback" aria-live="polite">Cliquez sur la carte pour placer votre point.</p>
          <button type="button" class="primary" data-action="validate" disabled>Valider</button>
        </footer>
      </main>`;

    const mapSlot = root.querySelector<HTMLElement>('.map-slot')!;
    currentMap = createMap(onPick);
    mapSlot.append(currentMap.element);

    root.querySelector<HTMLButtonElement>('[data-action="validate"]')!.addEventListener('click', onValidateClick);
  };

  const onValidateClick = () => {
    if (!validated) {
      validate();
    } else if (game && game.index === ROUNDS_PER_GAME - 1) {
      showResult();
    } else {
      nextRound();
    }
  };

  const onPick = (position: LonLat) => {
    if (validated || !currentMap) return;
    guess = position;
    currentMap.setGuess(position);
    const button = root.querySelector<HTMLButtonElement>('[data-action="validate"]')!;
    button.disabled = false;
    root.querySelector<HTMLElement>('.feedback')!.textContent = 'Point placé. Cliquez ailleurs pour le déplacer, ou validez.';
  };

  const validate = () => {
    if (!game || !guess || !currentMap || validated) return;
    const anecdote = game.anecdotes[game.index];
    const distanceKm = haversineKm(guess.lat, guess.lon, anecdote.lat, anecdote.lon);
    const points = pointsForDistance(distanceKm);
    game.results.push({ anecdote, guess, distanceKm, points });
    validated = true;

    currentMap.lock();
    currentMap.reveal(anecdote, guess);

    root.querySelector<HTMLElement>('.round-header strong')!.textContent = formatNumber(totalScore());
    root.querySelector<HTMLElement>('.feedback')!.innerHTML = `
      <strong>${escapeHtml(anecdote.lieu)}</strong> — à ${formatNumber(Math.round(distanceKm))} km, <strong>+${formatNumber(points)} pts</strong>.<br>
      ${escapeHtml(anecdote.revelation)}`;

    const isLast = game.index === ROUNDS_PER_GAME - 1;
    root.querySelector<HTMLButtonElement>('[data-action="validate"]')!.textContent = isLast
      ? 'Voir le résultat'
      : 'Manche suivante';
  };

  const nextRound = () => {
    if (!game) return;
    game.index += 1;
    showRound();
  };

  const showResult = () => {
    if (!game) return;
    const total = totalScore();
    stats = {
      bestScore: Math.max(stats.bestScore, total),
      gamesPlayed: stats.gamesPlayed + 1,
    };
    saveStats(stats);

    const rows = game.results
      .map(
        (r, i) => `
          <li>
            <span class="row-title">${i + 1}. ${escapeHtml(r.anecdote.titre)}</span>
            <span class="row-detail">${escapeHtml(r.anecdote.lieu)} · ${formatNumber(Math.round(r.distanceKm))} km</span>
            <span class="row-points">${formatNumber(r.points)}</span>
          </li>`,
      )
      .join('');

    root.innerHTML = `
      <main class="screen result">
        <h1>Partie terminée</h1>
        <p class="final-score">${formatNumber(total)} <span>/ ${formatNumber(ROUNDS_PER_GAME * MAX_POINTS_PER_ROUND)} pts</span></p>
        <p class="best">Meilleur score : <strong>${formatNumber(stats.bestScore)}</strong> pts</p>
        <ol class="recap">${rows}</ol>
        <div class="actions">
          <button type="button" class="primary" data-action="replay">Rejouer</button>
          <button type="button" data-action="home">Accueil</button>
        </div>
      </main>`;

    root.querySelector<HTMLButtonElement>('[data-action="replay"]')!.addEventListener('click', startGame);
    root.querySelector<HTMLButtonElement>('[data-action="home"]')!.addEventListener('click', showHome);
  };

  showHome();
}
