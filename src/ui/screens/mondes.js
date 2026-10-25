/* ============================================================
   PARALLEL ME - Mondes animes (SVG)
   Chaque univers est une scene vivante. Les etres et les objets
   sont dessines en SVG : de vraies silhouettes courbees, avec
   degrades et halos. Aucune image binaire, aucune fonction CSS
   exotique : tout passe sur Safari iOS.
   ============================================================ */

import { brut } from "../../state/dom.js";

const C = {
  nuit: "#090B1D",
  indigo: "#6654E8",
  lavande: "#C7B9FF",
  rose: "#F29BBF",
  cyan: "#75DDEB",
};

function svg(contenu, classe) {
  return (
    '<svg class="' + (classe || "m-svg") + '" viewBox="0 0 100 100" ' +
    'preserveAspectRatio="xMidYMid slice" aria-hidden="true" ' +
    'xmlns="http://www.w3.org/2000/svg">' + contenu + "</svg>"
  );
}

function defsGradient(id, de, a, x1, y1, x2, y2) {
  return (
    '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 +
    '" x2="' + x2 + '" y2="' + y2 + '">' +
    '<stop offset="0%" stop-color="' + de + '"/>' +
    '<stop offset="100%" stop-color="' + a + '"/>' +
    "</linearGradient>"
  );
}

function defsRadial(id, centre, bord) {
  return (
    '<radialGradient id="' + id + '">' +
    '<stop offset="0%" stop-color="' + centre + '"/>' +
    '<stop offset="70%" stop-color="' + bord + '"/>' +
    '<stop offset="100%" stop-color="' + bord + '" stop-opacity="0"/>' +
    "</radialGradient>"
  );
}

/** Baleine de l'espace : corps en fuseau, nageoire caudale, oeil. */
function baleine(x, y, echelle, teinte, opacite) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')" opacity="' + opacite + '">' +
      '<path d="M-16 0 C-13 -7, -2 -9, 8 -6 C13 -4.5, 16 -1.5, 17.5 0 C16 1.5, 13 4.5, 8 6 C-2 9, -13 7, -16 0 Z" fill="' + teinte + '" opacity=".82"/>' +
      '<path d="M-16 0 C-19 -3, -23 -5, -26 -4 C-24 -1.5, -24 1.5, -26 4 C-23 5, -19 3, -16 0 Z" fill="' + teinte + '" opacity=".62"/>' +
      '<path d="M-2 -6 C0 -11, 6 -12, 9 -9 C6 -7.5, 2 -6.5, -2 -6 Z" fill="' + teinte + '" opacity=".55"/>' +
      '<circle cx="11" cy="-1.5" r="1.4" fill="#fff" opacity=".95"/>' +
    "</g>"
  );
}

/** Creature ailee : corps, deux ailes membraneuses, queue. */
function ailee(x, y, echelle, teinte, opacite) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')" opacity="' + opacite + '">' +
      '<path d="M-10 0 C-6 -4, 2 -5, 9 -2.5 C12 -1.4, 14 0, 15 1.5 C12 2.4, 6 4, 0 3.4 C-5 2.9, -8 1.6, -10 0 Z" fill="' + teinte + '" opacity=".8"/>' +
      '<path d="M-1 -1 C-8 -13, -19 -17, -25 -13 C-18 -8, -12 -3, -6 1 Z" fill="' + teinte + '" opacity=".42"/>' +
      '<path d="M-1 1 C-8 12, -18 16, -24 12 C-17 8, -11 3, -6 -1 Z" fill="' + teinte + '" opacity=".34"/>' +
      '<circle cx="11" cy="0" r="1.1" fill="#fff" opacity=".9"/>' +
    "</g>"
  );
}

/** Astronaute : casque, buste, jambes, filin. */
function astronaute(x, y, echelle) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')">' +
      '<circle cx="0" cy="-7" r="3.6" fill="#EDEBFF"/>' +
      '<circle cx="-1" cy="-7.6" r="1.6" fill="' + C.cyan + '" opacity=".85"/>' +
      '<path d="M-3 -3.5 C-2 -5, 2 -5, 3 -3.5 L3.4 2 C2 3.4, -2 3.4, -3.4 2 Z" fill="#EDEBFF"/>' +
      '<path d="M-3 2 L-4.4 8 M3 2 L4.4 8" stroke="#EDEBFF" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M-3 -2 L-6.5 -4 M3 -2 L6.5 -4" stroke="#EDEBFF" stroke-width="1.3" stroke-linecap="round"/>' +
    "</g>"
  );
}

/** Fantome : voile flottant, deux yeux. */
function fantome(x, y, echelle, opacite) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')" opacity="' + opacite + '">' +
      '<path d="M0 -8 C5 -8, 8 -4, 8 1 C8 5, 8.6 8, 10 10 C7 9, 5 9.6, 3 11 C1 9.4, -1 9.4, -3 11 C-5 9.6, -7 9, -10 10 C-8.6 8, -8 5, -8 1 C-8 -4, -5 -8, 0 -8 Z" fill="#EDEBFF" opacity=".5"/>' +
      '<ellipse cx="0" cy="-1" rx="7" ry="8" fill="#EDEBFF" opacity=".34"/>' +
      '<ellipse cx="-2.6" cy="-1.5" rx="1.05" ry="1.7" fill="' + C.nuit + '"/>' +
      '<ellipse cx="2.6" cy="-1.5" rx="1.05" ry="1.7" fill="' + C.nuit + '"/>' +
    "</g>"
  );
}

/** Chat endormi, enroule. */
function chat(x, y, echelle, teinte) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')">' +
      '<ellipse cx="0" cy="0" rx="11" ry="6" fill="' + teinte + '" opacity=".78"/>' +
      '<path d="M-11 -1 C-14 -3, -13 -7, -9 -7 C-10 -5, -10.5 -3, -11 -1 Z" fill="' + teinte + '" opacity=".6"/>' +
      '<path d="M-8 -6 L-9.5 -9.5 L-6.5 -7.5 Z M-4.5 -7 L-4 -10.5 L-1.5 -7.8 Z" fill="' + teinte + '" opacity=".7"/>' +
      '<path d="M9 2 C15 1, 19 -2, 21 -6" stroke="' + teinte + '" stroke-width="1.6" fill="none" opacity=".6"/>' +
    "</g>"
  );
}

/** Oiseau / creature des airs, en vol. */
function oiseau(x, y, echelle, teinte) {
  return (
    '<g transform="translate(' + x + " " + y + ") scale(" + echelle + ')">' +
      '<path d="M0 0 C-5 -4, -13 -5, -19 -2 C-13 0, -6 1, 0 0 Z" fill="' + teinte + '" opacity=".68"/>' +
      '<path d="M0 0 C5 -4, 13 -5, 19 -2 C13 0, 6 1, 0 0 Z" fill="' + teinte + '" opacity=".68"/>' +
      '<ellipse cx="0" cy="0" rx="4" ry="2.2" fill="' + teinte + '" opacity=".85"/>' +
    "</g>"
  );
}

/* --- Scenes --- */

function sceneSpace() {
  const d = "<defs>" +
    defsRadial("g-Planete", "#BDEFF9", "#2F63B8") +
    defsGradient("g-Anneau", "#C7B9FF", "#6654E8", "0%", "0%", "100%", "100%") +
    "</defs>";

  const corps =
    '<g fill="#fff" opacity=".55">' +
      '<circle cx="12" cy="14" r=".8"/><circle cx="26" cy="9" r=".6"/>' +
      '<circle cx="44" cy="18" r=".7"/><circle cx="68" cy="11" r=".9"/>' +
      '<circle cx="84" cy="22" r=".6"/><circle cx="20" cy="34" r=".7"/>' +
      '<circle cx="76" cy="40" r=".6"/><circle cx="8" cy="52" r=".8"/>' +
      '<circle cx="90" cy="62" r=".7"/><circle cx="34" cy="86" r=".6"/>' +
      '<circle cx="58" cy="92" r=".7"/><circle cx="80" cy="84" r=".6"/>' +
    "</g>" +
    '<g class="m-svg__planete">' +
      '<circle cx="66" cy="66" r="26" fill="url(#g-Planete)"/>' +
      '<path d="M44 58 C52 54, 62 57, 66 64 C70 71, 80 73, 88 70" stroke="#BDEFF9" stroke-width="2.4" fill="none" opacity=".34"/>' +
      '<path d="M46 74 C54 70, 64 73, 70 79 C74 83, 82 84, 88 82" stroke="#BDEFF9" stroke-width="1.8" fill="none" opacity=".26"/>' +
      '<circle cx="66" cy="66" r="26" fill="none" stroke="#75DDEB" stroke-width=".8" opacity=".7"/>' +
    "</g>" +
    '<g class="m-svg__anneau" style="transform-origin:50px 44px">' +
      '<path d="M2 44 C2 32, 46 24, 98 44 C46 64, 2 56, 2 44 Z" fill="none" stroke="url(#g-Anneau)" stroke-width="2.6" opacity=".9"/>' +
      '<circle cx="24" cy="33" r="3" fill="#EDEBFF" opacity=".9"/>' +
      '<circle cx="76" cy="55" r="3" fill="#EDEBFF" opacity=".9"/>' +
      '<rect x="46" y="26" width="12" height="7" rx="2.5" fill="#EDEBFF" opacity=".92"/>' +
    "</g>" +
    '<g class="m-svg__module">' +
      '<ellipse cx="26" cy="26" rx="16" ry="9" fill="#EDEBFF" opacity=".9"/>' +
      '<ellipse cx="26" cy="24" rx="16" ry="8" fill="#C7B9FF" opacity=".5"/>' +
      '<rect x="36" y="24" width="10" height="3" rx="1.5" fill="#EDEBFF" opacity=".8"/>' +
      '<rect x="46" y="21" width="12" height="8" rx="1.5" fill="#6654E8" opacity=".75"/>' +
    "</g>" +
    '<g class="m-svg__baleine">' + baleine(30, 60, 1, C.cyan, ".85") + "</g>" +
    '<g class="m-svg__ailee">' + ailee(70, 26, .9, C.lavande, ".75") + "</g>" +
    '<g class="m-svg__fantome">' + fantome(20, 44, .8, ".9") + "</g>" +
    '<g class="m-svg__eva">' +
      '<path d="M50 44 L50 12" stroke="#C7B9FF" stroke-width=".6" opacity=".55"/>' +
      astronaute(50, 12, .92) +
    "</g>" +
    '<circle class="m-svg__alerte" cx="54" cy="30" r="2.4" fill="#F0A534"/>';

  return svg(d + corps, "m-svg");
}

function sceneStudio() {
  const d = "<defs>" +
    defsGradient("g-Toile", "#F29BBF", "#6654E8", "0%", "0%", "100%", "100%") +
    "</defs>";

  const corps =
    '<rect width="100" height="100" fill="#080818"/>' +
    '<g>' +
      '<rect x="54" y="12" width="38" height="34" rx="2" fill="#0d1024" opacity=".9"/>' +
      '<rect x="54" y="12" width="38" height="34" rx="2" fill="none" stroke="#C7B9FF" stroke-width="1.4" opacity=".7"/>' +
      '<path d="M73 12 L73 46 M54 29 L92 29" stroke="#C7B9FF" stroke-width="1" opacity=".5"/>' +
      '<g class="m-svg__nuages">' +
        '<ellipse cx="72" cy="30" rx="12" ry="4" fill="#EDEBFF" opacity=".2"/>' +
        '<ellipse cx="84" cy="24" rx="8" ry="3" fill="#EDEBFF" opacity=".14"/>' +
      "</g>" +
    "</g>" +
    '<g class="m-svg__toiles">' +
      '<rect x="8" y="44" width="16" height="24" rx="2" fill="url(#g-Toile)" opacity=".8"/>' +
      '<rect x="26" y="42" width="14" height="26" rx="2" fill="#C7B9FF" opacity=".55"/>' +
      '<rect x="42" y="46" width="12" height="22" rx="2" fill="#EDEBFF" opacity=".38"/>' +
    "</g>" +
    '<path d="M0 84 L100 84 L100 100 L0 100 Z" fill="#0B0D20" opacity=".85"/>' +
    '<g class="m-svg__pigment">' +
      '<circle cx="26" cy="80" r="10" fill="' + C.rose + '" opacity=".22"/>' +
      '<circle cx="26" cy="80" r="6" fill="' + C.rose + '" opacity=".9"/>' +
    "</g>" +
    '<g class="m-svg__chat">' + chat(66, 84, .8, C.rose) + "</g>" +
    '<g class="m-svg__oiseau">' + oiseau(34, 26, .8, C.lavande) + "</g>" +
    '<g class="m-svg__fantome">' + fantome(16, 62, .95, ".95") + "</g>" +
    '<g class="m-svg__feuilles" fill="#EDEBFF" opacity=".7">' +
      '<path d="M48 76 q3 -4 6 0 q-3 4 -6 0 Z"/>' +
      '<path d="M58 70 q2.5 -3.5 5 0 q-2.5 3.5 -5 0 Z" opacity=".7"/>' +
      '<path d="M40 66 q2 -3 4 0 q-2 3 -4 0 Z" opacity=".5"/>' +
    "</g>" +
    '<circle class="m-svg__lampe" cx="60" cy="58" r="2.6" fill="' + C.rose + '"/>';

  return svg(d + corps, "m-svg");
}

function sceneAtlas() {
  const d = "<defs>" +
    defsGradient("g-Cite", "#8C84C8", "#1A1D3A", "0%", "0%", "0%", "100%") +
    "</defs>";

  const corps =
    '<rect width="100" height="100" fill="#070918"/>' +
    '<g class="m-svg__brule">' +
      '<path d="M6 84 Q30 78, 50 84 T94 84 L94 100 L6 100 Z" fill="#1a0f14" opacity=".9"/>' +
      '<path d="M14 80 q6 -4 12 0 M40 78 q6 -4 12 0 M66 80 q6 -4 12 0" stroke="#F29BBF" stroke-width="1.2" fill="none" opacity=".28"/>' +
    "</g>" +
    '<g class="m-svg__cite" style="transform-origin:50px 50px">' +
      '<path d="M6 58 L16 44 L26 58 L36 40 L46 58 L56 42 L66 58 L76 46 L86 58 L94 50 L94 66 L6 66 Z" fill="url(#g-Cite)" opacity=".92"/>' +
      '<path d="M6 66 L94 66" stroke="#C7B9FF" stroke-width="1.4" opacity=".8"/>' +
      '<g fill="#75DDEB" opacity=".85">' +
        '<rect x="18" y="50" width="2.4" height="3"/><rect x="30" y="48" width="2.4" height="3"/>' +
        '<rect x="44" y="50" width="2.4" height="3"/><rect x="58" y="48" width="2.4" height="3"/>' +
        '<rect x="72" y="50" width="2.4" height="3"/><rect x="84" y="52" width="2.4" height="3"/>' +
      "</g>" +
      '<path d="M10 72 Q48 78, 90 72" stroke="#C7B9FF" stroke-width="1.1" fill="none" opacity=".55"/>' +
    "</g>" +
    '<g class="m-svg__veilleuses">' +
      '<circle cx="20" cy="70" r="1.6" fill="' + C.cyan + '" opacity=".9"/>' +
      '<circle cx="36" cy="72" r="1.6" fill="' + C.cyan + '" opacity=".75"/>' +
      '<circle cx="52" cy="73" r="1.6" fill="' + C.cyan + '" opacity=".9"/>' +
      '<circle cx="68" cy="72" r="1.6" fill="' + C.cyan + '" opacity=".75"/>' +
      '<circle cx="84" cy="70" r="1.6" fill="' + C.cyan + '" opacity=".9"/>' +
    "</g>" +
    '<g class="m-svg__ailee">' + ailee(30, 28, .95, C.cyan, ".8") + "</g>" +
    '<g class="m-svg__baleine">' + baleine(72, 16, .8, C.lavande, ".7") + "</g>" +
    '<g class="m-svg__fantome">' + fantome(58, 62, .78, ".9") + "</g>" +
    '<g class="m-svg__instruments" style="transform-origin:24px 84px">' +
      '<circle cx="24" cy="84" r="7" fill="none" stroke="' + C.lavande + '" stroke-width="1" opacity=".7"/>' +
      '<path d="M24 77 L24 91 M17 84 L31 84" stroke="' + C.lavande + '" stroke-width=".7" opacity=".5"/>' +
    "</g>";

  return svg(d + corps, "m-svg");
}

const SCENES = { space: sceneSpace, studio: sceneStudio, atlas: sceneAtlas };

/** Version reduite, pour la carte de reprise : un astre et un anneau. */
function sceneCompacte(packId) {
  const teintes = { space: C.cyan, studio: C.rose, atlas: C.lavande };
  const teinte = teintes[packId] || C.cyan;
  return svg(
    "<defs>" + defsRadial("g-mini", teinte, "#0b0d20") + "</defs>" +
    '<circle cx="50" cy="50" r="34" fill="url(#g-mini)" opacity=".9"/>' +
    '<circle cx="50" cy="50" r="34" fill="none" stroke="' + teinte + '" stroke-width=".8" opacity=".6"/>',
    "m-svg"
  );
}

/** Rend la scene animee d'un univers. */
export function mondeAnime(packId, compacte) {
  const fabrique = SCENES[packId] || SCENES.space;
  const contenu = compacte ? sceneCompacte(packId) : fabrique();
  return brut(
    '<span class="monde' + (compacte ? " monde--compacte" : "") +
    '" aria-hidden="true">' + contenu + "</span>"
  );
}
