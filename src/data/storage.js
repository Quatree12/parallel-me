/* ============================================================
   PARALLEL ME — Persistance versionnée
   §1.3 des fondations. Aucune corruption ne doit produire un
   écran blanc : tout échec de lecture renvoie un multivers vide
   accompagné d'un drapeau d'erreur que l'interface affiche.
   ============================================================ */

const CLE = "parallelme:v1:universes";
const VERSION = 1;

/** Mémoire de secours si localStorage est indisponible (mode privé). */
const memoire = new Map();
let secoursActif = false;

function disponible() {
  try {
    const t = "__parallelme_test__";
    window.localStorage.setItem(t, "1");
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

const utilisable = (() => {
  try { return disponible(); } catch { return false; }
})();

export function enModeSecours() {
  return secoursActif || !utilisable;
}

function lireBrut() {
  if (utilisable) return window.localStorage.getItem(CLE);
  return memoire.get(CLE) ?? null;
}

function ecrireBrut(valeur) {
  if (utilisable) {
    window.localStorage.setItem(CLE, valeur);
    return;
  }
  memoire.set(CLE, valeur);
  secoursActif = true;
}

/**
 * Charge le multivers.
 * @returns {{ universes: Array, erreur: string|null }}
 */
export function charger() {
  let brut = null;
  try {
    brut = lireBrut();
  } catch (e) {
    return { universes: [], erreur: "Lecture du stockage impossible.", technique: String(e) };
  }
  if (brut == null) return { universes: [], erreur: null };

  let donnees;
  try {
    donnees = JSON.parse(brut);
  } catch {
    // On ne supprime rien d'office : l'utilisateur décide (§5.5).
    return {
      universes: [],
      erreur: "Les données sauvegardées sont illisibles. Vous pouvez réinitialiser le multivers.",
      corrompu: true,
    };
  }

  if (!donnees || typeof donnees !== "object" || !Array.isArray(donnees.universes)) {
    return {
      universes: [],
      erreur: "Format de sauvegarde inattendu. Vous pouvez réinitialiser le multivers.",
      corrompu: true,
    };
  }

  if (donnees.version !== VERSION) {
    // Aucune migration nécessaire pour l'instant, mais on trace.
    return { universes: donnees.universes.map(completer), erreur: null };
  }

  return { universes: donnees.universes.map(completer), erreur: null };
}

/** Un univers partiel ne doit jamais faire planter un écran. */
function completer(u) {
  if (!u || typeof u !== "object") return null;
  return {
    id: u.id || `u_${Math.random().toString(36).slice(2, 10)}`,
    name: u.name || "Univers sans nom",
    createdAt: u.createdAt || Date.now(),
    updatedAt: u.updatedAt || u.createdAt || Date.now(),
    packId: u.packId || "space",
    params: u.params || { role: "—", setting: "—", mood: "—", challenge: "—", freeNote: "" },
    state: {
      sceneId: u.state?.sceneId || "",
      variables: u.state?.variables || {},
      flags: Array.isArray(u.state?.flags) ? u.state.flags : [],
      visited: Array.isArray(u.state?.visited) ? u.state.visited : [],
    },
    // `etatApres` est indispensable : creerBranche s'en sert pour
    // retrouver l'état d'avant la divergence. Le jeter ici ferait
    // repartir chaque branche du mauvais point après un rechargement.
    journal: (Array.isArray(u.journal) ? u.journal : []).map(completerEntree),
    branches: (Array.isArray(u.branches) ? u.branches : []).map((b) => ({
      ...b,
      state: b?.state || { sceneId: "", variables: {}, flags: [], visited: [] },
      entries: (Array.isArray(b?.entries) ? b.entries : []).map(completerEntree),
    })),
    originId: u.originId ?? null,
  };
}

/** Une entrée de journal conserve son instantané d'état, indispensable
 *  à la bifurcation. On ne garde que les champs utiles d'un état. */
function completerEntree(e) {
  if (!e || typeof e !== "object") return e;
  if (!e.etatApres) return e;
  const s = e.etatApres;
  return {
    ...e,
    etatApres: {
      sceneId: s.sceneId || "",
      variables: s.variables || {},
      flags: Array.isArray(s.flags) ? s.flags : [],
      visited: Array.isArray(s.visited) ? s.visited : [],
    },
  };
}

/**
 * Sauvegarde l'ensemble. Renvoie `{ ok, erreur }` — l'appelant
 * affiche la bannière si l'écriture a échoué (quota, mode privé).
 */
export function sauver(universes) {
  try {
    ecrireBrut(JSON.stringify({ version: VERSION, universes }));
    return { ok: true, erreur: null };
  } catch (e) {
    secoursActif = true;
    try {
      memoire.set(CLE, JSON.stringify({ version: VERSION, universes }));
      return { ok: false, erreur: "Sauvegarde durable indisponible : progression gardée pour cette session seulement." };
    } catch {
      return { ok: false, erreur: `Sauvegarde impossible : ${String(e)}` };
    }
  }
}

/** Efface tout, sur décision explicite de l'utilisateur. */
export function reinitialiser() {
  try {
    if (utilisable) window.localStorage.removeItem(CLE);
    memoire.delete(CLE);
    return { ok: true };
  } catch (e) {
    return { ok: false, erreur: String(e) };
  }
}

/** Clé exportée pour les tests qui inspectent le stockage brut. */
export const CLE_STOCKAGE = CLE;
