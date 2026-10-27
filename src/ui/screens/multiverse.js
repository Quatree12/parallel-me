/* ============================================================
   ECRAN 1 - YOUR MULTIVERSE

   CORRECTIF DU HTML IMPRIME - cause enfin identifiee.

   `sphere()` renvoyait un gabarit h``, donc une CHAINE. La
   vignette etait ensuite interpolee dans le gabarit `reprise`,
   et `rendre()` — qui n'echappe que les chaines non marquees —
   l'echappait : le HTML s'imprimait a l'ecran.

   Envelopper le resultat dans brut() ne servait a rien : le mal
   etait fait AVANT, par le h`` lui-meme.

   La vignette est desormais construite par concatenation, sans
   passer par un gabarit h`` : la chaine reste du HTML sur, et
   l'interpolation ne peut plus l'echapper.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS } from "../../data/params.js";
import { quand } from "../../state/dom.js";
import { PACK_VERS_UNIVERS } from "../../data/univers-visuels.js";
import { mondeAnime } from "./visuels-mondes.js";

/** Sous-titre utile : jamais le nom de l'univers repete. */
function sousTitre(u, pack) {
  const titrePack = pack ? pack.title : u.packId;
  const branches = u.branches ? u.branches.length : 0;
  const morceaux = [];
  if (titrePack !== u.name) morceaux.push(titrePack);
  if (branches > 0) morceaux.push(branches + " branche(s)");
  return morceaux.join(" - ");
}

/**
 * Sphere compacte (carte de reprise) : concatenation directe.
 * Aucun gabarit h``, donc aucune chaine a echapper par erreur.
 */
function sphereCompacte(u, pack) {
  const p = pack ? pack.palette : { core: "#6654E8", accent: "#F29BBF", glow: "rgba(102,84,232,.14)" };
  const style = "--core:" + p.core + ";--accent:" + p.accent + ";--glow:" + p.glow;
  const cle = PACK_VERS_UNIVERS[u.packId] || u.packId;

  return brut(
    '<button class="sphere sphere--compacte" data-act="ouvrir" data-id="' + esc(u.id) + '"' +
      ' style="' + style + '" aria-label="Ouvrir ' + esc(u.name) + '">' +
      mondeAnime(cle, true) +
    "</button>"
  );
}

/** Sphere complete : visuel, libelle, et bouton de gestion. */
function sphereComplete(u, pack) {
  const p = pack ? pack.palette : { core: "#6654E8", accent: "#F29BBF", glow: "rgba(102,84,232,.14)" };
  const cle = PACK_VERS_UNIVERS[u.packId] || u.packId;
  const style = "--core:" + p.core + ";--accent:" + p.accent + ";--glow:" + p.glow;
  const sous = sousTitre(u, pack);

  return brut(
    '<div class="sphere-bloc">' +
      '<button class="sphere" data-act="ouvrir" data-id="' + esc(u.id) + '"' +
        ' style="' + style + '" aria-label="Ouvrir ' + esc(u.name) + '">' +
        mondeAnime(cle, false) +
        '<span class="sphere__voile" aria-hidden="true"></span>' +
        '<span class="sphere__libelle">' +
          '<span class="sphere__nom">' + esc(u.name) + "</span>" +
          (sous ? '<span class="sphere__sous">' + esc(sous) + "</span>" : "") +
        "</span>" +
      "</button>" +
      '<button class="sphere__gerer" data-act="volumes-univers" data-id="' + esc(u.id) + '"' +
      ' aria-label="Gerer ' + esc(u.name) + '">&#8943;</button>' +
    "</div>"
  );
}

export function ecranMultiverse(etat) {
  const universes = etat.universes.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  const dernier = universes[0];

  if (!etat.pret) {
    return h`
      <div class="ecran">
        <h1 class="titre-ecran">Your Multiverse</h1>
        <p class="chapeau">Lecture de vos vies alternatives...</p>
        <div class="chargement">
          <div class="chargement__orbe" aria-hidden="true"></div>
          <p class="vide-note">Chargement du multivers</p>
        </div>
        <div class="squelette"></div>
        <div class="squelette" style="width:70%"></div>
      </div>`;
  }

  const bandeau = etat.erreurStockage
    ? h`
      <div class="bandeau" role="alert">
        <span aria-hidden="true">!</span>
        <span>${etat.erreurStockage}</span>
      </div>`
    : "";

  if (universes.length === 0) {
    return h`
      <div class="ecran">
        <h1 class="titre-ecran">Your Multiverse</h1>
        <p class="chapeau">The Alternate Life Simulator</p>
        ${brut(bandeau)}
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">o</div>
          <h2 class="etat__titre">Aucune vie alternative pour l'instant.</h2>
          <p class="etat__texte">Creez-en une pour commencer.</p>
        </div>
        <button class="btn" data-act="nouvelle">Creer ma premiere vie</button>
        ${etat.corrompu ? brut('<button class="btn btn--discret" style="margin-top:12px" data-act="reinit">Reinitialiser le multivers</button>') : ""}
      </div>`;
  }

  const pack = PACKS[dernier.packId];
  const scene = pack ? pack.scenes[dernier.state.sceneId] : null;
  const nomScene = scene ? scene.title : "Scene inconnue";

  // La vignette est un objet brut() : l'interpolation de `reprise`
  // le reconnait et le laisse passer intact.
  const vignette = sphereCompacte(dernier, pack);

  const reprise = h`
    <section class="glass-card" style="padding:20px;margin-bottom:8px">
      <div class="section-titre" style="margin-top:0">Reprendre</div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="flex:0 0 68px">${vignette}</div>
        <div style="min-width:0">
          <div style="font:600 17px/23px -apple-system,system-ui,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dernier.name}</div>
          <div class="carte-ligne__meta">Scene : ${nomScene} - ${quand(dernier.updatedAt)}</div>
        </div>
      </div>
      <button class="btn" data-act="reprendre" data-id="${dernier.id}">Reprendre l'histoire</button>
    </section>`;

  const sansPack = universes.filter((u) => !PACKS[u.packId]).map((u) => u.name);
  const avertissement = sansPack.length
    ? h`<div class="bandeau" role="alert"><span aria-hidden="true">!</span><span>Univers sans pack narratif : ${sansPack.join(", ")}. Le reste demeure jouable.</span></div>`
    : "";

  const grille = universes.map((u) => sphereComplete(u, PACKS[u.packId]));

  return h`
    <div class="ecran">
      <h1 class="titre-ecran">Your Multiverse</h1>
      <p class="chapeau">${universes.length} vie(s) alternative(s) en cours</p>
      ${brut(bandeau)}
      ${brut(avertissement)}
      ${brut(reprise)}

      <h2 class="section-titre">Tous les univers</h2>
      <p class="vide-note" style="margin-bottom:12px">
        Touchez une sphere pour jouer. Le bouton a trois points permet de renommer ou de supprimer une vie.
      </p>
      <div class="grille-univers">${brut(grille)}</div>

      <div style="margin-top:28px">
        <button class="btn" data-act="nouvelle">Creer une nouvelle vie</button>
      </div>
      <p class="vide-note" style="margin-top:20px;text-align:center">
        Simulation fictive. PARALLEL ME ne predit rien : il raconte.
      </p>
    </div>`;
}
