export default {
  noTributeDownloads: {
    label: "Block all downloads",
    description: "Forbids downloading anything from ARK data.",
  },
  PreventDownloadSurvivors: {
    label: "Block survivor downloads",
    description: "Characters can't be downloaded to this server.",
  },
  PreventDownloadDinos: {
    label: "Block creature downloads",
    description: "Creatures can't be downloaded to this server.",
  },
  PreventDownloadItems: {
    label: "Block item downloads",
    description: "Items can't be downloaded to this server.",
  },
  PreventUploadSurvivors: {
    label: "Block survivor uploads",
    description: "Characters can't be uploaded to ARK data.",
  },
  PreventUploadDinos: {
    label: "Block creature uploads",
    description: "Creatures can't be uploaded to ARK data.",
  },
  PreventUploadItems: {
    label: "Block item uploads",
    description: "Items can't be uploaded to ARK data.",
  },
  CrossARKAllowForeignDinoDownloads: {
    label: "Creatures from other maps",
    description: "Allows downloading creatures from other maps (Aberration).",
  },
  MinimumDinoReuploadInterval: {
    label: "Creature re-upload delay",
    description:
      "Seconds between two uploads of the same creature; 43200 on official servers.",
  },
  TributeCharacterExpirationSeconds: {
    label: "Uploaded survivor expiry",
    description:
      "Seconds before deletion; 0 or less = never. Use the same value across the cluster.",
  },
  TributeDinoExpirationSeconds: {
    label: "Uploaded creature expiry",
    description:
      "Seconds before deletion. Use the same value across the cluster.",
  },
  TributeItemExpirationSeconds: {
    label: "Uploaded item expiry",
    description:
      "Seconds before deletion. Use the same value across the cluster.",
  },
  MaxTributeCharacters: {
    label: "Survivor slots",
    description:
      "Max uploaded survivors. Above 10, cluster data may get corrupted.",
  },
  MaxTributeDinos: {
    label: "Creature slots",
    description:
      "Max uploaded creatures. Above 20, cluster data may get corrupted.",
  },
  MaxTributeItems: {
    label: "Item slots",
    description:
      "Max uploaded items. Above 50, cluster data may get corrupted.",
  },
};
