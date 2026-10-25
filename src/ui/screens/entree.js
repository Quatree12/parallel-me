/* ============================================================
   ECRAN 3 - ENTER THE WORLD
   Introduction immersive : decor propre a l'univers, lieux et
   objets interactifs qui revelent des elements narratifs.
   Les objets decouverts entrent vraiment dans l'etat (flags),
   donc dans le journal et dans la comparaison.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS } from "../../data/params.js";

export function ecranEntree(etat, univers) {
  const pack = PACKS[univers.packId];
  if (!pack) {
    return h`
      <div class="ecran">
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">!</div>
          <h2 class="etat__titre">Univers sans pack narratif</h2>
          <p class="etat__texte">Le pack « ${univers.packId} » est introuvable. L'univers reste visible et renommable depuis le multivers.</p>
        </div>
        <button class="btn" data-act="retour-multiverse">Retour au multivers</button>
      </div>`;
  }

  const p = pack.palette;
  const e = pack.entry;
  const decouverts = (univers.state.flags || []).filter((f) => f.startsWith("objet:"));

  return h`
    <div class="ecran">
      <div class="visuel" style="--core:${p.core};--accent:${p.accent};--glow:${p.glow}">
        <div class="sphere__monde" aria-hidden="true" style="inset:0;opacity:.85"></div>
        <div class="glass-portail" style="inset:-30% -10%"></div>
        <div class="visuel__voile"></div>
        <div class="visuel__texte">
          <div class="visuel__titre">${e.titre}</div>
          <div class="visuel__sous">${e.sous}</div>
        </div>
      </div>

      <div class="scene-corps">
        ${brut(e.corps.map((par) => `<p>${esc(par)}</p>`).join(""))}
      </div>

      <h2 class="section-titre">Lieux</h2>
      <ul class="liste">
        ${brut(e.lieux.map((l) => h`
          <li>
            <details class="detail">
              <summary>${l.nom}<span aria-hidden="true">+</span></summary>
              <div class="detail__corps carte-ligne__meta">${l.detail}</div>
            </details>
          </li>`).join(""))}
      </ul>

      <h2 class="section-titre">Objets interactifs</h2>
      <p class="vide-note" style="margin-bottom:12px">Touchez un objet pour reveler ce qu'il porte. Ce que vous decouvrez est enregistre dans la vie alternative.</p>
      <div class="objets">
        ${brut(fragments(univers, pack))}
      </div>

      <p class="vide-note" style="margin-bottom:20px">
        Objets decouverts : ${decouverts.length}/${Object.keys(pack.objects || {}).length}
      </p>

      <button class="btn" data-act="entrer">
        ${univers.state.visited.length > 1 ? "Reprendre la scene en cours" : "Entrer dans le monde"}
      </button>
      <button class="btn btn--discret" style="margin-top:10px" data-act="retour-multiverse">Retour au multivers</button>
    </div>`;
}

/** Objets cliquables, dont l'effet est reellement ecrit dans l'etat. */
function fragments(univers, pack) {
  const scene = pack.scenes[pack.startSceneId];
  const trouves = (univers.state.flags || []).filter((f) => f.startsWith("objet:"));
  return (scene.hotspots || []).map((hs) => h`
    <button class="objet" data-act="fragment" data-nom="${hs.nom}" data-objet="${hs.objet || ""}"
      data-vu="${hs.objet && trouves.includes(`objet:${hs.objet}`) ? "true" : "false"}">
      <span aria-hidden="true">*</span> ${hs.nom}
    </button>`).join("");
}
