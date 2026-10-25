/* ============================================================
   PARALLEL ME — Moteur narratif déterministe
   §2 des fondations. Aucun aléatoire, aucune lecture d'horloge,
   aucune dépendance à l'interface. C'est ce module qui garantit
   qu'un choix produit réellement une conséquence.
   ============================================================ */

/** Évalue une condition contre un état. `null` = toujours vrai. */
export function conditionRemplie(condition, etat) {
  if (!condition) return true;
  const { variable, operateur = "==", valeur } = condition;
  const actuel = etat.variables[variable];
  switch (operateur) {
    case "==": return actuel === valeur;
    case "!=": return actuel !== valeur;
    case ">":  return Number(actuel) > Number(valeur);
    case ">=": return Number(actuel) >= Number(valeur);
    case "<":  return Number(actuel) < Number(valeur);
    case "<=": return Number(actuel) <= Number(valeur);
    case "a":  return (etat.flags || []).includes(valeur);
    case "na": return !(etat.flags || []).includes(valeur);
    default:   return false;
  }
}

/** Phrase courte expliquant pourquoi un choix est verrouillé. */
export function raisonVerrou(condition) {
  if (!condition) return "Indisponible.";
  const noms = {
    "==": "doit être égal à", "!=": "doit différer de",
    ">": "doit dépasser", ">=": "doit atteindre",
    "<": "doit rester sous", "<=": "doit rester sous ou égal à",
    "a": "exige", "na": "ne doit pas avoir",
  };
  const op = noms[condition.operateur] || "exige";
  return `Verrouillé — ${condition.variable} ${op} ${condition.valeur}.`;
}

/** Les choix d'une scène, annotés de leur disponibilité. */
export function choixDisponibles(scene, etat) {
  return (scene?.choices || []).map((choix) => ({
    choix,
    ouvert: conditionRemplie(choix.requires, etat),
    raison: conditionRemplie(choix.requires, etat) ? null : raisonVerrou(choix.requires),
  }));
}

/** Les choix réellement jouables. */
export function choixJouables(scene, etat) {
  return choixDisponibles(scene, etat).filter((c) => c.ouvert).map((c) => c.choix);
}

/**
 * Applique un choix à un état. Renvoie un NOUVEL état et les
 * différences observées, pour que le journal puisse dire ce qui a
 * réellement changé — et non ce que l'auteur espérait.
 *
 * Effets appliqués dans l'ordre déclaré, puis navigation (§2).
 */
export function appliquerChoix(etat, choix, pack) {
  const suivant = {
    sceneId: etat.sceneId,
    variables: { ...etat.variables },
    flags: [...(etat.flags || [])],
    visited: [...(etat.visited || [])],
  };
  const avant = { ...etat.variables };
  const changements = [];
  const objets = [];
  const capacites = [];

  for (const effet of choix.effects || []) {
    switch (effet.op) {
      case "set": {
        suivant.variables[effet.key] = effet.value;
        break;
      }
      case "add": {
        const base = Number(suivant.variables[effet.key] ?? 0);
        suivant.variables[effet.key] = base + Number(effet.value);
        break;
      }
      case "flag": {
        if (!suivant.flags.includes(effet.value)) suivant.flags.push(effet.value);
        capacites.push(effet.value);
        break;
      }
      case "item": {
        if (!suivant.flags.includes(`objet:${effet.value}`)) {
          suivant.flags.push(`objet:${effet.value}`);
        }
        objets.push(effet.value);
        break;
      }
      case "goto": {
        suivant.sceneId = effet.sceneId;
        break;
      }
      default:
        break;
    }
  }

  // Ce qui a réellement bougé, dans un ordre stable.
  for (const cle of Object.keys(suivant.variables).sort()) {
    if (avant[cle] !== suivant.variables[cle]) {
      changements.push({ cle, avant: avant[cle], apres: suivant.variables[cle] });
    }
  }

  if (!suivant.visited.includes(suivant.sceneId)) suivant.visited.push(suivant.sceneId);

  // Garde-fou d'auteur : une destination doit exister dans le pack.
  const destination = pack?.scenes?.[suivant.sceneId];
  const avertissement = destination
    ? null
    : `Scène « ${suivant.sceneId} » introuvable dans le pack ${pack?.id ?? "?"}.`;

  return { etat: suivant, changements, objets, capacites, avertissement };
}

/**
 * Diagnostic d'auteur : détecte les culs-de-sac silencieux et les
 * renvois morts (§2, règle 5). Utilisé par le test T5 et par le
 * rapport, jamais montré au joueur en cours de partie.
 */
export function auditerPack(pack) {
  const problemes = [];
  const ids = Object.keys(pack.scenes || {});
  if (!pack.scenes?.[pack.startSceneId]) {
    problemes.push(`startSceneId « ${pack.startSceneId} » absent.`);
  }
  for (const id of ids) {
    const scene = pack.scenes[id];
    if (!scene.choices?.length && !scene.ending) {
      problemes.push(`Scène « ${id} » sans choix ni fin.`);
    }
    for (const choix of scene.choices || []) {
      if (!choix.effects?.some((e) => e.op === "goto")) {
        problemes.push(`Choix « ${choix.id} » de « ${id} » sans destination.`);
      }
      for (const effet of choix.effects || []) {
        if (effet.op === "goto" && !pack.scenes[effet.sceneId]) {
          problemes.push(`Choix « ${choix.id} » pointe vers « ${effet.sceneId} » qui n'existe pas.`);
        }
      }
    }
  }
  return problemes;
}

/** État initial dérivé des paramètres choisis au LIFE GENERATOR. */
export function etatInitial(pack, params) {
  const base = { ...(pack.variablesInitiales || {}) };
  // Chaque paramètre pèse réellement : c'est ce qui rend deux
  // univers comparables autrement que par leur nom.
  base.ambition = 3;
  base.equilibre = 3;
  base.rayonnement = 2;
  for (const regle of pack.modificateurs || []) {
    if (regle.si.variable === "role" && regle.si.valeur === params.role) {
      Object.assign(base, regle.alors);
    }
    if (regle.si.variable === "challenge" && regle.si.valeur === params.challenge) {
      for (const [cle, valeur] of Object.entries(regle.alors)) {
        base[cle] = Number(base[cle] ?? 0) + Number(valeur);
      }
    }
    if (regle.si.variable === "mood" && regle.si.valeur === params.mood) {
      Object.assign(base, regle.alors);
    }
  }
  return {
    sceneId: pack.startSceneId,
    variables: base,
    flags: [],
    visited: [pack.startSceneId],
  };
}
