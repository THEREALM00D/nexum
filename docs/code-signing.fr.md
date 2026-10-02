# Politique de signature et confidentialité

🇬🇧 [English](code-signing.md) | 🇫🇷 Français

## Politique de signature de code

> **État :** les exécutables Windows **ne sont pas signés** pour l'instant, Windows SmartScreen peut donc afficher un avertissement. Chaque release indique l'empreinte SHA256 de ses fichiers et leurs liens d'analyse VirusTotal pour vérifier votre téléchargement. La signature de code est prévue ; cette page sera mise à jour quand elle sera en place.

Quand la signature sera activée, elle suivra ces règles :

- Seuls les exécutables compilés par le workflow GitHub Actions de ce dépôt (`.github/workflows/release.yml`), à partir de son code source, sont signés.
- Chaque release sera approuvée manuellement avant d'être signée.
- Les exécutables signés porteront le nom du produit (Nexum) et sa version dans leurs métadonnées.

### Rôles de l'équipe

| Rôle                        | Membres                                       |
| --------------------------- | --------------------------------------------- |
| Contributeurs et relecteurs | [THEREALM00D](https://github.com/THEREALM00D) |
| Approbateurs                | [THEREALM00D](https://github.com/THEREALM00D) |

Tous les comptes utilisent l'authentification à deux facteurs sur GitHub et SignPath.

## Confidentialité

Nexum n'a **ni télémétrie, ni statistiques d'usage, ni compte**. Il ne collecte et n'envoie aucune donnée personnelle.

Il se connecte uniquement aux services suivants, pour la fonctionnalité indiquée :

| Service                                                           | Quand                                                                                  | Pourquoi                                                                                                              |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| GitHub (`github.com`)                                             | Au démarrage, et quand vous cliquez sur « Vérifier les mises à jour »                  | Vérifier s'il existe une nouvelle version de Nexum. Le téléchargement et l'installation restent toujours votre choix. |
| Steam (`steamcdn-a.akamaihd.net` et serveurs Steam, via SteamCMD) | Quand vous installez ou mettez à jour SteamCMD ou un serveur de jeu                    | Télécharger SteamCMD et les fichiers du serveur dédié.                                                                |
| Thunderstore (`thunderstore.io`) et Hexium (`hexium.gg`)          | Quand vous ouvrez la page Mods Valheim, parcourez, installez ou mettez à jour des mods | Lister, télécharger et vérifier les mods, et afficher leurs icônes.                                                   |

Les connexions vers `127.0.0.1` (l'API REST de Palworld, le plugin Odin-Eye) restent sur votre ordinateur.

Les serveurs de jeu lancés par Nexum sont des programmes distincts : leur propre trafic réseau relève de l'éditeur de chaque jeu.
