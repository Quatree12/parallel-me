/* ============================================================
   PARALLEL ME — Micro-couche DOM
   Volontairement minuscule. Le rendu reconstruit l'arbre de
   l'écran courant ; les écoutes sont donc posées après coup
   par `lier`. Aucune dépendance.
   ============================================================ */

/** Échappe le texte destiné à être inséré dans du HTML. */
export function esc(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Gabarit balisé -> chaîne HTML. Les expressions interpolées sont
 * échappées sauf si elles passent par `brut()`.
 */
const BRUT = Symbol("brut");
export function brut(html) {
  return { [BRUT]: true, html: String(html) };
}
function rendre(valeur) {
  if (valeur == null || valeur === false) return "";
  if (typeof valeur === "object" && valeur[BRUT]) return valeur.html;
  if (Array.isArray(valeur)) return valeur.map(rendre).join("");
  return esc(valeur);
}
export function h(gabarit, ...expressions) {
  return gabarit.reduce(
    (sortie, morceau, i) => sortie + morceau + (i < expressions.length ? rendre(expressions[i]) : ""),
    ""
  );
}

/** Écrit le HTML d'un écran. */
export function peindre(cible, html) {
  cible.innerHTML = html;
}

/**
 * Délégation d'événements. Une seule écoute par rendu, sur des
 * attributs `data-act`. Cela évite d'orchestrer des dizaines
 * d'écoutes et de les oublier lors d'une reconstruction.
 */
export function lier(racine, table) {
  const gerer = (evenement) => {
    const porteur = evenement.target.closest?.("[data-act]");
    if (!porteur || !racine.contains(porteur)) return;
    const nom = porteur.getAttribute("data-act");
    const action = table[nom];
    if (!action) return;
    evenement.preventDefault();
    action(porteur, evenement);
  };
  racine.addEventListener("click", gerer);
  racine.addEventListener("input", (e) => {
    const porteur = e.target.closest?.("[data-act-input]");
    if (!porteur || !racine.contains(porteur)) return;
    const action = table[porteur.getAttribute("data-act-input")];
    if (action) action(porteur, e);
  });
  racine.addEventListener("change", (e) => {
    const porteur = e.target.closest?.("[data-act-change]");
    if (!porteur || !racine.contains(porteur)) return;
    const action = table[porteur.getAttribute("data-act-change")];
    if (action) action(porteur, e);
  });
  return () => racine.replaceChildren();
}

/** Identifiants courts, lisibles dans les journaux. */
export function idCourt(prefixe) {
  const alea = Math.random().toString(36).slice(2, 6);
  return `${prefixe}_${Date.now()}_${alea}`;
}

/** Datation lisible en français, sans dépendance externe. */
export function quand(horodatage) {
  const d = new Date(horodatage);
  const maintenant = Date.now();
  const ecart = maintenant - horodatage;
  if (ecart < 60_000) return "à l'instant";
  if (ecart < 3_600_000) return `il y a ${Math.floor(ecart / 60_000)} min`;
  if (ecart < 86_400_000) return `il y a ${Math.floor(ecart / 3_600_000)} h`;
  const jour = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heure}`;
}
