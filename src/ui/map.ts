import { DEPARTEMENTS } from '../data/departements';
import { geometryToPath, MAP_VIEWBOX, project, unproject, type LonLat } from '../geo/projection';

const NS = 'http://www.w3.org/2000/svg';
const MARKER_RADIUS = 0.085;
const MAX_ZOOM = 12;
const DRAG_THRESHOLD_PX = 6;

interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RevealOptions {
  answer: LonLat;
  guess: LonLat | null;
  departementCode: string;
  /** Mode Départements : on met en valeur toute la surface plutôt qu'un point. */
  wholeDepartement: boolean;
}

export interface SummaryItem {
  answer: LonLat;
  guess: LonLat | null;
  tone: string;
}

export interface MapHandle {
  element: HTMLElement;
  setGuess(position: LonLat): void;
  highlight(codes: string[], className: 'hint-region' | 'hint-departement'): void;
  reveal(options: RevealOptions): Promise<void>;
  showSummary(items: SummaryItem[]): void;
  lock(): void;
  destroy(): void;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function animate(duration: number, step: (t: number) => void): Promise<void> {
  if (prefersReducedMotion()) {
    step(1);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      step(easeInOut(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

export function createMap(options: { onPick?: (position: LonLat) => void; showNames?: boolean; interactive?: boolean } = {}): MapHandle {
  const interactive = options.interactive ?? true;
  const full: View = { x: MAP_VIEWBOX.x, y: MAP_VIEWBOX.y, w: MAP_VIEWBOX.width, h: MAP_VIEWBOX.height };
  let view: View = { ...full };

  const wrapper = document.createElement('div');
  wrapper.className = 'map-wrapper';

  const svg = el('svg', {
    class: 'map',
    role: 'img',
    'aria-label': 'Carte de la France métropolitaine',
    preserveAspectRatio: 'xMidYMid meet',
  });
  if (!interactive) svg.classList.add('static');

  const departements = el('g', { class: 'departements' });
  const paths = new Map<string, SVGPathElement>();
  for (const dep of DEPARTEMENTS) {
    const path = el('path', { class: 'departement', d: geometryToPath(dep), 'data-code': dep.code });
    if (options.showNames) path.dataset.nom = dep.nom;
    paths.set(dep.code, path);
    departements.append(path);
  }

  const answerLayer = el('g', { class: 'layer-answer' });
  const guessLayer = el('g', { class: 'layer-guess' });
  svg.append(departements, answerLayer, guessLayer);
  wrapper.append(svg);

  const markers = new Set<SVGCircleElement>();
  const labels = new Set<SVGTextElement>();
  const scale = () => view.w / full.w;
  const refreshSizes = () => {
    const s = scale();
    for (const m of markers) m.setAttribute('r', String(MARKER_RADIUS * Number(m.dataset.size ?? 1) * s));
    for (const t of labels) t.setAttribute('font-size', String(MARKER_RADIUS * 2.4 * s));
  };

  const marker = (className: string, position: LonLat, size = 1) => {
    const { x, y } = project(position);
    const circle = el('circle', { class: className, cx: x, cy: y });
    circle.dataset.size = String(size);
    markers.add(circle);
    return circle;
  };

  const clampView = (v: View): View => {
    const w = Math.min(full.w, Math.max(full.w / MAX_ZOOM, v.w));
    const h = (w * full.h) / full.w;
    const x = Math.min(full.x + full.w - w, Math.max(full.x, v.x));
    const y = Math.min(full.y + full.h - h, Math.max(full.y, v.y));
    return { x, y, w, h };
  };

  const applyView = (v: View) => {
    view = clampView(v);
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    refreshSizes();
    wrapper.classList.toggle('zoomed', view.w < full.w * 0.98);
  };
  applyView(view);

  const animateTo = (target: View, duration = 550) => {
    const from = { ...view };
    const to = clampView(target);
    return animate(duration, (t) =>
      applyView({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        w: from.w + (to.w - from.w) * t,
        h: from.h + (to.h - from.h) * t,
      }),
    );
  };

  /** Cadre la vue sur une boîte (en coordonnées de carte), avec une marge et une largeur minimale. */
  const fitBox = (minX: number, minY: number, maxX: number, maxY: number, minWidth = full.w / 4) => {
    const pad = 0.35;
    let w = Math.max((maxX - minX) * (1 + pad * 2), ((maxY - minY) * (1 + pad * 2) * full.w) / full.h, minWidth);
    w = Math.min(w, full.w);
    const h = (w * full.h) / full.w;
    return animateTo({ x: (minX + maxX) / 2 - w / 2, y: (minY + maxY) / 2 - h / 2, w, h });
  };

  const zoomAround = (factor: number, cx: number, cy: number, base: View = view) => {
    const w = Math.min(full.w, Math.max(full.w / MAX_ZOOM, base.w * factor));
    const ratio = w / base.w;
    applyView({ x: cx - (cx - base.x) * ratio, y: cy - (cy - base.y) * ratio, w, h: (w * full.h) / full.w });
  };

  const toLocal = (clientX: number, clientY: number, matrix = svg.getScreenCTM()) => {
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  };

  let locked = false;
  const cleanups: (() => void)[] = [];

  if (interactive) {
    // Zoom et déplacement : molette, glisser, pincer, et boutons.
    const controls = document.createElement('div');
    controls.className = 'map-controls';
    controls.innerHTML = `
      <button type="button" data-zoom="in" aria-label="Zoomer" title="Zoomer (+)">+</button>
      <button type="button" data-zoom="out" aria-label="Dézoomer" title="Dézoomer (−)">−</button>
      <button type="button" data-zoom="reset" aria-label="Vue d'ensemble" title="Vue d'ensemble (0)">⤢</button>`;
    controls.addEventListener('click', (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-zoom]')?.dataset.zoom;
      const cx = view.x + view.w / 2;
      const cy = view.y + view.h / 2;
      if (action === 'in') zoomAround(1 / 1.6, cx, cy);
      if (action === 'out') zoomAround(1.6, cx, cy);
      if (action === 'reset') void animateTo(full, 350);
    });

    const hover = document.createElement('div');
    hover.className = 'map-hover';
    hover.hidden = true;
    wrapper.append(controls, hover);

    svg.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        const local = toLocal(event.clientX, event.clientY);
        if (!local) return;
        zoomAround(Math.exp(event.deltaY * 0.0018), local.x, local.y);
      },
      { passive: false },
    );

    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; view: View; matrix: DOMMatrix | null; moved: boolean } | null = null;
    let pinch: { distance: number; center: { x: number; y: number }; view: View } | null = null;

    const pinchState = () => {
      const [a, b] = [...pointers.values()];
      const center = toLocal((a.x + b.x) / 2, (a.y + b.y) / 2);
      return center ? { distance: Math.hypot(a.x - b.x, a.y - b.y), center, view: { ...view } } : null;
    };

    svg.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      svg.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        drag = { x: event.clientX, y: event.clientY, view: { ...view }, matrix: svg.getScreenCTM(), moved: false };
      } else if (pointers.size === 2) {
        pinch = pinchState();
        if (drag) drag.moved = true;
      }
    });

    svg.addEventListener('pointermove', (event) => {
      if (options.showNames && event.pointerType === 'mouse') {
        const nom = (event.target as Element).closest<SVGPathElement>('.departement')?.dataset.nom;
        hover.hidden = !nom;
        if (nom) hover.textContent = nom;
      }
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 0) zoomAround(pinch.distance / distance, pinch.center.x, pinch.center.y, pinch.view);
        return;
      }
      if (drag && pointers.size === 1) {
        if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_THRESHOLD_PX) return;
        drag.moved = true;
        svg.classList.add('dragging');
        const start = toLocal(drag.x, drag.y, drag.matrix);
        const now = toLocal(event.clientX, event.clientY, drag.matrix);
        if (start && now) applyView({ ...drag.view, x: drag.view.x - (now.x - start.x), y: drag.view.y - (now.y - start.y) });
      }
    });

    const release = (event: PointerEvent, canceled: boolean) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        if (drag && !drag.moved && !canceled && !locked && options.onPick) {
          const local = toLocal(event.clientX, event.clientY);
          if (local) options.onPick(unproject(local));
        }
        drag = null;
        svg.classList.remove('dragging');
      }
    };
    svg.addEventListener('pointerup', (event) => release(event, false));
    svg.addEventListener('pointercancel', (event) => release(event, true));
    svg.addEventListener('pointerleave', () => {
      hover.hidden = true;
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.altKey || event.ctrlKey || event.metaKey) return;
      const cx = view.x + view.w / 2;
      const cy = view.y + view.h / 2;
      const step = view.w * 0.15;
      const moves: Record<string, () => void> = {
        '+': () => zoomAround(1 / 1.6, cx, cy),
        '=': () => zoomAround(1 / 1.6, cx, cy),
        '-': () => zoomAround(1.6, cx, cy),
        '0': () => void animateTo(full, 350),
        ArrowLeft: () => applyView({ ...view, x: view.x - step }),
        ArrowRight: () => applyView({ ...view, x: view.x + step }),
        ArrowUp: () => applyView({ ...view, y: view.y - step }),
        ArrowDown: () => applyView({ ...view, y: view.y + step }),
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        move();
      }
    };
    window.addEventListener('keydown', onKey);
    cleanups.push(() => window.removeEventListener('keydown', onKey));
  }

  const boxOfCodes = (codes: string[]) => {
    let box: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
    for (const code of codes) {
      const path = paths.get(code);
      if (!path) continue;
      const b = path.getBBox();
      box = box
        ? {
            minX: Math.min(box.minX, b.x),
            minY: Math.min(box.minY, b.y),
            maxX: Math.max(box.maxX, b.x + b.width),
            maxY: Math.max(box.maxY, b.y + b.height),
          }
        : { minX: b.x, minY: b.y, maxX: b.x + b.width, maxY: b.y + b.height };
    }
    return box;
  };

  return {
    element: wrapper,
    setGuess(position) {
      for (const m of guessLayer.querySelectorAll('circle')) markers.delete(m as SVGCircleElement);
      const pin = marker('marker marker-guess pop', position, 1);
      guessLayer.replaceChildren(pin);
      refreshSizes();
    },
    highlight(codes, className) {
      for (const code of codes) paths.get(code)?.classList.add(className);
      const box = boxOfCodes(codes);
      if (box) void fitBox(box.minX, box.minY, box.maxX, box.maxY, full.w / 6);
    },
    async reveal({ answer, guess, departementCode, wholeDepartement }) {
      paths.get(departementCode)?.classList.add(wholeDepartement ? 'answer-departement' : 'answer-area');
      const to = project(answer);
      const from = guess ? project(guess) : null;
      const xs = from ? [from.x, to.x] : [to.x];
      const ys = from ? [from.y, to.y] : [to.y];
      if (wholeDepartement) {
        const box = boxOfCodes([departementCode]);
        if (box) {
          xs.push(box.minX, box.maxX);
          ys.push(box.minY, box.maxY);
        }
      }
      await fitBox(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), full.w / 5);

      if (from && !wholeDepartement) {
        const line = el('line', { class: 'link', x1: from.x, y1: from.y, x2: from.x, y2: from.y });
        answerLayer.append(line);
        await animate(600, (t) => {
          line.setAttribute('x2', String(from.x + (to.x - from.x) * t));
          line.setAttribute('y2', String(from.y + (to.y - from.y) * t));
        });
      }
      if (!wholeDepartement) answerLayer.append(marker('marker marker-answer pop', answer, 1.15));
      refreshSizes();
    },
    showSummary(items) {
      answerLayer.replaceChildren();
      guessLayer.replaceChildren();
      markers.clear();
      labels.clear();
      const xs: number[] = [];
      const ys: number[] = [];
      items.forEach((item, index) => {
        const to = project(item.answer);
        xs.push(to.x);
        ys.push(to.y);
        if (item.guess) {
          const from = project(item.guess);
          xs.push(from.x);
          ys.push(from.y);
          answerLayer.append(el('line', { class: 'link', x1: from.x, y1: from.y, x2: to.x, y2: to.y }));
          guessLayer.append(marker('marker marker-guess', item.guess, 0.8));
        }
        guessLayer.append(marker(`marker marker-answer tone-${item.tone}`, item.answer, 1.9));
        const label = el('text', { class: 'marker-label', x: to.x, y: to.y });
        label.textContent = String(index + 1);
        labels.add(label);
        guessLayer.append(label);
      });
      applyView(full);
      void fitBox(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), full.w / 2.5);
    },
    lock() {
      locked = true;
      svg.classList.add('locked');
    },
    destroy() {
      cleanups.forEach((fn) => fn());
    },
  };
}
