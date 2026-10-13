export default {
  join: {
    title: "Join the server",
    local: "Same network",
    internet: "From the Internet",
    code: "Crossplay join code",
    showPublicIp: "Show my public IP",
    publicIpTooltip:
      "Asks the ipify.org service for your public IP address (only when you click)",
    publicIpError:
      "Couldn't get your public IP. Check your Internet connection.",
    copy: "Copy",
    copied: "Copied",
    thisPc: "this PC",
    hint: "For friends outside your network: forward UDP port(s) {{range}} on your router to {{ip}}, and apply the firewall rules (Network page). Most routers won't let you join your own public IP from inside your network: have a friend test it.",
  },
  logs: {
    title: "Server logs",
    lines: "{{count}} lines",
    clear: "Clear",
    empty: "No logs — start the server to see logs.",
    copy: "Copy",
    copyTooltip:
      "Copy the whole log, with the Nexum version and game at the top (handy for a bug report). Public IP addresses, Steam IDs and join codes are hidden.",
    copied:
      "Log copied. IP addresses, Steam IDs and join codes were hidden; player names were kept.",
    copyError: "Couldn't copy the log to the clipboard.",
    save: "Save as .txt",
    saved:
      "Log saved. IP addresses, Steam IDs and join codes were hidden; player names were kept.",
    saveError: "Couldn't save the log: {{error}}",
    showInFolder: "Show in folder",
    newLines: "New lines — back to live",
    session: {
      live: "Current session (live)",
      crashed: "crashed",
      size: "{{size}} KB",
      openDir: "Open the logs folder",
      truncated:
        "Showing the last {{count}} lines of this session. Copy and Save export the whole file.",
    },
  },
};
