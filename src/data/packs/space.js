/* ============================================================
   PACK 01 — « Orbite Basse »
   Rôle : ingénieur de station. Décor : anneau orbital.
   Défi : un réacteur qui lâche.
   Contenu PRÉÉCRIT (§0). Le moteur est déterministe.
   ============================================================ */

export const packSpace = {
  id: "space",
  title: "Orbite Basse",
  tagline: "Une station, un réacteur, et le silence autour.",
  palette: { core: "#75DDEB", accent: "#6654E8", glow: "rgba(117,221,235,.18)" },
  startSceneId: "s_veille",
  variablesInitiales: {
    integrite: 72, oxygene: 88, confiance_equipage: 5,
    derive: 0, savoir: 2, ambition: 3, equilibre: 3, rayonnement: 2,
  },
  modificateurs: [
    { si: { variable: "decors", valeur: "anneau" }, alors: { integrite: 6 } },
    { si: { variable: "ambiance", valeur: "calme" }, alors: { equilibre: 5 } },
    { si: { variable: "ambiance", valeur: "tension" }, alors: { confiance_equipage: 4, equilibre: 1 } },
    { si: { variable: "defi", valeur: "reacteur" }, alors: { integrite: -10, oxygene: -4 } },
    { si: { variable: "defi", valeur: "debris" }, alors: { integrite: -6, derive: 2 } },
    { si: { variable: "role", valeur: "ingenieur" }, alors: { savoir: 5 } },
    { si: { variable: "role", valeur: "commandant" }, alors: { confiance_equipage: 8, rayonnement: 4 } },
  ],
  variablesAffichees: [
    { cle: "integrite", nom: "Intégrité station", max: 100 },
    { cle: "oxygene", nom: "Oxygène", max: 100 },
    { cle: "confiance_equipage", nom: "Confiance équipage", max: 12 },
    { cle: "derive", nom: "Dérive orbitale", max: 10 },
    { cle: "savoir", nom: "Savoir technique", max: 12 },
  ],
  objects: {
    o_cle: { nom: "Clé dynamométrique gravée", detail: "Un outil qui vient de l'ancien équipage. Les initiales sont usées." },
    o_log: { nom: "Journal de bord tronqué", detail: "Douze heures manquent, sans raison technique." },
    o_signal: { nom: "Boucle de signal étrangère", detail: "Un motif répétitif, très lent, qui ne vient pas de la Terre." },
    o_cristal: { nom: "Fragment de glace métallique", detail: "Froid même hors du sas. Il ne fond pas." },
  },
  objectifs: [
    { id: "g_maitriser", nom: "Maîtriser le réacteur", quand: "savoir >= 7" },
    { id: "g_equipage", nom: "Tenir l'équipage", quand: "confiance_equipage >= 9" },
    { id: "g_signal", nom: "Comprendre le signal", quand: "variable:signal_compris" },
    { id: "g_rentrer", nom: "Rentrer sans perte", quand: "integrite >= 55" },
  ],
  entry: {
    titre: "Orbite Basse",
    sous: "Jour 412 · anneau orbital · 400 km au-dessus du silence",
    corps: [
      "Vous ouvrez les yeux dans un cylindre qui tourne lentement. Dehors, la Terre passe toutes les quatre-vingt-dix minutes — un bleu qui ne se fatigue jamais.",
      "La station est vieille. Elle craque comme une maison de bois à l'aube. Vous connaissez chacun de ses bruits ; l'un d'eux, ce matin, est nouveau.",
    ],
    lieux: [
      { nom: "Baie d'observation", detail: "Deux fauteuils, un hublot de trois mètres, et une couverture que personne n'a jamais rangée." },
      { nom: "Salle des machines", detail: "Une chaleur douce, des voyants verts, et un voyant ambre qui s'allume sans vouloir s'éteindre." },
      { nom: "Carré d'équipage", detail: "Trois tasses, quatre occupants. Personne ne fait la remarque." },
      { nom: "Sas externe", detail: "Le froid s'y arrête net, comme impressionné." },
    ],
  },
  scenes: {
    /* --- Acte 1 : le réveil --- */
    s_veille: {
      id: "s_veille",
      place: "Baie d'observation",
      title: "Le bruit nouveau",
      body: [
        "Le son revient toutes les onze secondes. Un frottement, doux, quelque part sous le plancher.",
        "Sur la console d'alerte, aucun défaut n'est signalé. La station vous dit qu'elle va bien.",
      ],
      hotspots: [
        { id: "ob_hublot", nom: "Hublot", texte: "La Terre, et plus loin, une lumière qui ne bouge pas comme les autres." },
        { id: "ob_console", nom: "Console d'alerte", texte: "« Tous systèmes nominaux. » La ligne est écrite en vert, deux fois de suite." },
        { id: "ob_couverture", nom: "Couverture pliée", texte: "Sous elle, un outil oublié. La clé dynamométrique gravée.", objet: "o_cle" },
      ],
      choices: [
        {
          id: "c1", label: "Descendre écouter dans la salle des machines",
          hint: "Aller au bruit avant de réveiller qui que ce soit.",
          effects: [
            { op: "add", key: "savoir", value: 2 },
            { op: "set", key: "voie", value: "ecoute" },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
        {
          id: "c2", label: "Réveiller l'équipage maintenant",
          hint: "Plus d'yeux, mais l'alarme d'un jour commencé trop tôt.",
          effects: [
            { op: "add", key: "confiance_equipage", value: 2 },
            { op: "add", key: "equilibre", value: -1 },
            { op: "set", key: "voie", value: "collectif" },
            { op: "goto", sceneId: "s_carre" },
          ],
        },
        {
          id: "c3", label: "Consulter d'abord le journal de bord",
          hint: "Le passé renseigne parfois mieux que les capteurs.",
          effects: [
            { op: "add", key: "savoir", value: 1 },
            { op: "item", value: "o_log" },
            { op: "flag", value: "a_lu_le_journal" },
            { op: "set", key: "voie", value: "archives" },
            { op: "goto", sceneId: "s_archives" },
          ],
        },
      ],
    },

    s_archives: {
      id: "s_archives",
      place: "Salle des archives",
      title: "Douze heures manquantes",
      body: [
        "Le journal de bord s'arrête net, il y a trois semaines, puis reprend sans transition. Pas de panne : une coupure propre, décidée.",
        "Une main a écrit, dans la marge : « ne pas relancer le cycle 4 ».",
      ],
      hotspots: [
        { id: "ob_marge", nom: "Note en marge", texte: "L'écriture est appliquée, presque trop régulière pour être pressée." },
        { id: "ob_cycle", nom: "Fichier cycle 4", texte: "Accès refusé. Deux tentatives restantes avant verrouillage." },
      ],
      choices: [
        {
          id: "c1", label: "Forcer l'accès au fichier cycle 4",
          hint: "Vous aurez la vérité, et le système le saura.",
          effects: [
            { op: "add", key: "savoir", value: 4 },
            { op: "add", key: "integrite", value: -2 },
            { op: "flag", value: "acces_force" },
            { op: "set", key: "verite", value: "connue" },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
        {
          id: "c2", label: "Refermer et aller écouter le bruit",
          hint: "Respecter l'avertissement, pour l'instant.",
          effects: [
            { op: "add", key: "savoir", value: 1 },
            { op: "add", key: "prudence", value: 1 },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
      ],
    },

    s_carre: {
      id: "s_carre",
      place: "Carré d'équipage",
      title: "Trois tasses, quatre occupants",
      body: [
        "Ils arrivent un par un, les yeux encore lourds. Personne ne demande pourquoi vous les avez réveillés : ils l'entendent aussi.",
        "La commandante en second pose la question technique : « Combien de temps avant que ce bruit devienne un problème ? » Vous n'en savez rien.",
      ],
      hotspots: [
        { id: "ob_tasses", nom: "Les trois tasses", texte: "Quatre occupants, trois tasses. Un décompte qui ne tombe jamais juste." },
        { id: "ob_hublot2", nom: "Hublot du carré", texte: "Quelqu'un a collé un papier : « Ici, on ne compte pas les jours. »" },
      ],
      choices: [
        {
          id: "c1", label: "Dire la vérité : je n'en sais rien",
          hint: "Perdre en autorité, gagner en confiance.",
          effects: [
            { op: "add", key: "confiance_equipage", value: 4 },
            { op: "add", key: "rayonnement", value: -1 },
            { op: "set", key: "honnetete", value: true },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
        {
          id: "c2", label: "Donner un délai précis, quitte à le tenir plus tard",
          hint: "Le calme immédiat, au prix d'une dette.",
          effects: [
            { op: "add", key: "confiance_equipage", value: 2 },
            { op: "add", key: "ambition", value: 2 },
            { op: "set", key: "honnetete", value: false },
            { op: "set", key: "dette", value: 1 },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
        {
          id: "c3", label: "Confier la veille à l'équipage et y aller seul",
          hint: "Déléguer réellement, pas seulement en paroles.",
          effects: [
            { op: "add", key: "confiance_equipage", value: 6 },
            { op: "add", key: "equilibre", value: 1 },
            { op: "flag", value: "equipage_autonome" },
            { op: "goto", sceneId: "s_machines" },
          ],
        },
      ],
    },

    /* --- Acte 2 : le cœur --- */
    s_machines: {
      id: "s_machines",
      place: "Salle des machines",
      title: "Le voyant ambre",
      body: [
        "Le bruit vient du réacteur n° 2. Le voyant ambre pulse exactement au rythme du frottement.",
        "Deux options tiennent debout : purger le circuit, ce qui coûte de l'oxygène, ou remplacer la pièce, ce qui coûte du temps et de l'intégrité.",
      ],
      hotspots: [
        { id: "ob_reacteur", nom: "Réacteur n° 2", texte: "Chaud au point de faire vibrer l'air. Le cycle 4 tourne encore." },
        { id: "ob_glace", nom: "Dépôt sous la conduite", texte: "Une matière froide qui ne fond pas. Vous en détachez un fragment.", objet: "o_cristal" },
        { id: "ob_plaque", nom: "Plaque constructeur", texte: "Date de mise en service : deux ans après votre naissance. Cette station est plus vieille que vous." },
      ],
      choices: [
        {
          id: "c1", label: "Purger le circuit",
          hint: "Immédiat et sûr, mais vous respirez moins longtemps.",
          effects: [
            { op: "add", key: "oxygene", value: -18 },
            { op: "add", key: "integrite", value: 12 },
            { op: "set", key: "reacteur", value: "purge" },
            { op: "goto", sceneId: "s_signal" },
          ],
        },
        {
          id: "c2", label: "Remplacer la pièce soi-même",
          hint: "Dépend de ce que vous savez vraiment faire.",
          requires: { variable: "savoir", operateur: ">=", valeur: 6 },
          effects: [
            { op: "add", key: "integrite", value: 20 },
            { op: "add", key: "oxygene", value: -4 },
            { op: "add", key: "savoir", value: 2 },
            { op: "set", key: "reacteur", value: "reparation" },
            { op: "goto", sceneId: "s_signal" },
          ],
        },
        {
          id: "c3", label: "Demander à l'équipage de tenir la purge pendant que vous démontez",
          hint: "Coûte de l'autorité, épargne l'oxygène.",
          requires: { variable: "confiance_equipage", operateur: ">=", valeur: 8 },
          effects: [
            { op: "add", key: "integrite", value: 16 },
            { op: "add", key: "oxygene", value: -6 },
            { op: "add", key: "rayonnement", value: 3 },
            { op: "set", key: "reacteur", value: "coordination" },
            { op: "goto", sceneId: "s_signal" },
          ],
        },
        {
          id: "c4", label: "Isoler le réacteur et laisser le cycle 4 s'éteindre seul",
          hint: "Le plus simple. Le plus long à assumer.",
          requires: { variable: "verite", operateur: "==", valeur: "connue" },
          effects: [
            { op: "add", key: "integrite", value: -8 },
            { op: "add", key: "derive", value: 3 },
            { op: "set", key: "reacteur", value: "abandon" },
            { op: "flag", value: "a_choisi_le_silence" },
            { op: "goto", sceneId: "s_signal" },
          ],
        },
      ],
    },

    s_signal: {
      id: "s_signal",
      place: "Sas externe",
      title: "La lumière qui ne bouge pas comme les autres",
      body: [
        "Le réacteur est traité — provisoirement. La station a changé de bruit ; elle craque maintenant plus bas, comme quelqu'un qui se résigne.",
        "Pendant ce temps, dehors, une lumière répète un motif. Onze secondes, un silence, onze secondes.",
      ],
      hotspots: [
        { id: "ob_boucle", nom: "Enregistrer la boucle", texte: "Trois répétitions complètes. Ce n'est pas du bruit : c'est un motif.", objet: "o_signal" },
        { id: "ob_combinaison", nom: "Combinaison EVA", texte: "Quarante minutes d'autonomie. Il en faut trente-cinq pour aller voir." },
        { id: "ob_tableau", nom: "Tableau de bord", texte: "L'intégrité a tenu. L'oxygène, moins. Le compte est clair." },
      ],
      choices: [
        {
          id: "c1", label: "Sortir en EVA et s'approcher",
          hint: "Trente-cinq minutes aller. L'oxygène décide pour vous.",
          requires: { variable: "oxygene", operateur: ">=", valeur: 60 },
          effects: [
            { op: "add", key: "oxygene", value: -22 },
            { op: "add", key: "savoir", value: 4 },
            { op: "add", key: "derive", value: 2 },
            { op: "set", key: "signal_compris", value: true },
            { op: "goto", sceneId: "s_contact" },
          ],
        },
        {
          id: "c2", label: "Restituer le motif au sol et attendre la réponse",
          hint: "Trois heures de latence. La Terre finira par parler.",
          effects: [
            { op: "add", key: "confiance_equipage", value: 3 },
            { op: "add", key: "rayonnement", value: 2 },
            { op: "set", key: "a_transmis", value: true },
            { op: "flag", value: "a_transmis_au_sol" },
            { op: "goto", sceneId: "s_contact" },
          ],
        },
        {
          id: "c3", label: "Éteindre le récepteur et rentrer",
          hint: "Certaines portes se referment sans bruit.",
          effects: [
            { op: "add", key: "equilibre", value: 3 },
            { op: "add", key: "savoir", value: -1 },
            { op: "flag", value: "a_choisi_le_silence" },
            { op: "set", key: "signal_ignore", value: true },
            { op: "goto", sceneId: "s_fin_silence" },
          ],
        },
      ],
    },

    s_contact: {
      id: "s_contact",
      place: "Baie d'observation",
      title: "Ce que la lumière répond",
      body: [
        "Le motif n'est pas un message. C'est une **adresse** — répétée par une chose qui n'a peut-être pas de mot pour dire « ici ».",
        "Vous le comprenez à la quatrième répétition, et à cet instant précis, la station n'est plus tout à fait la même maison.",
      ],
      choices: [
        {
          id: "c1", label: "Écrire la découverte dans le journal de bord",
          hint: "Rendre la trouvaille transmissible.",
          effects: [
            { op: "add", key: "savoir", value: 3 },
            { op: "add", key: "rayonnement", value: 3 },
            { op: "set", key: "decouverte_partagee", value: true },
            { op: "flag", value: "decouverte_partagee" },
            { op: "goto", sceneId: "s_fin_lien" },
          ],
        },
        {
          id: "c2", label: "Garder l'information pour vous, le temps d'y penser",
          hint: "Votre secret. Votre poids.",
          effects: [
            { op: "add", key: "ambition", value: 3 },
            { op: "add", key: "confiance_equipage", value: -3 },
            { op: "set", key: "secret", value: true },
            { op: "goto", sceneId: "s_fin_secret" },
          ],
        },
        {
          id: "c3", label: "Poser une balise et laisser la suite à quelqu'un d'autre",
          hint: "Une décision qui vous dépasse un peu.",
          effects: [
            { op: "add", key: "equilibre", value: 4 },
            { op: "add", key: "integrite", value: -3 },
            { op: "goto", sceneId: "s_fin_legs" },
          ],
        },
      ],
    },

    /* --- Acte 3 : fins --- */
    s_fin_lien: {
      id: "s_fin_lien",
      place: "Baie d'observation",
      title: "Le mot « ici »",
      body: [
        "L'équipage relit votre entrée deux fois. La commandante en second note la date, puis la repose — comme si la date comptait plus que le reste.",
        "Vous avez répondu à une adresse. Quelque part, très loin, une chose sait enfin qu'on l'a entendue.",
      ],
      ending: { kind: "success" },
    },
    s_fin_secret: {
      id: "s_fin_secret",
      place: "Salle des archives",
      title: "Ce que vous emportez",
      body: [
        "Vous notez tout, puis vous fermez le fichier et vous vous asseyez dessus, au sens propre : sur le siège, devant l'écran éteint.",
        "L'équipage sent qu'il manque une phrase et ne la demande pas. La station repart vers le sol avec un passager de plus — vous, et votre silence.",
      ],
      ending: { kind: "bittersweet" },
    },
    s_fin_legs: {
      id: "s_fin_legs",
      place: "Sas externe",
      title: "Une balise quelque part",
      body: [
        "La balise s'allume, minuscule, et répète le motif une fois par heure pour les trois cents prochaines années.",
        "Vous rentrez. Le réacteur tiendra, ou ne tiendra pas. Vous n'aurez pas été le dernier à savoir — seulement l'un de ceux qui ont laissé la porte ouverte.",
      ],
      ending: { kind: "bittersweet" },
    },
    s_fin_silence: {
      id: "s_fin_silence",
      place: "Carré d'équipage",
      title: "Onze secondes de rien",
      body: [
        "Le récepteur éteint, le silence retrouve sa place. Le frottement du réacteur reprend sa cadence, et devient ce qu'il aurait toujours dû être : un bruit de fond.",
        "Vous dormez mieux cette nuit-là que depuis six mois. C'est un résultat, même s'il ne ressemble pas à une réponse.",
      ],
      ending: { kind: "loss" },
    },
  },
};
