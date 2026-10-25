/* ============================================================
   PARALLEL ME - Mondes animes
   Chaque univers est une scene vivante : plusieurs couches
   tournent a des vitesses differentes, avec des astres, des
   silhouettes, des objets et des creatures qui derivent.
   Aucune image binaire : tout tient dans le DOM et le CSS.
   ============================================================ */

import { brut } from "../../state/dom.js";

function astre(classe) {
  return '<span class="m-astre ' + classe + '" aria-hidden="true"></span>';
}

function creature(classe, teinte) {
  return '<span class="m-creature ' + classe + '" aria-hidden="true" style="--teinte:' + teinte + '">' +
    '<span class="m-corps"></span>' +
    '<span class="m-aile m-aile--g"></span>' +
    '<span class="m-aile m-aile--d"></span>' +
    '<span class="m-oeil"></span>' +
    "</span>";
}

function fantome(classe) {
  return '<span class="m-fantome ' + classe + '" aria-hidden="true">' +
    '<span class="m-spectre"></span>' +
    '<span class="m-yeux"><i></i><i></i></span>' +
    "</span>";
}

function lanterne(classe, teinte, delai) {
  return '<span class="m-lanterne ' + classe + '" aria-hidden="true" style="--teinte:' +
    teinte + ";animation-delay:" + delai + 's"></span>';
}

function sceneSpace() {
  return [
    '<span class="m-ciel" aria-hidden="true"></span>',
    astre("m-astre--loin"),
    astre("m-astre--proche"),
    '<span class="m-planete" aria-hidden="true"><span class="m-planete__trame"></span></span>',
    '<span class="m-anneau" aria-hidden="true"></span>',
    '<span class="m-orbite m-orbite--eva" aria-hidden="true">' +
      '<span class="m-filin"></span>' +
      '<span class="m-eva"></span>' +
    "</span>",
    creature("m-creature--vide", "#75DDEB"),
    '<span class="m-station" aria-hidden="true"></span>',
    fantome("m-fantome--module"),
    '<span class="m-alerte" aria-hidden="true"></span>',
    lanterne("m-lanterne--hublot", "#75DDEB", "0.4"),
  ].join("");
}

function sceneStudio() {
  return [
    '<span class="m-ciel m-ciel--chaud" aria-hidden="true"></span>',
    astre("m-astre--loin"),
    '<span class="m-fenetre" aria-hidden="true"></span>',
    '<span class="m-nuage m-nuage--1" aria-hidden="true"></span>',
    '<span class="m-nuage m-nuage--2" aria-hidden="true"></span>',
    '<span class="m-toiles" aria-hidden="true"></span>',
    '<span class="m-feuille m-feuille--1" aria-hidden="true"></span>',
    '<span class="m-feuille m-feuille--2" aria-hidden="true"></span>',
    '<span class="m-feuille m-feuille--3" aria-hidden="true"></span>',
    '<span class="m-pigment" aria-hidden="true"></span>',
    creature("m-creature--chat", "#F29BBF"),
    creature("m-creature--oiseau", "#C7B9FF"),
    fantome("m-fantome--atelier"),
    lanterne("m-lanterne--lampe", "#F29BBF", "1.1"),
  ].join("");
}

function sceneAtlas() {
  return [
    '<span class="m-ciel" aria-hidden="true"></span>',
    astre("m-astre--loin"),
    astre("m-astre--proche"),
    '<span class="m-brule" aria-hidden="true"></span>',
    '<span class="m-cite" aria-hidden="true"></span>',
    '<span class="m-veilleuses" aria-hidden="true"></span>',
    creature("m-creature--ailee", "#75DDEB"),
    fantome("m-fantome--pont"),
    '<span class="m-instruments" aria-hidden="true"></span>',
    lanterne("m-lanterne--tour", "#C7B9FF", "0.2"),
    lanterne("m-lanterne--place", "#F29BBF", "0.9"),
  ].join("");
}

const SCENES = { space: sceneSpace, studio: sceneStudio, atlas: sceneAtlas };

/** Version reduite, pour la carte de reprise. */
function sceneCompacte(packId) {
  const fragments = {
    space: astre("m-astre--proche") + '<span class="m-anneau m-anneau--fin"></span>',
    studio: '<span class="m-ciel m-ciel--chaud"></span>' + astre("m-astre--loin"),
    atlas: '<span class="m-cite m-cite--fin"></span>' + astre("m-astre--proche"),
  };
  return fragments[packId] || fragments.space;
}

/**
 * Rend la scene animee d'un univers. `compacte` produit la version
 * reduite, sans les details trop petits pour rester lisibles.
 */
export function mondeAnime(packId, compacte) {
  const fabrique = SCENES[packId] || SCENES.space;
  const contenu = compacte ? sceneCompacte(packId) : fabrique();
  return brut('<span class="monde' + (compacte ? " monde--compacte" : "") +
    '" aria-hidden="true">' + contenu + "</span>");
}
