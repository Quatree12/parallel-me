/* ============================================================
   PARALLEL ME — Journal et branches
   §3.3 et §5.3 des fondations. Le journal est append-only : on
   n'y réécrit jamais une entrée. Une branche possède son propre
   journal, et l'univers d'origine n'est jamais modifié.
   ============================================================ */

import { idCourt } from "../state/dom.js";

/** Fabrique une entrée de journal. */
export function entree(kind, label, options = {}) {
  return {
    id: idCourt("j"),
    at: Date.now(),
    kind,
    label,
    detail: options.detail || "",
    sceneId: options.sceneId || null,
    branchId: options.branchId || null,
    changements: options.changements || [],
    objets: options.objets || [],
  };
}

/** Libellé lisible d'un changement de variable, pour le journal. */
export function decrireChangements(changements) {
  if (!changements?.length) return "";
  return changements
    .map((c) => `${c.cle} ${formatValeur(c.avant)} → ${formatValeur(c.apres)}`)
    .join(" · ");
}

function formatValeur(v) {
  if (typeof v === "boolean") return v ? "oui" : "non";
  if (typeof v === "number") return String(v);
  return String(v);
}

/**
 * Crée une branche depuis une scène déjà visitée (§5.3).
 * La branche copie l'état TEL QU'IL ÉTAIT avant le choix divergent,
 * puis rejoue à partir de là. `univers` n'est pas modifié ici : la
 * fonction renvoie un nouvel univers que l'appelant installe.
 */
export function creerBranche(univers, sceneId, labelScene) {
  const journalOrigine = univers.journal || [];
  // On retrouve l'état au moment où la scène a été atteinte, pour
  // que la branche parte réellement d'avant la divergence.
  const indexEntree = journalOrigine.findIndex((e) => e.sceneId === sceneId);
  const etatAuMoment = indexEntree >= 0
    ? journalOrigine[indexEntree].etatApres || univers.state
    : { ...univers.state };

  const branche = {
    id: idCourt("b"),
    label: `Branche depuis « ${labelScene} »`,
    parentSceneId: sceneId,
    createdAt: Date.now(),
    state: {
      sceneId,
      variables: { ...(etatAuMoment.variables || {}) },
      flags: [...(etatAuMoment.flags || [])],
      visited: [...(etatAuMoment.visited || [])],
    },
    entries: [
      entree("branch", `Bifurcation : ${labelScene}`, {
        detail: "Nouvelle lignée créée sans modifier l'histoire d'origine.",
      }),
    ],
  };

  return {
    ...univers,
    updatedAt: Date.now(),
    brancheIdDerniere: branche.id,
    branches: [...(univers.branches || []), branche],
    journal: [
      ...journalOrigine,
      entree("branch", `Branche ouverte : ${labelScene}`, {
        detail: "L'histoire d'origine reste intacte.",
      }),
    ],
  };
}

/** Duplication indépendante (§T9) : aucune référence partagée. */
export function dupliquer(univers, tous) {
  const copie = structuredClone(univers);
  copie.id = idCourt("u");
  copie.name = `${univers.name} — copie`;
  copie.createdAt = Date.now();
  copie.updatedAt = Date.now();
  copie.originId = univers.id;
  copie.branches = (univers.branches || []).map((b) => ({ ...b, id: idCourt("b") }));
  copie.journal = [
    ...(univers.journal || []),
    entree("creation", "Univers dupliqué", {
      detail: `Copie de « ${univers.name} ». Les deux évoluent désormais séparément.`,
    }),
  ];
  return { copie, tous: [...tous, copie] };
}

/** Étiquettes des scènes visitées, pour la comparaison (§5.4). */
export function trajectoire(univers, pack) {
  return (univers.state.visited || [])
    .map((id) => pack?.scenes?.[id]?.title || id)
    .filter(Boolean);
}
