/* ECRAN 6 - THE ATLAS : carte des univers, comparaison, duplication. */

import { h, esc, brut } from "../../state/dom.js";
import { PACKS, libelle, ROLES, DECORS, AMBIANCES, DEFIS } from "../../data/params.js";
import { quand } from "../../state/dom.js";
import { trajectoire } from "../../engine/journal.js";

function fmt(v) {
  if (v === undefined) return "-";
  if (typeof v === "boolean") return v ? "oui" : "non";
  return String(v);
}

function intersection(x, y) {
  return x.filter(function (i) { return y.indexOf(i) !== -1; });
}

export function comparer(a, b) {
  const brutParams = [
    ["Role", a.params.role, b.params.role],
    ["Decor", a.params.setting, b.params.setting],
    ["Ambiance", a.params.mood, b.params.mood],
    ["Defi", a.params.challenge, b.params.challenge],
  ];
  const lignesParams = brutParams.map(function (l) {
    return { nom: l[0], a: l[1], b: l[2], diff: l[1] !== l[2] };
  });

  const cles = Array.from(new Set(
    Object.keys(a.state.variables || {}).concat(Object.keys(b.state.variables || {}))
  )).sort();

  const variables = cles.map(function (cle) {
    const va = a.state.variables[cle];
    const vb = b.state.variables[cle];
    return { cle: cle, a: fmt(va), b: fmt(vb), diff: String(va) !== String(vb) };
  });
  const divergentes = variables.filter(function (v) { return v.diff; }).length;

  const ta = trajectoire(a, PACKS[a.packId]);
  const tb = trajectoire(b, PACKS[b.packId]);
  const communes = [];
  const min = Math.min(ta.length, tb.length);
  for (let i = 0; i < min; i++) {
    if (ta[i] === tb[i]) communes.push(ta[i]);
    else break;
  }

  const objetsA = (a.state.flags || []).filter(function (f) { return f.indexOf("objet:") === 0; });
  const objetsB = (b.state.flags || []).filter(function (f) { return f.indexOf("objet:") === 0; });

  return {
    lignesParams: lignesParams,
    variables: variables,
    divergentes: divergentes,
    identiques: variables.length - divergentes,
    communes: communes,
    suiteA: ta.slice(communes.length),
    suiteB: tb.slice(communes.length),
    memesObjets: intersection(objetsA, objetsB).length,
  };
}

function carteUnivers(u, selection) {
  const choisi = selection.indexOf(u.id) !== -1;
  const pack = PACKS[u.packId];
  const couleur = pack ? pack.palette.core : "#6654E8";
  const titrePack = pack ? pack.title : u.packId;
  const scenes = (u.state.visited || []).length;
  const origine = u.originId ? " - issu d'une copie" : "";
  const styleChoisi = choisi ? "border-color:rgba(117,221,235,.7);color:#fff" : "";
  const labelChoisi = choisi ? "Comparer (actif)" : "Comparer";

  return (
    '<li class="glass-card" style="padding:14px;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div class="carte-ligne__pastille" style="--core:' + couleur + '"></div>' +
        '<div class="carte-ligne__corps">' +
          '<div class="carte-ligne__titre">' + esc(u.name) + "</div>" +
          '<div class="carte-ligne__meta">' + esc(titrePack) + " - " + scenes + " scenes - " +
            esc(quand(u.updatedAt)) + origine + "</div>" +
        "</div>" +
      "</div>" +
      '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="btn btn--discret btn--petit" data-act="atlas-choisir" data-id="' + esc(u.id) +
          '" aria-pressed="' + String(choisi) + '" style="' + styleChoisi + '">' + labelChoisi + "</button>" +
        '<button class="btn btn--discret btn--petit" data-act="atlas-ouvrir" data-id="' + esc(u.id) + '">Rouvrir</button>' +
        '<button class="btn btn--discret btn--petit" data-act="atlas-dupliquer" data-id="' + esc(u.id) + '">Dupliquer</button>' +
        '<button class="btn btn--discret btn--petit" data-act="atlas-gerer" data-id="' + esc(u.id) + '">Renommer / supprimer</button>' +
      "</div>" +
    "</li>"
  );
}

export function ecranAtlas(etat) {
  const universes = etat.universes.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  const selection = etat.atlasSelection || [];

  if (universes.length === 0) {
    return h`
      <div class="ecran">
        <h1 class="titre-ecran">The Atlas</h1>
        <div class="etat">
          <div class="etat__sphere" aria-hidden="true">@</div>
          <h2 class="etat__titre">Carte vide</h2>
          <p class="etat__texte">Aucune vie alternative pour l'instant. Creez-en une pour commencer.</p>
        </div>
        <button class="btn" data-act="nouvelle">Creer une vie alternative</button>
      </div>`;
  }

  const listeHtml = universes.map(function (u) {
    return carteUnivers(u, selection);
  }).join("");

  let compHtml = "";
  if (selection.length === 2) {
    const a = universes.find(function (u) { return u.id === selection[0]; });
    const b = universes.find(function (u) { return u.id === selection[1]; });
    if (a && b) {
      const c = comparer(a, b);

      const lignesParams = c.lignesParams.map(function (l) {
        const cls = l.diff ? "diff" : "meme";
        return "<tr><th>" + esc(l.nom) + "</th>" +
          '<td class="' + cls + '">' + esc(l.a) + "</td>" +
          '<td class="' + cls + '">' + esc(l.b) + "</td></tr>";
      }).join("");

      const divergentes = c.variables.filter(function (v) { return v.diff; });
      let lignesVars;
      if (divergentes.length) {
        lignesVars = divergentes.map(function (v) {
          return "<tr><th>" + esc(v.cle) + "</th>" +
            '<td class="diff">' + esc(v.a) + "</td>" +
            '<td class="diff">' + esc(v.b) + "</td></tr>";
        }).join("");
      } else {
        lignesVars = '<tr><td colspan="3" class="meme">Aucune variable divergente.</td></tr>';
      }

      let phraseCommunes;
      if (c.communes.length) {
        phraseCommunes = c.communes.length + " scene(s) commune(s) : " + c.communes.join(" > ") + ".";
      } else {
        phraseCommunes = "Aucune scene commune : les deux histoires divergent des le depart.";
      }
      const dernierCommun = c.communes.length ? c.communes[c.communes.length - 1] : "le depart";

      compHtml = h`
        <h2 class="section-titre">Comparaison</h2>
        <div class="glass-card" style="padding:16px;overflow-x:auto">
          <table class="tableau">
            <thead><tr><th></th><th>${a.name}</th><th>${b.name}</th></tr></thead>
            <tbody>
              ${brut(lignesParams)}
              <tr><th colspan="3" style="padding-top:16px">Variables narratives</th></tr>
              ${brut(lignesVars)}
            </tbody>
          </table>
          <p class="vide-note" style="margin-top:12px">
            ${c.divergentes} variable(s) divergent, ${c.identiques} identique(s).
            ${c.memesObjets} objet(s) decouvert(s) en commun.
          </p>
        </div>

        <h2 class="section-titre">Trajectoires</h2>
        <div class="glass-card" style="padding:16px">
          <p class="carte-ligne__meta" style="margin-top:0">${phraseCommunes}</p>
          <div class="ligne-dose"><span>${a.name} - apres la divergence</span><span>${c.suiteA.length}</span></div>
          <div class="ligne-dose"><span>${b.name} - apres la divergence</span><span>${c.suiteB.length}</span></div>
          <div class="badge badge--rose" style="margin-top:12px">Repere de divergence pose apres « ${dernierCommun} »</div>
        </div>`;
    }
  } else if (selection.length === 1) {
    compHtml = h`<p class="vide-note">Selectionnez un second univers pour lancer la comparaison.</p>`;
  }

  const connexionsHtml = universes
    .filter(function (u) {
      return u.originId && universes.some(function (v) { return v.id === u.originId; });
    })
    .map(function (u) {
      const parent = universes.find(function (v) { return v.id === u.originId; });
      return '<div class="ligne-dose"><span>' + esc(parent.name) + " -> " + esc(u.name) +
        "</span><span>copie</span></div>";
    })
    .join("");

  const branchesTotales = universes.reduce(function (n, u) {
    return n + ((u.branches || []).length);
  }, 0);

  const blocConnexions = connexionsHtml
    ? h`<h2 class="section-titre">Connexions</h2><div class="glass-card" style="padding:14px">${brut(connexionsHtml)}</div>`
    : "";

  const noteConnexion = universes.length < 2
    ? h`<p class="vide-note" style="margin-top:12px">Deux univers minimum pour tracer une connexion.</p>`
    : "";

  return h`
    <div class="ecran">
      <h1 class="titre-ecran">The Atlas</h1>
      <p class="chapeau">${universes.length} univers - ${branchesTotales} branche(s) alternative(s)</p>

      <div class="badge" style="margin-bottom:20px">
        Recit preecrit - comparaison fondee sur les variables reelles, pas sur une estimation.
      </div>

      <h2 class="section-titre">Univers</h2>
      <ul class="liste">${brut(listeHtml)}</ul>

      ${brut(noteConnexion)}
      ${brut(blocConnexions)}
      ${brut(compHtml)}

      <div style="margin-top:24px">
        <button class="btn" data-act="nouvelle">Creer une nouvelle vie</button>
      </div>
    </div>`;
}

export function nommerParametres(p) {
  return {
    role: p.libreRole || libelle(ROLES, p.role),
    decor: p.libreDecor || libelle(DECORS, p.decor),
    mood: libelle(AMBIANCES, p.ambiance),
    challenge: libelle(DEFIS, p.defi),
  };
}
