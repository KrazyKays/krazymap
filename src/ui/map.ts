import departementsData from '../data/departements.json';
import { geometryToPath, MAP_VIEWBOX, project, unproject, type Geometry, type LonLat } from '../geo/projection';

type Departement = Geometry & {
  code: string;
  nom: string;
};

const NS = 'http://www.w3.org/2000/svg';
const MARKER_RADIUS = 0.07;
const DEPARTEMENTS = departementsData as Departement[];

export interface MapHandle {
  element: SVGSVGElement;
  setGuess(position: LonLat): void;
  reveal(answer: LonLat, guess: LonLat): void;
  lock(): void;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

function marker(className: string, position: LonLat): SVGCircleElement {
  const { x, y } = project(position);
  return el('circle', { class: className, cx: x, cy: y, r: MARKER_RADIUS });
}

export function createMap(onPick: (position: LonLat) => void): MapHandle {
  const svg = el('svg', {
    viewBox: `${MAP_VIEWBOX.x} ${MAP_VIEWBOX.y} ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`,
    class: 'map',
    role: 'img',
    'aria-label': 'Carte de la France métropolitaine',
  });

  const departements = el('g', { class: 'departements' });
  for (const dep of DEPARTEMENTS) {
    const path = el('path', {
      class: 'departement',
      d: geometryToPath(dep),
      'data-code': dep.code,
    });
    const title = el('title', {});
    title.textContent = dep.nom;
    path.append(title);
    departements.append(path);
  }

  const guessLayer = el('g', { class: 'layer-guess' });
  const answerLayer = el('g', { class: 'layer-answer' });
  svg.append(departements, answerLayer, guessLayer);

  let locked = false;

  svg.addEventListener('click', (event) => {
    if (locked) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    onPick(unproject({ x: local.x, y: local.y }));
  });

  return {
    element: svg,
    setGuess(position) {
      guessLayer.replaceChildren(marker('marker marker-guess', position));
    },
    reveal(answer, guess) {
      const from = project(guess);
      const to = project(answer);
      answerLayer.replaceChildren(
        el('line', { class: 'link', x1: from.x, y1: from.y, x2: to.x, y2: to.y }),
        marker('marker marker-answer', answer),
      );
    },
    lock() {
      locked = true;
    },
  };
}
