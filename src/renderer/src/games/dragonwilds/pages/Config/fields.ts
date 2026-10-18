import type { FieldGroup } from "../../../../components/config/types";

// Port beacon par défaut = port de jeu + 1111 (compose.yaml officiel).
export const BEACON_OFFSET = 1111;

export const FIELD_GROUPS: FieldGroup[] = [
  {
    labelKey: "dragonwildsConfig.groups.server",
    fields: [
      { key: "ServerName", type: "text" },
      { key: "DefaultWorldName", type: "text" },
      { key: "WorldPassword", type: "text" },
    ],
  },
  {
    labelKey: "dragonwildsConfig.groups.access",
    fields: [
      { key: "OwnerId", type: "text", required: true },
      { key: "AdminPassword", type: "text" },
    ],
  },
  {
    labelKey: "dragonwildsConfig.groups.network",
    fields: [
      { key: "Port", type: "number" },
      { key: "BeaconPort", type: "number" },
      {
        key: "PlatformPolicy",
        type: "select",
        // Valeurs de l'énumération EDomPlatformFamily du serveur : seules
        // celles qui ont un sens pour un serveur PC sont proposées.
        options: [
          {
            value: "Crossplay",
            labelKey: "dragonwildsConfig.policy.Crossplay",
          },
          { value: "PC", labelKey: "dragonwildsConfig.policy.PC" },
        ],
      },
    ],
  },
  {
    labelKey: "dragonwildsConfig.groups.advanced",
    fields: [{ key: "customArgs", type: "text" }],
  },
];
