import type { LonLat } from '../geo/projection';

export interface Anecdote extends LonLat {
  id: string;
  titre: string;
  texte: string;
  lieu: string;
  revelation: string;
}

export const ANECDOTES: Anecdote[] = [
  {
    id: 'lascaux',
    titre: 'La découverte du siècle',
    texte:
      "En septembre 1940, quatre adolescents et leur chien suivent un trou dans le sol de la forêt. Ils découvrent une cavité ornée de peintures vieilles de plus de 15 000 ans.",
    lieu: 'Montignac (Dordogne)',
    revelation: 'La grotte de Lascaux est célèbre pour ses chevaux, aurochs et cerfs peints au Paléolithique.',
    lat: 45.0578,
    lon: 1.1681,
  },
  {
    id: 'mont-saint-michel',
    titre: 'Une île qui respire avec la mer',
    texte:
      "Ce rocher couronné d'une abbaye est entouré de sables mouvants. Les marées y sont parmi les plus fortes d'Europe, et la mer peut revenir plus vite qu'un cheval au galop.",
    lieu: 'Le Mont-Saint-Michel (Manche)',
    revelation: "L'abbaye s'élève sur un îlot granitique, relié au continent par une passerelle inaugurée en 2014.",
    lat: 48.6361,
    lon: -1.5114,
  },
  {
    id: 'carcassonne',
    titre: 'Un château de conte restauré',
    texte:
      "Une cité médiévale entourée de deux enceintes et de 52 tours. Au XIXe siècle, l'architecte Viollet-le-Duc la restaure presque entièrement, toits pointus compris.",
    lieu: 'Carcassonne (Aude)',
    revelation: "La cité de Carcassonne est inscrite au patrimoine mondial de l'UNESCO depuis 1997.",
    lat: 43.2075,
    lon: 2.365,
  },
  {
    id: 'pont-du-gard',
    titre: 'Un aqueduc à trois étages',
    texte:
      "Les Romains y font franchir une rivière à un canal d'eau potable sur trois étages d'arches. L'ouvrage dépasse les 40 mètres de haut.",
    lieu: 'Vers-Pont-du-Gard (Gard)',
    revelation: "L'aqueduc amenait l'eau d'Uzès jusqu'à Nîmes, sur une cinquantaine de kilomètres.",
    lat: 43.9472,
    lon: 4.5358,
  },
  {
    id: 'dune-du-pilat',
    titre: 'La plus haute dune d\'Europe',
    texte:
      "Ce monticule de sable s'élève au bord de l'océan, à quelques kilomètres d'un bassin ostréicole. Il avance chaque année de plusieurs mètres vers la forêt.",
    lieu: 'Dune du Pilat (Gironde)',
    revelation: "La dune se déplace d'environ 4 à 5 mètres par an et engloutit peu à peu une forêt de pins.",
    lat: 44.5833,
    lon: -1.2167,
  },
  {
    id: 'mont-blanc',
    titre: 'Le toit de l\'Europe occidentale',
    texte:
      "Ce sommet culmine à 4 808 mètres. Il marque la frontière entre deux pays, et les premiers alpinistes qui le gravissent en 1786 s'y rendent par les glaciers.",
    lieu: 'Massif du Mont-Blanc (Haute-Savoie)',
    revelation: "Le Mont-Blanc est le point culminant de l'Europe occidentale. Il est à cheval sur la France et l'Italie.",
    lat: 45.8326,
    lon: 6.8652,
  },
  {
    id: 'cap-gris-nez',
    titre: 'Le point le plus proche de Londres',
    texte:
      "Par temps clair, on voit depuis cette falaise de la Côte d'Opale les falaises du pays voisin. La Manche n'y mesure que 33 kilomètres de large.",
    lieu: 'Cap Gris-Nez (Pas-de-Calais)',
    revelation: "Ce cap est le point le plus proche de l'Angleterre sur le littoral français.",
    lat: 50.8705,
    lon: 1.5853,
  },
  {
    id: 'gavarnie',
    titre: 'Un cirque de pierre et une cascade',
    texte:
      "Au fond d'une vallée pyrénéenne, un amphithéâtre de parois calcaires de plus de 1 500 mètres de hauteur encadre une cascade qui tombe en plusieurs étages.",
    lieu: 'Cirque de Gavarnie (Hautes-Pyrénées)',
    revelation: "Le cirque est inscrit au patrimoine mondial de l'UNESCO et sa grande cascade est l'une des plus hautes de France.",
    lat: 42.7284,
    lon: -0.0112,
  },
  {
    id: 'lourdes',
    titre: 'Des apparitions dans une grotte',
    texte:
      "En 1858, une jeune fille de 14 ans affirme avoir vu une dame lumineuse dans une grotte au bord d'un gave. Le lieu attire aujourd'hui des millions de pèlerins chaque année.",
    lieu: 'Lourdes (Hautes-Pyrénées)',
    revelation: "Bernadette Soubirous a vu l'apparition dans la grotte de Massabielle. L'Église catholique a reconnu ces apparitions en 1862.",
    lat: 43.0942,
    lon: -0.0458,
  },
  {
    id: 'vezelay',
    titre: 'Le départ d\'une croisade',
    texte:
      "Sur une colline bourguignonne, une basilique abrite les reliques d'une sainte. En 1146, un moine y prêche la deuxième croisade devant une foule immense.",
    lieu: 'Vézelay (Yonne)',
    revelation: "Bernard de Clairvaux prêche ici la deuxième croisade. La basilique Sainte-Madeleine est classée à l'UNESCO.",
    lat: 47.4645,
    lon: 3.75,
  },
  {
    id: 'alesia',
    titre: 'Un siège légendaire',
    texte:
      "En 52 avant notre ère, une armée romaine de César encercle une ville gauloise sur un plateau. Son chef, un Arverne, tente de briser le siège avec une armée de secours.",
    lieu: 'Alise-Sainte-Reine (Côte-d\'Or)',
    revelation: "C'est sur ce site que Vercingétorix se rend à César. La localisation de la bataille a longtemps été débattue.",
    lat: 47.5213,
    lon: 4.5088,
  },
  {
    id: 'chartres',
    titre: 'Le bleu des vitraux',
    texte:
      "Cette cathédrale du XIIe siècle conserve une grande partie de ses vitraux d'origine. Un bleu profond, presque irréel, a donné son nom à une teinte célèbre.",
    lieu: 'Chartres (Eure-et-Loir)',
    revelation: "Le « bleu de Chartres » désigne ce bleu profond des vitraux médiévaux de la cathédrale Notre-Dame.",
    lat: 48.4469,
    lon: 1.4893,
  },
  {
    id: 'strasbourg',
    titre: 'Le plus haut édifice du monde',
    texte:
      "Cette cathédrale gothique possède une flèche de 142 mètres. Au XIXe siècle, elle est pendant plusieurs années le bâtiment le plus haut du monde.",
    lieu: 'Strasbourg (Bas-Rhin)',
    revelation: "La flèche de la cathédrale de Strasbourg dépasse les pyramides de Gizeh, et reste la plus haute du Moyen Âge.",
    lat: 48.5818,
    lon: 7.751,
  },
  {
    id: 'carnac',
    titre: 'Une armée de pierres',
    texte:
      "Dans un champ breton, plus de 3 000 pierres dressées s'alignent en rangées parallèles sur plusieurs kilomètres. Elles datent du néolithique.",
    lieu: 'Carnac (Morbihan)',
    revelation: "Les alignements de Carnac sont parmi les plus grands ensembles mégalithiques du monde.",
    lat: 47.585,
    lon: -3.08,
  },
  {
    id: 'verdun',
    titre: 'Une bataille de 300 jours',
    texte:
      "En 1916, l'armée allemande attaque une place forte de la Meuse. Les combats durent près de dix mois et font des centaines de milliers de victimes.",
    lieu: 'Verdun (Meuse)',
    revelation: "La bataille de Verdun s'achève en décembre 1916. Un ossuaire proche de la ville rassemble les restes de soldats non identifiés.",
    lat: 49.1594,
    lon: 5.3862,
  },
  {
    id: 'pointe-du-raz',
    titre: 'Le bout du monde',
    texte:
      "Au bout d'une péninsule bretonne, une falaise plonge dans l'Atlantique. On l'appelle souvent « le bout du monde ».",
    lieu: 'Pointe du Raz (Finistère)',
    revelation: "La pointe du Raz est l'un des sites les plus visités de Bretagne, face à l'île de Sein.",
    lat: 48.0356,
    lon: -4.7369,
  },
  {
    id: 'puy-de-dome',
    titre: 'Un temple au sommet',
    texte:
      "Sur le sommet de ce volcan endormi, des vestiges gallo-romains rappellent un temple dédié à un dieu du commerce. Le sommet dépasse les 1 400 mètres.",
    lieu: 'Puy de Dôme (Puy-de-Dôme)',
    revelation: "Le temple du Puy de Dôme était dédié à Mercure. Le sommet domine la chaîne des Puys, classée à l'UNESCO en 2018.",
    lat: 45.7719,
    lon: 2.9647,
  },
  {
    id: 'tourmalet',
    titre: 'Le col le plus redouté',
    texte:
      "Ce col pyrénéen culmine à plus de 2 100 mètres. Il est franchi pour la première fois par le Tour de France en 1910, et revient souvent dans la course.",
    lieu: 'Col du Tourmalet (Hautes-Pyrénées)',
    revelation: "Le Tourmalet est l'un des cols les plus célèbres du Tour de France.",
    lat: 42.9083,
    lon: 0.1433,
  },
  {
    id: 'ventoux',
    titre: 'Le Géant de Provence',
    texte:
      "Ce sommet isolé, couvert de cailloux blancs, domine la plaine du Comtat. Il est souvent visible de très loin, et son nom signifie « venteux ».",
    lieu: 'Mont Ventoux (Vaucluse)',
    revelation: "Le Mont Ventoux culmine à 1 912 mètres, et ses pentes sont un passage obligé du Tour de France.",
    lat: 44.1739,
    lon: 5.2789,
  },
  {
    id: 'chambord',
    titre: 'Un château pour un roi chasseur',
    texte:
      "Ce château de la Renaissance compte plus de 400 pièces et un escalier à double révolution. Il est bâti au XVIe siècle au milieu d'un immense parc.",
    lieu: 'Chambord (Loir-et-Cher)',
    revelation: "Le château a été commandé par François Ier. Son escalier à double hélice est attribué à Léonard de Vinci.",
    lat: 47.6162,
    lon: 1.517,
  },
  {
    id: 'rocamadour',
    titre: 'Un village accroché à la falaise',
    texte:
      "Des maisons et des sanctuaires s'accrochent à une paroi rocheuse de plus de cent mètres de haut. Au Moyen Âge, les pèlerins y gravissent les marches à genoux.",
    lieu: 'Rocamadour (Lot)',
    revelation: "Rocamadour est l'une des grandes étapes de pèlerinage du Moyen Âge, sur la route de Compostelle.",
    lat: 44.7995,
    lon: 1.618,
  },
  {
    id: 'padirac',
    titre: 'Une rivière sous la terre',
    texte:
      "Un puits de plus de 30 mètres s'ouvre dans un causse calcaire. Au fond, une rivière souterraine coule dans des galeries aux stalactites étincelantes.",
    lieu: 'Gouffre de Padirac (Lot)',
    revelation: "Le gouffre a été exploré en 1889 par Édouard-Alfred Martel, pionnier de la spéléologie.",
    lat: 44.9826,
    lon: 1.7714,
  },
  {
    id: 'saint-malo',
    titre: 'Une ville de corsaires',
    texte:
      "Une cité entourée de remparts granitiques, face à la mer. Au XVIIIe siècle, ses capitaines de navires armés en course harcèlent les convois anglais.",
    lieu: 'Saint-Malo (Ille-et-Vilaine)',
    revelation: "Robert Surcouf, célèbre corsaire né dans cette ville, est un des héros de la cité.",
    lat: 48.6493,
    lon: -2.0257,
  },
  {
    id: 'bayeux',
    titre: 'Une tapisserie brodée',
    texte:
      "Une broderie de plus de 70 mètres raconte, en images et en latin, une conquête de 1066. Elle est exposée dans un musée près de la cathédrale.",
    lieu: 'Bayeux (Calvados)',
    revelation: "La tapisserie de Bayeux, probablement brodée en Angleterre, raconte la conquête de l'Angleterre par Guillaume le Conquérant.",
    lat: 49.2766,
    lon: -0.7022,
  },
  {
    id: 'cognac',
    titre: 'Un alcool qui porte le nom d\'une ville',
    texte:
      "Cette petite ville charentaise donne son nom à un alcool produit par distillation de vin blanc, puis vieilli longuement en fûts de chêne.",
    lieu: 'Cognac (Charente)',
    revelation: "Le cognac est une eau-de-vie de vin, produite dans une aire délimitée autour de la ville.",
    lat: 45.6976,
    lon: -0.3297,
  },
  {
    id: 'epernay',
    titre: 'Des caves creusées dans la craie',
    texte:
      "Une avenue bordée de maisons de négoce s'étend au cœur d'une ville champenoise. Sous ses trottoirs courent des kilomètres de caves creusées dans la craie.",
    lieu: 'Épernay (Marne)',
    revelation: "L'avenue de Champagne accueille les grandes maisons de champagne, et les caves atteignent plus de 100 km de long.",
    lat: 49.0456,
    lon: 3.9591,
  },
  {
    id: 'tour-eiffel',
    titre: 'Une structure temporaire',
    texte:
      "Cette tour de fer est construite en 1889 pour une exposition universelle. Elle devait être démontée après vingt ans, mais elle est restée.",
    lieu: 'Paris, Champ-de-Mars',
    revelation: "La tour Eiffel a été dessinée par les ingénieurs de l'entreprise de Gustave Eiffel. Elle mesure plus de 300 mètres.",
    lat: 48.8584,
    lon: 2.2945,
  },
  {
    id: 'le-puy',
    titre: 'Une cathédrale sur un piton volcanique',
    texte:
      "Dans une ville de la Haute-Loire, une cathédrale est bâtie au sommet d'une aiguille de lave, à laquelle on accède par un escalier. Une statue domine le rocher voisin.",
    lieu: 'Le Puy-en-Velay (Haute-Loire)',
    revelation: "La cité est célèbre pour sa dentelle, et son rocher Corneille accueille une statue de la Vierge.",
    lat: 45.0435,
    lon: 3.8845,
  },
  {
    id: 'roquefort',
    titre: 'Un fromage affiné dans une montagne',
    texte:
      "Ce fromage de brebis est affiné dans des caves naturelles creusées dans une falaise calcaire. Le courant d'air y est constant toute l'année.",
    lieu: 'Roquefort-sur-Soulzon (Aveyron)',
    revelation: "Le roquefort ne peut être produit qu'à partir de lait de brebis et affiné dans les caves de la commune.",
    lat: 43.9928,
    lon: 3.0279,
  },
  {
    id: 'fourviere',
    titre: 'Une basilique qui surplombe la ville',
    texte:
      "Une basilique de style néo-byzantin domine une ville en deux fleuves, au sommet d'une colline. Elle est construite à la fin du XIXe siècle.",
    lieu: 'Lyon, colline de Fourvière (Rhône)',
    revelation: "La basilique Notre-Dame de Fourvière offre une vue sur le confluent du Rhône et de la Saône.",
    lat: 45.7623,
    lon: 4.8226,
  },
  {
    id: 'bonne-mere',
    titre: 'La Bonne Mère veille sur la mer',
    texte:
      "Une basilique blanche et dorée dresse sa statue sur un promontoire rocheux. Elle surplombe le port d'une grande ville méditerranéenne.",
    lieu: 'Marseille (Bouches-du-Rhône)',
    revelation: "Notre-Dame de la Garde domine le port de Marseille depuis le XIXe siècle. Elle est surnommée la « Bonne Mère ».",
    lat: 43.2841,
    lon: 5.3712,
  },
  {
    id: 'gros-horloge',
    titre: 'Une horloge qui enjambe la rue',
    texte:
      "Dans une ville normande, un beffroi du XIVe siècle enjambe la rue principale. Son cadran doré est l'emblème de la cité.",
    lieu: 'Rouen (Seine-Maritime)',
    revelation: "Le Gros-Horloge de Rouen est l'un des plus célèbres monuments de la ville, et son cadran est doré.",
    lat: 49.441,
    lon: 1.093,
  },
  {
    id: 'oradour',
    titre: 'Un village préservé en mémoire',
    texte:
      "Le 10 juin 1944, les SS massacrent les habitants de ce village limousin. Les ruines ont été laissées en l'état, comme un mémorial.",
    lieu: 'Oradour-sur-Glane (Haute-Vienne)',
    revelation: "Le village martyr d'Oradour-sur-Glane fait 642 victimes. Ses ruines sont conservées en mémoire du massacre.",
    lat: 45.8919,
    lon: 1.0343,
  },
];
