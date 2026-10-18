export default {
  valheimMods: {
    title: "Mods",
    subtitle: "Manage your Valheim server mods via Thunderstore and Hexium",
    tabs: {
      installed: "Installed",
      browse: "Browse",
      configs: "Configs",
    },
    clientHint:
      'Nexum installs mods on the server only. Most mods must also be installed by each player, with a mod manager such as Gale, r2modman or the Hexium mod manager (the mod page says whether it\'s needed on the client). Use "Share modpack" to give them the same mods in one code.',
    share: {
      button: "Share modpack",
      title: "Share the modpack with your players",
      creating: "Creating the profile code…",
      codeLabel: "Profile code",
      howTo:
        "This code contains the {{count}} active mods of this server. Give it to your players: in Gale or r2modman, Import profile → From code, then paste it. They'll get exactly the same mods as the server.",
      hexiumWarning:
        "Some mods come from Hexium: r2modman can't install them, your players need Gale (or the Hexium mod manager).",
      skippedManual:
        "{{count}} mod(s) installed by hand (outside Nexum) aren't included: they have no registry code. Players must install them themselves.",
      expiry:
        "The code is stored by Thunderstore and may expire after a while: create a new one if a player can't import it anymore.",
      copy: "Copy code",
      copied: "Code copied",
      close: "Close",
      noMods: "No active mod to share.",
      error: "Couldn't create the profile code: {{error}}",
    },
    bepinex: {
      warning:
        "BepInEx not detected in the server folder. Most Valheim mods require BepInEx to work.",
      ok: "BepInEx detected",
      install: "Install BepInEx",
      installing: "Installing…",
      success: "BepInEx installed successfully",
    },
    installed: {
      empty:
        "No mods installed. Browse Thunderstore/Hexium or import an r2modman profile.",
      remove: "Uninstall",
      removeConfirm: "Uninstall {{name}}?",
      enabled: "Enabled",
      disabled: "Disabled",
      manual: "Manual",
      installedAt: "Installed on {{date}}",
      updatedAt: "Version published on {{registry}}: {{date}}",
      version: "v{{version}}",
      search: "Search installed mods…",
      count_one: "{{count}} mod",
      count_other: "{{count}} mods",
      sort: {
        label: "Sort by",
        name: "Name (A → Z)",
        updates: "Updates available first",
        recentlyInstalled: "Recently installed",
        recentlyPublished: "Recently updated",
        author: "Author (A → Z)",
      },
      countFiltered: "{{shown}} / {{total}} mods",
      noMatch: "No installed mod matches this search.",
      loadFailed: "Unable to load installed mods",
      restartRequired:
        "Restart the server to apply this change — BepInEx only reloads mods on startup.",
    },
    thunderstore: {
      title: "Install via code",
      label: "Package code",
      helper:
        "Format: Author-ModName-Version (e.g. denikson-BepInExPack_Valheim-5.4.2202)",
      importProfile: "Import profile",
      profileLabel: "Profile code",
      profileHelper:
        "Paste the code exported from Thunderstore, Hexium or r2modman/Gale (Settings → Export profile → Copy code)",
      importProfileFile: "Import from a file (.r2z)",
      install: "Install",
      success: "{{name}} installed from {{registry}}",
      profileSuccess: "{{count}} mod(s) installed from profile",
      profileErrors: "{{count}} mod(s) failed — see notifications",
    },
    browse: {
      tabs: {
        trending: "Trending",
        latest: "New",
        updated: "Updated",
      },
      search: "Search…",
      searchBtn: "Search",
      clearSearch: "Clear",
      installLatest: "Install latest version",
      openTooltip: "Opens the mod page on {{registry}}",
      viewFiles: "Versions",
      filesDialog: {
        title: "Versions of {{name}}",
        close: "Close",
        size: "{{size}} KB",
        noFiles: "No versions available",
      },
      endorsements: "{{count}} stars",
      updatedOn: "Updated {{date}}",
      staleTooltip:
        "Not updated in over a year: it may not work with the current version of Valheim. Check the comments on its page before installing.",
      loading: "Loading…",
      error: "Unable to load {{registry}} mods",
    },
    folders: {
      plugins: "Mods folder",
      config: "Mod configs",
    },
    nxm: {
      installing: "Installing…",
      success: "{{name}} installed successfully",
      error: "Installation error: {{error}}",
    },
    deps: {
      title: "Required dependencies",
      subtitle:
        "{{name}} requires {{count}} uninstalled mod(s). Install them now?",
      installAll: "Install all ({{count}})",
      skip: "Skip",
    },
    deprecated: {
      label: "Deprecated",
      tooltip:
        "Marked deprecated by its author on {{registry}} — no longer maintained, may break after a game update.",
      tooltipAlternative:
        "Deprecated on {{registry}} — a maintained version exists on {{alternative}}, use the suggested update.",
    },
    updates: {
      newVersion: "v{{version}} available",
      newVersionOnRegistry: "v{{version}} available on {{registry}}",
      updateBtn: "Update to v{{version}}",
      updateBtnSourceChanged:
        "Update to v{{version}} — will switch from {{from}} to {{to}}",
      refresh: "Check for updates",
      found: "{{count}} update(s) available",
      none: "All mods are up to date",
      updateAll: "Update all ({{count}})",
    },
    configs: {
      empty:
        "No config file found in BepInEx/config/. Mods generate one the first time the server starts.",
      noEntries: "No recognized setting in this file.",
      noMatch: "No results.",
      searchFiles: "Search a config file…",
      searchSettings: "Search a setting (name, description, section)…",
      default: "Default: {{value}}",
      edit: "Edit",
      close: "Close",
      save: "Save",
      saved: "{{name}} saved",
      loadFailed: "Unable to list config files",
      readFailed: "Unable to read this config file",
      saveFailed: "Unable to save this config file",
      unsaved: {
        title: "Unsaved changes",
        message: "You changed {{name}} without saving. Close anyway?",
        keepEditing: "Keep editing",
        discard: "Discard changes",
      },
    },
  },
};
