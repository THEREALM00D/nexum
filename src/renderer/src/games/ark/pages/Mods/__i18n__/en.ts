export default {
  arkMods: {
    title: "Mods",
    subtitle:
      "The server's CurseForge mods. The server downloads and updates them itself at every start.",
    add: {
      label: "Mod ID (Project ID)",
      help: "The “Project ID” is shown on the mod's CurseForge page, under “About Project”.",
      helpUnchecked:
        "The “Project ID” is shown on the mod's CurseForge page, under “About Project”. Double-check it: an unknown ID prevents the server from starting.",
      button: "Add",
    },
    notices: {
      running:
        "The server is running: changes on this page apply at the next start.",
      args: "The launch arguments (Configuration page) still contain mods: {{ids}}.",
      argsButton: "Move to the list",
    },
    list: {
      empty: "No mods. Add a mod with its ID.",
      hint: "Mods load in the order of the list. Players download them when they join the server. Removing a mod also removes what it added to the world (creatures, structures, items).",
      unknownName: "Mod {{id}}",
      id: "ID {{id}}",
      by: "by {{authors}}",
      fileWithDate: "{{file}}, published on {{date}}",
      notDownloaded: "Downloaded at the server's next start",
      premium: "Paid",
      toggle: "Enable the mod",
      enabled: "Enabled",
      disabled: "Disabled: not loaded by the server",
      moveUp: "Move up",
      moveDown: "Move down",
      open: "Open on CurseForge",
      remove: "Remove from the list",
    },
    downloaded: {
      title: "Downloaded by the server, not in the list",
      hint: "The server keeps the files of a mod removed from the list, or installed before Nexum. They are not loaded.",
      add: "Add",
    },
  },
};
