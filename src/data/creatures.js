/* ============================================================
   PARALLEL ME - Creatures du multivers
   Registre des sept creatures. Donnees pures : aucun acces au
   DOM, aucune dependance a l'interface. Chaque creature porte son
   nom, son univers d'origine, son role et les variables qu'elle
   module.

   Provenance : ces noms et libelles viennent de la planche de
   direction artistique fournie par le proprietaire du projet.
   ============================================================ */

export const CREATURES = [
  {
    id: "lumi",
    nom: "Lumi",
    univers: "aquaria",
    titre: "Reveuse",
    role: "Eclaire une voie sans rien imposer",
    note: "Elle flotte ou la lumiere ne va pas. La suivre rend visible ce qui etait cache.",
    teinte: "#75DDEB",
    effet: { flag: "objet:lumi", variables: { mystere: 1 } },
  },
  {
    id: "zephyr",
    nom: "Zephyr",
    univers: "solaris",
    titre: "Libre",
    role: "Ouvre un passage que rien ne semblait permettre",
    note: "Il ne se pose jamais longtemps. Le vent qu'il laisse derriere lui indique une direction.",
    teinte: "#F29BBF",
    effet: { flag: "objet:zephyr", variables: { equilibre: 1 } },
  },
  {
    id: "nyx",
    nom: "Nyx",
    univers: "nexus",
    titre: "Protecteur",
    role: "Veille sur ce qui a ete confie",
    note: "Assis a l'angle des passerelles, il compte les passages. Il ne dort que d'un oeil.",
    teinte: "#C7B9FF",
    effet: { flag: "objet:nyx", variables: { confiance_equipage: 1 } },
  },
  {
    id: "orion",
    nom: "Orion",
    univers: "terra-lumina",
    titre: "Sage",
    role: "Se souvient de ce que la ville a oublie",
    note: "Il connait les chemins anciens, ceux d'avant les cartes. On l'interroge une fois.",
    teinte: "#75DDEB",
    effet: { flag: "objet:orion", variables: { verite: 2 } },
  },
  {
    id: "pixie",
    nom: "Pixie",
    univers: "dreamy",
    titre: "Joyeuse",
    role: "Rend possible ce qui paraissait inutile",
    note: "Elle transforme un geste ordinaire en geste qui compte. Rarement au bon moment, jamais pour rien.",
    teinte: "#F29BBF",
    effet: { flag: "objet:pixie", variables: { rayonnement: 2 } },
  },
  {
    id: "kai",
    nom: "Kai",
    univers: "umbra",
    titre: "Fier",
    role: "Garde l'orgueil d'un choix difficile",
    note: "Il ne propose rien. Sa seule presence rappelle qu'un refus peut etre tenu.",
    teinte: "#6654E8",
    effet: { flag: "objet:kai", variables: { ambition: 2 } },
  },
  {
    id: "bloom",
    nom: "Bloom",
    univers: "lysea",
    titre: "Unique",
    role: "Marque la fin d'une chose et le debut d'une autre",
    note: "Elle ne ressemble a aucune autre, et c'est precisement ce qu'elle enseigne.",
    teinte: "#C7B9FF",
    effet: { flag: "objet:bloom", variables: { integrite_oeuvre: 1 } },
  },
];

/** Retrouve une creature par son identifiant. */
export function creatureParId(id) {
  return CREATURES.find((c) => c.id === id) || null;
}

/** Creatures liees a un univers donne. */
export function creaturesDe(univers) {
  return CREATURES.filter((c) => c.univers === univers);
}

/** Identifiant de drapeau d'une creature, tel qu'ecrit dans l'etat. */
export function drapeauDe(creature) {
  return "objet:" + creature.id;
}

/**
 * Applique l'effet d'une rencontre a un etat.
 * Renvoie un NOUVEL etat ; ne modifie jamais celui qu'on lui passe.
 * L'effet est deterministe : aucune lecture d'horloge, aucun hasard.
 */
export function rencontrer(etat, creature) {
  if (!etat || !creature) return etat;
  const variables = Object.assign({}, etat.variables);
  const effets = creature.effet.variables || {};
  for (const cle of Object.keys(effets)) {
    variables[cle] = Number(variables[cle] || 0) + Number(effets[cle]);
  }
  const drapeau = drapeauDe(creature);
  const flags = etat.flags.indexOf(drapeau) !== -1 ? etat.flags : etat.flags.concat([drapeau]);
  return Object.assign({}, etat, { variables: variables, flags: flags });
}
