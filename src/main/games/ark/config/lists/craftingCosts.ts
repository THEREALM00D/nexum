import type {
  ArkCraftingCost,
  ArkCraftingResource,
} from "../../../../../shared/types";
import { AppError } from "../../../../utils/appError";
import type { IniDocument } from "../iniDocument";
import {
  formatUeValue,
  ueField,
  ueFieldText,
  ueList,
  ueStruct,
  ueText,
  type UeValue,
} from "../ueStruct";
import {
  boolText,
  classText,
  extraFields,
  numberText,
  readEntries,
  ueBool,
  withExtra,
  writeEntries,
} from "./listEntries";

// ConfigOverrideItemCraftingCosts (wiki ARK, ASA et ASE) : une entrée par
// objet, qui remplace toutes ses ressources. Ne change ni le coût de
// réparation ni le remboursement à la démolition (wiki).
export const CRAFTING_KEY = "ConfigOverrideItemCraftingCosts";
const COST_FIELDS = ["ItemClassString", "BaseCraftingResourceRequirements"];
const RESOURCE_FIELDS = [
  "ResourceItemTypeString",
  "BaseResourceRequirement",
  "bCraftingRequireExactResourceType",
];

/**
 * Ressource lue, ou null si Nexum ne saurait pas la réécrire à l'identique
 * (pas une structure, sans classe ni quantité, « type exact » illisible).
 */
function parseResource(value: UeValue): ArkCraftingResource | null {
  if (Array.isArray(value) || value.kind !== "struct") return null;
  const resource = ueFieldText(value, "ResourceItemTypeString");
  const quantity = ueFieldText(value, "BaseResourceRequirement");
  if (!resource || !quantity) return null;
  const exactText = ueFieldText(value, "bCraftingRequireExactResourceType");
  const exact = exactText === undefined ? false : ueBool(exactText);
  if (exact === null) return null;
  return {
    resource,
    quantity,
    exact,
    extra: extraFields(value, RESOURCE_FIELDS),
  };
}

/**
 * Entrée lue. ⚠️ Sans ressource ou avec une ressource illisible : null,
 * donc gardée telle quelle comme entrée illisible (`readEntries`). Sinon
 * l'enregistrement de la liste l'effaçait (un objet sans ressource n'est
 * jamais écrit) ou perdait la ressource mal formée.
 */
function parseCost(value: UeValue): ArkCraftingCost | null {
  const item = ueFieldText(value, "ItemClassString");
  if (!item) return null;
  const resources = ueList(ueField(value, "BaseCraftingResourceRequirements"));
  const parsed = resources.map(parseResource);
  if (parsed.length === 0 || parsed.some((resource) => resource === null))
    return null;
  return {
    item,
    resources: parsed as ArkCraftingResource[],
    extra: extraFields(value, COST_FIELDS),
  };
}

export function readCraftingCosts(doc: IniDocument) {
  return readEntries(doc, CRAFTING_KEY, parseCost);
}

/**
 * Quantité écrite en décimal (`5.0`) comme dans les exemples du wiki. Vide
 * ou invalide → erreur codée : une ressource sans quantité ne doit pas
 * disparaître en silence.
 */
function quantityText(value: string): string {
  const text = numberText(CRAFTING_KEY, value);
  if (text === undefined)
    throw new AppError("ARK_SETTING_INVALID", { key: CRAFTING_KEY, value });
  return /^-?\d+$/.test(text) ? `${text}.0` : text;
}

function formatCost(cost: ArkCraftingCost): string | null {
  const item = classText(CRAFTING_KEY, cost.item);
  if (item === undefined) {
    // Ressources remplies sans objet : refusé plutôt qu'abandonné en silence.
    const filled = (cost.resources ?? []).some(
      (resource) => (resource.resource ?? "").trim() !== "",
    );
    if (filled)
      throw new AppError("ARK_SETTING_INVALID", {
        key: CRAFTING_KEY,
        value: "",
      });
    return null;
  }
  const resources = (cost.resources ?? []).flatMap((resource) => {
    const className = classText(CRAFTING_KEY, resource.resource);
    if (className === undefined) return [];
    return [
      withExtra(
        ueStruct([
          ["ResourceItemTypeString", ueText(className, true)],
          ["BaseResourceRequirement", ueText(quantityText(resource.quantity))],
          [
            "bCraftingRequireExactResourceType",
            ueText(boolText(resource.exact === true)),
          ],
        ]),
        resource.extra,
      ),
    ];
  });
  // Sans ressource, l'objet deviendrait gratuit : pas écrit.
  if (resources.length === 0) return null;
  return formatUeValue(
    withExtra(
      ueStruct([
        ["ItemClassString", ueText(item, true)],
        ["BaseCraftingResourceRequirements", resources],
      ]),
      cost.extra,
    ),
  );
}

export function writeCraftingCosts(
  doc: IniDocument,
  costs: ArkCraftingCost[],
  unreadable: string[],
): void {
  const values = (Array.isArray(costs) ? costs : []).flatMap(
    (cost) => formatCost(cost) ?? [],
  );
  writeEntries(doc, CRAFTING_KEY, values, unreadable);
}
