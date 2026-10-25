/* ============================================================
   PACK 02 — « Atelier 4 h »
   Rôle : artiste plasticien. Décor : atelier au dernier étage.
   Défi : une commande qui finance un an — et qui vous contredit.
   Contenu PRÉÉCRIT (§0).
   ============================================================ */

export const packStudio = {
  id: "studio",
  title: "Atelier 4 h",
  tagline: "Une commande, une vérité, et trois murs à moitié peints.",
  palette: { core: "#F29BBF", accent: "#C7B9FF", glow: "rgba(242,155,191,.18)" },
  startSceneId: "s_reveil",
  variablesInitiales: {
    argent: 3, integrite_oeuvre: 6, visibilite: 2, sommeil: 5,
    ambition: 3, equilibre: 3, rayonnement: 2,
  },
  modificateurs: [
    { si: { variable: "ambiance", valeur: "calme" }, alors: { sommeil: 4 } },
    { si: { variable: "ambiance", valeur: "tension" }, alors: { visibilite: 4, sommeil: -2 } },
    { si: { variable: "defi", valeur: "commande" }, alors: { argent: 4, integrite_oeuvre: -2 } },
    { si: { variable: "defi", valeur: "rupture" }, alors: { integrite_oeuvre: 3, argent: -1 } },
    { si: { variable: "role", valeur: "artiste" }, alors: { integrite_oeuvre: 3 } },
    { si: { variable: "role", valeur: "architecte" }, alors: { argent: 3, visibilite: 2 } },
  ],
  variablesAffichees: [
    { cle: "argent", nom: "Mois de loyer d'avance", max: 10 },
    { cle: "integrite_oeuvre", nom: "Intégrité de l'œuvre", max: 14 },
    { cle: "visibilite", nom: "Visibilité", max: 12 },
    { cle: "sommeil", nom: "Sommeil accumulé", max: 12 },
  ],
  objects: {
    o_carnet: { nom: "Carnet taché", detail: "Cent pages, une seule idée reformulée cent fois." },
    o_lettre: { nom: "Lettre du galeriste", detail: "Deux paragraphes polis, un troisième qui ne l'est pas." },
    o_echantillon: { nom: "Échantillon de pigment", detail: "Un rose qui n'existe dans aucun nuancier vendu." },
    o_photo: { nom: "Polaroïd d'ouverture", detail: "L'atelier vide, la veille. Le sol était propre." },
  },
  objectifs: [
    { id: "g_finir", nom: "Achever une pièce", quand: "integrite_oeuvre >= 9" },
    { id: "g_vivre", nom: "Payer le mois", quand: "argent >= 5" },
    { id: "g_regard", nom: "Être vu", quand: "visibilite >= 6" },
    { id: "g_soi", nom: "Ne pas se perdre", quand: "sommeil >= 6" },
  ],
  entry: {
    titre: "Atelier 4 h",
    sous: "Quatrième étage sans ascenseur · la fenêtre ne ferme plus depuis mars",
    corps: [
      "L'atelier sent la térébenthine et le café froid. Sur le mur du fond, une toile commencée il y a onze mois, recouverte trois fois.",
      "Sur la table : une enveloppe ouverte. Le galeriste propose une exposition — à condition que la série change de ton.",
    ],
    lieux: [
      { nom: "Le mur du fond", detail: "Trois couches de peinture, dont deux que vous regrettez encore." },
      { nom: "Le coin cuisine", detail: "Un réchaud, deux tasses, aucune vaisselle propre." },
      { nom: "La fenêtre", detail: "Elle ne ferme plus. Vous avez fini par aimer l'air." },
      { nom: "Le carton de commandes", detail: "Trois factures, deux relances, une réponse à écrire." },
    ],
  },
  scenes: {
    s_reveil: {
      id: "s_reveil",
      place: "Le coin cuisine",
      title: "L'enveloppe ouverte",
      body: [
        "Quatre heures du matin. Vous relisez la proposition pour la sixième fois : « votre travail est fort, mais il faudrait quelque chose de plus chaleureux ».",
        "Deux chiffres tournent : le loyer, et ce que vous voulez peindre.",
      ],
      hotspots: [
        { id: "ob_enveloppe", nom: "La lettre", texte: "Le troisième paragraphe propose de revoir « la palette générale ».", objet: "o_lettre" },
        { id: "ob_carnet", nom: "Carnet", texte: "La même idée, cent fois, et à la page 71 une variante qui tient debout.", objet: "o_carnet" },
        { id: "ob_thermo", nom: "Thermomètre", texte: "14 °C. Vous ne l'aviez pas remarqué avant cette année." },
      ],
      choices: [
        {
          id: "c1", label: "Accepter la commande telle qu'elle est",
          hint: "Trois mois de loyer, une œuvre qui n'est plus tout à fait la vôtre.",
          effects: [
            { op: "add", key: "argent", value: 5 },
            { op: "add", key: "integrite_oeuvre", value: -3 },
            { op: "set", key: "voie", value: "commande" },
            { op: "goto", sceneId: "s_commande" },
          ],
        },
        {
          id: "c2", label: "Répondre par une contre-proposition",
          hint: "Garder la main, risquer le silence en retour.",
          effects: [
            { op: "add", key: "argent", value: -1 },
            { op: "add", key: "integrite_oeuvre", value: 2 },
            { op: "add", key: "visibilite", value: 1 },
            { op: "set", key: "voie", value: "negociation" },
            { op: "goto", sceneId: "s_negociation" },
          ],
        },
        {
          id: "c3", label: "Ne pas répondre aujourd'hui et travailler",
          hint: "Le silence aussi est une réponse — plus tard.",
          effects: [
            { op: "add", key: "integrite_oeuvre", value: 4 },
            { op: "add", key: "sommeil", value: -2 },
            { op: "item", value: "o_photo" },
            { op: "set", key: "voie", value: "oeuvre" },
            { op: "goto", sceneId: "s_toile" },
          ],
        },
      ],
    },

    s_negociation: {
      id: "s_negociation",
      place: "Le carton de commandes",
      title: "Un mail de quatre lignes",
      body: [
        "Vous écrivez quatre lignes, vous en supprimez deux, vous envoyez les deux restantes avant de pouvoir vous raviser.",
        "La réponse arrive en dix-neuf minutes : « venez, on en parle ».",
      ],
      choices: [
        {
          id: "c1", label: "Y aller demain matin, à jeun et fatigué",
          hint: "Négocier sans arme.",
          effects: [
            { op: "add", key: "sommeil", value: -2 },
            { op: "add", key: "visibilite", value: 4 },
            { op: "add", key: "argent", value: 3 },
            { op: "set", key: "entrevue", value: true },
            { op: "goto", sceneId: "s_commande" },
          ],
        },
        {
          id: "c2", label: "Proposer de montrer la toile en cours d'abord",
          hint: "Mettre l'œuvre devant l'argument.",
          effects: [
            { op: "add", key: "integrite_oeuvre", value: 2 },
            { op: "add", key: "visibilite", value: 2 },
            { op: "set", key: "entrevue", value: false },
            { op: "goto", sceneId: "s_toile" },
          ],
        },
      ],
    },

    s_commande: {
      id: "s_commande",
      place: "Le mur du fond",
      title: "Peindre ce qu'on vous demande",
      body: [
        "La consigne est claire : des tons doux, des formats vendables, rien qui demande un effort au regard.",
        "Vous commencez. La main va plus vite que d'habitude, et c'est bien le problème.",
      ],
      hotspots: [
        { id: "ob_pigment", nom: "Pot de pigment", texte: "Un rose qui n'est pas au nuancier. Vous ne savez plus d'où il vient.", objet: "o_echantillon" },
        { id: "ob_radio", nom: "Radio", texte: "Une émission sur un peintre qui a brûlé toute sa série. Personne ne sait s'il l'a regretté." },
      ],
      choices: [
        {
          id: "c1", label: "Livrer exactement ce qui est demandé",
          hint: "L'argent tombe. L'œuvre ne vous ressemble pas.",
          effects: [
            { op: "add", key: "argent", value: 4 },
            { op: "add", key: "integrite_oeuvre", value: -4 },
            { op: "add", key: "visibilite", value: 3 },
            { op: "set", key: "livraison", value: "conforme" },
            { op: "goto", sceneId: "s_vernissage" },
          ],
        },
        {
          id: "c2", label: "Glisser une seule pièce vraie dans la série",
          hint: "Un cheval de Troie minuscule.",
          effects: [
            { op: "add", key: "argent", value: 3 },
            { op: "add", key: "integrite_oeuvre", value: 2 },
            { op: "add", key: "visibilite", value: 4 },
            { op: "set", key: "livraison", value: "troie" },
            { op: "goto", sceneId: "s_vernissage" },
          ],
        },
        {
          id: "c3", label: "Livrer la série puis peindre la vraie toile la nuit",
          hint: "Deux vies dans le même mois.",
          requires: { variable: "sommeil", operateur: ">=", valeur: 4 },
          effects: [
            { op: "add", key: "sommeil", value: -3 },
            { op: "add", key: "integrite_oeuvre", value: 5 },
            { op: "add", key: "argent", value: 3 },
            { op: "flag", value: "double_vie" },
            { op: "set", key: "livraison", value: "double" },
            { op: "goto", sceneId: "s_vernissage" },
          ],
        },
      ],
    },

    s_toile: {
      id: "s_toile",
      place: "Le mur du fond",
      title: "La couche sous les couches",
      body: [
        "En grattant, vous retrouvez la première version — celle d'il y a onze mois. Elle était meilleure, et vous le saviez déjà.",
        "Le pigment rose est là, quelque part dessous. Vous l'aviez recouvert exprès.",
      ],
      hotspots: [
        { id: "ob_grattage", nom: "Spatule", texte: "Trois couches, c'est beaucoup. La quatrième est toujours la plus dangereuse." },
        { id: "ob_facture", nom: "Facture impayée", texte: "Vingt-deux jours de retard. Le ton de la lettre suivante se devine." },
      ],
      choices: [
        {
          id: "c1", label: "Tout reprendre depuis la première version",
          hint: "Détruire pour retrouver.",
          effects: [
            { op: "add", key: "integrite_oeuvre", value: 5 },
            { op: "add", key: "argent", value: -2 },
            { op: "add", key: "sommeil", value: -1 },
            { op: "set", key: "methode", value: "retour" },
            { op: "goto", sceneId: "s_vernissage" },
          ],
        },
        {
          id: "c2", label: "Garder les trois couches et peindre la quatrième comme un palimpseste",
          hint: "Faire de la contradiction le sujet.",
          requires: { variable: "integrite_oeuvre", operateur: ">=", valeur: 8 },
          effects: [
            { op: "add", key: "integrite_oeuvre", value: 6 },
            { op: "add", key: "visibilite", value: 2 },
            { op: "flag", value: "palimpseste" },
            { op: "set", key: "methode", value: "palimpseste" },
            { op: "goto", sceneId: "s_vernissage" },
          ],
        },
        {
          id: "c3", label: "Abandonner la toile et accepter la commande",
          hint: "Onze mois au mur, sans témoin.",
          effects: [
            { op: "add", key: "argent", value: 4 },
            { op: "add", key: "integrite_oeuvre", value: -5 },
            { op: "add", key: "equilibre", value: 2 },
            { op: "set", key: "methode", value: "abandon" },
            { op: "goto", sceneId: "s_commande" },
          ],
        },
      ],
    },

    s_vernissage: {
      id: "s_vernissage",
      place: "Galerie, rez-de-chaussée",
      title: "Les gens devant",
      body: [
        "Vingt-deux personnes, du vin tiède, et le bruit particulier des conversations qui ne parlent pas des tableaux.",
        "Quelqu'un s'arrête plus longtemps devant une pièce. Vous savez laquelle, vous ne regardez pas.",
      ],
      hotspots: [
        { id: "ob_livreor", nom: "Livre d'or", texte: "Deux remarques sincères, dix-neuf signatures." },
        { id: "ob_prix", nom: "Cartels", texte: "Les prix sont imprimés à l'avance. On n'en a pas discuté avec vous." },
      ],
      choices: [
        {
          id: "c1", label: "Aller parler à la personne qui s'est arrêtée",
          hint: "Risquer la vraie conversation.",
          effects: [
            { op: "add", key: "visibilite", value: 4 },
            { op: "add", key: "rayonnement", value: 3 },
            { op: "add", key: "sommeil", value: -1 },
            { op: "goto", sceneId: "s_fin_regard" },
          ],
        },
        {
          id: "c2", label: "Compter les ventes depuis le fond de la salle",
          hint: "L'argent, plus la fierté.",
          effects: [
            { op: "add", key: "argent", value: 3 },
            { op: "add", key: "equilibre", value: -2 },
            { op: "goto", sceneId: "s_fin_vente" },
          ],
        },
        {
          id: "c3", label: "Partir avant la fin et remonter à l'atelier",
          hint: "Le vernissage a eu lieu. C'est suffisant.",
          effects: [
            { op: "add", key: "sommeil", value: 3 },
            { op: "add", key: "integrite_oeuvre", value: 2 },
            { op: "add", key: "visibilite", value: -1 },
            { op: "goto", sceneId: "s_fin_atelier" },
          ],
        },
      ],
    },

    s_fin_regard: {
      id: "s_fin_regard",
      place: "Galerie",
      title: "Une phrase, deux personnes",
      body: [
        "La personne dit : « celle-là, on ne peut pas la vendre ». Puis, après un silence : « c'est un compliment ».",
        "Vous rentrez à pied. L'atelier sera froid, mais il y aura du travail dedans — et cette fois, vous savez lequel.",
      ],
      ending: { kind: "success" },
    },
    s_fin_vente: {
      id: "s_fin_vente",
      place: "Galerie",
      title: "Le compte est bon",
      body: [
        "Quatre pièces vendues. Le galeriste vous parle déjà de la prochaine série, avec le même mot : « chaleureux ».",
        "Vous rentrez en taxi. C'est la première fois depuis deux ans, et vous ne vous en réjouissez qu'à moitié.",
      ],
      ending: { kind: "bittersweet" },
    },
    s_fin_atelier: {
      id: "s_fin_atelier",
      place: "Atelier 4 h",
      title: "La fenêtre ouverte",
      body: [
        "La toile est là où vous l'avez laissée. Vous dormez cinq heures d'affilée, pour la première fois depuis des semaines.",
        "Demain, le loyer sera encore dû. Mais la main saura quoi faire, ce qui n'était pas gagné hier.",
      ],
      ending: { kind: "bittersweet" },
    },
  },
};
