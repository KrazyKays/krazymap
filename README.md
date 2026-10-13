# Krazy Map - Jeu d'Exploration Géographique

**Krazy Map** est un jeu web inspiré du concept de Blindtrail, où le joueur doit rejoindre une ville cible en France métropolitaine depuis une ville de départ, avec une carte qui se révèle progressivement autour du joueur.

## 🎮 Fonctionnalités

### 🎯 Core Gameplay
- **Accueil** : Menu principal avec titre, bouton Nouvelle Partie et sélection de difficulté
- **Villes** : Catalogue local de 100+ villes françaises avec coordonnées
- **Carte** : Fond cartographique Leaflet avec brouillard de guerre opaque et révélation circulaire
- **Déplacement** : Déplacement par clic/toucher avec coût en énergie proportionnel à la distance
- **Événements** : Génération aléatoire d'événements (mini-jeux, ravitaillement, révélations)

### 🎲 Mini-jeux (4 types implémentés)
1. **Quiz Géographique** - Testez vos connaissances sur les villes françaises
2. **Défi d'Orientation** - Trouvez la bonne direction cardinal
3. **Observation Cartographique** - Identifiez la couleur d'une forme sur la carte
4. **Défi de Navigation** - Estimez la distance à parcourir

### 📊 Progression
- Énergie, distance parcourue, temps écoulé
- Score calculé dynamiquement
- Victoire/défaite avec écran de fin
- Statistiques locales sauvegardées

### 📱 Compatibilité
- **Responsive** : Adapté aux mobile et ordinateur
- **Sans backend** : Application statique, hébergement sur GitHub Pages
- **Sans clé API** : Utilise OpenStreetMap (tuiles gratuites)

## 🚀 Installation & Lancement

### Prérequis
- Node.js 18+ (recommandé: Node.js 20)
- npm ou yarn

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/ton-utilisateur/krazymap.git
cd krazymap

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Builder pour production
npm run build

# Prévisualiser le build
npm run preview
```

### Déploiement
Le jeu est configuré pour être déployé sur **GitHub Pages** :
1. Poussez votre code sur la branche `main` ou `master`
2. GitHub Actions détecte automatiquement les modifications
3. Le workflow `deploy.yml` build et déploie sur GitHub Pages

#### Configuration GitHub Pages
1. Allez dans **Settings** → **Pages** de votre dépôt GitHub
2. Sélectionnez **Source: GitHub Actions**
3. Activez GitHub Pages

Votre jeu sera disponible à l'adresse : `https://ton-utilisateur.github.io/krazymap/`

## 📁 Structure du Projet

```
krazymap/
├── public/
│   ├── favicon.svg
│   └── assets/
├── src/
│   ├── data/
│   │   └── frenchCities.ts      # Catalogue des villes françaises
│   ├── game/
│   │   ├── engine.ts            # Moteur du jeu
│   │   ├── mapManager.ts        # Gestion de la carte Leaflet
│   │   └── types.ts             # Types et interfaces
│   ├── minigames/
│   │   ├── index.ts
│   │   ├── navigationGame.ts
│   │   ├── observationGame.ts
│   │   ├── orientationGame.ts
│   │   └── quizGame.ts
│   ├── ui/
│   │   └── components.ts        # Composants UI
│   ├── utils/
│   │   └── helpers.ts           # Fonctions utilitaires
│   ├── styles.css              # Styles CSS
│   └── main.ts                 # Point d'entrée principal
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

## 🎨 Technologie & Stack

- **Framework** : [Vite](https://vitejs.dev/) + TypeScript
- **Cartographie** : [Leaflet](https://leafletjs.com/) 1.9.4
- **Cartes** : OpenStreetMap (tuiles gratuites)
- **CSS** : Vanilla CSS avec variables et animations
- **Build** : Vite avec configuration GitHub Pages

## 📜 Attribution & Licences

### Données Cartographiques
- **OpenStreetMap** : Cartes fournies par © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- **Licence** : ODbl (Open Database License)

### Données des Villes
- **Source** : INSEE, OpenStreetMap, données publiques
- **Licence** : Domaine public

### Code
- **Licence** : MIT (ou autre selon votre choix)

## 🎯 Règles du Jeu

### Objectif
Rejoindre la ville destination depuis la ville de départ en un minimum de déplacements.

### Énergie
- Chaque déplacement consomme de l'énergie proportionnellement à la distance parcourue
- Le coût dépend du niveau de difficulté
- Trouvez des points de ravitaillement pour récupérer de l'énergie

### Brouillard de Guerre
- La carte est initialement cachée
- La zone autour du joueur est révélée
- Les zones explorées restent visibles

### Événements
- **Quiz Géographique** : Répondez à des questions sur la France
- **Défi d'Orientation** : Trouvez la bonne direction
- **Observation Cartographique** : Identifiez des éléments visuels
- **Défi de Navigation** : Estimez des distances
- **Point de Ravitaillement** : Récupérez de l'énergie
- **Révélation Temporaire** : Révélez une zone de la carte

### Score
Le score est calculé en fonction de :
- Distance parcourue
- Événements découverts
- Mini-jeux réussis
- Énergie restante
- Temps écoulé (plus vite = plus de points)
- Bonus de difficulté

## 🏆 Difficultés

| Niveau | Distance | Énergie | Événements |
|--------|----------|---------|------------|
| Facile | 100-300 km | x1 | 3-5 |
| Moyen | 200-500 km | x1.5 | 5-7 |
| Difficile | 400-800 km | x2 | 8-10 |

## 🔧 Configuration

Les paramètres du jeu peuvent être modifiés dans `src/game/types.ts` :
```typescript
// Configuration par défaut
export const DEFAULT_CONFIG: GameConfig = {
  initialEnergy: 100,
  energyPerKm: 5,
  fogRadius: 50000,      // 50 km
  explorationRadius: 2000, // 2 km
  eventRadius: 1000,    // 1 km
  // ...
};
```

## 🐛 Dépannage

### Problèmes de build
1. Vérifiez que Node.js est installé : `node -v`
2. Vérifiez les dépendances : `npm install`
3. Essayez un build propre : `rm -rf dist && npm run build`

### Problèmes de carte
- **Tuiles non chargées** : Vérifiez votre connexion internet
- **Carte noire** : Leaflet a besoin d'accéder à Internet pour charger les tuiles OpenStreetMap
- **Brouillard ne fonctionne pas** : Vérifiez que le canvas overlay est correctement initialisé

### Problèmes mobiles
- **Toucher non détecté** : Assurez-vous que `gestureHandling: true` est activé dans Leaflet
- **Performance lente** : Réduisez le `explorationRadius` dans la configuration

## 📝 Notes de Développement

### Architecture
- **Séparation claire** : Logique du jeu, carte, données, mini-jeux, interface
- **Pas de sur-architecture** : Architecture simple et maintenable
- **Types stricts** : Utilisation de TypeScript pour la sécurité du code

### Performances
- **Brouillard** : Utilisation de Canvas pour un rendu performant
- **Événements** : Génération aléatoire avec seed pour la reproductibilité
- **Minimisation des dépendances** : Leaflet uniquement pour les cartes

### Améliorations Possibles
- [ ] Ajouter un système de sauvegarde/eduction de partie
- [ ] Implémenter un système de niveaux
- [ ] Ajouter des power-ups spéciaux
- [ ] Intégrer un système de classement en ligne
- [ ] Ajouter plus de mini-jeux
- [ ] Support offline complet (avec cache des tuiles)

## 📚 Ressources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Créé avec ❤️ pour les amoureux de la géographie et des jeux web.**

*Inspiré par le concept de Blindtrail, mais avec une approche Krazy Map !*
