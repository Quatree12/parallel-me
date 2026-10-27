/* ============================================================
   ECRAN 7 - THE UNIVERSES (galerie des univers visuels)
   Les huit directions artistiques, en galerie. Aucune histoire
   n'est reecrite : cet ecran presente, et laisse choisir une
   teinte qui s'applique au reste de l'application.

   Le visuel vient de la table VISUELS (mondes.js) ; si le fichier
   manque, une vignette de repli prend sa place.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { UNIVERS_VISUELS } from "../../data/univers-visuels.js";
import { mondeAnime } from "./mondes.js";

/** Une carte d'univers : visuel, nom, slogan, mots-cles. */
function carteUnivers(u, actif) {
  const mots = (u.mots || [])
    .map((m) => '<span class="univ-mot">' + esc(m) + "</span>")
    .join("");

  return (
    '<button class="univ-carte' + (actif ? " univ-carte--actif" : "") + '"' +
      ' data-act="univers-choisir" data-univers="' + esc(u.id) + '"' +
      ' style="--teinte:' + esc(u.teinte) + '"' +
      ' aria-pressed="' + String(Boolean(actif)) + '"' +
      ' aria-label="Univers ' + esc(u.nom) + ', ' + esc(u.slogan) + '">' +
      '<span class="univ-carte__visuel">' +
        mondeAnime(u.id, true) +
      "</span>" +
      '<span class="univ-carte__texte">' +
        '<span class="univ-carte__nom">' + esc(u.nom) + "</span>" +
        '<span class="univ-carte__slogan">' + esc(u.slogan) + "</span>" +
        '<span class="univ-carte__mots">' + mots + "</span>" +
      "</span>" +
      (actif ? '<span class="univ-carte__marque">Theme actif</span>' : "") +
    "</button>"
  );
}

export function ecranUnivers(etat) {
  const choisi = etat.universChoisi || null;
  const liste = UNIVERS_VISUELS
    .map((u) => carteUnivers(u, u.id === choisi))
    .join("");

  const packsActifs = (etat.universes || []).length;

  const blocChoix = choisi
    ? h`
      <div class="glass-card" style="padding:16px;margin-bottom:20px">
        <div class="badge badge--cyan" style="margin-bottom:10px">Theme applique</div>
        <p class="carte-ligne__meta" style="margin:0">
          L'application adopte les teintes de cet univers. Vos vies alternatives ne sont pas modifiees.
        </p>
        <button class="btn btn--secondaire" style="margin-top:14px" data-act="univers-choisir" data-univers="${choisi}">
          Revenir au theme d'origine
        </button>
      </div>`
    : h`
      <p class="vide-note" style="margin-bottom:20px">
        Touchez un univers pour en faire le theme de l'application. C'est un habillage, pas un choix d'histoire.
      </p>`;

  const noteJeu = packsActifs > 0
    ? packsActifs + " vie(s) alternative(s) en cours. Chaque pack narratif prend le visuel qui lui correspond."
    : "Aucune vie alternative pour l'instant. Les huit univers ci-dessus sont des decors ; les recits se creent dans LIFE GENERATOR.";

  return h`
    <div class="ecran">
      <h1 class="titre-ecran">The Universes</h1>
      <p class="chapeau">Huit directions visuelles. Un seul toi.</p>

      ${brut(blocChoix)}

      <div class="univ-grille">${brut(liste)}</div>

      <h2 class="section-titre">Ou jouer maintenant</h2>
      <p class="vide-note" style="margin-bottom:12px">${noteJeu}</p>
      <button class="btn" data-act="retour-multiverse">Aller au multivers</button>
      <button class="btn btn--secondaire" style="margin-top:10px" data-act="nouvelle">Creer une nouvelle vie</button>
    </div>`;
}
