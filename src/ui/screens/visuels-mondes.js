/* ============================================================
   PARALLEL ME - Mondes : visuels deposes, avec repli SVG
   (fichier renomme depuis mondes.js pour contourner un cache
   tenace de Safari sur les modules ES)

   Aucune entite HTML dans le code genere : les guillemets sont
   droits, et le repli est pose par un gestionnaire d'erreur.
   ============================================================ */

import { brut } from "../../state/dom.js";

/** Visuels deposes dans le depot, a la racine. */
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

const TEINTES = {
  space: "#75DDEB",
  studio: "#F29BBF",
  atlas: "#C7B9FF",
};

/** Scene de repli : un astre, un anneau, un ciel. */
function sceneRepli(packId) {
  const teinte = TEINTES[packId] || "#6654E8";
  return [
    '<svg class="m-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">',
      "<defs>",
        '<radialGradient id="repli-ciel">',
          '<stop offset="0%" stop-color="#1a1d3a"/>',
          '<stop offset="100%" stop-color="#070918"/>',
        "</radialGradient>",
        '<radialGradient id="repli-astre">',
          '<stop offset="0%" stop-color="#ffffff"/>',
          '<stop offset="55%" stop-color="' + teinte + '"/>',
          '<stop offset="100%" stop-color="' + teinte + '" stop-opacity="0"/>',
        "</radialGradient>",
      "</defs>",
      '<rect width="100" height="100" fill="url(#repli-ciel)"/>',
      '<circle cx="64" cy="36" r="26" fill="url(#repli-astre)" opacity="0.85"/>',
      '<ellipse cx="46" cy="58" rx="38" ry="13" fill="none" stroke="' + teinte + '" stroke-width="1.4" opacity="0.5"/>',
    "</svg>",
  ].join("");
}

/** Visuel d'un univers : image, plus sa scene de repli masquee. */
export function mondeAnime(cle, compacte) {
  const chemin = VISUELS[cle];
  const classe = "monde" + (compacte ? " monde--compacte" : "");

  if (chemin) {
    return brut(
      '<span class="' + classe + '" aria-hidden="true">' +
        '<img class="monde__visuel" src="' + chemin + '" alt="" loading="lazy" decoding="async">' +
        '<span class="monde__secours">' + sceneRepli(cle) + "</span>" +
      "</span>"
    );
  }

  return brut(
    '<span class="' + classe + '" aria-hidden="true">' + sceneRepli(cle) + "</span>"
  );
}

/** Branche le repli apres chaque rendu. */
export function brancherReplis(racine) {
  const images = racine.querySelectorAll(".monde__visuel");
  for (let i = 0; i < images.length; i++) {
    images[i].addEventListener("error", function () {
      this.style.display = "none";
      const secours = this.nextElementSibling;
      if (secours) secours.style.display = "block";
    });
  }
}
