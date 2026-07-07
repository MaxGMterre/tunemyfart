// Bibliothèque de dialogues du Professeur Prout
// Ton : scientifique passionné, références historiques inventées,
// unités farfelues, paternaliste bienveillant, putois omniprésent.

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const DIALOGUES = {
  onFirstLaunch: [
    "Bienvenue au laboratoire ! Je suis le Professeur Prout, titulaire de la chaire de Sonoflatulogie à l'Académie de Vichy depuis 1887.",
    "Enfin un nouvel apprenti ! Le corpus manquait de fraîcheur. Putois aussi est ravi.",
    "Ah, un nouveau chercheur ! Votre dossier est vierge — mais pas pour longtemps.",
    "Le laboratoire vous accueille. Notez que toute contribution au corpus est irréversible… pour la postérité.",
    "Par les archives de la Société Flatulogique de Genève ! Un spécimen de plus rejoint notre programme de recherche.",
  ],

  onFirstRecording: [
    "Bravo, jeune chercheur ! Votre premier relevé est désormais gravé dans les annales de la science.",
    "Magnifique contribution ! Ce spécimen rejoint notre corpus avec toute la solennité requise.",
    "Un début prometteur, mon apprenti ! Mon confrère Von Döppler aurait applaudi.",
    "Premier relevé certifié ! Putois marque l'occasion d'une pirouette discrète.",
    "Remarquable pour un début ! J'en ai vu de moins convaincants à la conférence de Baden-Baden de 1912.",
  ],

  onSilence: [
    "Le silence est-il la note ultime, ou simplement un manque de conviction ? La science tranche.",
    "Hmm… même le vide a une fréquence. Réessayons avec plus d'enthousiasme.",
    "Le laboratoire attend. Le putois aussi. Moi aussi, du reste.",
    "Timide ? La science n'a pas de pudeur, mon apprenti.",
    "Mon sismographe acoustique n'a rien détecté. Défaillance matérielle ou absence de sujet d'étude ?",
    "En 1843, le professeur Flatstein a démontré que l'inhibition est la principale ennemie de la recherche.",
    "Putois dresse une oreille. Il attend. Nous attendons tous.",
    "Zéro protoflatule enregistré. C'est un résultat, techniquement parlant.",
    "Le silence peut-être est votre signature. Certains chercheurs l'ont cultivé avec succès, jusqu'à leur retraite.",
    "Mon carnet reste blanc. Ce n'est pas la vocation de la science.",
  ],

  onLowDb: [
    "Un résultat subtil. La discrétion est une forme de virtuosité, notons-le.",
    "Signal délicat. Mon hygromètre acoustique peine à enregistrer, mais le corpus accueille tout.",
    "Furtif, comme un souffle dans un couloir de bibliothèque. Charmant.",
    "Une contribution modeste mais honnête. Même les pianissimos ont leur valeur scientifique.",
    "Putois a failli ne pas l'entendre. Bravo pour cette retenue digne d'un diplomate.",
    "En dessous de 2,7 protoflatules. C'est dans la marge basse de nos tableaux de référence.",
    "La finesse est une qualité rare dans ce domaine. Je la consigne avec soin.",
    "Mon confrère Silenzio de l'Académie de Venise se spécialisait dans ces spectres discrets.",
  ],

  onMediumDb: [
    "Un spécimen solide. Dans la norme supérieure du corpus international.",
    "Résultat équilibré. Ni trop discret, ni trop flamboyant. La science apprécie la régularité.",
    "Bonne amplitude. Je coche la case 'contribution sérieuse' dans mon formulaire d'analyse.",
    "Convenable, mon apprenti. Le corpus progresse à un rythme satisfaisant.",
    "Données consignées. Putois semble approbateur — c'est bon signe.",
    "Une lecture dans la moyenne supérieure. Vous n'êtes pas le pire sujet d'étude que j'ai croisé.",
    "Résultat nominal. Votre coefficient de résonance gastrique est encourageant.",
    "Le graphe s'enrichit. C'est tout ce que nous demandons à la science.",
  ],

  onHighDb: [
    "Par les grands ancêtres du chou-fleur ! Un tel spécimen mérite une mention spéciale.",
    "Nom d'une éprouvette ! Je note, je note — et je note encore !",
    "Voilà ce qui s'appelle une contribution majeure à la sonoflatulogie mondiale.",
    "Stupéfiant ! Ce résultat dépasse les seuils de référence de la conférence de Zürich 1924.",
    "Putois s'est réfugié sous le bureau. Je consigne cela comme 'puissance acoustique exceptionnelle'.",
    "Mes vitres ont vibré. Mes instruments ont vacillé. La science a triomphé.",
    "Le sismographe a bougé d'un demi-millimètre. Historique.",
    "Je ferai paraître ce résultat dans les Annales de la Flatulogie Appliquée. Avec votre accord.",
    "47,3 décibels-Prout ! Un record à consigner dans les registres dorés du laboratoire.",
    "Mon collègue Explosif de l'Institut de Bruxelles serait vert de jalousie.",
  ],

  onLongDuration: [
    "L'endurance est une vertu cardinale de la recherche acoustique. Vous l'incarnez pleinement.",
    "Un spécimen de cette durée n'a été observé que trois fois depuis 1891. Remarquable.",
    "Plus de cinq secondes ! Putois a dû s'asseoir pour reprendre ses esprits.",
    "Votre coefficient d'endurance dépasse le 99e percentile de notre base de données.",
    "Mon chronomètre a failli s'épuiser. La science est en dette envers vous.",
    "Le marathon acoustique ! Mon confrère Longoni de Milan aurait pleuré de joie.",
    "Durée exceptionnelle. Je consigne : 'spécimen à potentiel endurance-record'.",
    "Un tel spécimen devrait figurer dans les annales de la Société Internationale d'Acoustique Digestive.",
  ],

  onShortDuration: [
    "Bref mais intense. C'est une approche scientifique légitime.",
    "La concision est une forme d'élégance. Votre spécimen en témoigne.",
    "Court, oui — mais les meilleures bouteilles se dégustent en quelques secondes.",
    "Staccato. Un terme musical pour ce type de contribution.",
    "Moins d'une seconde ? Mon confrère Furtivo de Naples en aurait fait sa thèse.",
    "La brièveté n'invalide pas la rigueur scientifique. Je l'enregistre avec le même soin.",
    "Instantané. Comme un éclair acoustique dans un ciel serein.",
    "Bref mais mémorable. Putois a eu le temps de hausser un sourcil.",
  ],

  onMusicalMelody: [
    "Une mélodie ! Le spectre harmonique est fascinant. Mon violoncelle est jaloux.",
    "Pluralité de notes détectées. Voici une contribution de haute valeur musicologique.",
    "Remarquable complexité harmonique ! Le corpus s'enrichit de données rares.",
    "Mon carnet de notation ne suffit plus. Je passe au cahier grand format.",
    "Votre appareil digestif mérite un pupitre dans notre orchestre de chambre.",
    "Putois bat la mesure discrètement. Il reconnaît la qualité.",
    "Plusieurs fréquences simultanées ! Ce type de spécimen n'apparaît qu'une fois sur cent.",
    "Le compositeur Proutovsky de Saint-Pétersbourg s'inspirait de tels spécialismes. Je comprends pourquoi.",
  ],

  onSpecificNote: {
    Do: [
      "Do ! La note fondatrice de la gamme occidentale. Un choix de classique.",
      "Do, la tonique parfaite. Pythagore aurait applaudi.",
      "Un Do bien calibré. Voilà qui manquait à notre corpus.",
      "Do naturel ! Le putois reconnaît cette fréquence — il l'entend depuis 1887.",
      "Do : 261,6 Hz. Votre appareil digestif est parfaitement accordé.",
    ],
    Ré: [
      "Ré ! La note des cordes de viole, disait mon maître.",
      "Un Ré solide. Le corpus des tons seconds s'enrichit.",
      "Ré, note de la mélancolie productive, selon les traités de 1743.",
      "Fréquence Ré confirmée. Putois acquiesce.",
      "Un Ré qui tient la route. Je l'encode dans nos registres fréquentiels.",
    ],
    Mi: [
      "Mi ! Note de la tierce majeure. Votre gamme prend forme, mon apprenti.",
      "Un Mi clair et précis. Félicitations pour cette contribution tierçaire.",
      "Mi naturel. Le violon de l'académie vibre en sympathie.",
      "Mi : fréquence médiane par excellence. Bien réglé.",
      "Mi validé. Putois semble reconnaître cette fréquence — il la fredonne parfois.",
    ],
    Fa: [
      "Fa ! La quarte juste. Un pas de plus dans la gamme chromatique.",
      "Un Fa bien posé. Mon professeur de solfège en aurait été ému.",
      "Fa : note litigieuse depuis le concile de Latran. Mais ici elle est parfaite.",
      "Fa consigné. Trois notes de plus et nous avons un arpège.",
      "Fa détecté avec précision. Le spectrographe ne ment pas.",
    ],
    Sol: [
      "Sol ! La dominante par excellence. Votre corpus s'harmonise.",
      "Un Sol majeur, vibrant et noble. Digne des grandes orgues de la cathédrale.",
      "Sol : 392 Hz. Votre fréquence gastrique est dans les normes supérieures.",
      "Sol enregistré. Je griffonne furieusement dans mon carnet.",
      "Sol, la clef de voûte harmonique. Remarquable.",
    ],
    La: [
      "La ! Le La universel, 440 Hz, référence absolue. Votre corps est un diapason.",
      "Un La parfaitement accordé. Même les orchestres vous envieraient.",
      "La natuel. Mon diapason confirme — vous êtes en accord avec le cosmos.",
      "La enregistré. C'est la note de référence internationale depuis 1939.",
      "La : une signature rare et précieuse dans notre corpus.",
    ],
    Si: [
      "Si ! La sensible de la gamme. Une note d'une délicatesse exquise.",
      "Un Si subtil, presque mystérieux. La gamme approche de sa complétude.",
      "Si naturel. Il ne manque plus que quelques notes pour l'octave complète.",
      "Si consigné avec soin. Putois incline la tête en signe de respect.",
      "Si : note finale, tendue vers la résolution. Vous avez le sens du drame musical.",
    ],
    "Do#": [
      "Do dièse ! Note chromatique rare. Le corpus des altérations se complète.",
      "Un Do# précis. Votre demi-ton est impeccable.",
      "Do dièse détecté. La gamme tempérée vous est accessible — bravo.",
      "Altération chromatique confirmée. Je consigne ce demi-ton avec soin.",
      "Do# : note de la gamme Blues selon certains théoriciens. Magnifique.",
    ],
    "Ré#": [
      "Ré dièse — ou Mi bémol, selon votre école. Votre appareil est éclectique.",
      "Un Ré# correct. La science des demi-tons avance.",
      "Ré dièse ! Mon enharmoniste préféré. Putois semble intrigué.",
      "Altération ascendante confirmée. Le corpus chromatique s'enrichit.",
      "Ré# : note romantique par excellence. Schubert en était friand.",
    ],
    "Fa#": [
      "Fa dièse ! La note de D majeur selon les théoriciens. Votre gamme monte.",
      "Un Fa# bien ancré. Tonalité de la modernité, selon mon confrère de Vienne.",
      "Fa dièse enregistré. Nous approchons d'une palette chromatique complète.",
      "Altération Fa# confirmée. Un demi-ton de plus dans notre corpus.",
      "Fa# : fréquence de 369,99 Hz. Précision remarquable.",
    ],
    "Sol#": [
      "Sol dièse ! Le Lab par excellence pour les jazzmen, disait mon cousin.",
      "Un Sol# bien tracé. La gamme de La majeur est à votre portée.",
      "Sol dièse enregistré. Putois bat la mesure d'un swing subtil.",
      "Altération Sol# consignée avec grand soin.",
      "Sol# : note pivot dans les modulations romantiques. Vous avez l'oreille absolue.",
    ],
    "La#": [
      "La dièse — ou Si bémol. L'enharmonie est un art.",
      "Un La# net et précis. La gamme de Si bémol majeur vous tend les bras.",
      "La dièse enregistré. Putois applaudit discrètement.",
      "Altération La# confirmée. Neuf notes au corpus, trois restantes.",
      "La# : fréquence de 466,16 Hz. Votre diaphragme est un instrument.",
    ],
  },

  onMissionUnlocked: [
    "Certification obtenue ! Je griffonne frénétiquement dans les annales du laboratoire.",
    "Bravo, cher confrère ! Cette mission enrichit votre dossier de manière significative.",
    "Putois exécute une petite danse de victoire. Je l'ai observé rarement.",
    "Protocole accompli ! Votre grade dans la hiérarchie sonoflatulogique progresse.",
    "Magnifique ! Cette certification sera mentionnée dans le prochain rapport annuel de l'Académie.",
    "Mission accomplie avec brio ! Mon confrère Victorieux de Lyon applaudit depuis son bureau.",
    "Je tamponner ce certificat d'un sceau doré. Vous l'avez mérité.",
    "Votre dossier s'épaissit. Un signe de distinction dans notre laboratoire.",
    "Par les éprouvettes de la science ! Cette performance dépasse mes prévisions.",
    "Je consigne cette réussite dans le Grand Livre des Exploits Acoustiques. Avec deux astérisques.",
  ],

  onReturnAfterAbsence: [
    "De retour après une absence ! Le laboratoire était silencieux sans vous.",
    "Ah, mon apprenti reparaît ! Putois a regardé la porte pendant 72 heures.",
    "Vous étiez en vadrouille scientifique sur le terrain, j'espère ?",
    "Bienvenue de retour. Les instruments n'attendaient que vous pour reprendre du service.",
    "Le corpus avait une lacune temporelle. La voici comblée — continuez ainsi.",
    "Mon carnet de présences marque une longue interruption. J'espère que vous allez bien.",
    "Retour du chercheur ! Je relance les appareils de mesure immédiatement.",
    "L'absence n'invalide pas les travaux antérieurs. Reprenons où nous en étions.",
    "Mon baromètre d'activité était au plus bas. Remontons-le ensemble.",
    "Vous avez manqué. Le putois aussi. Enfin, de manière strictement scientifique.",
  ],

  onStreak: {
    3: [
      "Trois jours consécutifs ! La régularité est le premier pilier de la recherche.",
      "La constance commence à 3. Vous êtes sur la bonne voie, mon apprenti.",
      "Trois contributions d'affilée ! Mon tableur est satisfait.",
    ],
    7: [
      "Une semaine de rigueur ! Le badge Assiduité Exemplaire est dans vos attributions.",
      "Sept jours sans faillir ! Mon confrère Régulier de Lyon aurait été fier.",
      "Une semaine entière de contributions. Cela mérite une mention dans le journal de bord.",
    ],
    14: [
      "Deux semaines ! Votre dévouement surpasse celui de la plupart de mes étudiants.",
      "Quatorze jours d'affilée ! Je rédige une lettre de recommandation.",
      "Un fortnight acoustique ! Terme anglais que j'emploie uniquement dans les grandes occasions.",
    ],
    30: [
      "Un mois entier ! Vous êtes officiellement Membre Permanent du Laboratoire.",
      "Trente jours consécutifs ! Cette performance ne sera pas oubliée de sitôt.",
      "Un mois de rigueur absolue. Je grave votre nom sur la plaque de bronze du couloir.",
    ],
    100: [
      "Cent jours ! Vous avez dépassé mes espérances, mon confrère. Ce titre est mérité.",
      "100 jours ! Vous transcendez la catégorie d'apprenti. C'est une carrière que vous bâtissez.",
      "Centenaire acoustique ! L'académie entière vous salue. Putois exécute une révérence.",
    ],
  },

  onError: [
    "Hm. Un parasite dans les données. La science connaît des revers.",
    "Résultat non conforme. Ce n'est pas de votre faute — les instruments capricieux eux aussi.",
    "L'appareil est récalcitrant ce soir. Nous réessaierons avec patience.",
    "Putois est déçu. Moi aussi. Mais la science ne se décourage pas.",
    "Erreur technique consignée. Mon carnet d'incidents s'enrichit.",
    "Mon oscilloscope a eu un haut-le-cœur. Phénomène rare mais documenté.",
    "Défaillance transitoire. C'est arrivé lors de la conférence de Strasbourg en 1931. Nous avons persévéré.",
    "Incident de mesure. Je consulte le manuel de maintenance — il date de 1952.",
  ],

  onAppOpen: [
    "Bonjour, cher confrère ! Le laboratoire est en ordre de marche.",
    "Ah, vous voilà ! Putois s'est réveillé à l'instant même.",
    "Le grand livre du corpus est ouvert. Qu'y consignerons-nous aujourd'hui ?",
    "Une nouvelle journée de science nous attend. Mon enthousiasme est intact.",
    "Bienvenue. Les instruments sont calibrés. Tout est prêt.",
    "Le Professeur Prout à votre service. Résultats attendus dans les plus brefs délais.",
    "Le laboratoire ouvre ses portes. Je vous attendais, voyez-vous.",
    "Putois trottine à votre rencontre. C'est un signe d'accueil chez lui.",
    "Grand bien vous fasse d'être là ! Le corpus ne s'enrichit pas tout seul.",
    "Bonjour ! J'ai relu hier soir les Annales de 1899. Inspirant.",
    "L'appareil est chaud. Vous pouvez commencer quand vous le souhaitez.",
    "Mon carnet est ouvert à la bonne page. Nous pouvons procéder.",
    "La jauge de curiosité scientifique est au maximum. Commençons.",
    "Le spectrographe est en attente. Vous savez ce qu'il faut faire.",
    "Journée prometteuse pour la recherche acoustique digestive. Allons-y !",
  ],

  onNightUsage: [
    "Minuit passé ? La science ne dort jamais. Ni moi d'ailleurs.",
    "Une contribution nocturne ! Les données de nuit ont leur propre caractère fréquentiel.",
    "Le silence de la nuit amplifie les mesures. Conditions idéales.",
    "Putois est lui aussi nocturne. Vous êtes en bonne compagnie.",
    "La nuit est propice aux expériences rares. Je suis tout ouïe.",
  ],

  onMorningUsage: [
    "Matinal ! Les premières contributions de la journée sont les plus pures, dit-on.",
    "Un spécimen d'aube ! Le corpus matinal est précieux dans notre classification.",
    "6h du matin ? Votre dévotion à la science force le respect.",
    "Le putois baille encore, mais il est là. Comme vous.",
    "Fraîcheur matinale détectée. Conditions acoustiques optimales.",
  ],

  randomIdleFacts: [
    "Saviez-vous que le premier pet analysé scientifiquement remonte à 1743, par Sir Edmund Flatley ?",
    "Le mot 'flatulence' vient du latin 'flatus', qui signifie littéralement 'souffle divin'.",
    "En 1876, un chercheur anglais a tenté de breveter un métronome digestif. Le brevet fut refusé.",
    "La vitesse de propagation d'un flatulent mesurée en 1923 à Leipzig atteignait 3,7 m/s.",
    "Les putois produisent leurs propres composés acoustiques — c'est pourquoi Putois est si précieux.",
    "La Société Flatulogique de Genève publie depuis 1892 des Annales en trois volumes.",
    "Le compositeur fictif Proutovsky a dédié sa 3e symphonie aux 'émissions digestives de la bourgeoisie'.",
    "En acoustique digestive, l'unité officieuse est la 'protoflatule', définie en 1902.",
    "Le spectre fréquentiel d'un pet humain s'étend de 20 à 2000 Hz — une gamme proche du cor français.",
    "Mon confrère Helmholtz (l'autre) avait noté un rapport entre régime alimentaire et fréquence fondamentale.",
    "Les Romains avaient un dieu de la flatulence : Crepitus. Il est peu représenté dans l'art.",
    "Une étude de 1887 à Vienne démontrait que les légumineuses augmentent le corpus de 47%.",
    "Le premier concours international de sonoflatulogie s'est tenu à Bruxelles en 1904. Le gagnant est resté anonyme.",
    "Putois perçoit des fréquences jusqu'à 48 000 Hz. C'est pourquoi il anticipe parfois les résultats.",
    "La note La (440 Hz) a été choisie comme référence en 1939 — par coincidence, cette fréquence est commune.",
    "En tibétain, le mot pour 'flatulence' signifie aussi 'message du vent'. Philosophique.",
    "Le diaphragme humain peut exercer une pression de 1,3 atmosphères. Remarquable mécanique.",
    "Un chercheur de l'Académie de Vienne a établi que la durée moyenne d'un pet est de 2,8 secondes.",
    "La corrélation entre consommation de bière brune et richesse harmonique est établie depuis 1891.",
    "Mon prédécesseur à cette chaire, le Professeur Rumblino, a publié 47 articles sur le sujet.",
    "En musicologie digestive, on distingue le 'staccato furtif', le 'legato prolongé' et le 'fortissimo soudain'.",
    "Le premier enregistrement audio d'un pet date de 1932, sur cire de phonographe.",
    "Les cétacés produisent des bulles sonores sous-marines. La baleine bleue peut atteindre 188 dB.",
    "Selon la loi de Boyle-Mariotte, la pression d'un gaz est inversement proportionnelle à son volume. CQFD.",
    "En 1899, un médecin viennois a proposé un classement en 12 types — comme les notes de la gamme.",
    "Le chou-fleur, le chou-frisé et les haricots blancs constituent le 'trio d'or' de la recherche.",
    "Mon laboratoire possède le plus grand corpus de spectrogrammes flatulents au nord des Alpes.",
    "La thermodynamique s'applique aussi ici : l'expansion gastrique suit les lois du 2e principe.",
    "Putois a été formé dès son plus jeune âge à reconnaître 47 fréquences distinctes.",
    "La Chine possède le plus grand registre national de données acoustiques digestives — 2,3 millions de spécimens.",
  ],
};

// Helpers contextuels

export function getTimeBasedDialogue(): string {
  const h = new Date().getHours();
  if (h >= 22 || h < 6) return pickRandom(DIALOGUES.onNightUsage);
  if (h >= 6 && h < 10) return pickRandom(DIALOGUES.onMorningUsage);
  return pickRandom(DIALOGUES.onAppOpen);
}

export function getDbDialogue(db: number): string {
  if (db > -15) return pickRandom(DIALOGUES.onHighDb);
  if (db > -30) return pickRandom(DIALOGUES.onMediumDb);
  if (db > -50) return pickRandom(DIALOGUES.onLowDb);
  return pickRandom(DIALOGUES.onSilence);
}

export function getDurationDialogue(ms: number): string {
  if (ms > 5000) return pickRandom(DIALOGUES.onLongDuration);
  if (ms < 800) return pickRandom(DIALOGUES.onShortDuration);
  return pickRandom(DIALOGUES.onMediumDb);
}

export function getNoteDialogue(note: string): string {
  const noteKey = note as keyof typeof DIALOGUES.onSpecificNote;
  if (noteKey in DIALOGUES.onSpecificNote) {
    return pickRandom(DIALOGUES.onSpecificNote[noteKey]);
  }
  return pickRandom(DIALOGUES.onMusicalMelody);
}

export function getStreakDialogue(streak: number): string {
  const keys = [100, 30, 14, 7, 3] as const;
  for (const k of keys) {
    if (streak >= k) return pickRandom(DIALOGUES.onStreak[k]);
  }
  return pickRandom(DIALOGUES.onAppOpen);
}
