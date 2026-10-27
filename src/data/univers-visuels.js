/* ============================================================
   PARALLEL ME - Univers visuels
   Les huit directions artistiques de la planche de reference.
   Donnees pures : ni DOM, ni dependance. Le visuel est un chemin
   reel dans le depot ; s'il manque, mondeAnime() retombe sur SVG.

   Provenance : noms, slogans et mots-cles viennent de la planche
   fournie par le proprietaire du projet.
   ============================================================ */

export const UNIVERS_VISUELS = [
  {
    id: "auroria",
    nom: "Auroria",
    slogan: "Le monde des possibles",
    mots: ["Reve", "Creation", "Liberte", "Evasion"],
    teinte: "#F29BBF",
  },
  {
    id: "nebula-noir",
    nom: "Nebula Noir",
    slogan: "La ou tout est possible",
    mots: ["Tech", "Mystere", "Puissance", "Evolution"],
    teinte: "#6654E8",
  },
  {
    id: "terra-lumina",
    nom: "Terra Lumina",
    slogan: "L'equilibre en toi",
    mots: ["Nature", "Harmonie", "Bien-etre", "Connexion"],
    teinte: "#75DDEB",
  },
  {
    id: "voidalis",
    nom: "Voidalis",
    slogan: "Au-dela des limites",
    mots: ["Exploration", "Inconnu", "Infini", "Liberte"],
    teinte: "#C7B9FF",
  },
  {
    id: "neluna",
    nom: "Neluna",
    slogan: "La douceur du reel",
    mots: ["Elegance", "Serenite", "Intimite", "Authenticite"],
    teinte: "#F29BBF",
  },
  {
    id: "irisia",
    nom: "Irysia",
    slogan: "Le pouvoir de la legerete",
    mots: ["Couleurs", "Joie", "Creativite", "Fluidite"],
    teinte: "#75DDEB",
  },
  {
    id: "emelia",
    nom: "Emelia",
    slogan: "La force tranquille",
    mots: ["Intensite", "Equilibre", "Confiance", "Transformation"],
    teinte: "#4FD8B0",
  },
  {
    id: "noxora",
    nom: "Noxora",
    slogan: "L'art de se reinventer",
    mots: ["Style", "Creativite", "Ambition", "Depassement"],
    teinte: "#D9B45B",
  },
];

/** Retrouve un univers visuel par son identifiant. */
export function universVisuelParId(id) {
  return UNIVERS_VISUELS.find((u) => u.id === id) || null;
}

/**
 * Rattachement d'un pack narratif a un univers visuel.
 * Chaque pack existant prend le visuel qui lui correspond le mieux,
 * sans rien changer a son recit ni a ses variables.
 */
export const PACK_VERS_UNIVERS = {
  space: "noxora",        // la cite aux reflets d'or, la plus proche de la station
  studio: "neluna",       // interieurs doux, lumiere chaude
  atlas: "terra-lumina",  // cite suspendue, nature et architecture
};
