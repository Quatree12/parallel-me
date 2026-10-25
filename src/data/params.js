/* ============================================================
   PARALLEL ME — Options du LIFE GENERATOR
   §6 : options prédéfinies + saisie libre. Les intitulés de rôle
   restent génériques — les packs décident de ce qu'ils en font,
   via leurs `modificateurs`.
   ============================================================ */

import { packSpace } from "./packs/space.js";
import { packStudio } from "./packs/studio.js";
import { packAtlas } from "./packs/atlas.js";

export const PACKS = {
  space: packSpace,
  studio: packStudio,
  atlas: packAtlas,
};

/** Les trois univers livrés, présentés au choix de départ. */
export const UNIVERS_PREDEFINIS = [
  {
    packId: "space",
    nom: "Orbite Basse",
    resume: "Station ancienne, réacteur n° 2, une lumière qui répète un motif.",
    role: "ingénieur",
  },
  {
    packId: "studio",
    nom: "Atelier 4 h",
    resume: "Une commande qui finance un an, et qui contredit onze mois de travail.",
    role: "artiste",
  },
  {
    packId: "atlas",
    nom: "Les Cartographes",
    resume: "Une carte brûlée au bord, un quartier qu'on a décidé d'effacer.",
    role: "archiviste",
  },
];

export const ROLES = [
  { id: "ingenieur", nom: "Ingénieur", note: "Le savoir avant l'action." },
  { id: "commandant", nom: "Commandant", note: "Les autres avant soi." },
  { id: "artiste", nom: "Artiste", note: "L'œuvre avant l'accord." },
  { id: "architecte", nom: "Architecte", note: "La structure avant le geste." },
  { id: "explorateur", nom: "Explorateur", note: "Le terrain avant la carte." },
  { id: "archiviste", nom: "Archiviste", note: "La preuve avant l'élan." },
  { id: "fondateur", nom: "Fondateur", note: "Le futur avant le confort." },
];

export const DECORS = [
  { id: "anneau", nom: "Anneau orbital", note: "Une station qui tourne, 90 min par jour." },
  { id: "atelier", nom: "Atelier d'altitude", note: "Quatre étages sans ascenseur, une fenêtre ouverte." },
  { id: "cite", nom: "Cité de veilleuses", note: "Un air plus lourd, des structures qui descendent." },
  { id: "chantier", nom: "Chantier inachevé", note: "Du béton, des grues, et une date dépassée." },
  { id: "libre", nom: "Décor libre", note: "Décrivez-le vous-même." },
];

export const AMBIANCES = [
  { id: "calme", nom: "Calme", note: "Le temps de respirer entre deux décisions." },
  { id: "tension", nom: "Tension", note: "Chaque scène appuie un peu plus." },
  { id: "mystere", nom: "Mystère", note: "On ne comprend qu'à la fin." },
  { id: "fievre", nom: "Fièvre", note: "Trop vite, trop fort, trop de gens." },
];

export const DEFIS = [
  { id: "reacteur", nom: "Une machine lâche", note: "Technique, mesurable, sans méchant." },
  { id: "commande", nom: "Une commande qui dérange", note: "Ce qui paie contre ce qu'on veut faire." },
  { id: "carte_fausse", nom: "Une vérité cachée", note: "Quelqu'un a décidé pour vous." },
  { id: "debris", nom: "Un danger extérieur", note: "Rien de personnel, et c'est pire." },
  { id: "rupture", nom: "Tout quitter", note: "L'option que personne ne conseille." },
  { id: "disparition", nom: "Une disparition", note: "Quelqu'un manque, et on fait comme si non." },
];

/** Associe un décor à un pack existant, ou renvoie null pour un décor libre. */
export function packPourDecor(decorId, defiId) {
  if (defiId === "commande" || decorId === "atelier") return "studio";
  if (defiId === "carte_fausse" || decorId === "cite") return "atlas";
  if (decorId === "anneau" || defiId === "reacteur" || defiId === "debris") return "space";
  return "space";
}

/** Libellé affichable d'un id d'option, quel que soit le champ. */
export function libelle(liste, id) {
  return liste.find((o) => o.id === id)?.nom || id || "—";
}

/** Brouillon initial du LIFE GENERATOR. */
export function brouillonVide() {
  return {
    nom: "",
    role: "ingenieur",
    decor: "anneau",
    ambiance: "tension",
    defi: "reacteur",
    libreRole: "",
    libreDecor: "",
    note: "",
    packId: "space",
    etape: 0,
  };
}
