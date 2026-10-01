export default {
  network: {
    title: "Network & Firewall",
    subtitle: "Manage Windows Defender Firewall rules for the Palworld server",
    errors: {
      uacCancelled:
        "Change cancelled: the Windows confirmation (UAC) was declined.",
      invalidRule:
        "Invalid rule name: letters, digits, spaces and - _ . ( ) : only (80 characters max).",
      notApplied:
        "The rule could not be changed. Try again, or check that no security software is blocking Windows Firewall.",
    },
    admin: {
      title: "Administrator privileges",
      subtitle: "Only needed to change firewall rules",
      isAdmin: "Administrator",
      notAdmin: "Standard mode",
      warning:
        'Nexum runs without administrator rights. When you change a rule, Windows asks you to confirm (UAC): just once for "Apply all".',
    },
    standard: {
      title: "Firewall rules",
      applyAll: "Apply all",
      applyAllTooltip:
        "Re-read ports from PalWorldSettings.ini and create every rule",
      removeAll: "Remove all",
      removeAllTooltip: "Remove all Palworld rules from the firewall",
      colRule: "Rule",
      colPort: "Port",
      colProto: "Proto",
      colState: "State",
      enable: "Enable",
      disable: "Disable",
      active: "Active",
      inactive: "Inactive",
      ruleAdded: 'Rule "{{name}}" added',
      ruleRemoved: 'Rule "{{name}}" removed',
      allApplied: "All rules were applied",
      allRemoved: "All Palworld rules were removed",
    },
    custom: {
      title: "Custom rules",
      name: "Name",
      port: "Port",
      proto: "Proto",
      create: "Create",
      delete: "Delete",
      none: "No custom rule",
      invalidInput: "Valid name and port (1-65535) required",
      createErrorFallback: "Creation failed",
      deleteErrorFallback: "Deletion failed",
      created: 'Rule "{{name}}" created',
      deleted: 'Rule "{{name}}" removed',
    },
  },
};
