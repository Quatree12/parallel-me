/* ============================================================
   PARALLEL ME - Mondes : visuels deposes, avec repli SVG

   Les huit univers de la planche de direction artistique sont
   desormais de vrais fichiers dans le depot. Chaque univers
   tente d'abord son image ; si elle manque, la scene SVG animee
   prend le relais. Aucun ecran ne peut donc rester vide.
   ============================================================ */

import { brut } from "../../state/dom.js";

/**
 * Visuels deposes dans le depot, a la racine.
 * La cle est l'identifiant d'univers tel qu'il apparait dans
 * univers-visuels.js ; la valeur est le chemin reel du fichier.
 */
export const VISUELS = {
  auroria: "01_Auroria.png",
  "nebula-noir": "02_Nebula_Noir.png",
  "terra-lumina": "03_Terra_Lumina.png",
  voidalis: "04_Voidalis.png",
  neluna: "05_Neluna.png",
  irisia: "06_Irysia.png",
  emelia: "07_Emelia.png",
  noxora: "08_Noxora.png",
};

/* --- Teintes de repli, quand aucun visuel n'est disponible --- */
const TEINTES = {
  space: "#75DDEB",
  studio: "#F29BBF",
  atlas: "#C7B9FF",
};

/**
 * Scene de repli : un astre, un anneau, un ciel. Elle s'affiche
 * si l'image attendue est absente ou ne se charge pas.
 */
function sceneRepli(packId) {
  const teinte = TEINTES[packId] || "#6654E8";
  return (
    '<svg class="m-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" ' +
    'aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<radialGradient id="repli-ciel">' +
          '<stop offset="0%" stop-color="#1a1d3a"/>' +
          '<stop offset="100%" stop-color="#070918"/>' +
        "</radialGradient>" +
        '<radialGradient id="repli-astre">' +
          '<stop offset="0%" stop-color="#fff"/>' +
          '<stop offset="55%" stop-color="' + teinte + '"/>' +
          '<stop offset="100%" stop-color="' + teinte + '" stop-opacity="0"/>' +
        "</radialGradient>" +
      "</defs>" +
      '<rect width="100" height="100" fill="url(#repli-ciel)"/>' +
      '<circle cx="64" cy="36" r="26" fill="url(#repli-astre)" opacity=".85"/>' +
      '<ellipse cx="46" cy="58" rx="38" ry="13" fill="none" stroke="' + teinte +
        '" stroke-width="1.4" opacity=".5"/>' +
    "</svg>"
  );
}

/**
 * Rend le visuel d'un univers.
 *
 * @param cle        identifiant (univers visuel, ou pack narratif)
 * @param compacte   true pour la carte de reprise
 */
export function mondeAnime(cle, compacte) {
  const chemin = VISUELS[cle];
  const classe = "monde" + (compacte ? " monde--compacte" : "");

  // Un visuel existe : on l'affiche, avec repli SVG si le
  // chargement echoue (fichier renomme, deplace, reseau coupe).
  if (chemin) {
    const repli = sceneRepli(cle).replace(/"/g, "&quot;");
    const img =
      '<img class="monde__visuel" src="' + chemin + '" alt="" ' +
      'loading="lazy" decoding="async" ' +
      'onerror="this.style.display=&quot;none&quot;;' +
      'this.nextElementSibling.style.display=&quot;block&quot;">';
    const secours = '<span class="monde__secours" style="display:none">' +
      sceneRepli(cle) + "</span>";
    void repli;
    return brut('<span class="' + classe + '" aria-hidden="true">' + img + secours + "</span>");
  }

  // Aucun visuel : la scene animee s'affiche directement.
  return brut('<span class="' + classe + '" aria-hidden="true">' + sceneRepli(cle) + "</span>");
}
