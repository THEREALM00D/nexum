export default {
  settings: {
    title: "Settings",
    subtitle:
      "App settings. Settings for a specific server are in its dialog, on the Servers page.",
    startup: {
      title: "Startup",
      description:
        'To have your servers come back on their own after a PC restart, turn this on and check "Start automatically" in each server\'s dialog (Servers page).',
      launchAtLogin: {
        label: "Launch Nexum when Windows starts",
        helper:
          'Nexum opens minimized in the taskbar, then starts the servers marked "Start automatically".',
        unsupported:
          "Only available in the installed app (not in development mode).",
        on: "Nexum will launch when Windows starts",
        off: "Nexum will no longer launch when Windows starts",
      },
    },
    language: { title: "Language" },
    updates: { title: "Updates" },
    help: {
      title: "Help & about",
      docs: "Documentation",
      bug: "Report a bug",
      privacy: "Privacy",
      license:
        "Nexum is free and open-source software, licensed under GPL-3.0. No telemetry, no account.",
    },
  },
};
