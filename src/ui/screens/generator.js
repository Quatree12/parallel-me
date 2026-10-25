/* ============================================================
   ÉCRAN 2 — LIFE GENERATOR
   Paramètres : rôle, décor, ambiance, défi. Options prédéfinies
   + saisie libre. Le brouillon vit dans le store, donc un retour
   accidentel ne perd rien.
   ============================================================ */

import { h, esc, brut } from "../../state/dom.js";
import { ROLES, DECORS, AMBIANCES, DEFIS, UNIVERS_PREDEFINIS, packPourDecor, libelle } from "../../data/params.js";

const ETAPES = ["Rôle", "Décor", "Ambiance", "Défi"];

function options(liste, courant, action, libre = false) {
  return h`
    <div class="options">
      ${brut(liste.map((o) => h`
        <button class="option" data-act="${action}" data-valeur="${o.id}"
          aria-pressed="${courant === o.id}">${o.nom}</button>`).join(""))}
      ${libre ? brut(`<input class="saisie" style="margin-top:8px" data-act-input="libre" placeholder="ou décrivez le vôtre" aria-label="Saisie libre">`) : ""}
    </div>`;
}

function resume(b, note) {
  return h`
    <div class="glass-card" style="padding:16px;margin-bottom:20px">
      <div class="carte-ligne__meta">Aperçu de la vie alternative</div>
      <div style="font:600 17px/23px -apple-system,system-ui,sans-serif;margin:6px 0 4px">${b.nom || "Sans nom pour l'instant"}</div>
      <div class="ligne-dose"><span>Rôle</span><span>${b.libreRole || libelle(ROLES, b.role)}</span></div>
      <div class="ligne-dose"><span>Décor</span><span>${b.libreDecor || libelle(DECORS, b.decor)}</span></div>
      <div class="ligne-dose"><span>Ambiance</span><span>${libelle(AMBIANCES, b.ambiance)}</span></div>
      <div class="ligne-dose"><span>Défi</span><span>${libelle(DEFIS, b.defi)}</span></div>
      <div class="carte-ligne__meta" style="margin-top:10px;font-style:italic">${note}</div>
    </div>`;
}

export function ecranGenerator(etat) {
  const b = etat.generateur;
  const packId = packPourDecor(b.decor, b.defi);
  const chemin = ETAPES.map((nom, i) => h`
    <button class="btn btn--discret btn--petit" data-act="etape" data-n="${i}"
      aria-current="${b.etape === i}"
      style="${b.etape === i ? "border-color:rgba(199,185,255,.6);color:#fff" : ""}">${i + 1}. ${nom}</button>`).join("");

  let corps;
  if (b.etape === 0) {
    corps = h`
      <div class="champ">
        <label class="champ__label" for="nom-univers">Nom de cette vie alternative</label>
        <input id="nom-univers" class="saisie" data-act-input="nom" value="${b.nom}"
          placeholder="Ex. « Orbite Basse »" autocomplete="off">
      </div>
      <div class="champ">
        <span class="champ__label">Rôle</span>
        ${brut(options(ROLES, b.role, "role"))}
        <input class="saisie" style="margin-top:8px" data-act-input="libreRole"
          value="${b.libreRole}" placeholder="ou votre propre rôle" aria-label="Rôle libre">
      </div>`;
  } else if (b.etape === 1) {
    corps = h`
      <div class="champ">
        <span class="champ__label">Décor</span>
        ${brut(options(DECORS, b.decor, "decor"))}
        <input class="saisie" style="margin-top:8px" data-act-input="libreDecor"
          value="${b.libreDecor}" placeholder="ou décrivez le décor" aria-label="Décor libre">
      </div>`;
  } else if (b.etape === 2) {
    corps = h`
      <div class="champ">
        <span class="champ__label">Ambiance</span>
        ${brut(options(AMBIANCES, b.ambiance, "ambiance"))}
        <p class="vide-note" style="margin-top:10px">${libelle(AMBIANCES, b.ambiance) === b.ambiance ? "" : (AMBIANCES.find((a) => a.id === b.ambiance)?.note || "")}</p>
      </div>`;
  } else {
    corps = h`
      <div class="champ">
        <span class="champ__label">Défi</span>
        ${brut(options(DEFIS, b.defi, "defi"))}
        <p class="vide-note" style="margin-top:10px">${DEFIS.find((d) => d.id === b.defi)?.note || ""}</p>
      </div>
      <div class="champ">
        <label class="champ__label" for="note-libre">Note libre (optionnel)</label>
        <textarea id="note-libre" class="zone-texte" data-act-input="note"
          placeholder="Une contrainte, un détail, une envie…">${b.note}</textarea>
      </div>`;
  }

  const dernier = b.etape === ETAPES.length - 1;
  const pack = packPourDecor(b.decor, b.defi);
  const nomPack = { space: "Orbite Basse", studio: "Atelier 4 h", atlas: "Les Cartographes" }[pack];

  return h`
    <div class="ecran">
      <h1 class="titre-ecran">Life Generator</h1>
      <p class="chapeau">Composez une vie qui n'existe pas. Le moteur est déterministe : vos choix auront des conséquences réelles dans le scénario.</p>

      ${brut(resume(b, `Trame narrative : ${nomPack}`))}

      <div class="section-titre">Étapes</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">${brut(chemin)}</div>

      ${brut(corps)}

      <div style="display:flex;gap:8px;margin-top:24px">
        <button class="btn btn--secondaire" data-act="precedent" ${b.etape === 0 ? "disabled" : ""}>Précédent</button>
        <button class="btn" data-act="${dernier ? "creer" : "suivant"}">
          ${dernier ? "Créer cette vie" : "Continuer"}
        </button>
      </div>

      <h2 class="section-titre">Partir d'un univers prédéfini</h2>
      <ul class="liste">
        ${brut(UNIVERS_PREDEFINIS.map((u) => h`
          <li>
            <button class="carte-ligne" data-act="predefini" data-pack="${u.packId}">
              <span class="carte-ligne__pastille" aria-hidden="true"></span>
              <span class="carte-ligne__corps">
                <span class="carte-ligne__titre">${u.nom}</span>
                <span class="carte-ligne__meta">${u.resume}</span>
              </span>
            </button>
          </li>`).join(""))}
      </ul>
      <p class="vide-note" style="margin-top:16px">
        Contenu préécrit. Aucun de ces univers n'est présenté comme une génération en direct.
      </p>
    </div>`;
}
