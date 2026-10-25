/* ============================================================
   ECRAN 4 - THE CROSSROADS
   Scenes interactives a deux ou trois choix. Chaque decision
   modifie l'etat de l'histoire et les scenes accessibles.
   Les choix verrouilles restent VISIBLES avec leur raison.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS } from "../../data/params.js";
import { choixDisponibles } from "../../engine/narrative.js";

export function ecranCrossroads(etat, univers) {
  const pack = PACKS[univers.packId];
  if (!pack) {
    return h`
      <div class="ecran">
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">!</div>
          <h2 class="etat__titre">Scene indisponible</h2>
          <p class="etat__texte">Le pack narratif de cet univers est introuvable. Aucune progression n'a ete perdue.</p>
        </div>
        <button class="btn" data-act="journal">Ouvrir le journal</button>
      </div>`;
  }

  const etatCourant = univers.state;
  const scene = pack.scenes[etatCourant.sceneId];
  const branche = (univers.branches || []).find((b) => b.id === etat.brancheId) || null;

  if (!scene) {
    return h`
      <div class="ecran">
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">o</div>
          <h2 class="etat__titre">Scene introuvable</h2>
          <p class="etat__texte">La position enregistree n'existe pas dans ce pack. Vous pouvez recommencer cet univers sans perdre le reste du multivers.</p>
        </div>
        <button class="btn" data-act="recommencer">Recommencer cet univers</button>
        <button class="btn btn--discret" style="margin-top:10px" data-act="journal">Ouvrir le journal</button>
      </div>`;
  }

  const ruban = branche
    ? h`<div class="ruban-branche"><span aria-hidden="true">Y</span> ${branche.label}</div>`
    : "";

  const doses = (pack.variablesAffichees || []).map((v) => {
    const valeur = Number(etatCourant.variables[v.cle] ?? 0);
    const max = v.max || 10;
    const pct = Math.max(4, Math.min(100, Math.round((valeur / max) * 100)));
    return h`
      <div style="margin-bottom:10px">
        <div class="ligne-dose"><span>${v.nom}</span><span>${valeur}</span></div>
        <div class="jauge"><div class="jauge__part" style="width:${pct}%"></div></div>
      </div>`;
  }).join("");

  const choixHtml = choixDisponibles(scene, etatCourant).map((item, i) => h`
    <button class="choix ${item.ouvert ? "" : "choix--verrou"}"
      data-act="${item.ouvert ? "choisir" : "rien"}"
      data-choix="${item.choix.id}"
      ${item.ouvert ? "" : 'aria-disabled="true"'}
      style="animation-delay:${i * 90}ms">
      <span class="choix__puce" aria-hidden="true"></span>
      <span class="choix__label">${item.choix.label}</span>
      <span class="choix__hint">${item.ouvert ? (item.choix.hint || "") : item.raison}</span>
    </button>`).join("");

  const fin = scene.ending
    ? h`
      <div class="glass-card" style="padding:18px;margin-bottom:16px;border-color:rgba(242,155,191,.45)">
        <div class="badge badge--rose" style="margin-bottom:10px">Fin atteinte</div>
        <p class="carte-ligne__meta" style="margin:0">
          Cette vie alternative est arrivee a son terme. Vous pouvez creer une branche depuis n'importe quelle scene
          du journal, sans effacer celle-ci.
        </p>
      </div>
      <button class="btn" data-act="journal">Ouvrir le journal</button>
      <button class="btn btn--secondaire" style="margin-top:10px" data-act="branche-ici">Creer une branche depuis cette scene</button>`
    : "";

  const dernier = [...(univers.journal || [])].reverse().find((x) => x.kind === "choice");
  const echo = dernier
    ? h`<div class="badge badge--cyan" style="margin-bottom:16px">Derniere decision : ${dernier.label}</div>`
    : "";

  return h`
    <div class="ecran">
      ${brut(ruban)}
      <div class="lieu"><span aria-hidden="true">+</span> ${scene.place}</div>
      <h1 class="titre-ecran" style="font:var(--f-scene)">${scene.title}</h1>

      <div class="scene-corps">
        ${brut(scene.body.map((par) => `<p>${esc(par)}</p>`).join(""))}
      </div>

      ${scene.hotspots?.length ? brut(`
        <h2 class="section-titre">Dans la scene</h2>
        <div class="objets">
          ${(scene.hotspots || []).map((hs) => `<button class="objet" data-act="fragment" data-objet="${hs.objet || ""}" data-nom="${esc(hs.nom)}"><span aria-hidden="true">*</span> ${esc(hs.nom)}</button>`).join("")}
        </div>
      `) : ""}

      ${brut(echo)}

      ${scene.ending ? brut(fin) : brut(`
        <h2 class="section-titre">The Crossroads</h2>
        ${choixHtml}
      `)}

      <h2 class="section-titre">Etat de cette vie</h2>
      <div class="glass-card" style="padding:16px">${brut(doses)}</div>

      <div style="display:flex;gap:8px;margin-top:20px">
        <button class="btn btn--secondaire" data-act="entree">Le monde</button>
        <button class="btn btn--secondaire" data-act="journal">Journal</button>
      </div>
      <p class="vide-note" style="margin-top:14px">
        Un retour d'ecran ne defait pas un choix. Pour explorer l'autre voie, creez une branche depuis le journal.
      </p>
    </div>`;
}
