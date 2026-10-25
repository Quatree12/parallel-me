/* ============================================================
   PARALLEL ME — Point d'entrée
   Assemble les six écrans, câble les actions, garantit qu'aucun
   bouton n'est décoratif : chaque `data-act` a une entrée dans
   le tableau d'actions ci-dessous.
   ============================================================ */

import { peindre, lier, h, brut, idCourt, esc } from "./state/dom.js";
import * as store from "./state/store.js";
import { ecranMultiverse } from "./ui/screens/multiverse.js";
import { ecranGenerator } from "./ui/screens/generator.js";
import { ecranEntree } from "./ui/screens/entree.js";
import { ecranCrossroads } from "./ui/screens/crossroads.js";
import { ecranJournal } from "./ui/screens/journal.js";
import { ecranAtlas } from "./ui/screens/atlas.js";
import { nommerParametres } from "./ui/screens/atlas.js";
import { modaleRenommer, modaleSupprimer, modaleGerer, modaleFragment, modaleReinitialiser } from "./ui/modales.js";
import { PACKS, brouillonVide, packPourDecor, libelle, ROLES, DECORS, AMBIANCES, DEFIS } from "./data/params.js";
import { etatInitial, appliquerChoix, choixJouables } from "./engine/narrative.js";
import { entree, creerBranche, dupliquer, decrireChangements } from "./engine/journal.js";
import { objectifAtteint } from "./ui/objectifs.js";

const racine = document.getElementById("app");
let interfaceLocale = { modale: null, hotspot: null };

/* ---------- Rendu ---------- */

function rendre() {
  const etat = store.etat;
  const univers = store.universActif();
  const ecran = etat.ecran;

  let corps;
  switch (ecran) {
    case "generator": corps = ecranGenerator(etat); break;
    case "entree":    corps = univers ? ecranEntree(etat, univers) : ecranMultiverse(etat); break;
    case "crossroads":corps = univers ? ecranCrossroads(etat, univers) : ecranMultiverse(etat); break;
    case "journal":   corps = univers ? ecranJournal(etat, univers) : ecranMultiverse(etat); break;
    case "atlas":     corps = ecranAtlas(etat); break;
    default:          corps = ecranMultiverse(etat);
  }

  const onglets = [
    ["multiverse", "◍", "Multivers"],
    ["generator", "✧", "Créer"],
    ["journal", "▤", "Journal"],
    ["atlas", "◎", "Atlas"],
  ].map(([cle, icone, nom]) => h`
    <button data-act="onglet" data-ecran="${cle}" aria-current="${ecran === cle || (cle === "multiverse" && (ecran === "entree" || ecran === "crossroads")) ? "page" : "false"}">
      <span aria-hidden="true">${icone}</span><span>${nom}</span>
    </button>`).join("");

  const barre = univers || ecran === "multiverse" || ecran === "generator" || ecran === "atlas"
    ? h`<nav class="barre-onglets" aria-label="Navigation principale">${brut(onglets)}</nav>`
    : "";

  const modale = interfaceLocale.modale || "";
  peindre(racine, h`${brut(corps)}${brut(barre)}${brut(modale)}`);
}

/* ---------- Persistance de l'univers actif ---------- */

function majUnivers(id, transforme) {
  const index = store.etat.universes.findIndex((u) => u.id === id);
  if (index < 0) return null;
  const suivant = transforme(store.etat.universes[index]);
  suivant.updatedAt = Date.now();
  store.etat.universes[index] = suivant;
  store.persister();
  return suivant;
}

/** Écrit une entrée dans le journal actif (univers ou branche). */
function journaliser(id, uneEntree) {
  majUnivers(id, (u) => {
    if (store.etat.brancheId) {
      return {
        ...u,
        branches: u.branches.map((b) =>
          b.id === store.etat.brancheId ? { ...b, entries: [...b.entries, uneEntree] } : b
        ),
      };
    }
    return { ...u, journal: [...u.journal, uneEntree] };
  });
}

/** État courant : celui de la branche active, ou de l'univers. */
function etatCourantDe(univers) {
  if (!univers) return null;
  const b = (univers.branches || []).find((x) => x.id === store.etat.brancheId);
  return b ? b.state : univers.state;
}

function remplacerEtatCourant(id, nouvelEtat) {
  majUnivers(id, (u) => {
    if (store.etat.brancheId) {
      return {
        ...u,
        branches: u.branches.map((b) => b.id === store.etat.brancheId ? { ...b, state: nouvelEtat } : b),
      };
    }
    return { ...u, state: nouvelEtat };
  });
}

/* ---------- Actions ---------- */

const actions = {
  /* --- navigation --- */
  onglet(el) { store.aller(el.getAttribute("data-ecran")); },
  retour() { store.aller("multiverse"); },
  "retour-multiverse"() { store.aller("multiverse"); },

  nouvelle() {
    store.definirBrouillonGenerateur(brouillonVide());
    store.aller("generator");
  },

  ouvrir(el) {
    store.activer(el.getAttribute("data-id"));
    const u = store.universActif();
    const pack = PACKS[u.packId];
    // Reprise réelle : si l'on a déjà dépassé l'introduction, on
    // rouvre la scène enregistrée plutôt que l'entrée.
    const deja = (u.state.visited || []).length > 1 || u.state.sceneId !== pack?.startSceneId;
    store.aller(deja ? "crossroads" : "entree");
  },

  reprendre(el) {
    const id = el.getAttribute("data-id") || store.etat.actifId;
    store.activer(id);
    const u = store.universActif();
    const pack = PACKS[u.packId];
    const deja = (u.state.visited || []).length > 1 || u.state.sceneId !== pack?.startSceneId;
    store.aller(deja ? "crossroads" : "entree");
  },

  entrer() { store.aller("crossroads"); },
  journal() { store.aller("journal"); },
  atlas() { store.aller("atlas"); },
  entree() { store.aller("entree"); },

  /* --- LIFE GENERATOR --- */
  role(el) { majBrouillon({ role: el.getAttribute("data-valeur") }); },
  decor(el) { majBrouillon({ decor: el.getAttribute("data-valeur") }); },
  ambiance(el) { majBrouillon({ ambiance: el.getAttribute("data-valeur") }); },
  defi(el) { majBrouillon({ defi: el.getAttribute("data-valeur") }); },
  etape(el) { majBrouillon({ etape: Number(el.getAttribute("data-n")) }); },

  suivant() { majBrouillon({ etape: Math.min(3, (store.etat.generateur?.etape || 0) + 1) }); },
  precedent() { majBrouillon({ etape: Math.max(0, (store.etat.generateur?.etape || 0) - 1) }); },

  predefini(el) {
    const packId = el.getAttribute("data-pack");
    const meta = { space: ["ingenieur", "anneau", "tension", "reacteur"], studio: ["artiste", "atelier", "calme", "commande"], atlas: ["archiviste", "cite", "mystere", "carte_fausse"] }[packId];
    majBrouillon({
      packId, nom: PACKS[packId].title,
      role: meta[0], decor: meta[1], ambiance: meta[2], defi: meta[3], etape: 3,
    });
  },

  creer() {
    const b = store.etat.generateur;
    if (!b) return;
    const packId = packPourDecor(b.decor, b.defi);
    const pack = PACKS[packId];
    const nom = (b.nom || "").trim() || pack.title;
    const params = {
      role: b.libreRole || libelle(ROLES, b.role),
      setting: b.libreDecor || libelle(DECORS, b.decor),
      mood: libelle(AMBIANCES, b.ambiance),
      challenge: libelle(DEFIS, b.defi),
      freeNote: (b.note || "").trim(),
      roleId: b.role, decorId: b.decor, ambianceId: b.ambiance, defiId: b.defi,
      libreRole: (b.libreRole || "").trim(), libreDecor: (b.libreDecor || "").trim(),
    };

    const id = idCourt("u");
    const univers = {
      id,
      name: nom,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      packId,
      params,
      state: etatInitial(pack, params),
      journal: [entree("creation", `Univers créé : ${nom}`, {
        detail: `${pack.title} · ${params.role} · ${params.mood} · ${params.challenge}${params.freeNote ? ` · « ${params.freeNote} »` : ""}`,
        sceneId: pack.startSceneId,
      })],
      branches: [],
      originId: null,
    };
    univers.journal[0].etatApres = univers.state;

    store.etat.universes.push(univers);
    store.etat.actifId = id;
    store.etat.brancheId = null;
    store.persister();
    store.aller("entree");
  },

  /* --- ENTER THE WORLD --- */
  fragment(el) {
    const nom = el.getAttribute("data-nom") || el.textContent.trim();
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const scene = pack?.scenes?.[univers.state.sceneId] || pack?.scenes?.[pack.startSceneId];
    const hotspot = (scene?.hotspots || []).find((x) => x.nom === nom);
    if (!hotspot) return;
    interfaceLocale.modale = modaleFragment(hotspot.nom, hotspot.texte);
    if (hotspot.objet) {
      journaliser(univers.id, entree("item", `Objet découvert : ${pack.objects[hotspot.objet]?.nom || hotspot.objet}`, {
        detail: pack.objects[hotspot.objet]?.detail || "",
        sceneId: univers.state.sceneId,
      }));
      majUnivers(univers.id, (u) => {
        const cle = `objet:${hotspot.objet}`;
        const cible = store.etat.brancheId ? "branches" : null;
        if (cible) {
          return {
            ...u,
            branches: u.branches.map((b) => b.id === store.etat.brancheId
              ? { ...b, state: { ...b.state, flags: b.state.flags.includes(cle) ? b.state.flags : [...b.state.flags, cle] } }
              : b),
          };
        }
        return { ...u, state: { ...u.state, flags: u.state.flags.includes(cle) ? u.state.flags : [...u.state.flags, cle] } };
      });
    }
    rendre();
  },

  /* --- THE CROSSROADS --- */
  choisir(el) {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const courant = etatCourantDe(univers);
    const scene = pack.scenes[courant.sceneId];
    const choix = scene.choices.find((c) => c.id === el.getAttribute("data-choix"));
    if (!choix) return;

    const { etat: suivant, changements, objets, avertissement } = appliquerChoix(courant, choix, pack);
    if (avertissement) {
      store.signaler(avertissement);
    }

    remplacerEtatCourant(univers.id, suivant);

    journaliser(univers.id, {
      ...entree("choice", choix.label, {
        detail: [
          decrireChangements(changements),
          objets.length ? `objet : ${objets.map((o) => pack.objects[o]?.nom || o).join(", ")}` : "",
          choix.hint ? `Enjeu : ${choix.hint}` : "",
        ].filter(Boolean).join(" · "),
        sceneId: suivant.sceneId,
        changements,
        objets,
      }),
      etatApres: suivant,
    });

    store.aller("crossroads");
  },

  riren() { /* choix verrouillé : aucun effet, la raison est déjà affichée */ },
  rien() { /* idem */ },

  /* --- Journal / branches --- */
  "branche-depuis"(el) {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const sceneId = el.getAttribute("data-scene");
    const scene = pack.scenes[sceneId];
    const avant = univers.branches?.length || 0;
    const maj = creerBranche(univers, sceneId, scene.title);
    majUnivers(univers.id, () => maj);
    const nouvelle = maj.branches[maj.branches.length - 1];
    if (!nouvelle) { store.signaler("Création de branche impossible."); return; }
    store.etat.brancheId = nouvelle.id;
    store.notifier();
    void avant;
  },

  "branche-ouvrir"(el) {
    store.etat.brancheId = el.getAttribute("data-branche");
    store.notifier();
  },
  "branche-principale"() {
    store.etat.brancheId = null;
    store.notifier();
  },
  "branche-ici"() {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const scene = pack.scenes[univers.state.sceneId];
    const maj = creerBranche(univers, scene.id, scene.title);
    majUnivers(univers.id, () => maj);
    const nouvelle = maj.branches[maj.branches.length - 1];
    if (nouvelle) store.etat.brancheId = nouvelle.id;
    store.notifier();
  },

  recommencer() {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    majUnivers(univers.id, (u) => ({
      ...u,
      state: etatInitial(pack, u.params),
      journal: [...u.journal, entree("scene", "Univers recommencé", { detail: "Nouvelle lignée principale, branches conservées.", sceneId: pack.startSceneId })],
    }));
    store.etat.brancheId = null;
    store.aller("entree");
  },

  /* --- Gestion d'univers --- */
  volumes() { interfaceLocale.modale = modaleGerer(store.universActif()); rendre(); },
  "gerer-dupliquer"(el) {
    const id = el.getAttribute("data-id");
    const u = store.etat.universes.find((x) => x.id === id);
    const { copie, tous } = dupliquer(u, store.etat.universes);
    store.etat.universes = tous;
    store.etat.actifId = copie.id;
    interfaceLocale.modale = null;
    store.persister();
    store.aller("crossroads");
  },
  "gerer-recommencer"(el) {
    store.activer(el.getAttribute("data-id"));
    interfaceLocale.modale = null;
    actions.recommencer();
  },
  "renommer-ouvrir"(el) {
    const u = store.etat.universes.find((x) => x.id === el.getAttribute("data-id"));
    interfaceLocale.modale = modaleRenommer(u);
    rendre();
  },
  "renommer-valider"(el) {
    const id = el.getAttribute("data-id");
    const champ = racine.querySelector('[data-act-input="nom-modale"]');
    const nom = (champ?.value || "").trim();
    if (!nom) { store.signaler("Le nom ne peut pas être vide."); return; }
    majUnivers(id, (u) => ({ ...u, name: nom }));
    interfaceLocale.modale = null;
    store.notifier();
  },
  "supprimer-ouvrir"(el) {
    const u = store.etat.universes.find((x) => x.id === el.getAttribute("data-id"));
    interfaceLocale.modale = modaleSupprimer(u);
    rendre();
  },
  "supprimer-valider"(el) {
    const id = el.getAttribute("data-id");
    store.etat.universes = store.etat.universes.filter((u) => u.id !== id);
    if (store.etat.actifId === id) {
      const suivant = [...store.etat.universes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      store.etat.actifId = suivant ? suivant.id : null;
    }
    interfaceLocale.modale = null;
    store.persister();
    store.aller("multiverse");
  },
  reinit() { interfaceLocale.modale = modaleReinitialiser(); rendre(); },
  "reinit-valider"() {
    interfaceLocale.modale = null;
    store.reinitialiserTout();
  },

  /* --- THE ATLAS --- */
  "atlas-choisir"(el) {
    const id = el.getAttribute("data-id");
    const s = store.etat.atlasSelection || [];
    const neuve = s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2);
    store.etat.atlasSelection = neuve;
    store.notifier();
  },
  "atlas-ouvrir"(el) { actions.ouvrir(el); },
  "atlas-dupliquer"(el) {
    const id = el.getAttribute("data-id");
    const u = store.etat.universes.find((x) => x.id === id);
    const { copie, tous } = dupliquer(u, store.etat.universes);
    store.etat.universes = tous;
    store.etat.actifId = copie.id;
    store.persister();
    store.aller("crossroads");
  },
  "atlas-gerer"(el) {
    const u = store.etat.universes.find((x) => x.id === el.getAttribute("data-id"));
    store.etat.actifId = u.id;
    interfaceLocale.modale = modaleGerer(u);
    rendre();
  },

  /* --- Modales --- */
  "fermer-modale"() { interfaceLocale.modale = null; rendre(); },
  "fermer-voile"(el) {
    if (el === el.target || el.getAttribute("data-act") === "fermer-modale") {
      interfaceLocale.modale = null;
      rendre();
    }
  },
};

function majBrouillon(partiel) {
  const b = { ...(store.etat.generateur || brouillonVide()), ...partiel };
  b.packId = packPourDecor(b.decor, b.defi);
  store.definirBrouillonGenerateur(b);
}

/* ---------- Saisies ---------- */

const saisies = {
  nom: (el) => majBrouillon({ nom: el.value }),
  libreRole: (el) => majBrouillon({ libreRole: el.value }),
  libreDecor: (el) => majBrouillon({ libreDecor: el.value }),
  note: (el) => majBrouillon({ note: el.value }),
  libre: () => {},
  "nom-modale": () => {},
};

/* ---------- Démarrage ---------- */

lier(racine, actions);
racine.addEventListener("input", (e) => {
  const cible = e.target.closest?.("[data-act-input]");
  if (cible) {
    const f = saisies[cible.getAttribute("data-act-input")];
    if (f) f(cible);
  }
});
store.sAbonner(rendre);

// Un rechargement doit retrouver exactement la même scène (§T6).
window.addEventListener("pagehide", () => store.persister());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") store.persister();
});

store.amorcer();
