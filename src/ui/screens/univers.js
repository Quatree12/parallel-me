/* ============================================================
   ECRAN 7 - THE UNIVERSES (galerie + bibliotheque visuelle)

   CORRECTIF : les vignettes passaient par mondeAnime() sans
   passer par brut(), l'objet se convertissait en texte et
   affichait « [object Object] ». Le visuel est desormais insere
   correctement, et le repli SVG reste disponible.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { UNIVERS_VISUELS } from "../../data/univers-visuels.js";
import { mondeAnime } from "./mondes.js";

const PLANCHE_ANNEXES = [
  {
    fichier: "09_Creatures_du_multivers.png",
    titre: "Creatures du multivers",
    note: "Les sept creatures : Lumi, Zephyr, Nyx, Orion, Pixie, Kai, Bloom. Chacune a sa fiche dans THE CROSSROADS.",
  },
  {
    fichier: "10_Objets_et_artefacts.png",
    titre: "Objets et artefacts",
    note: "Les formes qui peuplent les scenes : spheres, eclats, fragments lumineux.",
  },
  {
    fichier: "11_Interfaces_et_elements_UI.png",
    titre: "Interfaces et elements",
    note: "La matiere Parallel Glass : surfaces translucides, reflets, boutons.",
  },
  {
    fichier: "12_Fonds_et_ambiances.png",
    titre: "Fonds et ambiances",
    note: "Cette planche sert aussi de texture d'ambiance, en transparence derriere l'application.",
  },
  {
    fichier: "13_Icones_et_symboles.png",
    titre: "Icones et symboles",
    note: "Le vocabulaire graphique : infini, atome, spirale, lotus.",
  },
];

/** Une carte d'univers : visuel, nom, slogan, mots-cles. */
function carteUnivers(u, actif) {
  const mots = (u.mots || [])
    .map((m) => '<span class="univ-mot">' + esc(m) + "</span>")
    .join("");

  // Le visuel est un objet brut() : il DOIT etre insere via brut(),
  // sinon il s'affiche comme « [object Object] ».
  const visuel = mondeAnime(u.id, true);

  return h`
    <button class="univ-carte${actif ? " univ-carte--actif" : ""}"
      data-act="univers-choisir" data-univers="${u.id}"
      style="--teinte:${u.teinte}"
      aria-pressed="${String(Boolean(actif))}"
      aria-label="Univers ${u.nom}, ${u.slogan}">
      <span class="univ-carte__visuel">${visuel}</span>
      <span class="univ-carte__texte">
        <span class="univ-carte__nom">${u.nom}</span>
        <span class="univ-carte__slogan">${u.slogan}</span>
        <span class="univ-carte__mots">${brut(mots)}</span>
      </span>
      ${actif ? brut('<span class="univ-carte__marque">Theme actif</span>') : ""}
    </button>`;
}

/** Une planche annexe, montree entiere avec sa legende. */
function plancheHtml(p) {
  return (
    '<div class="biblio-item">' +
      '<img class="biblio-item__image" src="' + esc(p.fichier) + '" alt="" ' +
        'loading="lazy" decoding="async">' +
      '<div class="biblio-item__legende">' +
        '<div class="biblio-item__titre">' + esc(p.titre) + "</div>" +
        '<div class="biblio-item__note">' + esc(p.note) + "</div>" +
      "</div>" +
    "</div>"
  );
}

export function ecranUnivers(etat) {
  const choisi = etat.universChoisi || null;
  const liste = UNIVERS_VISUELS
    .map((u) => carteUnivers(u, u.id === choisi))
    .join("");
  const planches = PLANCHE_ANNEXES.map(plancheHtml).join("");
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

      <h2 class="section-titre">Bibliotheque visuelle</h2>
      <p class="vide-note" style="margin-bottom:14px">
        Les planches de reference du projet, telles qu'elles ont ete dessinees.
        Elles ne sont pas decoupees : l'application les montre entieres.
      </p>
      <div class="biblio-liste">${brut(planches)}</div>

      <h2 class="section-titre">Ou jouer maintenant</h2>
      <p class="vide-note" style="margin-bottom:12px">${noteJeu}</p>
      <button class="btn" data-act="retour-multiverse">Aller au multivers</button>
      <button class="btn btn--secondaire" style="margin-top:10px" data-act="nouvelle">Creer une nouvelle vie</button>
    </div>`;
}
