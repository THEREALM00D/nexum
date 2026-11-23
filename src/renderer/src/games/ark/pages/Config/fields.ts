import type { FieldGroup } from "../../../../components/config/types";

// Cartes présentes dans les fichiers du serveur (index des .pak, build
// 26749470). Les valeurs restent les noms bruts de la ligne de commande.
const MAPS = [
  "TheIsland_WP",
  "TheCenter_WP",
  "ScorchedEarth_WP",
  "Aberration_WP",
  "Extinction_WP",
  "Ragnarok_WP",
  "Valguero_WP",
  "LostColony_WP",
  "Astraeos_WP",
];

export const FIELD_GROUPS: FieldGroup[] = [
  {
    labelKey: "arkConfig.groups.server",
    fields: [
      { key: "SessionName", type: "text" },
      {
        key: "map",
        type: "select",
        options: MAPS.map((map) => ({
          value: map,
          labelKey: `arkConfig.maps.${map}`,
        })),
      },
      { key: "maxPlayers", type: "number", min: 1, max: 255 },
      { key: "ServerPVE", type: "boolean" },
    ],
  },
  {
    labelKey: "arkConfig.groups.access",
    fields: [
      { key: "ServerPassword", type: "text" },
      { key: "ServerAdminPassword", type: "text" },
      { key: "RCONEnabled", type: "boolean" },
    ],
  },
  {
    labelKey: "arkConfig.groups.network",
    fields: [
      { key: "port", type: "number", min: 1, max: 65535 },
      { key: "queryPort", type: "number", min: 1, max: 65535 },
      { key: "rconPort", type: "number", min: 1, max: 65535 },
    ],
  },
  {
    labelKey: "arkConfig.groups.advanced",
    fields: [
      { key: "battlEye", type: "boolean" },
      { key: "customArgs", type: "text" },
    ],
  },
];
