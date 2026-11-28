import type { ArkMod, ArkModState } from "./types";

/** Désactivé l'emporte sur passif : un mod désactivé n'est sur aucune ligne. */
export function arkModState(mod: ArkMod): ArkModState {
  if (!mod.enabled) return "disabled";
  return mod.passive ? "passive" : "active";
}

/** Le mod avec cet état (`passive` seulement quand il est vrai). */
export function withArkModState(mod: ArkMod, state: ArkModState): ArkMod {
  const { id } = mod;
  if (state === "disabled") return { id, enabled: false };
  return state === "passive"
    ? { id, enabled: true, passive: true }
    : { id, enabled: true };
}
