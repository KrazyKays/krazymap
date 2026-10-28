# Krazy Map

Krazy Map est un jeu de géographie : une anecdote locale s'affiche (un événement historique, un paysage, un monument, une spécialité), et vous la placez sur la carte de France. Plus votre point est proche du lieu, plus vous marquez de points.

Application statique : aucun serveur, aucune clé API, aucun compte requis. La carte est un SVG des départements, sans tuiles externes.

## Installation et lancement

Prérequis : Node.js 22 (ou 20+) et npm.

```bash
npm install          # installe les dépendances
npm run dev          # serveur de développement sur http://localhost:5173
npm test             # tests unitaires (Vitest)
npm run build        # vérification TypeScript puis build de production dans dist/
npm run preview      # sert le build localement
```

## Modes de jeu

| Mode | Manches | Particularité |
|---|---|---|
| 🗺️ Classique | 5 anecdotes | Thème au choix : Histoire, Nature, Patrimoine, Terroir, ou tous |
| 📅 Défi du jour | 5 anecdotes | Le même tirage pour tout le monde, selon la date. Seule la première partie du jour compte |
| ⏱️ Contre-la-montre | 5 anecdotes | 30 secondes par manche. À zéro, le point placé est validé (ou 0 point) |
| 🧩 Départements | 10 départements | Carte muette : un clic dans le département rapporte le maximum, à côté au plus 80 % |

## Règles et score

- Jusqu'à 5 000 points par manche, qui décroissent avec la distance (`5000 × e^(−distance / 150 km)`).
- **Indices** : la région (−30 % sur la manche), puis le département (−60 %). La carte se recentre et met la zone en surbrillance. En mode Départements, seule la région est proposée.
- **Notes** : 🟩 Dans le mille / Excellent (≥ 70 %), 🟨 Bien vu (≥ 45 %), 🟧 Pas loin (≥ 15 %), 🟥 Raté.
- **Rang** en fin de partie selon le pourcentage du score maximal, de « Voyageur égaré » à « Cartographe légendaire ».
- **Partager** copie un résumé façon Wordle (cases de couleur et score), ou ouvre le partage natif sur mobile.

## Carte et commandes

- Clic ou toucher : placer / déplacer son point.
- Molette, pincement ou boutons `+` `−` : zoom. Glisser ou flèches du clavier : déplacer. `0` : vue d'ensemble.
- `Entrée` : valider puis passer à la manche suivante. `H` : demander un indice.
- Au survol (souris), le nom du département s'affiche, sauf en mode Départements.
- Thème clair ou sombre selon le système. Les animations sont désactivées si « réduire les animations » est activé.

## Progression

Le **Carnet de voyage** rassemble :

- les records par mode ;
- 11 succès à débloquer (premier « Dans le mille » à moins de 10 km, partie sans indice, 7 défis du jour, 8 départements trouvés en une partie, toutes les anecdotes découvertes, etc.) ;
- la collection des anecdotes découvertes, par thème.

Tout est enregistré dans le `localStorage` du navigateur, sous la clé `krazymap:v3`. Le record et le nombre de parties de l'ancienne clé `krazymap:v2` sont repris automatiquement. Une partie en cours n'est pas sauvegardée.

## Contenu

- `src/data/anecdotes.ts` : 124 anecdotes réparties en 4 thèmes, sur toute la métropole et la Corse. Chaque anecdote a un titre, un texte qui ne nomme pas le lieu, le lieu, une révélation affichée après la réponse et des coordonnées.
- `src/data/departements.json` : contours simplifiés des 96 départements. `src/data/departements.ts` y ajoute les 13 régions.

Pour ajouter une anecdote, ajoutez une entrée dans `ANECDOTES`. Les tests vérifient qu'elle tombe bien dans le département indiqué entre parenthèses dans `lieu`.

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` exécute les tests, puis le build et le déploiement à chaque push sur `main` (ou manuellement via `workflow_dispatch`). Le chemin de base de l'application est déduit du nom du dépôt.

Configuration à faire une seule fois dans le dépôt GitHub : **Settings → Pages → Source : GitHub Actions**.

L'adresse publiée est alors `https://<utilisateur>.github.io/<nom-du-dépôt>/`.

Aucun secret n'est nécessaire pour le déploiement.

## Structure du projet

```
src/
├── main.ts                 point d'entrée
├── app.ts                  écrans (accueil, manche, résultat, carnet, règles) et déroulement d'une partie
├── storage.ts              profil du joueur (localStorage, validation, migration)
├── styles.css
├── data/
│   ├── anecdotes.ts        anecdotes et thèmes
│   ├── departements.json   contours des départements
│   └── departements.ts     régions, recherche du département d'un point
├── game/
│   ├── config.ts           constantes (manches, points, chrono, indices)
│   ├── modes.ts            modes de jeu et construction des manches
│   ├── evaluate.ts         calcul du score d'une réponse
│   ├── scoring.ts          distance, points, notes et rangs
│   ├── achievements.ts     succès
│   ├── random.ts           aléatoire à graine (défi du jour)
│   └── rounds.ts           tirage sans remise
├── geo/
│   ├── projection.ts       projection lon/lat vers le plan de la carte
│   └── geometry.ts         point dans un polygone, distance au contour, centre
└── ui/map.ts               carte SVG : zoom, déplacement, indices, révélation animée, carte récapitulative
```

La logique de jeu (`src/game/`, `src/geo/`, `src/data/`) ne dépend pas du DOM et est testée dans les fichiers `*.test.ts`.
