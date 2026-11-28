import type { AppErrorCode } from "../types";

// Textes des erreurs codées (`AppError`, voir `src/main/utils/appError.ts`),
// lus par le renderer (`appErrors` de i18next) et par le main pour écrire
// ces erreurs dans les logs (`appErrorLogText`). `Record<AppErrorCode, …>` :
// un code sans traduction ne compile pas. Interpolation `{{param}}`.
export const APP_ERRORS_FR: Record<AppErrorCode, string> = {
  NO_SERVER_PATH: "Aucun dossier de serveur configuré.",
  NO_ACTIVE_SERVER:
    "Aucun serveur sélectionné. Choisissez-en un dans la barre latérale.",
  SERVER_NOT_FOUND: "Ce serveur n'existe plus ({{id}}).",
  UNKNOWN_GAME: "Jeu inconnu : {{game}}",
  SERVER_ALREADY_RUNNING: "Le serveur est déjà lancé.",
  BULK_ACTION_RUNNING: "Une action sur tous les serveurs est déjà en cours.",
  REMOTE_ADMIN_UNAVAILABLE:
    "Commande indisponible : activez RCON ou l'API REST du serveur (page Configuration).",
  SERVER_NOT_RUNNING: "Le serveur n'est pas lancé.",
  SERVER_EXE_NOT_FOUND:
    "{{exe}} introuvable dans {{path}}. Installez le serveur depuis la page Installation, ou vérifiez le dossier du serveur.",
  SERVER_STOP_TIMEOUT: "Le serveur n'a pas répondu à la demande d'arrêt.",
  STOP_BEFORE_RESTORE: "Arrêtez le serveur avant de restaurer une sauvegarde.",
  BACKUP_SOURCE_NOT_FOUND:
    "Rien à sauvegarder : le dossier du monde n'existe pas ({{path}}). Démarrez le serveur une fois pour qu'il crée son monde.",
  BACKUP_TIMEOUT:
    "La sauvegarde a pris trop longtemps et a été annulée (fichiers verrouillés par un autre programme ?).",
  BACKUP_FILE_NOT_FOUND: "Fichier de sauvegarde introuvable : {{path}}",
  BACKUP_CORRUPTED:
    "{{name}} est corrompu ou incomplet : la sauvegarde a probablement été interrompue pendant sa création. Essayez de l'ouvrir avec 7-Zip pour récupérer ce qui peut l'être.",
  PAL_API_DISABLED:
    "L'API REST de Palworld est désactivée. Activez-la dans la page Configuration (RESTAPIEnabled), puis redémarrez le serveur.",
  PAL_API_HTTP:
    "L'API REST de Palworld a répondu par une erreur (HTTP {{status}}). Un 401 signifie que le mot de passe admin ne correspond pas.",
  PAL_API_TIMEOUT: "L'API REST de Palworld n'a pas répondu en 8 secondes.",
  PAL_API_UNREACHABLE:
    "Impossible de joindre l'API REST de Palworld. Vérifiez que le serveur tourne et que le port de l'API correspond à la configuration.",
  RCON_AUTH_FAILED:
    "RCON a refusé le mot de passe admin. Vérifiez ServerAdminPassword dans la page Configuration.",
  RCON_TIMEOUT: "RCON n'a pas répondu en 8 secondes.",
  RCON_UNREACHABLE:
    "Impossible de joindre RCON sur le port {{port}}. Vérifiez que le serveur a fini de démarrer et que RCON est activé dans la page Configuration.",
  ARK_MAP_INVALID:
    "Nom de carte invalide : {{map}}. Lettres, chiffres et « _ » seulement, par exemple Svartalfheim_WP.",
  ARK_SAVE_DIR_INVALID:
    "Dossier du monde invalide : {{name}}. Lettres, chiffres et « _ » seulement, ou vide pour SavedArks.",
  ARK_MAX_PLAYERS_INVALID: "Nombre de joueurs invalide (1 à {{max}}).",
  ARK_MOD_ID_INVALID:
    "ID de mod invalide : {{id}}. C'est le nombre « Project ID » affiché sur la page du mod sur CurseForge.",
  ARK_MOD_NOT_FOUND:
    "Aucun mod ARK: Survival Ascended avec l'ID {{id}} sur CurseForge.",
  ARK_MOD_DUPLICATE: "Le mod {{id}} est déjà dans la liste.",
  ARK_SETTING_INVALID: "Valeur invalide pour {{key}} : {{value}}",
  ARK_SETTING_UNKNOWN: "Réglage inconnu : {{key}}",
  ARK_PROFILE_SERVER_RUNNING:
    "Arrêtez le serveur pour restaurer le profil d'un joueur.",
  ARK_PROFILE_NOT_FOUND: "Cette sauvegarde de profil n'existe plus.",
  ARK_MODS_SERVER_RUNNING:
    "Arrêtez le serveur pour nettoyer le dossier des mods.",
  ARK_MODS_CLEAN_FAILED:
    "Impossible de supprimer {{path}} ({{detail}}) : un fichier est peut-être ouvert par un autre programme.",
  ARK_PROFILE_READ_FAILED:
    "Impossible de lire {{path}} ({{detail}}) : vérifiez que le dossier de sauvegarde est accessible.",
  ARK_PROFILE_COPY_FAILED:
    "Impossible de copier {{path}} ({{detail}}) : vérifiez que le dossier existe et que vous avez le droit d'y écrire.",
  CURSEFORGE_FORBIDDEN:
    "CurseForge refuse la clé de cette version de Nexum pour la recherche de mods.",
  CURSEFORGE_UNAVAILABLE:
    "Cette version de Nexum n'a pas de clé CurseForge : la recherche de mods n'est pas disponible.",
  ARK_PORTS_SAME:
    "Le port de jeu et le port de requête doivent être différents (tous deux en UDP).",
  NETWORK_ERROR:
    "Impossible de joindre {{host}} ({{detail}}). Vérifiez votre connexion Internet.",
  HTTP_ERROR: "{{host}} a répondu par une erreur (HTTP {{status}}).",
  INVALID_RESPONSE: "Réponse inattendue de {{host}} (HTTP {{status}}).",
  TOO_MANY_REDIRECTS: "Trop de redirections : téléchargement annulé.",
  DOWNLOAD_TIMEOUT:
    "Le téléchargement s'est bloqué et a été annulé. Réessayez.",
  PUBLIC_IP_FAILED: "Impossible d'obtenir votre IP publique ({{detail}}).",
  STEAMCMD_FAILED:
    "Échec de SteamCMD (code {{code}}). Le journal d'installation ci-dessus indique pourquoi.",
  STEAMCMD_OLD_BUILD_DENIED:
    "SteamCMD n'a pas pu mettre à jour cette ancienne installation (code {{code}}). Installez le serveur dans un dossier vide, puis recopiez-y vos sauvegardes et votre configuration.",
  STEAMCMD_EXTRACT_FAILED: "Impossible d'extraire SteamCMD (code {{code}}).",
  FILE_NOT_FOUND: "Fichier introuvable : {{path}}",
  INVALID_FILE_NAME: "Nom de fichier invalide.",
  MOD_NOT_FOUND: "Mod {{name}} introuvable sur les registres de mods.",
  MOD_CODE_INVALID:
    "Format invalide. Attendu : Auteur-NomDuMod-Version (ex : denikson-BepInExPack_Valheim-5.4.2202).",
  MOD_FILES_IN_USE:
    "Les fichiers du mod {{name}} sont utilisés (serveur lancé ?). Arrête le serveur puis réessaie : la version installée n'a pas été modifiée.",
  BEPINEX_VERSION_UNAVAILABLE:
    "Impossible d'obtenir la version de BepInExPack_Valheim depuis Thunderstore.",
  BEPINEX_ZIP_INVALID:
    "Archive BepInEx inattendue : BepInEx/core/BepInEx.dll est absent.",
  PROFILE_NO_R2X:
    "Ce profil n'a pas de fichier export.r2x : ce n'est pas un profil r2modman/Gale.",
  PROFILE_EMPTY: "Ce profil ne contient aucun mod.",
  PROFILE_UNRESOLVED:
    "Code de profil introuvable sur Thunderstore et Hexium. Il a peut-être expiré : demandez-en un nouveau.",
  PROFILE_UNEXPECTED_RESPONSE: "Réponse inattendue du service de profils.",
  PROFILE_INVALID_CODE: "Code de profil invalide.",
  PROFILE_UNKNOWN_FORMAT: "Format de profil non reconnu.",
  MODPACK_NO_MODS: "Aucun mod actif à partager.",
  MODPACK_NO_CODE: "Thunderstore n'a pas renvoyé de code de profil. Réessayez.",
  PORT_CONFLICT: "Conflit de ports avec un serveur déjà lancé : {{list}}",
  VALHEIM_PASSWORD_IN_NAME:
    "Le mot de passe Valheim ne doit pas apparaître dans le nom du serveur.",
  VALHEIM_PASSWORD_TOO_SHORT:
    "Le mot de passe Valheim doit faire au moins 5 caractères (ou être vide).",
  DW_OWNER_ID_MISSING:
    "Renseignez votre Player ID (OwnerId) dans la page Configuration : sans lui, le serveur Dragonwilds ne démarre pas. Il s'affiche en bas du menu Paramètres du jeu.",
  DW_OWNER_ID_INVALID:
    "Player ID invalide : copiez-le tel quel depuis le menu Paramètres du jeu (lettres et chiffres uniquement).",
  CONFIG_LOCKED:
    "Arrêtez le serveur avant de modifier sa configuration : il réécrit ce fichier pendant qu'il tourne.",
  PORT_INVALID: "Port invalide (1 à 65535).",
  PORTS_SAME: "Le port de jeu et le port beacon doivent être différents.",
  STOP_BEFORE_WORLD_CHANGE: "Arrêtez le serveur avant de changer de monde.",
  WORLD_NOT_FOUND: "Monde introuvable : {{name}}",
  NOT_A_WORLD_SAVE: "Ce fichier n'est pas une sauvegarde de monde Dragonwilds.",
  BACKUP_BEFORE_UPDATE_FAILED:
    "Mise à jour annulée : la sauvegarde du monde a échoué ({{msg}}). Vérifiez le dossier de sauvegarde, ou désactivez « Sauvegarder le monde avant chaque mise à jour » dans la page Sauvegardes.",
  ODIN_EYE_NO_URL: "Renseignez d'abord l'adresse d'Odin-Eye.",
  ODIN_EYE_INVALID_URL:
    "Adresse Odin-Eye invalide « {{url}} ». Format attendu : http://127.0.0.1:21618",
  ODIN_EYE_UNREACHABLE:
    "Rien ne répond à {{url}}. Vérifiez que le serveur tourne et que son monde est chargé, que le log BepInEx contient « OdinEye running! », et que cette adresse correspond à HttpServerAddress dans BepInEx/config/org.bepinex.plugins.odineye.cfg.",
  ODIN_EYE_TIMEOUT:
    "{{url}} n'a pas répondu en 8 secondes. Vérifiez l'adresse et que rien (pare-feu, autre programme) ne bloque ce port.",
  ODIN_EYE_HTTP:
    "{{url}} a répondu par une erreur (HTTP {{status}}). Vérifiez que cette adresse est bien celle d'Odin-Eye.",
  ODIN_EYE_NO_ENDPOINT:
    "Quelque chose répond à {{url}}, mais ce n'est pas l'API joueurs d'Odin-Eye. Vérifiez le port, et que le plugin est à jour.",
  ENSHROUDED_CONFIG_INVALID:
    "enshrouded_server.json est illisible ({{detail}}) : le serveur ne démarrerait pas. Corrigez-le, ou supprimez-le pour que le serveur en recrée un au prochain démarrage (une copie .backup est gardée à côté).",
  ENSHROUDED_GROUP_INVALID:
    "Chaque groupe doit avoir un nom, et deux groupes ne peuvent pas porter le même.",
  ENSHROUDED_SLOTS_INVALID:
    "Nombre de places invalide : entre 1 et {{max}} joueurs, et les places réservées des groupes ne peuvent pas dépasser ce total.",
  TRANSFER_FILE_INVALID:
    "Ce fichier n'est pas un export Nexum valide, ou il a été modifié.",
  TRANSFER_FILE_TOO_NEW:
    "Ce fichier vient d'une version plus récente de Nexum : mettez Nexum à jour pour l'importer.",
  TRANSFER_TARGET_RUNNING:
    "Le serveur « {{name}} » utilise ces dossiers et il est lancé : arrêtez-le ou choisissez d'autres dossiers.",
  TRANSFER_WRITE_FAILED:
    "Impossible d'écrire {{path}} ({{detail}}) : vérifiez que le dossier existe et que vous avez le droit d'y écrire. Aucun serveur n'a été ajouté.",
  STOP_BEFORE_EXPORT:
    "Arrêtez le serveur avant de l'exporter : son monde ne doit pas changer pendant la copie.",
};
