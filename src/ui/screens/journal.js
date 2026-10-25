/* ============================================================
   ECRAN 5 - LIFE JOURNAL
   Journal chronologique, objectifs, objets decouverts et
   branches. Permet de reprendre une histoire ou de creer une
   branche alternative depuis n'importe quelle scene visitee.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS } from "../../data/params.js";
import { quand } from "../../state/dom.js";
import { objectifAtteint } from "../objectifs.js";

const LIBELLES = {
  creation: "creation",
  scene: "scene",
  choice: "decision",
  goal: "objectif",
  item: "objet",
  branch: "branche",
};

function libelleKind(kind) {
  return LIBELLES[kind] || kind;
}

/** Une ligne d'objectif, construite sans gabarit imbrique. */
function ligneObjectif(o, etat) {
  const fait = objectifAtteint(o, etat);
  const marque = fait ? "V" : "o";
  const couleur = fait ? "var(--rose)" : "var(--texte-faible)";
  const statut = fait ? "atteint" : "en cours";
  return (
    '<li class="ligne-dose" style="align-items:flex-start">' +
    "<span>" + marque + " " + esc(o.nom) + "</span>" +
    '<span style="color:' + couleur + '">' + statut + "</span>" +
    "</li>"
  );
}

/** Une entree de journal, construite sans gabarit imbrique. */
function entreeHtml(e) {
  let html = '<li class="entree" data-kind="' + esc(e.kind) + '">';
  html += '<div class="entree__quand">' + esc(quand(e.at)) + " - " + libelleKind(e.kind) + "</div>";
  html += '<div class="entree__titre">' + esc(e.label) + "</div>";
  if (e.detail) html += '<div class="entree__detail">' + esc(e.detail) + "</div>";
  if (e.changements && e.changements.length) {
    const texte = e.changements
      .map(function (c) { return c.cle + " : " + c.avant + " vers " + c.apres; })
      .join(" - ");
    html += '<div class="entree__detail" style="color:var(--lavande)">' + esc(texte) + "</div>";
  }
  return html + "</li>";
}

/** Une scene visitee, comme point de bifurcation possible. */
function ligneVisitee(s) {
  return (
    '<li><button class="carte-ligne" data-act="branche-depuis" data-scene="' + esc(s.id) + '">' +
    '<span class="carte-ligne__corps">' +
    '<span class="carte-ligne__titre">' + esc(s.title) + "</span>" +
    '<span class="carte-ligne__meta">' + esc(s.place) + " - bifurquer ici</span>" +
    "</span>" +
    '<span aria-hidden="true">Y</span>' +
    "</button></li>"
  );
}

/** Un onglet de branche. */
function ligneBranche(b, branche) {
  const actif = branche && branche.id === b.id;
  const style = actif ? "border-color:rgba(242,155,191,.6);color:#fff" : "";
  return (
    '<button class="btn btn--discret btn--petit" data-act="branche-ouvrir" data-branche="' +
    esc(b.id) + '" aria-pressed="' + String(Boolean(actif)) + '" style="' + style + '">' +
    esc(b.label) +
    "</button>"
  );
}

export function ecranJournal(etat, univers) {
  const pack = PACKS[univers.packId];
  const branche = (univers.branches || []).find((b) => b.id === etat.brancheId) || null;
  const source = branche || univers;
  const journal = branche ? branche.entries : univers.journal || [];

  if (!pack) {
    return h`
      <div class="ecran">
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">!</div>
          <h2 class="etat__titre">Journal sans pack narratif</h2>
          <p class="etat__texte">Les entrees brutes sont conservees : ${journal.length} evenement(s).</p>
        </div>
        <button class="btn" data-act="retour-multiverse">Retour au multivers</button>
      </div>`;
  }

  const objectifsHtml = (pack.objectifs || [])
    .map(function (o) { return ligneObjectif(o, source.state); })
    .join("");
  const scenes = (source.state.visited || [])
    .map(function (id) { return pack.scenes[id]; })
    .filter(Boolean);
  const visitesHtml = scenes.map(ligneVisitee).join("");

  const objetsTrouves = (source.state.flags || [])
    .filter(function (f) { return f.indexOf("objet:") === 0; })
    .map(function (f) { return f.slice(6); });
  const totalObjets = Object.keys(pack.objects || {}).length;

  let objetsHtml;
  if (objetsTrouves.length) {
    objetsHtml = '<div class="objets">' + objetsTrouves.map(function (id) {
      const nom = pack.objects[id] ? pack.objects[id].nom : id;
      return '<span class="badge badge--cyan">' + esc(nom) + "</span>";
    }).join("") + "</div>";
  } else {
    objetsHtml = '<p class="vide-note">Aucun objet decouvert pour l\'instant. Les objets se trouvent dans les scenes et dans ENTER THE WORLD.</p>';
  }

  let entreesHtml;
  if (journal.length) {
    entreesHtml = journal.slice().reverse().map(entreeHtml).join("");
  } else {
    entreesHtml = '<li class="vide-note">Cette branche commence ici.</li>';
  }

  let branchesHtml = "";
  if (univers.branches && univers.branches.length) {
    const principalActif = !branche;
    const stylePrincipal = principalActif ? "border-color:rgba(199,185,255,.6);color:#fff" : "";
    const onglets = univers.branches.map(function (b) { return ligneBranche(b, branche); }).join("");
    branchesHtml = h`
      <h2 class="section-titre">Branches de cet univers</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn--discret btn--petit" data-act="branche-principale"
          aria-pressed="${String(principalActif)}" style="${stylePrincipal}">Lignee principale</button>
        ${brut(onglets)}
      </div>`;
  }

  const ruban = branche
    ? h`<div class="ruban-branche"><span aria-hidden="true">Y</span> ${branche.label} - lignee separee</div>`
    : h`<div class="badge badge--cyan" style="margin-bottom:16px">Lignee principale</div>`;

  const blocVisites = scenes.length
    ? h`<ul class="liste">${brut(visitesHtml)}</ul>`
    : h`<p class="vide-note">Aucune scene traversee : la branche se cree apres la premiere decision.</p>`;

  return h`
    <div class="ecran">
      ${brut(ruban)}
      <h1 class="titre-ecran">Life Journal</h1>
      <p class="chapeau">${univers.name} - ${journal.length} evenement(s) - ${scenes.length} scene(s) traversee(s)</p>

      <div class="badge" style="margin-bottom:20px">
        Recit preecrit - moteur deterministe : vos choix modifient l'etat et les scenes accessibles.
      </div>

      ${brut(branchesHtml)}

      <h2 class="section-titre">Objectifs</h2>
      <div class="glass-card" style="padding:14px">
        <ul style="list-style:none;margin:0;padding:0">${brut(objectifsHtml)}</ul>
      </div>

      <h2 class="section-titre">Objets decouverts</h2>
      ${brut(objetsHtml)}
      <p class="vide-note" style="margin-top:8px">${objetsTrouves.length}/${totalObjets}</p>

      <h2 class="section-titre">Chronologie</h2>
      <ul class="journal">${brut(entreesHtml)}</ul>

      <h2 class="section-titre">Creer une branche alternative</h2>
      <p class="vide-note" style="margin-bottom:12px">
        Choisissez la scene d'ou repartir. L'histoire d'origine n'est jamais modifiee.
      </p>
      ${brut(blocVisites)}

      <h2 class="section-titre">Actions</h2>
      <button class="btn" data-act="reprendre">Reprendre la ou j'en etais</button>
      <button class="btn btn--secondaire" style="margin-top:10px" data-act="volumes">Renommer / gerer cet univers</button>
      <button class="btn btn--secondaire" style="margin-top:10px" data-act="atlas">Ouvrir The Atlas</button>
    </div>`;
}
