export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
}

// Catalogue de plus de 100 villes françaises métropolitaines avec coordonnées
// Sources: INSEE, OpenStreetMap, données publiques
export const frenchCities: City[] = [
  // Île-de-France
  { id: 'paris', name: 'Paris', lat: 48.8566, lon: 2.3522, region: 'Île-de-France' },
  { id: 'marseille', name: 'Marseille', lat: 43.2965, lon: 5.3698, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'lyon', name: 'Lyon', lat: 45.7640, lon: 4.8357, region: 'Auvergne-Rhône-Alpes' },
  { id: 'toulouse', name: 'Toulouse', lat: 43.6047, lon: 1.4442, region: 'Occitanie' },
  { id: 'nice', name: 'Nice', lat: 43.7102, lon: 7.2620, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'nantes', name: 'Nantes', lat: 47.2184, lon: -1.5536, region: 'Pays de la Loire' },
  { id: 'montpellier', name: 'Montpellier', lat: 43.6109, lon: 3.8772, region: 'Occitanie' },
  { id: 'strasbourg', name: 'Strasbourg', lat: 48.5734, lon: 7.7521, region: 'Grand Est' },
  { id: 'bordeaux', name: 'Bordeaux', lat: 44.8378, lon: -0.5792, region: 'Nouvelle-Aquitaine' },
  { id: 'lille', name: 'Lille', lat: 50.6292, lon: 3.0573, region: 'Hauts-de-France' },
  { id: 'rennes', name: 'Rennes', lat: 48.0986, lon: -1.6828, region: 'Bretagne' },
  { id: 'reims', name: 'Reims', lat: 49.2583, lon: 4.0317, region: 'Grand Est' },
  { id: 'le-havre', name: 'Le Havre', lat: 49.4939, lon: 0.1079, region: 'Normandie' },
  { id: 'saint-etienne', name: 'Saint-Étienne', lat: 45.4397, lon: 4.3872, region: 'Auvergne-Rhône-Alpes' },
  { id: 'toulon', name: 'Toulon', lat: 43.1242, lon: 5.9280, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'grenoble', name: 'Grenoble', lat: 45.1885, lon: 5.7269, region: 'Auvergne-Rhône-Alpes' },
  { id: 'dijon', name: 'Dijon', lat: 47.3220, lon: 5.0415, region: 'Bourgogne-Franche-Comté' },
  { id: 'angers', name: 'Angers', lat: 47.4784, lon: -0.5632, region: 'Pays de la Loire' },
  { id: 'nimes', name: 'Nîmes', lat: 43.8367, lon: 4.3601, region: 'Occitanie' },
  { id: ' aix-en-provence', name: 'Aix-en-Provence', lat: 43.5297, lon: 5.4474, region: 'Provence-Alpes-Côte d\'Azur' },
  
  // Auvergne-Rhône-Alpes
  { id: 'annecy', name: 'Annecy', lat: 45.9006, lon: 6.1234, region: 'Auvergne-Rhône-Alpes' },
  { id: 'valence', name: 'Valence', lat: 44.9312, lon: 4.8958, region: 'Auvergne-Rhône-Alpes' },
  { id: 'bourgoin-jallieu', name: 'Bourgoin-Jallieu', lat: 45.5858, lon: 5.2764, region: 'Auvergne-Rhône-Alpes' },
  { id: 'clermont-ferrand', name: 'Clermont-Ferrand', lat: 45.7772, lon: 3.0870, region: 'Auvergne-Rhône-Alpes' },
  { id: 'chambery', name: 'Chambéry', lat: 45.5646, lon: 5.9178, region: 'Auvergne-Rhône-Alpes' },
  { id: 'saint-chamond', name: 'Saint-Chamond', lat: 45.4667, lon: 4.5167, region: 'Auvergne-Rhône-Alpes' },
  
  // Bourgogne-Franche-Comté
  { id: 'besancon', name: 'Besançon', lat: 47.2378, lon: 6.0241, region: 'Bourgogne-Franche-Comté' },
  { id: 'belfort', name: 'Belfort', lat: 47.6473, lon: 6.8526, region: 'Bourgogne-Franche-Comté' },
  { id: 'vesoul', name: 'Vesoul', lat: 47.6233, lon: 6.1518, region: 'Bourgogne-Franche-Comté' },
  
  // Bretagne
  { id: 'brest', name: 'Brest', lat: 48.3858, lon: -4.4861, region: 'Bretagne' },
  { id: 'quimper', name: 'Quimper', lat: 48.0059, lon: -4.1043, region: 'Bretagne' },
  { id: 'lorient', name: 'Lorient', lat: 47.7481, lon: -3.3641, region: 'Bretagne' },
  { id: 'vannes', name: 'Vannes', lat: 47.6582, lon: -2.7608, region: 'Bretagne' },
  { id: 'saint-brieuc', name: 'Saint-Brieuc', lat: 48.5144, lon: -2.7652, region: 'Bretagne' },
  { id: 'saint-malo', name: 'Saint-Malo', lat: 48.6483, lon: -2.0267, region: 'Bretagne' },
  
  // Centre-Val de Loire
  { id: 'orleans', name: 'Orléans', lat: 47.9029, lon: 1.9093, region: 'Centre-Val de Loire' },
  { id: 'tours', name: 'Tours', lat: 47.3941, lon: 0.6848, region: 'Centre-Val de Loire' },
  { id: 'bourges', name: 'Bourges', lat: 47.0810, lon: 2.3988, region: 'Centre-Val de Loire' },
  { id: 'blois', name: 'Blois', lat: 47.5852, lon: 1.3308, region: 'Centre-Val de Loire' },
  { id: 'chartres', name: 'Chartres', lat: 48.4478, lon: 1.4888, region: 'Centre-Val de Loire' },
  { id: 'chateauroux', name: 'Châteauroux', lat: 46.8073, lon: 1.6906, region: 'Centre-Val de Loire' },
  
  // Corse
  { id: 'ajaccio', name: 'Ajaccio', lat: 41.9265, lon: 8.7369, region: 'Corse' },
  { id: 'bastia', name: 'Bastia', lat: 42.7031, lon: 9.4515, region: 'Corse' },
  
  // Grand Est
  { id: 'metz', name: 'Metz', lat: 49.1193, lon: 6.1758, region: 'Grand Est' },
  { id: 'nancy', name: 'Nancy', lat: 48.6921, lon: 6.1844, region: 'Grand Est' },
  { id: 'mulhouse', name: 'Mulhouse', lat: 47.7508, lon: 7.3371, region: 'Grand Est' },
  { id: 'charleville-mezieres', name: 'Charleville-Mézières', lat: 49.7706, lon: 4.7250, region: 'Grand Est' },
  { id: 'epinal', name: 'Épinal', lat: 48.1781, lon: 6.4528, region: 'Grand Est' },
  { id: 'troyes', name: 'Troyes', lat: 48.2973, lon: 4.0749, region: 'Grand Est' },
  { id: 'chaumont', name: 'Chaumont', lat: 48.1117, lon: 5.1431, region: 'Grand Est' },
  
  // Hauts-de-France
  { id: 'amiens', name: 'Amiens', lat: 49.8942, lon: 2.2957, region: 'Hauts-de-France' },
  { id: 'rouen', name: 'Rouen', lat: 49.4431, lon: 1.0993, region: 'Normandie' },
  { id: 'dunkerque', name: 'Dunkerque', lat: 51.0503, lon: 2.3897, region: 'Hauts-de-France' },
  { id: 'villeneuve-d-ascq', name: 'Villeneuve-d\'Ascq', lat: 50.6282, lon: 3.1442, region: 'Hauts-de-France' },
  { id: 'beauvais', name: 'Beauvais', lat: 49.4376, lon: 2.0889, region: 'Hauts-de-France' },
  { id: 'saint-quentin', name: 'Saint-Quentin', lat: 49.8462, lon: 3.2869, region: 'Hauts-de-France' },
  { id: 'compiegne', name: 'Compiègne', lat: 49.4152, lon: 2.8233, region: 'Hauts-de-France' },
  
  // Normandie
  { id: 'caen', name: 'Caen', lat: 49.1828, lon: -0.3707, region: 'Normandie' },
  { id: 'cherbourg-en-cotentin', name: 'Cherbourg-en-Cotentin', lat: 49.6357, lon: -1.6147, region: 'Normandie' },
  { id: 'evreux', name: 'Évreux', lat: 49.0248, lon: 1.1498, region: 'Normandie' },
  { id: 'alencon', name: 'Alençon', lat: 48.4315, lon: 0.0948, region: 'Normandie' },
  
  // Nouvelle-Aquitaine
  { id: 'limoges', name: 'Limoges', lat: 45.8333, lon: 1.2611, region: 'Nouvelle-Aquitaine' },
  { id: 'poitiers', name: 'Poitiers', lat: 46.5802, lon: 0.3404, region: 'Nouvelle-Aquitaine' },
  { id: 'la-rochelle', name: 'La Rochelle', lat: 46.1667, lon: -1.1500, region: 'Nouvelle-Aquitaine' },
  { id: 'pau', name: 'Pau', lat: 43.3000, lon: -0.3667, region: 'Nouvelle-Aquitaine' },
  { id: 'perigueux', name: 'Périgueux', lat: 45.1867, lon: 0.7167, region: 'Nouvelle-Aquitaine' },
  { id: 'bayonne', name: 'Bayonne', lat: 43.4933, lon: -1.4731, region: 'Nouvelle-Aquitaine' },
  { id: 'niort', name: 'Niort', lat: 46.3236, lon: -0.4598, region: 'Nouvelle-Aquitaine' },
  { id: 'mont-de-marsan', name: 'Mont-de-Marsan', lat: 43.8917, lon: -0.5036, region: 'Nouvelle-Aquitaine' },
  
  // Occitanie
  { id: 'perpignan', name: 'Perpignan', lat: 42.6886, lon: 2.8954, region: 'Occitanie' },
  { id: 'beziers', name: 'Béziers', lat: 43.3435, lon: 3.2131, region: 'Occitanie' },
  { id: 'tarbes', name: 'Tarbes', lat: 43.2353, lon: 0.0791, region: 'Occitanie' },
  { id: 'albi', name: 'Albi', lat: 43.9283, lon: 2.1489, region: 'Occitanie' },
  { id: 'rodez', name: 'Rodez', lat: 44.3500, lon: 2.5733, region: 'Occitanie' },
  { id: 'castres', name: 'Castres', lat: 43.6069, lon: 2.2267, region: 'Occitanie' },
  
  // Pays de la Loire
  { id: 'le-mans', name: 'Le Mans', lat: 48.0078, lon: 0.2000, region: 'Pays de la Loire' },
  { id: 'saint-nazaire', name: 'Saint-Nazaire', lat: 47.2767, lon: -2.2133, region: 'Pays de la Loire' },
  { id: 'laval', name: 'Laval', lat: 48.0733, lon: -0.7489, region: 'Pays de la Loire' },
  { id: 'cholet', name: 'Cholet', lat: 47.0603, lon: -0.8889, region: 'Pays de la Loire' },
  { id: 'saumur', name: 'Saumur', lat: 47.2628, lon: -0.0733, region: 'Pays de la Loire' },
  
  // Provence-Alpes-Côte d'Azur
  { id: 'cannes', name: 'Cannes', lat: 43.5528, lon: 7.0174, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'antibes', name: 'Antibes', lat: 43.5806, lon: 7.0044, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'digne-les-bains', name: 'Digne-les-Bains', lat: 44.0944, lon: 6.2358, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'gap', name: 'Gap', lat: 44.5633, lon: 5.9261, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'draguignan', name: 'Draguignan', lat: 43.5292, lon: 6.4636, region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 'grasse', name: 'Grasse', lat: 43.6614, lon: 6.9158, region: 'Provence-Alpes-Côte d\'Azur' },
  
  // Baie de Somme
  { id: 'abbeville', name: 'Abbeville', lat: 50.1058, lon: 1.6442, region: 'Hauts-de-France' },
  
  // Alsace
  { id: 'colmar', name: 'Colmar', lat: 48.0798, lon: 7.3636, region: 'Grand Est' },
  { id: 'saverne', name: 'Saverne', lat: 48.7506, lon: 7.3611, region: 'Grand Est' },
  
  // Bourgogne
  { id: 'nevers', name: 'Nevers', lat: 46.9917, lon: 3.1597, region: 'Bourgogne-Franche-Comté' },
  { id: 'auxerre', name: 'Auxerre', lat: 47.7973, lon: 3.5759, region: 'Bourgogne-Franche-Comté' },
  
  // Franche-Comté
  { id: 'montbeliard', name: 'Montbéliard', lat: 47.5042, lon: 6.7864, region: 'Bourgogne-Franche-Comté' },
  
  // Additional cities
  { id: 'versailles', name: 'Versailles', lat: 48.8049, lon: 2.1342, region: 'Île-de-France' },
  { id: 'evry', name: 'Évry-Courcouronnes', lat: 48.6344, lon: 2.4348, region: 'Île-de-France' },
  { id: 'creteil', name: 'Créteil', lat: 48.7833, lon: 2.4500, region: 'Île-de-France' },
  { id: 'meaux', name: 'Meaux', lat: 48.9556, lon: 2.8819, region: 'Île-de-France' },
  { id: 'pontoise', name: 'Pontoise', lat: 49.0478, lon: 2.0981, region: 'Île-de-France' },
  { id: 'sainte-genevieve-des-bois', name: 'Sainte-Geneviève-des-Bois', lat: 48.6400, lon: 2.3500, region: 'Île-de-France' },
  { id: 'argenteuil', name: 'Argenteuil', lat: 48.9458, lon: 2.2412, region: 'Île-de-France' },
  { id: 'sarcelles', name: 'Sarcelles', lat: 48.9886, lon: 2.3619, region: 'Île-de-France' },
  { id: 'boulogne-billancourt', name: 'Boulogne-Billancourt', lat: 48.8358, lon: 2.2412, region: 'Île-de-France' },
  { id: 'saint-denis', name: 'Saint-Denis', lat: 48.9358, lon: 2.3564, region: 'Île-de-France' },
  { id: 'vitry-sur-seine', name: 'Vitry-sur-Seine', lat: 48.7742, lon: 2.4119, region: 'Île-de-France' },
  { id: 'colombes', name: 'Colombes', lat: 48.8944, lon: 2.2969, region: 'Île-de-France' },
];

// Filtre pour obtenir uniquement la France métropolitaine (exclut la Corse pour simplifier)
export const mainlandFrenchCities = frenchCities.filter(
  city => city.region !== 'Corse' && city.region !== 'Outre-Mer'
);

// Filtre pour obtenir des villes adaptées à chaque niveau de difficulté
export const getCitiesForDifficulty = (difficulty: 'facile' | 'moyen' | 'difficile'): City[] => {
  // Pour le niveau facile: villes principales bien connues
  const easyCities = frenchCities.filter(city => 
    ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre'].includes(city.name)
  );
  
  // Pour le niveau moyen: villes principales + villes moyennes
  const mediumCities = frenchCities.filter(city => 
    !['Ajaccio', 'Bastia', 'Perpignan', 'Digne-les-Bains', 'Gap', 'Draguignan'].includes(city.name) &&
    city.region !== 'Corse'
  );
  
  // Pour le niveau difficile: toutes les villes sauf les plus petites
  const hardCities = mainlandFrenchCities;
  
  switch (difficulty) {
    case 'facile': return easyCities;
    case 'moyen': return mediumCities;
    case 'difficile': return hardCities;
    default: return mediumCities;
  }
};
