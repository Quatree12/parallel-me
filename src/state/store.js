/* ============================================================
   PARALLEL ME - Store observable
   L'etat complet est serialisable tel quel. C'est ce qui rend la
   sauvegarde et la comparaison triviales.

   Ajout : `universChoisi`, le theme visuel actif. Ce champ vit
   HORS de `universes` : c'est un habillage, pas une partie
   sauvegardee, et il ne touche donc jamais au moteur narratif ni
   a la persistance des vies alternatives.
   ============================================================ */

import * as storage from "../data/storage.js";

const abonnes = new Set();

export const etat = {
  pret: false,
  erreurStockage: null,
  corrompu: false,
  ecran: "multiverse",
  universes: [],
  actifId: null,
  brancheId: null,
  generateur: null,
  universChoisi: null,
  atlasSelection: [],
};

export function sAbonner(fn) {
  abonnes.add(fn);
  return () => abonnes.delete(fn);
}

export function notifier() {
  for (const fn of abonnes) {
    try { fn(); } catch (e) { console.error("[PARALLEL ME] abonne en echec", e); }
  }
}

export function amorcer() {
  const res = storage.charger();
  etat.universes = res.universes.filter(Boolean);
  etat.erreurStockage = res.erreur || null;
  etat.corrompu = Boolean(res.corrompu);
  etat.pret = true;
  const dernier = etat.universes.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
  etat.actifId = dernier ? dernier.id : null;
  notifier();
}

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

export function signaler(erreur, corrompu) {
  etat.erreurStockage = erreur;
  etat.corrompu = Boolean(corrompu);
  notifier();
}

/** Theme visuel : un habillage, jamais persiste avec les vies. Toucher l'univers actif le desactive. */
export function definirUniversChoisi(id) {
  etat.universChoisi = (etat.universChoisi === id) ? null : id;
  notifier();
}

export function reinitialiserTout() {
  const res = storage.reinitialiser();
  etat.universes = [];
  etat.actifId = null;
  etat.brancheId = null;
  etat.corrompu = false;
  etat.erreurStockage = res.ok ? "Multivers reinitialise." : "Reinitialisation impossible : " + res.erreur;
  notifier();
}
