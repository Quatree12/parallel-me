/* ============================================================
   PARALLEL ME - Point d'entree

   `brancherReplis` est appele apres chaque rendu : si un visuel
   ne se charge pas, la scene de repli prend sa place.
   ============================================================ */

import { peindre, lier, h, brut, idCourt } from "./state/dom.js";
import * as store from "./state/store.js";
import { ecranMultiverse } from "./ui/screens/multiverse.js";
import { ecranGenerator } from "./ui/screens/generator.js";
import { ecranEntree } from "./ui/screens/entree.js";
import { ecranCrossroads } from "./ui/screens/crossroads.js";
import { ecranJournal } from "./ui/screens/journal.js";
import { ecranAtlas } from "./ui/screens/atlas.js";
import { ecranUnivers } from "./ui/screens/univers.js";
import { brancherReplis } from "./ui/screens/mondes.js";
import { modaleRenommer, modaleSupprimer, modaleGerer, modaleFragment, modaleReinitialiser } from "./ui/modales.js";
import { modaleCreature } from "./ui/fiche-creature.js";
import { PACKS, brouillonVide, packPourDecor, libelle, ROLES, DECORS, AMBIANCES, DEFIS } from "./data/params.js";
import { CREATURES, creatureParId, drapeauDe, rencontrer } from "./data/creatures.js";
import { universVisuelParId } from "./data/univers-visuels.js";
import { etatInitial, appliquerChoix } from "./engine/narrative.js";
import { entree, creerBranche, dupliquer, decrireChangements } from "./engine/journal.js";
import { objectifAtteint } from "./ui/objectifs.js";

const racine = document.getElementById("app");
let interfaceLocale = { modale: null, hotspot: null, creature: null };

/* ---------- Theme visuel ---------- */

function appliquerTheme() {
  const univers = universVisuelParId(store.etat.universChoisi);
  const coquille = document.querySelector(".app-shell");
  if (!coquille) return;
  if (!univers) {
    coquille.removeAttribute("data-theme");
    coquille.style.removeProperty("--theme");
    return;
  }
  coquille.setAttribute("data-theme", univers.id);
  coquille.style.setProperty("--theme", univers.teinte);
}

/* ---------- Etat courant, branche ou lignee principale ---------- */

function brancheActive(univers) {
  if (!univers || !store.etat.brancheId) return null;
  return (univers.branches || []).find((b) => b.id === store.etat.brancheId) || null;
}

function journalActifDe(univers) {
  const b = brancheActive(univers);
  return b ? (b.entries || []) : (univers.journal || []);
}

function contexteDe(univers) {
  const b = brancheActive(univers);
  return {
    etatCourant: b ? b.state : (univers ? univers.state : null),
    journal: journalActifDe(univers),
    branche: b,
  };
}

/* ---------- Rendu ---------- */

function rendre() {
  const etat = store.etat;
  const univers = store.universActif();
  const ecran = etat.ecran;
  const contexte = univers ? contexteDe(univers) : null;

  let corps;
  switch (ecran) {
    case "generator": corps = ecranGenerator(etat); break;
    case "entree":    corps = univers ? ecranEntree(etat, univers) : ecranMultiverse(etat); break;
    case "crossroads":corps = univers ? ecranCrossroads(etat, univers, contexte) : ecranMultiverse(etat); break;
    case "journal":   corps = univers ? ecranJournal(etat, univers) : ecranMultiverse(etat); break;
    case "atlas":     corps = ecranAtlas(etat); break;
    case "univers":   corps = ecranUnivers(etat); break;
    default:          corps = ecranMultiverse(etat);
  }

  const onglets = [
    ["multiverse", "+", "Multivers"],
    ["univers", "U", "Univers"],
    ["generator", "*", "Creer"],
    ["journal", "=", "Journal"],
    ["atlas", "o", "Atlas"],
  ].map(([cle, icone, nom]) => h`
    <button data-act="onglet" data-ecran="${cle}" aria-current="${ecran === cle || (cle === "multiverse" && (ecran === "entree" || ecran === "crossroads")) ? "page" : "false"}">
      <span aria-hidden="true">${icone}</span><span>${nom}</span>
    </button>`).join("");

  const barre = univers || ecran === "multiverse" || ecran === "generator" || ecran === "atlas" || ecran === "univers"
    ? h`<nav class="barre-onglets" aria-label="Navigation principale">${brut(onglets)}</nav>`
    : "";

  const modale = interfaceLocale.modale || "";
  peindre(racine, h`${brut(corps)}${brut(barre)}${brut(modale)}`);
  appliquerTheme();
  brancherReplis(racine);
}

/* ---------- Persistance ---------- */

function majUnivers(id, transforme) {
  const index = store.etat.universes.findIndex((u) => u.id === id);
  if (index < 0) return null;
  const suivant = transforme(store.etat.universes[index]);
  suivant.updatedAt = Date.now();
  store.etat.universes[index] = suivant;
  store.persister();
  return suivant;
}

function journaliser(id, uneEntree) {
  majUnivers(id, (u) => {
    if (store.etat.brancheId) {
      return Object.assign({}, u, {
        branches: u.branches.map((b) =>
          b.id === store.etat.brancheId ? Object.assign({}, b, { entries: b.entries.concat([uneEntree]) }) : b
        ),
      });
    }
    return Object.assign({}, u, { journal: u.journal.concat([uneEntree]) });
  });
}

function etatCourantDe(univers) {
  return contexteDe(univers).etatCourant;
}

function remplacerEtatCourant(id, nouvelEtat) {
  majUnivers(id, (u) => {
    if (store.etat.brancheId) {
      return Object.assign({}, u, {
        branches: u.branches.map((b) => b.id === store.etat.brancheId ? Object.assign({}, b, { state: nouvelEtat }) : b),
      });
    }
    return Object.assign({}, u, { state: nouvelEtat });
  });
}

function ajouterDrapeau(id, drapeau) {
  const poser = (etatVise) => Object.assign({}, etatVise, {
    flags: etatVise.flags.indexOf(drapeau) !== -1 ? etatVise.flags : etatVise.flags.concat([drapeau]),
  });
  majUnivers(id, (u) => {
    if (store.etat.brancheId) {
      return Object.assign({}, u, {
        branches: u.branches.map((b) =>
          b.id === store.etat.brancheId ? Object.assign({}, b, { state: poser(b.state) }) : b),
      });
    }
    return Object.assign({}, u, { state: poser(u.state) });
  });
}

/* ---------- Actions ---------- */

const actions = {
  onglet(el) { store.aller(el.getAttribute("data-ecran")); },
  retour() { store.aller("multiverse"); },
  "retour-multiverse"() { store.aller("multiverse"); },

  nouvelle() {
    store.definirBrouillonGenerateur(brouillonVide());
    store.aller("generator");
  },

  "univers-choisir"(el) {
    store.definirUniversChoisi(el.getAttribute("data-univers"));
  },

  "volumes-univers"(el) {
    const id = el.getAttribute("data-id");
    const u = store.etat.universes.find((x) => x.id === id);
    if (!u) return;
    store.etat.actifId = u.id;
    interfaceLocale.modale = modaleGerer(u);
    rendre();
  },

  ouvrir(el) {
    store.activer(el.getAttribute("data-id"));
    const u = store.universActif();
    const pack = PACKS[u.packId];
    const deja = (u.state.visited || []).length > 1 || u.state.sceneId !== (pack ? pack.startSceneId : null);
    store.aller(deja ? "crossroads" : "entree");
  },

  reprendre(el) {
    const id = el.getAttribute("data-id") || store.etat.actifId;
    store.activer(id);
    const u = store.universActif();
    const pack = PACKS[u.packId];
    const deja = (u.state.visited || []).length > 1 || u.state.sceneId !== (pack ? pack.startSceneId : null);
    store.aller(deja ? "crossroads" : "entree");
  },

  entrer() { store.aller("crossroads"); },
  journal() { store.aller("journal"); },
  atlas() { store.aller("atlas"); },
  entree() { store.aller("entree"); },

  role(el) { majBrouillon({ role: el.getAttribute("data-valeur") }); },
  decor(el) { majBrouillon({ decor: el.getAttribute("data-valeur") }); },
  ambiance(el) { majBrouillon({ ambiance: el.getAttribute("data-valeur") }); },
  defi(el) { majBrouillon({ defi: el.getAttribute("data-valeur") }); },
  etape(el) { majBrouillon({ etape: Number(el.getAttribute("data-n")) }); },

  suivant() { majBrouillon({ etape: Math.min(3, ((store.etat.generateur && store.etat.generateur.etape) || 0) + 1) }); },
  precedent() { majBrouillon({ etape: Math.max(0, ((store.etat.generateur && store.etat.generateur.etape) || 0) - 1) }); },

  predefini(el) {
    const packId = el.getAttribute("data-pack");
    const meta = {
      space: ["ingenieur", "anneau", "tension", "reacteur"],
      studio: ["artiste", "atelier", "calme", "commande"],
      atlas: ["archiviste", "cite", "mystere", "carte_fausse"],
    }[packId];
    majBrouillon({
      packId: packId, nom: PACKS[packId].title,
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
      id: id,
      name: nom,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      packId: packId,
      params: params,
      state: etatInitial(pack, params),
      journal: [entree("creation", "Univers cree : " + nom, {
        detail: pack.title + " / " + params.role + " / " + params.mood + " / " + params.challenge +
          (params.freeNote ? " / " + params.freeNote : ""),
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

  fragment(el) {
    const nom = el.getAttribute("data-nom") || el.textContent.trim();
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const courant = etatCourantDe(univers);
    const scene = (pack && pack.scenes && pack.scenes[courant.sceneId]) ||
      (pack && pack.scenes && pack.scenes[pack.startSceneId]);
    const hotspot = ((scene && scene.hotspots) || []).find((x) => x.nom === nom);
    if (!hotspot) return;
    interfaceLocale.modale = modaleFragment(hotspot.nom, hotspot.texte);

    if (hotspot.objet) {
      const objet = pack.objects && pack.objects[hotspot.objet];
      journaliser(univers.id, entree("item", "Objet decouvert : " +
        ((objet && objet.nom) || hotspot.objet), {
        detail: (objet && objet.detail) || "",
        sceneId: courant.sceneId,
      }));
      ajouterDrapeau(univers.id, "objet:" + hotspot.objet);
    }
    rendre();
  },

  creature(el) {
    const id = el.getAttribute("data-creature");
    const creature = creatureParId(id);
    if (!creature) return;
    const univers = store.universActif();
    if (!univers) return;

    const courant = etatCourantDe(univers);
    const dejaVue = courant.flags.indexOf(drapeauDe(creature)) !== -1;

    interfaceLocale.modale = modaleCreature(creature, dejaVue);

    if (!dejaVue) {
      const apres = rencontrer(courant, creature);
      remplacerEtatCourant(univers.id, apres);
      journaliser(univers.id, entree("item", "Creature rencontree : " + creature.nom, {
        detail: creature.titre + " / " + creature.role,
        sceneId: courant.sceneId,
      }));
    }
    rendre();
  },

  choisir(el) {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const courant = etatCourantDe(univers);
    const scene = pack.scenes[courant.sceneId];
    if (!scene) return;
    const choix = scene.choices.find((c) => c.id === el.getAttribute("data-choix"));
    if (!choix) return;

    const resultat = appliquerChoix(courant, choix, pack);
    const suivant = resultat.etat;
    const changements = resultat.changements;
    const objets = resultat.objets;
    if (resultat.avertissement) store.signaler(resultat.avertissement);

    const dejaInscrits = suivant.objectifsJournalises || [];
    const nouveaux = [];
    for (const o of (pack.objectifs || [])) {
      if (!objectifAtteint(o, suivant)) continue;
      if (dejaInscrits.indexOf(o.id) !== -1) continue;
      nouveaux.push(o);
    }
    const etatFinal = Object.assign({}, suivant, {
      objectifsJournalises: dejaInscrits.concat(nouveaux.map((o) => o.id)),
    });

    remplacerEtatCourant(univers.id, etatFinal);

    const detail = [
      decrireChangements(changements),
      objets.length ? "objet : " + objets.map((o) => (pack.objects[o] && pack.objects[o].nom) || o).join(", ") : "",
      choix.hint ? "Enjeu : " + choix.hint : "",
    ].filter(Boolean).join(" - ");

    journaliser(univers.id, Object.assign(
      entree("choice", choix.label, {
        detail: detail,
        sceneId: etatFinal.sceneId,
        changements: changements,
        objets: objets,
      }),
      { etatApres: etatFinal }
    ));

    for (const o of nouveaux) {
      journaliser(univers.id, entree("goal", "Objectif atteint : " + o.nom, {
        sceneId: etatFinal.sceneId,
      }));
    }

    const sceneSuivante = pack.scenes[etatFinal.sceneId];
    if (sceneSuivante && sceneSuivante.ending) {
      journaliser(univers.id, entree("scene", "Fin atteinte : " + sceneSuivante.title, {
        detail: "Issue : " + sceneSuivante.ending.kind,
        sceneId: etatFinal.sceneId,
      }));
    }

    store.aller("crossroads");
  },

  rien() { /* choix verrouille : aucun effet */ },

  "branche-depuis"(el) {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    const sceneId = el.getAttribute("data-scene");
    const scene = pack.scenes[sceneId];
    if (!scene) return;
    const maj = creerBranche(univers, sceneId, scene.title);
    majUnivers(univers.id, () => maj);
    const nouvelle = maj.branches[maj.branches.length - 1];
    if (!nouvelle) { store.signaler("Creation de branche impossible."); return; }
    store.etat.brancheId = nouvelle.id;
    store.notifier();
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
    const courant = etatCourantDe(univers);
    const scene = pack.scenes[courant.sceneId];
    if (!scene) return;
    const maj = creerBranche(univers, scene.id, scene.title);
    majUnivers(univers.id, () => maj);
    const nouvelle = maj.branches[maj.branches.length - 1];
    if (nouvelle) store.etat.brancheId = nouvelle.id;
    store.notifier();
  },

  recommencer() {
    const univers = store.universActif();
    const pack = PACKS[univers.packId];
    majUnivers(univers.id, (u) => Object.assign({}, u, {
      state: etatInitial(pack, u.params),
      journal: u.journal.concat([entree("scene", "Univers recommence", {
        detail: "Nouvelle lignee principale, branches conservees.",
        sceneId: pack.startSceneId,
      })]),
    }));
    store.etat.brancheId = null;
    store.aller("entree");
  },

  volumes() { interfaceLocale.modale = modaleGerer(store.universActif()); rendre(); },
  "gerer-dupliquer"(el) {
    const id = el.getAttribute("data-id");
    const u = store.etat.universes.find((x) => x.id === id);
    const res = dupliquer(u, store.etat.universes);
    store.etat.universes = res.tous;
    store.etat.actifId = res.copie.id;
    store.etat.brancheId = null;
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
    const nom = ((champ && champ.value) || "").trim();
    if (!nom) { store.signaler("Le nom ne peut pas etre vide."); return; }
    majUnivers(id, (u) => Object.assign({}, u, { name: nom }));
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
      const reste = store.etat.universes.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
      store.etat.actifId = reste ? reste.id : null;
      store.etat.brancheId = null;
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

  "atlas-choisir"(el) {
    const id = el.getAttribute("data-id");
    const s = store.etat.atlasSelection || [];
    const neuve = s.indexOf(id) !== -1 ? s.filter((x) => x !== id) : s.concat([id]).slice(-2);
    store.etat.atlasSelection = neuve;
    store.notifier();
  },
  "atlas-ouvrir"(el) { actions.ouvrir(el); },
  "atlas-dupliquer"(el) {
    const id = el.getAttribute("data-id");
    const u = store.etat.universes.find((x) => x.id === id);
    const res = dupliquer(u, store.etat.universes);
    store.etat.universes = res.tous;
    store.etat.actifId = res.copie.id;
    store.persister();
    store.aller("crossroads");
  },
  "atlas-gerer"(el) {
    const u = store.etat.universes.find((x) => x.id === el.getAttribute("data-id"));
    store.etat.actifId = u.id;
    interfaceLocale.modale = modaleGerer(u);
    rendre();
  },

  "fermer-modale"() { interfaceLocale.modale = null; rendre(); },
  "fermer-voile"(el) {
    if (el === el.target || el.getAttribute("data-act") === "fermer-modale") {
      interfaceLocale.modale = null;
      rendre();
    }
  },
};

function majBrouillon(partiel) {
  const base = store.etat.generateur || brouillonVide();
  const b = Object.assign({}, base, partiel);
  b.packId = packPourDecor(b.decor, b.defi);
  store.definirBrouillonGenerateur(b);
}

const saisies = {
  nom: (el) => majBrouillon({ nom: el.value }),
  libreRole: (el) => majBrouillon({ libreRole: el.value }),
  libreDecor: (el) => majBrouillon({ libreDecor: el.value }),
  note: (el) => majBrouillon({ note: el.value }),
  libre: () => {},
  "nom-modale": () => {},
};

lier(racine, actions);
racine.addEventListener("input", (e) => {
  const cible = e.target.closest ? e.target.closest("[data-act-input]") : null;
  if (cible) {
    const f = saisies[cible.getAttribute("data-act-input")];
    if (f) f(cible);
  }
});
store.sAbonner(rendre);

window.addEventListener("pagehide", () => store.persister());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") store.persister();
});

store.amorcer();
