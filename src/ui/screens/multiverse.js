/* ============================================================
   ÉCRAN 1 — YOUR MULTIVERSE
   Planète centrale, univers créés, raccourci de reprise, bouton
   de création. §3.2 des fondations.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS } from "../../data/params.js";
import { quand } from "../../state/dom.js";

function sphere(u, pack, options = {}) {
  const p = pack?.palette || { core: "#6654E8", accent: "#F29BBF", glow: "rgba(102,84,232,.14)" };
  return h`
    <button class="sphere" data-act="ouvrir" data-id="${u.id}"
      style="--core:${p.core};--accent:${p.accent};--glow:${p.glow}"
      aria-label="Ouvrir ${u.name}">
      <span class="sphere__anneau" aria-hidden="true"></span>
      <span class="sphere__monde" aria-hidden="true"></span>
      <span class="sphere__nom">${u.name}</span>
      <span class="sphere__sous">${pack?.title || u.packId}${u.branches?.length ? ` · ${u.branches.length} branche${u.branches.length > 1 ? "s" : ""}` : ""}</span>
    </button>`;
}

export function ecranMultiverse(etat) {
  const universes = [...etat.universes].sort((a, b) => b.updatedAt - a.updatedAt);
  const dernier = universes[0];

  if (!etat.pret) {
    return h`
      <div class="ecran">
        <h1 class="titre-ecran">Your Multiverse</h1>
        <p class="chapeau">Lecture de vos vies alternatives…</p>
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
        <span aria-hidden="true">⚠</span>
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
          <div class="etat__sphère" aria-hidden="true">◯</div>
          <h2 class="etat__titre">Aucune vie alternative pour l'instant.</h2>
          <p class="etat__texte">Créez-en une pour commencer.</p>
        </div>
        <button class="btn" data-act="nouvelle">Créer ma première vie</button>
        ${etat.corrompu ? brut(`<button class="btn btn--discret" style="margin-top:12px" data-act="reinit">Réinitialiser le multivers</button>`) : ""}
      </div>`;
  }

  const pack = PACKS[dernier.packId];
  const scene = pack?.scenes?.[dernier.state.sceneId];
  const reprise = h`
    <section class="glass-card" style="padding:20px;margin-bottom:8px">
      <div class="section-titre" style="margin-top:0">Reprendre</div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="flex:0 0 56px">
          ${brut(sphere(dernier, pack))}
        </div>
        <div style="min-width:0">
          <div style="font:600 17px/23px -apple-system,system-ui,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dernier.name}</div>
          <div class="carte-ligne__meta">${scene ? `Scène : ${scene.title}` : "Scène inconnue"} · ${quand(dernier.updatedAt)}</div>
        </div>
      </div>
      <button class="btn" data-act="reprendre" data-id="${dernier.id}">Reprendre l'histoire</button>
    </section>`;

  const erreurInterne = universes
    .map((u) => (PACKS[u.packId] ? null : u.name))
    .filter(Boolean);

  return h`
    <div class="ecran">
      <h1 class="titre-ecran">Your Multiverse</h1>
      <p class="chapeau">${universes.length} vie${universes.length > 1 ? "s" : ""} alternative${universes.length > 1 ? "s" : ""} en cours</p>
      ${brut(bandeau)}
      ${erreurInterne.length ? brut(`<div class="bandeau" role="alert"><span aria-hidden="true">⚠</span><span>Univers sans pack narratif : ${erreurInterne.map(esc).join(", ")}. Le reste demeure jouable.</span></div>`) : ""}
      ${brut(reprise)}

      <h2 class="section-titre">Tous les univers</h2>
      <div class="grille-univers">
        ${brut(universes.map((u) => sphere(u, PACKS[u.packId])).join(""))}
      </div>

      <div style="margin-top:28px">
        <button class="btn" data-act="nouvelle">Créer une nouvelle vie</button>
      </div>
      <p class="vide-note" style="margin-top:20px;text-align:center">
        Simulation fictive. PARALLEL ME ne prédit rien : il raconte.
      </p>
    </div>`;
}
