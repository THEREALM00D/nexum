export default {
  network: {
    title: "Réseau & Pare-feu",
    subtitle:
      "Gestion des règles Windows Defender Firewall pour le serveur Palworld",
    errors: {
      uacCancelled:
        "Modification annulée : la confirmation Windows (UAC) a été refusée.",
      invalidRule:
        "Nom de règle invalide : lettres, chiffres, espaces et - _ . ( ) : uniquement (80 caractères max).",
      notApplied:
        "La règle n'a pas pu être modifiée. Réessayez, ou vérifiez qu'aucun logiciel de sécurité ne bloque le pare-feu Windows.",
    },
    admin: {
      title: "Privilèges administrateur",
      subtitle: "Nécessaires uniquement pour modifier les règles de pare-feu",
      isAdmin: "Administrateur",
      notAdmin: "Mode standard",
      warning:
        "Nexum tourne sans droits administrateur. Quand vous modifiez une règle, Windows vous demande une confirmation (UAC) : une seule pour « Tout appliquer ».",
    },
    standard: {
      title: "Règles pare-feu",
      applyAll: "Tout appliquer",
      applyAllTooltip:
        "Relire les ports depuis PalWorldSettings.ini et créer toutes les règles",
      removeAll: "Tout supprimer",
      removeAllTooltip: "Supprimer toutes les règles Palworld du pare-feu",
      colRule: "Règle",
      colPort: "Port",
      colProto: "Proto",
      colState: "État",
      enable: "Activer",
      disable: "Désactiver",
      active: "Active",
      inactive: "Inactive",
      ruleAdded: 'Règle "{{name}}" ajoutée',
      ruleRemoved: 'Règle "{{name}}" supprimée',
      allApplied: "Toutes les règles ont été appliquées",
      allRemoved: "Toutes les règles Palworld ont été supprimées",
    },
    custom: {
      title: "Règles personnalisées",
      name: "Nom",
      port: "Port",
      proto: "Proto",
      create: "Créer",
      delete: "Supprimer",
      none: "Aucune règle personnalisée",
      invalidInput: "Nom et port valide (1-65535) requis",
      createErrorFallback: "Erreur lors de la création",
      deleteErrorFallback: "Erreur lors de la suppression",
      created: 'Règle "{{name}}" créée',
      deleted: 'Règle "{{name}}" supprimée',
    },
  },
};
