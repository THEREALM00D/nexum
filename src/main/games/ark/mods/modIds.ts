import type { ArkMod } from "../../../../shared/types";
import { arkModState, withArkModState } from "../../../../shared/arkMods";

// Sans autre dépendance du main : lu par launchConfig, argsMods et l'import
// d'une ligne (pas d'import circulaire).

// ID de projet CurseForge : entier positif (int32 côté API).
export const isModId = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 2147483647;

/** ID valides d'une liste « 1,2,3 », sans doublon. */
export function parseModIds(value: string): {
  ids: number[];
  invalid: boolean;
} {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const ids: number[] = [];
  let invalid = false;
  for (const part of parts) {
    const id = Number(part);
    if (!isModId(id)) invalid = true;
    else if (!ids.includes(id)) ids.push(id);
  }
  return { ids, invalid };
}

/**
 * Range dans la liste des mods venus d'une ligne de lancement (`-mods=`,
 * `-passivemods=` : arguments perso, ancienne option, import) avec l'état
 * qu'ils avaient vraiment sur la ligne : un mod de `-mods=` est actif ; un
 * mod de `-passivemods=` (et pas de `-mods=`) est passif, sauf s'il est déjà
 * actif dans la liste. Sinon un mod désactivé dans la liste mais chargé par
 * la ligne cessait d'être chargé (le monde perdait ce qu'il avait ajouté).
 * Les nouveaux vont à la fin, actifs puis passifs.
 */
export function mergeLineMods(
  listed: ArkMod[],
  ids: number[],
  passiveIds: number[],
): ArkMod[] {
  const mods = [...listed];
  const place = (id: number, state: "active" | "passive") => {
    const index = mods.findIndex((mod) => mod.id === id);
    if (index < 0) {
      mods.push(withArkModState({ id, enabled: true }, state));
      return;
    }
    const current = arkModState(mods[index]);
    if (state === "active" || current === "disabled")
      mods[index] = withArkModState(mods[index], state);
  };
  for (const id of ids) place(id, "active");
  for (const id of passiveIds) if (!ids.includes(id)) place(id, "passive");
  return mods;
}
