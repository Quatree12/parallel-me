/* ============================================================
   PARALLEL ME — Modales
   Renommer, supprimer, gérer. Toute suppression demande une
   confirmation explicite : un bouton ne détruit jamais par
   accident.
   ============================================================ */

import { h, esc, brut } from "../state/dom.js";

export function modaleRenommer(univers) {
  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Renommer l'univers" data-stop="1">
        <h2 class="modale__titre">Renommer cet univers</h2>
        <p class="modale__texte">Le nom apparaît dans YOUR MULTIVERSE, dans THE ATLAS et dans votre journal.</p>
        <input class="saisie" data-act-input="nom-modale" value="${univers.name}" aria-label="Nouveau nom">
        <div class="modale__actions" style="margin-top:20px">
          <button class="btn" data-act="renommer-valider" data-id="${univers.id}">Enregistrer</button>
          <button class="btn btn--secondaire" data-act="fermer-modale">Annuler</button>
        </div>
      </div>
    </div>`;
}

export function modaleSupprimer(univers) {
  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Supprimer l'univers">
        <h2 class="modale__titre">Supprimer « ${univers.name} » ?</h2>
        <p class="modale__texte">
          Cette vie alternative, ses ${(univers.journal || []).length} entrées de journal et ses
          ${(univers.branches || []).length} branche(s) seront effacées définitivement.
          Les autres univers ne sont pas concernés.
        </p>
        <div class="modale__actions">
          <button class="btn btn--danger" data-act="supprimer-valider" data-id="${univers.id}">Supprimer définitivement</button>
          <button class="btn btn--secondaire" data-act="fermer-modale">Conserver</button>
        </div>
      </div>
    </div>`;
}

export function modaleGerer(univers) {
  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Gérer l'univers">
        <h2 class="modale__titre">Gérer « ${univers.name} »</h2>
        <p class="modale__texte">
          ${(univers.state.visited || []).length} scènes traversées · ${(univers.journal || []).length} entrées ·
          ${(univers.branches || []).length} branche(s)
        </p>
        <div class="modale__actions">
          <button class="btn" data-act="renommer-ouvrir" data-id="${univers.id}">Renommer</button>
          <button class="btn btn--secondaire" data-act="gerer-dupliquer" data-id="${univers.id}">Dupliquer une copie indépendante</button>
          <button class="btn btn--secondaire" data-act="gerer-recommencer" data-id="${univers.id}">Recommencer cet univers</button>
          <button class="btn btn--danger" data-act="supprimer-ouvrir" data-id="${univers.id}">Supprimer</button>
          <button class="btn btn--discret" data-act="fermer-modale">Fermer</button>
        </div>
      </div>
    </div>`;
}

export function modaleFragment(nom, texte) {
  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Objet">
        <h2 class="modale__titre">${nom}</h2>
        <p class="modale__texte">${texte}</p>
        <div class="modale__actions">
          <button class="btn" data-act="fermer-modale">Compris</button>
        </div>
      </div>
    </div>`;
}

export function modaleReinitialiser() {
  return h`
    <div class="voile" data-act="fermer-voile">
      <div class="modale" role="dialog" aria-modal="true" aria-label="Réinitialiser">
        <h2 class="modale__titre">Réinitialiser tout le multivers ?</h2>
        <p class="modale__texte">
          Cette action efface l'ensemble des données sauvegardées. Elle est utile quand la sauvegarde
          est illisible. Irréversible.
        </p>
        <div class="modale__actions">
          <button class="btn btn--danger" data-act="reinit-valider">Tout effacer</button>
          <button class="btn btn--secondaire" data-act="fermer-modale">Annuler</button>
        </div>
      </div>
    </div>`;
}
