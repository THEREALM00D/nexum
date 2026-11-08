# Palworld

## REST API (`PalworldApiClient.ts`)

> Ces API ne sont pas conçues pour être exposées sur Internet : le client force `hostname: '127.0.0.1'`, **ne pas changer ça**.

- Port `RESTAPIPort` (défaut 8212), auth HTTP Basic `admin:{AdminPassword}` (depuis `PalWorldSettings.ini`), timeout 8 s.
- ⚠️ Un POST **sans `Content-Length`** répond 411 : le client en envoie toujours un.

| Endpoint           | Méthode | Rôle                                |
| ------------------ | ------- | ----------------------------------- |
| `/v1/api/info`     | GET     | `PalServerInfo`                     |
| `/v1/api/players`  | GET     | `{ players: PalPlayer[] }`          |
| `/v1/api/metrics`  | GET     | `PalMetrics`                        |
| `/v1/api/settings` | GET     | `Record<string, unknown>`           |
| `/v1/api/announce` | POST    | `{ message }`                       |
| `/v1/api/save`     | POST    | sauvegarde (synchrone, ~70 ms)      |
| `/v1/api/shutdown` | POST    | `{ waittime, message? }` (gracieux) |
| `/v1/api/stop`     | POST    | arrêt immédiat                      |
| `/v1/api/kick`     | POST    | `{ userid, message? }`              |
| `/v1/api/ban`      | POST    | `{ userid, message? }`              |
| `/v1/api/unban`    | POST    | `{ userid }`                        |

Sans API REST activée : arrêt et redémarrage planifié en `taskkill` sans sauvegarde, sauvegarde non forcée avant un backup, pas de suivi des joueurs.

## Config INI (`PalConfigParser.ts`)

- `{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`, section `[/Script/Pal.PalGameWorldSettings]`, format `OptionSettings=(key1=val1,key2=val2,...)` sur une ligne.
- 170+ paramètres avec valeurs par défaut dans le parser. Types : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`.
- UI : `games/palworld/pages/Config/fields.ts` (clés + types), `presets.ts` (difficulté), labels dans `Config/__i18n__`. Les `value` des `<Select>` (`Casual`, `ItemAndEquipment`…) restent les valeurs INI brutes, seuls les labels sont traduits.

## Lancement (`serverConfig.ts`)

`launchArgs: { publicLobby, performanceFlags, customArgs }` (`LaunchArgsConfig`). `-publiclobby` active le lobby EOS (crossplay Xbox). Seul jeu avec la section « Arguments de lancement » de la page Installation.

Sauvegardes : `{serverPath}/Pal/Saved/SaveGames/`.
