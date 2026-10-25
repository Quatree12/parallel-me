/* ============================================================
   PARALLEL ME - Fiche de creature
   Reutilise la mecanique de modaleFragment (meme voile, meme
   modale, meme bouton de fermeture) en l'enrichissant du role et
   de la provenance. Aucune modification de modales.js.

   La fiche est PURE : elle produit du HTML. L'ecriture dans le
   journal appartient a main.js, comme pour les objets.
   ============================================================ */

import { h, brut } from "../state/dom.js";

/**
 * @param creature  entree du registre creatures.js
 * @param dejaVue   true si la creature figure deja dans l'etat
 */
export function modaleCreature(creature, dejaVue) {
  if (!creature) return "";

  const effets = Object.keys(creature.effet.variables || {});
  const lignesEffet = effets.length
    ? effets.map((cle) => h`
        <div class="ligne-dose">
          <span>${cle}</span>
          <span>+${creature.effet.variables[cle]}</span>
        </div>`).join("")
    : h`<p class="vide-note">Cette rencontre ne modifie aucune variable.</p>`;

  const etatRencontre = dejaVue
    ? h`<div class="badge badge--cyan" style="margin-bottom:12px">Deja rencontree dans cette vie</div>`
    : h`<div class="badge badge--rose" style="margin-bottom:12px">Premiere rencontre</div>`;

  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Creature du multivers">
        <div class="fiche-creature" style="--teinte:${creature.teinte}">
          <div class="fiche-creature__sceau" aria-hidden="true"></div>
          <div class="fiche-creature__corps">
            <div class="fiche-creature__nom">${creature.nom}</div>
            <div class="fiche-creature__titre">${creature.titre}</div>
          </div>
        </div>

        ${brut(etatRencontre)}

        <h3 class="section-titre" style="margin-top:0">Role</h3>
        <p class="modale__texte" style="margin-bottom:16px">${creature.role}</p>

        <h3 class="section-titre">Note</h3>
        <p class="modale__texte">${creature.note}</p>

        <h3 class="section-titre">Origine</h3>
        <p class="modale__texte" style="margin-bottom:16px">${creature.univers}</p>

        <h3 class="section-titre">Effet sur cette vie</h3>
        <div class="glass-card" style="padding:14px">${brut(lignesEffet)}</div>

        <div class="modale__actions" style="margin-top:20px">
          <button class="btn" data-act="fermer-modale">Compris</button>
        </div>
      </div>
    </div>`;
}
