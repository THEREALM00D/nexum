# Changer de PC : export / import

Doc utilisateur : `docs/moving.md`. IPC `transfer:*` (`ipc/handlers/transfer.ts`). UI : `components/transfer/` (partagé), `pages/Settings/components/TransferSection.tsx`, `pages/Servers/hooks/useServerTransfer.ts`.

## Deux fichiers, un format (`transferFormat.ts`)

- **Réglages** (`settingsTransfer.ts`) : JSON `format: "nexum-settings"`. **Serveur** (`serverArchive.ts` / `serverArchiveImport.ts`) : ZIP avec `manifest.json` (`format: "nexum-server"`), `world/`, `config/<key>`.
- `TRANSFER_VERSION` : un fichier plus récent est refusé (`TRANSFER_FILE_TOO_NEW`). Ajouter un champ lisible par une ancienne version ne demande pas de la monter ; changer le sens d'un champ, si.
- Tout est revalidé à la lecture (`parseServerEntry` : `gameType` ∈ `GAME_TYPES`, config réduite aux clés de `DEFAULT_SERVER_CONFIG` du même type). Les règles de pare-feu passent par `isValidRule` (noms exécutés en admin, voir `src/main/firewall/CLAUDE.md`).
- Import = **nouvel id** (`ServerRegistry.create`), jamais d'écrasement. L'import des réglages relit le fichier par son chemin, jamais un contenu venu du renderer.
- Mots de passe : `stripPasswords` ne vide que ceux que Nexum stocke (`valheimConfig.password`, `dragonwildsConfig.adminPassword`) ; ceux des fichiers du jeu partent tels quels dans un export de serveur (avertissement dans le dialogue).

## Export d'un serveur

- Serveur arrêté seulement (`STOP_BEFORE_EXPORT`) : pas de sauvegarde à chaud ici.
- Ce qui part est déclaré par jeu dans `src/main/games/transferFiles.ts` (`Record<GameType, …>`) : fichiers de config, filtre du dossier des mondes, mods. ⚠️ Valheim : `worlds_local` est partagé entre serveurs du même `savedir`, d'où `worldFilter` (`<monde>.*` ou dossier `<monde>/`, sans `_backup`).
- À l'import, la cible d'un fichier de `config/` est **recalculée** depuis sa `key` (jamais un chemin du ZIP), avec `.backup` d'un fichier existant. Config avant monde : le dossier des mondes d'Enshrouded se lit dans `enshrouded_server.json`.
- Monde : fichier du même nom déjà présent → non copié (`world: "skipped"`) sauf `replaceWorld`. `transfer:serverWorldConflict` le dit au dialogue avant l'import.
- Le ZIP est extrait dès l'aperçu dans `{userData}/transfer-tmp/<uuid>` (le jeton revient du renderer : regex UUID avant tout `rmSync`). Vidé à l'import, à l'annulation et au démarrage (`clearTransferTmp`, appelé par `registerTransferHandlers`).
- Mods Valheim : codes dans le manifest → `pending-mods.json` du nouveau serveur, réinstallés depuis la page Mods (`src/main/games/valheim/pendingMods.ts`), une fois le jeu installé (BepInEx s'installe dans le dossier du serveur).
