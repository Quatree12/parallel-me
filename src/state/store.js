/* ============================================================
   PARALLEL ME — Store observable
   ~70 lignes. L'état complet est sérialisable tel quel : pas de
   Map, pas de Set, pas de fonction. C'est ce qui rend la
   sauvegarde et la comparaison triviales.
   ============================================================ */

import * as storage from "../data/storage.js";

const abonnes = new Set();

export const etat = {
  pret: false,            // lecture initiale terminée
  erreurStockage: null,   // message à afficher en bandeau
  corrompu: false,        // JSON illisible -> proposer réinitialisation
  ecran: "multiverse",    // multiverse | generator | entree | crossroads | journal | atlas
  universes: [],
  actifId: null,
  brancheId: null,        // null = lignée principale
  generateur: null,       // brouillon du LIFE GENERATOR
};

export function sAbonner(fn) {
  abonnes.add(fn);
  return () => abonnes.delete(fn);
}

export function notifier() {
  for (const fn of abonnes) {
    try { fn(); } catch (e) { console.error("[PARALLEL ME] abonné en échec", e); }
  }
}

/** Charge depuis le stockage et publie. Appelé une fois au démarrage. */
export function amorcer() {
  const res = storage.charger();
  etat.universes = res.universes.filter(Boolean);
  etat.erreurStockage = res.erreur || null;
  etat.corrompu = Boolean(res.corrompu);
  etat.pret = true;
  // Reprise : l'univers le plus récemment touché (§3.2).
  const dernier = [...etat.universes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  etat.actifId = dernier ? dernier.id : null;
  notifier();
}

/** Écrit sur disque et publie. Centralisé : aucune mutation ne saute la sauvegarde. */
export function persister() {
  const res = storage.sauver(etat.universes);
  if (!res.ok && res.erreur && etat.erreurStockage !== res.erreur) {
    etat.erreurStockage = res.erreur;
  }
  notifier();
}

export function universActif() {
  return etat.universes.find((u) => u.id === etat.actifId) || null;
}

export function brancheActive() {
  const u = universActif();
  if (!u || !etat.brancheId) return null;
  return u.branches.find((b) => b.id === etat.brancheId) || null;
}

/** Sélectionne un univers et rouvre exactement où il a été laissé (§T7). */
export function activer(id) {
  etat.actifId = id;
  etat.brancheId = null;
  notifier();
}

export function aller(ecran) {
  etat.ecran = ecran;
  notifier();
}

export function definirBrouillonGenerateur(brouillon) {
  etat.generateur = brouillon;
  notifier();
}

export function viderErreurStockage() {
  etat.erreurStockage = null;
  notifier();
}

export function signaler(erreur, corrompu = false) {
  etat.erreurStockage = erreur;
  etat.corrompu = corrompu;
  notifier();
}

export function reinitialiserTout() {
  const res = storage.reinitialiser();
  etat.universes = [];
  etat.actifId = null;
  etat.brancheId = null;
  etat.corrompu = false;
  etat.erreurStockage = res.ok ? "Multivers réinitialisé." : `Réinitialisation impossible : ${res.erreur}`;
  notifier();
}
