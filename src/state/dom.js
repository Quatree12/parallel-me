/* ============================================================
   PARALLEL ME - Micro-couche DOM

   CORRECTIF : `brut()` laisse passer un objet brut() tel quel.
   Sans cela, composer du HTML deja construit (une sphere
   imbriquant son monde) obligeait a le convertir en chaine, ce
   qui l'echappait une seconde fois — le HTML s'imprimait alors
   a l'ecran au lieu d'etre interprete.
   ============================================================ */

/** Echappe le texte destine a etre insere dans du HTML. */
export function esc(valeur) {
  return String(valeur === null || valeur === undefined ? "" : valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRUT = Symbol("brut");

/**
 * Marque une chaine comme HTML deja sur : elle ne sera pas echappee.
 * Accepte aussi un objet brut() (ou un tableau de tels objets) et
 * renvoie un brut equivalent : la composition reste possible de
 * brut a brut, sans jamais passer par une conversion en chaine.
 */
export function brut(html) {
  if (html && typeof html === "object" && html[BRUT]) return html;
  if (Array.isArray(html)) {
    return {
      [BRUT]: true,
      html: html.map(function (v) { return (v && v[BRUT]) ? v.html : String(v); }).join(""),
    };
  }
  return { [BRUT]: true, html: String(html === null || html === undefined ? "" : html) };
}

/** La chaine HTML portee par une valeur, brute ou non. */
export function texteBrut(valeur) {
  if (valeur && typeof valeur === "object" && valeur[BRUT]) return valeur.html;
  return esc(valeur);
}

function rendre(valeur) {
  if (valeur === null || valeur === undefined || valeur === false) return "";
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

/** Ecrit le HTML d'un ecran. */
export function peindre(cible, html) {
  cible.innerHTML = String(html);
}

/** Delegation d'evenements, une seule ecoute par rendu. */
export function lier(racine, table) {
  const gerer = (evenement) => {
    const porteur = evenement.target.closest ? evenement.target.closest("[data-act]") : null;
    if (!porteur || !racine.contains(porteur)) return;
    const nom = porteur.getAttribute("data-act");
    const action = table[nom];
    if (!action) return;
    evenement.preventDefault();
    action(porteur, evenement);
  };
  racine.addEventListener("click", gerer);
  racine.addEventListener("input", (e) => {
    const porteur = e.target.closest ? e.target.closest("[data-act-input]") : null;
    if (!porteur || !racine.contains(porteur)) return;
    const action = table[porteur.getAttribute("data-act-input")];
    if (action) action(porteur, e);
  });
  racine.addEventListener("change", (e) => {
    const porteur = e.target.closest ? e.target.closest("[data-act-change]") : null;
    if (!porteur || !racine.contains(porteur)) return;
    const action = table[porteur.getAttribute("data-act-change")];
    if (action) action(porteur, e);
  });
  return () => racine.replaceChildren();
}

/** Identifiants courts, lisibles dans les journaux. */
export function idCourt(prefixe) {
  const alea = Math.random().toString(36).slice(2, 6);
  return prefixe + "_" + Date.now() + "_" + alea;
}

/** Datation lisible en francais, sans dependance externe. */
export function quand(horodatage) {
  const d = new Date(horodatage);
  const ecart = Date.now() - horodatage;
  if (ecart < 60000) return "a l'instant";
  if (ecart < 3600000) return "il y a " + Math.floor(ecart / 60000) + " min";
  if (ecart < 86400000) return "il y a " + Math.floor(ecart / 3600000) + " h";
  const jour = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return jour + " - " + heure;
}
