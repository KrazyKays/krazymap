# Krazy Map

Krazy Map est un jeu d'exploration géographique inspiré de Blindtrail. Vous partez d'une ville française, une ville cible est cachée, et vous devez la rejoindre avec une énergie limitée. La carte est couverte d'un brouillard de guerre qui ne se dissipe que sur votre passage. En chemin, des événements (mini-jeux, ravitaillements, révélations) apparaissent.

Application statique : aucun serveur, aucune clé API, aucun compte requis.

## Installation et lancement

Prérequis : Node.js 22 (ou 20+) et npm.

```bash
npm install          # installe les dépendances
npm run dev          # serveur de développement sur http://localhost:5173
npm test             # tests unitaires (Vitest)
npm run build        # vérification TypeScript puis build de production dans dist/
npm run preview      # sert le build localement
```

## Règles du jeu

- **Départ et cible** : deux villes tirées au hasard dans le catalogue de métropole, à une distance selon la difficulté. La cible est affichée par son nom, mais sa position n'apparaît sur la carte qu'une fois découverte (à moins de 4 km de votre trajet ou via une révélation).
- **Déplacement** : cliquez ou touchez la carte (segment de 30 km maximum), ou utilisez la rose des vents / les flèches du clavier (segments de 10 km). Il n'y a pas de téléportation : le trajet est parcouru pas à pas.
- **Énergie** : 1 unité par kilomètre parcouru. Le budget initial dépend de la difficulté.
- **Événements** : ils se trouvent surtout sur le couloir entre le départ et la cible, et parfois dans les zones voisines. Ils ne sont visibles qu'après découverte de leur emplacement, et votre trajet s'arrête à leur rencontre.
- **Mini-jeux** : quiz géographique, orientation, observation cartographique (villes à mémoriser pendant quelques secondes), défi de navigation (estimer la distance à vol d'oiseau). Une bonne réponse rapporte de l'énergie, une mauvaise en retire.
- **Ravitaillement** : ajoute de l'énergie, dans la limite du maximum. **Révélation** : découvre temporairement les environs pendant quelques déplacements.
- **Victoire** : atteindre la cible. **Défaite** : énergie épuisée ou abandon.

| Difficulté | Distance | Budget d'énergie | Événements | Multiplicateur de score |
|---|---|---|---|---|
| Facile | 150 à 300 km | distance × 1,6 | 6 | ×1 |
| Moyen | 300 à 500 km | distance × 1,4 | 8 | ×1,5 |
| Difficile | 500 à 800 km | distance × 1,25 | 10 | ×2 |

Score : +500 pour une victoire, +2 par unité d'énergie restante, +25 par événement résolu, +100 par bonne réponse, puis multiplié par la difficulté.

## Données et sauvegarde

- Le catalogue (`src/data/cities.ts`) contient environ 175 villes de France métropolitaine. La Corse n'est pas incluse. Les coordonnées sont approximatives et peuvent être affinées.
- Les paramètres (difficulté par défaut, vitesse d'animation) et les statistiques (parties, victoires, meilleurs temps et scores par difficulté) sont enregistrés dans le `localStorage` du navigateur, sous la clé `krazymap:v1`.
- La partie en cours n'est pas sauvegardée : recharger la page la termine.

## Carte et attribution

Le fond de carte utilise les tuiles standard d'OpenStreetMap (`https://tile.openstreetmap.org`), avec l'attribution « © OpenStreetMap contributors ».

**Attention à la politique d'usage** : les tuiles publiques d'OpenStreetMap sont réservées à un usage modéré. Elles n'ont pas vocation à servir un trafic important et ne doivent pas être utilisées pour des applications en production à forte fréquentation. Pour une diffusion publique, utilisez un fournisseur de tuiles adapté. Vous pouvez en changer sans modifier le code en définissant la variable d'environnement de build `VITE_TILE_URL` (modèle d'URL `{z}/{x}/{y}`). Si les tuiles ne se chargent pas, un message s'affiche et la partie reste jouable.

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` exécute les tests, puis le build et le déploiement à chaque push sur `main` (ou manuellement via `workflow_dispatch`). Le chemin de base de l'application est déduit du nom du dépôt.

Configuration à faire une seule fois dans le dépôt GitHub : **Settings → Pages → Source : GitHub Actions**.

L'adresse publiée est alors `https://<utilisateur>.github.io/<nom-du-dépôt>/`.

Aucun secret n'est nécessaire pour le déploiement.

## Structure du projet

```
src/
├── main.ts              point d'entrée
├── app.ts               contrôleur : flux de partie, déplacements animés, événements, statistiques
├── storage.ts           paramètres et statistiques (localStorage, validation des données)
├── styles.css
├── data/cities.ts       catalogue des villes
├── game/
│   ├── types.ts         types partagés
│   ├── config.ts        constantes et réglages par difficulté
│   ├── geo.ts           distances, caps, points de destination
│   ├── rng.ts           générateur pseudo-aléatoire à graine
│   ├── generation.ts    choix des villes et placement des événements
│   ├── minigames.ts     création et correction des mini-jeux
│   └── engine.ts        règles du jeu (sans DOM ni Leaflet)
├── map/mapView.ts       carte Leaflet, brouillard de guerre, marqueurs
└── ui/                  accueil, HUD, mini-jeux, dialogues
```

La logique de jeu (`src/game/`) est indépendante du DOM et de Leaflet, et testée dans `src/game/*.test.ts` et `src/storage.test.ts`.

## Limites connues

- Les coordonnées du catalogue sont à vérifier avant une diffusion large.
- Les tuiles OpenStreetMap ne sont pas adaptées à un trafic élevé (voir ci-dessus).
- Pas de mode hors ligne ni de classement en ligne.
