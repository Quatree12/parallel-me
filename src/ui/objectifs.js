/* ============================================================
   PARALLEL ME — Objectifs et état narratif
   Un objectif est validé par une règle explicite (§1.2), jamais
   par une impression. Même vocabulaire que les conditions du
   moteur, pour qu'il n'existe qu'un seul langage.
   ============================================================ */

/** Vrai si l'objectif est atteint dans l'état donné. */
export function objectifAtteint(objectif, etat) {
  const regle = objectif.quand;
  if (!regle) return false;

  // Forme « variable » : la simple présence d'une variable suffit.
  if (regle.startsWith("variable:")) {
    return Boolean(etat.variables[regle.slice(9)]);
  }

  // Forme « cle operateur valeur », ex. « savoir >= 7 ».
  const correspondance = regle.match(/^([a-z_]+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/i);
  if (!correspondance) return false;
  const [, cle, operateur, brut] = correspondance;
  const attendu = isNaN(Number(brut)) ? brut : Number(brut);
  const actuel = etat.variables[cle];

  switch (operateur) {
    case ">=": return Number(actuel) >= Number(attendu);
    case "<=": return Number(actuel) <= Number(attendu);
    case ">":  return Number(actuel) > Number(attendu);
    case "<":  return Number(actuel) < Number(attendu);
    case "==": return actuel === attendu;
    case "!=": return actuel !== attendu;
    default:   return false;
  }
}

/** Nombre d'objectifs atteints, pour l'affichage. */
export function progression(pack, etat) {
  const total = (pack.objectifs || []).length;
  const faits = (pack.objectifs || []).filter((o) => objectifAtteint(o, etat)).length;
  return { faits, total };
}
