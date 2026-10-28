import { ANECDOTES, CATEGORIES, type Categorie } from './data/anecdotes';
import { departementByCode, departementsOfRegion, regionOf } from './data/departements';
import { ACHIEVEMENTS, unlockedAchievements, type Achievement } from './game/achievements';
import { HINT_MULTIPLIERS, MAX_POINTS_PER_ROUND } from './game/config';
import { evaluateGuess, type RoundResult } from './game/evaluate';
import { buildGame, MODES, type GameSetup, type ModeId } from './game/modes';
import { dayKey } from './game/random';
import { rankFor, ratingFor } from './game/scoring';
import type { LonLat } from './geo/projection';
import { dailyStreak, emptyProfile, loadProfile, saveProfile, type Profile } from './storage';
import { createMap, type MapHandle } from './ui/map';

interface Game {
  setup: GameSetup;
  index: number;
  results: RoundResult[];
}

const formatNumber = (value: number) => value.toLocaleString('fr-FR');
const formatKm = (km: number) => (km < 1 ? 'moins d’1 km' : `${formatNumber(Math.round(km))} km`);
const percent = (multiplier: number) => `−${Math.round((1 - multiplier) * 100)} %`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function countUp(element: HTMLElement, from: number, to: number, duration = 700): void {
  if (from === to || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = formatNumber(to);
    return;
  }
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    element.textContent = formatNumber(Math.round(from + (to - from) * (1 - (1 - t) ** 3)));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function toast(message: string): void {
  let host = document.querySelector<HTMLElement>('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = message;
  host.append(item);
  setTimeout(() => item.classList.add('leaving'), 3200);
  setTimeout(() => item.remove(), 3700);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function modeInfo(mode: ModeId) {
  return MODES.find((m) => m.id === mode)!;
}

function shareText(setup: GameSetup, results: RoundResult[], total: number): string {
  const label = setup.mode === 'jour' && setup.seedKey ? `Défi du ${formatDay(setup.seedKey)}` : modeInfo(setup.mode).title;
  const emojis = results.map((r) => ratingFor(r.points).emoji).join('');
  return `Krazy Map · ${label}\n${emojis} ${formatNumber(total)} / ${formatNumber(setup.maxScore)} pts\n${location.origin}${location.pathname}`;
}

export function startApp(root: HTMLElement): void {
  let profile: Profile = loadProfile();
  let game: Game | null = null;
  let map: MapHandle | null = null;
  let guess: LonLat | null = null;
  let hintsUsed = 0;
  let validated = false;
  let roundStartedAt = 0;
  let timer: number | null = null;
  let selectedCategorie: Categorie | undefined;
  let keyHandler: ((event: KeyboardEvent) => void) | null = null;

  const setKeys = (handler: ((event: KeyboardEvent) => void) | null) => {
    if (keyHandler) window.removeEventListener('keydown', keyHandler);
    keyHandler = handler;
    if (handler) window.addEventListener('keydown', handler);
  };

  const teardown = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
    map?.destroy();
    map = null;
    setKeys(null);
  };

  const render = (html: string) => {
    teardown();
    root.innerHTML = html;
    window.scrollTo({ top: 0 });
  };

  const bind = (action: string, handler: (button: HTMLButtonElement) => void) => {
    root.querySelectorAll<HTMLButtonElement>(`[data-action="${action}"]`).forEach((button) =>
      button.addEventListener('click', () => handler(button)),
    );
  };

  /* ---------- Accueil ---------- */

  const showHome = () => {
    game = null;
    const today = dayKey();
    const daily = profile.daily[today];
    const streak = dailyStreak(profile);
    const discovered = profile.discovered.filter((id) => ANECDOTES.some((a) => a.id === id)).length;

    const categoryChips = [
      `<button type="button" class="chip${selectedCategorie ? '' : ' active'}" data-action="categorie" data-categorie="">Tous les thèmes</button>`,
      ...(Object.entries(CATEGORIES) as [Categorie, (typeof CATEGORIES)[Categorie]][]).map(
        ([id, cat]) =>
          `<button type="button" class="chip${selectedCategorie === id ? ' active' : ''}" data-action="categorie" data-categorie="${id}">${cat.emoji} ${cat.label}</button>`,
      ),
    ].join('');

    const modeCards = MODES.map((mode) => {
      const best = profile.bestByMode[mode.id];
      let extra = best ? `<span class="mode-best">Record : ${formatNumber(best)} pts</span>` : '<span class="mode-best">Pas encore joué</span>';
      if (mode.id === 'jour' && daily) {
        extra = `<span class="mode-best done">✓ Fait aujourd’hui · ${formatNumber(daily.score)} pts ${daily.emojis}</span>`;
      }
      return `
        <article class="mode-card mode-${mode.id}">
          <div class="mode-head">
            <span class="mode-emoji" aria-hidden="true">${mode.emoji}</span>
            <div>
              <h2>${mode.title}</h2>
              <p>${mode.description}</p>
            </div>
          </div>
          ${mode.id === 'classique' ? `<div class="chips" role="group" aria-label="Thème">${categoryChips}</div>` : ''}
          <div class="mode-foot">
            ${extra}
            <button type="button" class="primary" data-action="play" data-mode="${mode.id}">${mode.id === 'jour' && daily ? 'Rejouer' : 'Jouer'}</button>
          </div>
        </article>`;
    }).join('');

    render(`
      <main class="screen home">
        <header class="brand">
          <span class="logo" aria-hidden="true">📍</span>
          <div>
            <h1>Krazy Map</h1>
            <p class="tagline">Une anecdote, un point sur la carte. Jusqu’où connaissez-vous la France ?</p>
          </div>
        </header>

        <section class="profile-strip" aria-label="Votre progression">
          <div class="stat"><strong>${profile.gamesPlayed}</strong><span>parties</span></div>
          <div class="stat"><strong>${discovered}<small>/${ANECDOTES.length}</small></strong><span>anecdotes</span>
            <div class="bar"><i style="width:${(discovered / ANECDOTES.length) * 100}%"></i></div></div>
          <div class="stat"><strong>${profile.achievements.length}<small>/${ACHIEVEMENTS.length}</small></strong><span>succès</span></div>
          <div class="stat"><strong>${streak > 0 ? '🔥 ' : ''}${streak}</strong><span>jours d’affilée</span></div>
        </section>

        <section class="modes">${modeCards}</section>

        <div class="home-actions">
          <button type="button" data-action="carnet">📔 Carnet de voyage</button>
          <button type="button" data-action="rules">❓ Comment jouer</button>
        </div>
      </main>`);

    bind('play', (button) => startGame(button.dataset.mode as ModeId));
    bind('carnet', showCarnet);
    bind('rules', showRules);
    bind('categorie', (button) => {
      selectedCategorie = (button.dataset.categorie || undefined) as Categorie | undefined;
      root.querySelectorAll('[data-action="categorie"]').forEach((chip) => chip.classList.toggle('active', chip === button));
    });
  };

  /* ---------- Règles ---------- */

  const showRules = () => {
    render(`
      <main class="screen page">
        <header class="page-head">
          <button type="button" class="ghost" data-action="home">← Accueil</button>
          <h1>Comment jouer</h1>
        </header>
        <section class="card prose">
          <h2>Le principe</h2>
          <p>Lisez l’anecdote, puis cliquez sur la carte là où vous pensez qu’elle s’est déroulée. Plus votre point est proche, plus vous gagnez de points : jusqu’à ${formatNumber(MAX_POINTS_PER_ROUND)} par manche.</p>
          <h2>Les indices</h2>
          <p>Bloqué ? Demandez la <strong>région</strong> (${percent(HINT_MULTIPLIERS[1])} sur la manche), puis le <strong>département</strong> (${percent(HINT_MULTIPLIERS[2])}). La carte se recentre sur la zone indiquée.</p>
          <h2>Les modes</h2>
          <ul>${MODES.map((m) => `<li><strong>${m.emoji} ${m.title}</strong> — ${m.description}</li>`).join('')}</ul>
          <h2>La carte</h2>
          <ul>
            <li>Molette, pincement ou boutons <kbd>+</kbd> <kbd>−</kbd> pour zoomer, <kbd>0</kbd> pour revenir à la vue d’ensemble.</li>
            <li>Glissez pour déplacer la carte (ou flèches du clavier).</li>
            <li><kbd>Entrée</kbd> pour valider ou passer à la suite, <kbd>H</kbd> pour un indice.</li>
          </ul>
          <h2>Les notes</h2>
          <ul>
            <li>🟩 Dans le mille / Excellent — 70 % des points ou plus</li>
            <li>🟨 Bien vu — 45 % ou plus</li>
            <li>🟧 Pas loin — 15 % ou plus</li>
            <li>🟥 Raté — moins de 15 %</li>
          </ul>
        </section>
      </main>`);
    bind('home', showHome);
  };

  /* ---------- Carnet de voyage ---------- */

  const showCarnet = () => {
    const seen = new Set(profile.discovered);
    const achievements = ACHIEVEMENTS.map((a) => {
      const unlocked = profile.achievements.includes(a.id);
      return `<li class="achievement${unlocked ? ' unlocked' : ''}">
        <span class="achievement-emoji" aria-hidden="true">${unlocked ? a.emoji : '🔒'}</span>
        <span><strong>${a.title}</strong><small>${a.description}</small></span>
      </li>`;
    }).join('');

    const categories = (Object.entries(CATEGORIES) as [Categorie, (typeof CATEGORIES)[Categorie]][]).map(([id, cat]) => {
      const list = ANECDOTES.filter((a) => a.categorie === id);
      const found = list.filter((a) => seen.has(a.id));
      const items = list
        .map((a) =>
          seen.has(a.id)
            ? `<li class="found"><strong>${escapeHtml(a.titre)}</strong><small>${escapeHtml(a.lieu)}</small></li>`
            : '<li class="unknown"><strong>???</strong><small>À découvrir</small></li>',
        )
        .join('');
      return `<details class="card collection"${found.length ? ' open' : ''}>
        <summary>${cat.emoji} ${cat.label} <span>${found.length} / ${list.length}</span></summary>
        <ul class="discoveries">${items}</ul>
      </details>`;
    }).join('');

    const records = MODES.map(
      (m) => `<li><span>${m.emoji} ${m.title}</span><strong>${profile.bestByMode[m.id] ? `${formatNumber(profile.bestByMode[m.id]!)} pts` : '—'}</strong></li>`,
    ).join('');

    render(`
      <main class="screen page">
        <header class="page-head">
          <button type="button" class="ghost" data-action="home">← Accueil</button>
          <h1>Carnet de voyage</h1>
        </header>
        <section class="card">
          <h2>Records</h2>
          <ul class="records">${records}</ul>
        </section>
        <section class="card">
          <h2>Succès <span class="muted">${profile.achievements.length} / ${ACHIEVEMENTS.length}</span></h2>
          <ul class="achievements">${achievements}</ul>
        </section>
        <h2 class="section-title">Anecdotes découvertes <span class="muted">${seen.size} / ${ANECDOTES.length}</span></h2>
        ${categories}
        <button type="button" class="danger" data-action="reset">Effacer ma progression</button>
      </main>`);
    bind('home', showHome);
    bind('reset', () => {
      if (!confirm('Effacer définitivement vos records, succès et anecdotes découvertes ?')) return;
      profile = emptyProfile();
      saveProfile(profile);
      showCarnet();
    });
  };

  /* ---------- Partie ---------- */

  const startGame = (mode: ModeId) => {
    game = { setup: buildGame(mode, { categorie: selectedCategorie }), index: 0, results: [] };
    showRound();
  };

  const totalScore = () => game?.results.reduce((sum, r) => sum + r.points, 0) ?? 0;

  const progressDots = () => {
    if (!game) return '';
    return game.setup.rounds
      .map((_, i) => {
        const result = game!.results[i];
        const cls = result ? `done tone-${ratingFor(result.points).tone}` : i === game!.index ? 'current' : '';
        return `<i class="${cls}"></i>`;
      })
      .join('');
  };

  const maxHints = () => (game?.setup.rounds[game.index].wholeDepartement ? 1 : 2);

  const hintButtonLabel = () => {
    if (hintsUsed >= maxHints()) return 'Plus d’indice';
    const multiplier = HINT_MULTIPLIERS[hintsUsed + 1];
    return `💡 ${hintsUsed === 0 ? 'Région' : 'Département'} <small>${percent(multiplier)}</small>`;
  };

  const showRound = () => {
    if (!game) return;
    const { setup } = game;
    const round = setup.rounds[game.index];
    guess = null;
    hintsUsed = 0;
    validated = false;
    const isDepartements = round.wholeDepartement;

    render(`
      <main class="screen round${isDepartements ? ' round-departements' : ''}">
        <header class="hud">
          <button type="button" class="ghost icon" data-action="quit" aria-label="Quitter la partie" title="Quitter">✕</button>
          <div class="hud-center">
            <span class="hud-mode">${modeInfo(setup.mode).emoji} ${modeInfo(setup.mode).title} · ${game.index + 1}/${setup.rounds.length}</span>
            <div class="dots" aria-hidden="true">${progressDots()}</div>
          </div>
          <span class="hud-score"><strong data-score>${formatNumber(totalScore())}</strong> pts</span>
          ${setup.timeLimit ? '<div class="timer" role="timer"><i></i><span></span></div>' : ''}
        </header>
        <div class="round-body">
          <aside class="card prompt">
            <span class="kicker">${escapeHtml(round.kicker)}</span>
            <h2 class="${isDepartements ? 'departement-name' : ''}">${escapeHtml(round.titre)}</h2>
            <p class="texte">${escapeHtml(round.texte)}</p>
            <p class="question">${escapeHtml(round.question)}</p>
            <div class="hint-zone">
              <button type="button" class="hint" data-action="hint">${hintButtonLabel()}</button>
              <ul class="hint-list"></ul>
            </div>
            <div class="reveal" hidden aria-live="polite"></div>
            <div class="prompt-actions">
              <p class="feedback" aria-live="polite">Touchez la carte pour placer votre point.</p>
              <button type="button" class="primary" data-action="validate" disabled>Valider</button>
            </div>
          </aside>
          <div class="map-slot"></div>
        </div>
      </main>`);

    map = createMap({ onPick, showNames: !isDepartements });
    root.querySelector<HTMLElement>('.map-slot')!.append(map.element);

    bind('validate', onPrimary);
    bind('hint', useHint);
    bind('quit', () => {
      if (game && game.results.length > 0 && !confirm('Quitter la partie en cours ? Votre score sera perdu.')) return;
      showHome();
    });
    setKeys((event) => {
      if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        onPrimary();
      } else if ((event.key === 'h' || event.key === 'H') && !validated) {
        useHint();
      }
    });

    roundStartedAt = performance.now();
    if (setup.timeLimit) startTimer(setup.timeLimit);
  };

  const startTimer = (limit: number) => {
    const bar = root.querySelector<HTMLElement>('.timer i')!;
    const label = root.querySelector<HTMLElement>('.timer span')!;
    const container = root.querySelector<HTMLElement>('.timer')!;
    const tick = () => {
      const remaining = Math.max(0, limit - (performance.now() - roundStartedAt) / 1000);
      bar.style.width = `${(remaining / limit) * 100}%`;
      label.textContent = `${Math.ceil(remaining)} s`;
      container.classList.toggle('urgent', remaining <= 5);
      if (remaining <= 0) {
        if (timer !== null) clearInterval(timer);
        timer = null;
        validate(true);
      }
    };
    tick();
    timer = window.setInterval(tick, 100);
  };

  const onPick = (position: LonLat) => {
    if (validated || !map) return;
    guess = position;
    map.setGuess(position);
    root.querySelector<HTMLButtonElement>('[data-action="validate"]')!.disabled = false;
    root.querySelector<HTMLElement>('.feedback')!.textContent = 'Point placé. Touchez ailleurs pour le déplacer, ou validez.';
  };

  const useHint = () => {
    if (!game || !map || validated || hintsUsed >= maxHints()) return;
    const round = game.setup.rounds[game.index];
    hintsUsed += 1;
    const list = root.querySelector<HTMLElement>('.hint-list')!;
    if (hintsUsed === 1) {
      const region = regionOf(round.departementCode);
      list.insertAdjacentHTML('beforeend', `<li>Région : <strong>${escapeHtml(region)}</strong></li>`);
      map.highlight(departementsOfRegion(region), 'hint-region');
    } else {
      const dep = departementByCode(round.departementCode)!;
      list.insertAdjacentHTML('beforeend', `<li>Département : <strong>${escapeHtml(dep.nom)} (${dep.code})</strong></li>`);
      map.highlight([dep.code], 'hint-departement');
    }
    const button = root.querySelector<HTMLButtonElement>('[data-action="hint"]')!;
    button.innerHTML = hintButtonLabel();
    button.disabled = hintsUsed >= maxHints();
  };

  const onPrimary = () => {
    if (!game) return;
    if (!validated) validate(false);
    else if (game.results.length === game.setup.rounds.length) showResult();
    else {
      game.index += 1;
      showRound();
    }
  };

  const validate = (timeUp: boolean) => {
    if (!game || !map || validated || (!guess && !timeUp)) return;
    if (timer !== null) clearInterval(timer);
    timer = null;
    validated = true;

    const round = game.setup.rounds[game.index];
    const seconds = (performance.now() - roundStartedAt) / 1000;
    const before = totalScore();
    const result = evaluateGuess(round, guess, hintsUsed, seconds);
    game.results.push(result);
    const rating = ratingFor(result.points);

    map.lock();
    void map.reveal({ answer: round.answer, guess, departementCode: round.departementCode, wholeDepartement: round.wholeDepartement });

    countUp(root.querySelector<HTMLElement>('[data-score]')!, before, totalScore());
    root.querySelector<HTMLElement>('.dots')!.innerHTML = progressDots();
    root.querySelector<HTMLElement>('.hint-zone')!.hidden = true;
    root.querySelector<HTMLElement>('.feedback')!.textContent = '';
    root.querySelector<HTMLElement>('.prompt')!.classList.add('revealed');

    let distance: string;
    if (result.distanceKm === null) distance = timeUp ? '⏰ Temps écoulé !' : 'Pas de réponse';
    else if (round.wholeDepartement) distance = result.distanceKm === 0 ? 'En plein dans le département' : `À ${formatKm(result.distanceKm)} de la frontière`;
    else distance = `À ${formatKm(result.distanceKm)}`;

    const badges = [
      !round.wholeDepartement && result.inDepartement ? '<span class="badge">✓ Bon département</span>' : '',
      result.hintsUsed > 0 ? `<span class="badge muted">💡 ${result.hintsUsed} indice${result.hintsUsed > 1 ? 's' : ''} (${percent(HINT_MULTIPLIERS[result.hintsUsed])})</span>` : '',
    ].join('');

    const reveal = root.querySelector<HTMLElement>('.reveal')!;
    reveal.hidden = false;
    reveal.innerHTML = `
      <div class="rating tone-${rating.tone}">
        <span class="rating-label">${rating.label}</span>
        <span class="rating-points">+<span data-round-points>0</span></span>
      </div>
      <p class="lieu">📍 <strong>${escapeHtml(round.lieu)}</strong></p>
      <p class="distance">${distance}</p>
      ${badges ? `<p class="badges">${badges}</p>` : ''}
      <p class="revelation">${escapeHtml(round.revelation)}</p>`;
    countUp(reveal.querySelector<HTMLElement>('[data-round-points]')!, 0, result.points, 900);

    const isLast = game.results.length === game.setup.rounds.length;
    const button = root.querySelector<HTMLButtonElement>('[data-action="validate"]')!;
    button.disabled = false;
    button.textContent = isLast ? 'Voir le résultat →' : 'Manche suivante →';
    button.focus({ preventScroll: true });
  };

  /* ---------- Résultat ---------- */

  const recordGame = (setup: GameSetup, results: RoundResult[], total: number) => {
    const previousBest = profile.bestByMode[setup.mode] ?? 0;
    const today = setup.seedKey;
    const isOfficialDaily = setup.mode === 'jour' && !!today && !profile.daily[today];

    profile.gamesPlayed += 1;
    profile.bestByMode[setup.mode] = Math.max(previousBest, total);
    for (const r of results) {
      if (r.round.anecdoteId && !profile.discovered.includes(r.round.anecdoteId)) profile.discovered.push(r.round.anecdoteId);
    }
    if (isOfficialDaily) {
      profile.daily[today!] = { score: total, emojis: results.map((r) => ratingFor(r.points).emoji).join('') };
      profile.dailyCount += 1;
    }
    const unlocked = unlockedAchievements(
      {
        mode: setup.mode,
        results,
        total,
        maxScore: setup.maxScore,
        gamesPlayed: profile.gamesPlayed,
        dailyCount: profile.dailyCount,
        discoveredCount: profile.discovered.length,
      },
      profile.achievements,
    );
    profile.achievements.push(...unlocked.map((a) => a.id));
    saveProfile(profile);
    return { isRecord: total > previousBest && previousBest > 0, unlocked, isOfficialDaily };
  };

  const showResult = () => {
    if (!game) return;
    const { setup, results } = game;
    const total = totalScore();
    const { isRecord, unlocked, isOfficialDaily } = recordGame(setup, results, total);

    const rows = results
      .map((r, i) => {
        const rating = ratingFor(r.points);
        const detail =
          r.distanceKm === null
            ? 'pas de réponse'
            : r.round.wholeDepartement
              ? r.distanceKm === 0
                ? 'trouvé'
                : `${formatKm(r.distanceKm)} à côté`
              : formatKm(r.distanceKm);
        return `
          <li>
            <span class="row-index tone-${rating.tone}">${i + 1}</span>
            <span class="row-title">${escapeHtml(r.round.titre)}</span>
            <span class="row-detail">${escapeHtml(r.round.lieu)} · ${detail}${r.hintsUsed ? ` · 💡${r.hintsUsed}` : ''}</span>
            <span class="row-points">${formatNumber(r.points)}</span>
          </li>`;
      })
      .join('');

    const achievementsHtml = (list: Achievement[]) =>
      list.map((a) => `<li class="achievement unlocked new"><span class="achievement-emoji">${a.emoji}</span><span><strong>${a.title}</strong><small>${a.description}</small></span></li>`).join('');

    const dailyNote =
      setup.mode === 'jour' && !isOfficialDaily ? '<p class="muted">Défi déjà joué aujourd’hui : ce score ne remplace pas le premier.</p>' : '';

    render(`
      <main class="screen result">
        <header class="result-head">
          <span class="kicker">${modeInfo(setup.mode).emoji} ${modeInfo(setup.mode).title}${setup.categorie ? ` · ${CATEGORIES[setup.categorie].label}` : ''}${setup.seedKey ? ` · ${formatDay(setup.seedKey)}` : ''}</span>
          <h1>${rankFor(total, setup.maxScore)}</h1>
          <p class="final-score"><strong data-final>0</strong> <span>/ ${formatNumber(setup.maxScore)} pts</span></p>
          <p class="emoji-line" aria-hidden="true">${results.map((r) => ratingFor(r.points).emoji).join(' ')}</p>
          ${isRecord ? '<p class="record">🏆 Nouveau record !</p>' : ''}
          ${dailyNote}
        </header>
        ${unlocked.length ? `<section class="card"><h2>Nouveaux succès</h2><ul class="achievements">${achievementsHtml(unlocked)}</ul></section>` : ''}
        <div class="result-grid">
          <div class="summary-map"></div>
          <ol class="recap">${rows}</ol>
        </div>
        <div class="actions">
          <button type="button" class="primary" data-action="replay">Rejouer</button>
          <button type="button" data-action="share">Partager</button>
          <button type="button" data-action="home">Accueil</button>
        </div>
      </main>`);

    countUp(root.querySelector<HTMLElement>('[data-final]')!, 0, total, 1200);
    map = createMap({ interactive: false });
    root.querySelector<HTMLElement>('.summary-map')!.append(map.element);
    map.showSummary(results.map((r) => ({ answer: r.round.answer, guess: r.guess, tone: ratingFor(r.points).tone })));
    unlocked.forEach((a, i) => setTimeout(() => toast(`${a.emoji} Succès débloqué : <strong>${a.title}</strong>`), 600 + i * 400));

    bind('replay', () => startGame(setup.mode));
    bind('home', showHome);
    bind('share', async () => {
      const text = shareText(setup, results, total);
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        try {
          await navigator.share({ text });
          return;
        } catch {
          // Partage annulé : on se rabat sur le presse-papiers.
        }
      }
      toast((await copyText(text)) ? '📋 Résultat copié dans le presse-papiers' : 'Impossible de copier le résultat');
    });
    setKeys((event) => {
      if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) startGame(setup.mode);
    });
  };

  showHome();
}
