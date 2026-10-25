/* ============================================================
   PACK 03 — « Les Cartographes »
   Rôle : cartographe d'un monde imaginaire. Décor : cité de
   veilleuses flottantes. Défi : une carte qui ment sur ce
   qu'elle contient.
   Contenu PRÉÉCRIT (§0).
   ============================================================ */

export const packAtlas = {
  id: "atlas",
  title: "Les Cartographes",
  tagline: "Une carte se trompe toujours quelque part. La question est : exprès ?",
  palette: { core: "#C7B9FF", accent: "#75DDEB", glow: "rgba(199,185,255,.20)" },
  startSceneId: "s_table",
  variablesInitiales: {
    verite: 4, reseau: 3, usure: 0, mystere: 5,
    ambition: 3, equilibre: 3, rayonnement: 2,
  },
  modificateurs: [
    { si: { variable: "ambiance", valeur: "mystere" }, alors: { mystere: 5 } },
    { si: { variable: "ambiance", valeur: "fievre" }, alors: { reseau: 4, usure: 2 } },
    { si: { variable: "defi", valeur: "carte_fausse" }, alors: { verite: -2, mystere: 3 } },
    { si: { variable: "defi", valeur: "disparition" }, alors: { reseau: -2, usure: 1 } },
    { si: { variable: "role", valeur: "explorateur" }, alors: { mystere: 2, usure: 1 } },
    { si: { variable: "role", valeur: "archiviste" }, alors: { verite: 4 } },
  ],
  variablesAffichees: [
    { cle: "verite", nom: "Justesse de la carte", max: 14 },
    { cle: "reseau", nom: "Réseau d'informateurs", max: 12 },
    { cle: "mystere", nom: "Compréhension du monde", max: 14 },
    { cle: "usure", nom: "Usure", max: 10 },
  ],
  objects: {
    o_carte: { nom: "Carte au bord brûlé", detail: "La brûlure suit exactement une frontière. Ce n'est pas un accident." },
    o_boussole: { nom: "Boussole désaimantée", detail: "Elle indique quelque chose, mais pas le nord." },
    o_fiole: { nom: "Fiole d'air de la cité", detail: "L'air y pèse plus lourd qu'ailleurs, et sent la pierre chaude." },
    o_registre: { nom: "Registre des disparus", detail: "Neuf noms, et une ligne qui a été grattée." },
  },
  objectifs: [
    { id: "g_juste", nom: "Corriger la carte", quand: "verite >= 9" },
    { id: "g_reseau", nom: "Trouver des témoins", quand: "reseau >= 7" },
    { id: "g_monde", nom: "Comprendre la cité", quand: "mystere >= 9" },
    { id: "g_tenir", nom: "Tenir physiquement", quand: "usure <= 4" },
  ],
  entry: {
    titre: "Les Cartographes",
    sous: "Cité de Veilleuses · l'air pèse 1,3 fois plus qu'en bas",
    corps: [
      "La cité flotte à six cents mètres, retenue par des veilleuses qu'on ne sait plus réparer, seulement entretenir.",
      "Sur votre table, une carte de la cité — la vôtre, taillée à la main pendant sept ans. Au bord, une brûlure nette, en forme de frontière.",
    ],
    lieux: [
      { nom: "La table de travail", detail: "Deux mètres de papier, quatre paires de ciseaux, aucune gomme." },
      { nom: "Le belvédère bas", detail: "D'où l'on voit la cité du dessous, celle qu'on dit inhabitée." },
      { nom: "Le bureau des registres", detail: "Une pièce tiède, un employé qui connaît les noms par cœur." },
      { nom: "La passerelle nord", detail: "Fermée depuis neuf mois. Officiellement pour travaux." },
    ],
  },
  scenes: {
    s_table: {
      id: "s_table",
      place: "La table de travail",
      title: "Le bord brûlé",
      body: [
        "La brûlure épouse la frontière nord comme si on l'avait posée là exprès. Une main a décidé que ce quartier ne devait pas figurer.",
        "Vous connaissez ce coin : vous y avez grandi. Il n'est pas vide.",
      ],
      hotspots: [
        { id: "ob_brulure", nom: "Bord brûlé", texte: "La coupe est trop régulière. Un instrument, pas un incendie.", objet: "o_carte" },
        { id: "ob_ciseaux", nom: "Ciseaux", texte: "Des ciseaux de cartographe. Vous en avez déjà utilisé pour corriger, jamais pour effacer." },
        { id: "ob_loupe", nom: "Loupe", texte: "Sous la loupe, un trait plus clair : quelqu'un a redessiné par-dessus." },
      ],
      choices: [
        {
          id: "c1", label: "Aller vérifier sur place, au bord brûlé",
          hint: "Voir de ses yeux coûte de l'usure.",
          effects: [
            { op: "add", key: "verite", value: 3 },
            { op: "add", key: "usure", value: 2 },
            { op: "set", key: "voie", value: "terrain" },
            { op: "goto", sceneId: "s_belvedere" },
          ],
        },
        {
          id: "c2", label: "Aller au bureau des registres d'abord",
          hint: "Les noms sont plus fiables que les boussoles.",
          effects: [
            { op: "add", key: "reseau", value: 2 },
            { op: "item", value: "o_registre" },
            { op: "set", key: "voie", value: "registres" },
            { op: "goto", sceneId: "s_registres" },
          ],
        },
        {
          id: "c3", label: "Interroger la boussole désaimantée",
          hint: "Elle sait quelque chose depuis longtemps.",
          effects: [
            { op: "add", key: "mystere", value: 3 },
            { op: "item", value: "o_boussole" },
            { op: "set", key: "voie", value: "objet" },
            { op: "goto", sceneId: "s_boussole" },
          ],
        },
      ],
    },

    s_registres: {
      id: "s_registres",
      place: "Bureau des registres",
      title: "Neuf noms",
      body: [
        "L'employé fait glisser le registre sans qu'on le lui demande. Neuf noms, tous du même quartier, tous « partis en bas ».",
        "Une ligne a été grattée. Sous la gratture, on devine un dixième nom : le vôtre.",
      ],
      choices: [
        {
          id: "c1", label: "Demander à l'employé ce qu'il a vu",
          hint: "Il est là depuis trente ans. Il sait.",
          effects: [
            { op: "add", key: "reseau", value: 4 },
            { op: "add", key: "verite", value: 2 },
            { op: "flag", value: "temoignage_cle" },
            { op: "goto", sceneId: "s_belvedere" },
          ],
        },
        {
          id: "c2", label: "Copier le registre et repartir sans rien dire",
          hint: "L'information comme puissance, pas comme échange.",
          effects: [
            { op: "add", key: "verite", value: 3 },
            { op: "add", key: "reseau", value: -2 },
            { op: "add", key: "ambition", value: 2 },
            { op: "goto", sceneId: "s_belvedere" },
          ],
        },
      ],
    },

    s_boussole: {
      id: "s_boussole",
      place: "Le belvédère bas",
      title: "Ce qu'indique l'aiguille",
      body: [
        "L'aiguille pointe vers le bas. Pas vers le nord : vers le bas. Deux doigts de pente suffisent à la faire s'affoler.",
        "En bas, il y a la cité du dessous. Celle que votre carte appelle « quartier nord ». Ce ne sont pas deux lieux : c'est un seul.",
      ],
      hotspots: [
        { id: "ob_pente", nom: "Mesure de pente", texte: "1,3 degré d'inclinaison par mètre. La cité descend, très lentement." },
        { id: "ob_air", nom: "Prélèvement d'air", texte: "L'air du dessous sent la pierre chaude. Vous en mettez une fiole dans votre poche.", objet: "o_fiole" },
      ],
      choices: [
        {
          id: "c1", label: "Descendre vers la cité du dessous",
          hint: "Le trajet le plus direct, et le plus coûteux.",
          requires: { variable: "usure", operateur: "<=", valeur: 6 },
          effects: [
            { op: "add", key: "usure", value: 3 },
            { op: "add", key: "mystere", value: 4 },
            { op: "flag", value: "a_vu_le_dessous" },
            { op: "set", key: "descendu", value: true },
            { op: "goto", sceneId: "s_assemblage" },
          ],
        },
        {
          id: "c2", label: "Rebrousser chemin et comparer les deux cartes",
          hint: "Travailler sur table plutôt qu'en terrain.",
          effects: [
            { op: "add", key: "verite", value: 3 },
            { op: "add", key: "usure", value: -1 },
            { op: "set", key: "descendu", value: false },
            { op: "goto", sceneId: "s_assemblage" },
          ],
        },
        {
          id: "c3", label: "Faire descendre quelqu'un d'autre, avec le réseau",
          hint: "Le réseau fait le travail, vous gardez vos jambes.",
          requires: { variable: "reseau", operateur: ">=", valeur: 6 },
          effects: [
            { op: "add", key: "reseau", value: 2 },
            { op: "add", key: "verite", value: 2 },
            { op: "add", key: "mystere", value: 1 },
            { op: "flag", value: "reseau_a_agi" },
            { op: "set", key: "descendu", value: false },
            { op: "goto", sceneId: "s_assemblage" },
          ],
        },
      ],
    },

    s_belvedere: {
      id: "s_belvedere",
      place: "Passerelle nord",
      title: "La porte qu'on ne répare pas",
      body: [
        "Neuf mois de travaux, et rien n'a bougé. Sous le panneau, quelqu'un a écrit à la craie : « ce n'est pas cassé, c'est fermé ».",
        "Derrière, la passerelle tient encore. La rouille est superficielle — et l'air, en bas, est tiède.",
      ],
      hotspots: [
        { id: "ob_craie", nom: "Inscription à la craie", texte: "Même écriture appliquée que celle du registre gratté." },
        { id: "ob_rouille", nom: "Structure", texte: "Solide. On ne répare pas ce qui n'est pas cassé ; on le cache." },
      ],
      choices: [
        {
          id: "c1", label: "Ouvrir la passerelle et passer",
          hint: "Ce que les gens du quartier savent déjà.",
          effects: [
            { op: "add", key: "verite", value: 4 },
            { op: "add", key: "usure", value: 2 },
            { op: "add", key: "mystere", value: 2 },
            { op: "flag", value: "passerelle_ouverte" },
            { op: "goto", sceneId: "s_assemblage" },
          ],
        },
        {
          id: "c2", label: "Noter la fermeture et rentrer sans forcer",
          hint: "La carte s'améliore sans que personne ne le sache.",
          effects: [
            { op: "add", key: "verite", value: 2 },
            { op: "add", key: "reseau", value: 1 },
            { op: "goto", sceneId: "s_assemblage" },
          ],
        },
      ],
    },

    s_assemblage: {
      id: "s_assemblage",
      place: "La table de travail",
      title: "Le moment de redessiner",
      body: [
        "Vous avez de quoi corriger la carte. Corriger signifie admettre que sept ans de travail contenaient une décision qui n'était pas la vôtre.",
        "Une carte fausse qui aide les gens, ou une carte juste qui leur coûte un quartier. Il faut choisir.",
      ],
      hotspots: [
        { id: "ob_encre", nom: "Encre de correction", texte: "Assez pour deux traits. Pas pour trois." },
        { id: "ob_fenetre", nom: "Fenêtre", texte: "En bas, les lumières du quartier nord s'allument à la même heure que les vôtres. Toujours." },
      ],
      choices: [
        {
          id: "c1", label: "Publier la carte corrigée, avec le quartier nord apparent",
          hint: "La vérité, et l'obligation de reloger.",
          effects: [
            { op: "add", key: "verite", value: 5 },
            { op: "add", key: "rayonnement", value: 4 },
            { op: "add", key: "reseau", value: -3 },
            { op: "set", key: "publication", value: "corrigee" },
            { op: "goto", sceneId: "s_fin_carte" },
          ],
        },
        {
          id: "c2", label: "Garder la carte telle quelle et travailler en dessous, discrètement",
          hint: "Protéger les gens sans leur dire pourquoi.",
          effects: [
            { op: "add", key: "mystere", value: 3 },
            { op: "add", key: "reseau", value: 3 },
            { op: "add", key: "verite", value: -2 },
            { op: "set", key: "publication", value: "silence" },
            { op: "goto", sceneId: "s_fin_silence" },
          ],
        },
        {
          id: "c3", label: "Brûler la carte entière et repartir du réel",
          hint: "Sept ans. La main qui brûle est la vôtre.",
          requires: { variable: "verite", operateur: ">=", valeur: 8 },
          effects: [
            { op: "add", key: "verite", value: 3 },
            { op: "add", key: "mystere", value: 3 },
            { op: "add", key: "usure", value: 2 },
            { op: "flag", value: "carte_brulee" },
            { op: "set", key: "publication", value: "brulee" },
            { op: "goto", sceneId: "s_fin_brulee" },
          ],
        },
      ],
    },

    s_fin_carte: {
      id: "s_fin_carte",
      place: "Place centrale",
      title: "La carte affichée",
      body: [
        "On colle la carte corrigée sur le mur de la place. Trois cents personnes la lisent en une matinée ; deux cents repartent sans rien dire.",
        "Vous avez rendu le quartier visible. Il faudra maintenant le rendre habitable, et ça demande des années que vous n'avez peut-être pas.",
      ],
      ending: { kind: "success" },
    },
    s_fin_silence: {
      id: "s_fin_silence",
      place: "La table de travail",
      title: "Ce qui se fait sous la carte",
      body: [
        "Vous continuez à imprimer la version officielle et à annoter la vraie dans vos marges. Vingt-deux familles passent par vos notes chaque mois.",
        "Personne ne connaîtra votre nom. Le réseau, lui, le connaît — c'est un registre qui n'a pas de gratture.",
      ],
      ending: { kind: "bittersweet" },
    },
    s_fin_brulee: {
      id: "s_fin_brulee",
      place: "La table de travail",
      title: "Cendres utiles",
      body: [
        "La carte a brûlé en onze minutes. Le lendemain, vous commencez à marcher les rues, un carnet sans colonne ni légende.",
        "C'est plus lent. C'est aussi la première fois en sept ans que vous ne craignez pas de vous tromper exprès.",
      ],
      ending: { kind: "bittersweet" },
    },
  },
};
