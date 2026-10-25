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
          'Nexum starts in the background (icon near the clock, or minimized in the taskbar), then starts the servers marked "Start automatically".',
        unsupported:
          "Only available in the installed app (not in development mode).",
        on: "Nexum will launch when Windows starts",
        off: "Nexum will no longer launch when Windows starts",
      },
      closeToTray: {
        label: "Keep Nexum running in the notification area when closed",
        helper:
          "Closing the window keeps Nexum near the clock, so scheduled backups and restarts keep running. Right-click the icon to control your servers or quit.",
        on: "Closing the window will keep Nexum in the notification area",
        off: "Closing the window will quit Nexum",
      },
    },
    language: { title: "Language" },
    updates: {
      title: "Updates",
      beta: {
        label: "Get beta versions",
        helper:
          "Try new features before everyone else. A beta may contain bugs: back up your worlds and report issues on Discord. If you turn this off, you stay on the installed beta until the next stable version.",
        on: "Beta versions will be offered to you",
        off: "Only stable versions will be offered to you",
      },
    },
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
