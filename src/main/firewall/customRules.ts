import type { FirewallNamedRule } from "../../shared/types";

// Liste des règles perso enregistrées (store `firewall`). Fonctions pures :
// `FirewallManager` garde le store, la validation des noms et netsh.

/** Même règle = même nom et même protocole (le port peut différer). */
export const sameRule =
  (rule: FirewallNamedRule) => (other: FirewallNamedRule) =>
    rule.name === other.name && rule.protocol === other.protocol;

export const withRule = (
  stored: FirewallNamedRule[],
  rule: FirewallNamedRule,
): FirewallNamedRule[] =>
  stored.some(sameRule(rule)) ? stored : [...stored, rule];

export const withoutRule = (
  stored: FirewallNamedRule[],
  name: string,
  protocol: "TCP" | "UDP",
): FirewallNamedRule[] =>
  stored.filter((rule) => !(rule.name === name && rule.protocol === protocol));

/**
 * Règles d'un import de réglages (déjà validées). Une règle locale du même
 * nom et protocole n'est jamais modifiée : avec un autre port, la règle du
 * fichier est ignorée (ni enregistrée ni appliquée), sinon Windows ouvrirait
 * un port que la page Réseau n'afficherait pas. `toApply` : règles ajoutées
 * ou identiques, à créer dans le pare-feu si demandé ; `next` : null si rien
 * n'est ajouté.
 */
export function mergeImportedRules(
  stored: FirewallNamedRule[],
  imported: FirewallNamedRule[],
): { next: FirewallNamedRule[] | null; toApply: FirewallNamedRule[] } {
  const added: FirewallNamedRule[] = [];
  const toApply: FirewallNamedRule[] = [];
  for (const rule of imported) {
    const local = stored.find(sameRule(rule));
    if (!local) added.push(rule);
    if (!local || local.port === rule.port) toApply.push(rule);
  }
  return { next: added.length > 0 ? [...stored, ...added] : null, toApply };
}
