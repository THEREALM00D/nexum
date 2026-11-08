# Astroneer

> **Sans RCON** (choix produit) : Astroneer expose un RCON (TCP, `ConsolePort`, défaut 1234) mais Nexum ne l'implémente pas. Arrêt toujours en `taskkill`. `ConsolePort`/`ConsolePassword` sont éditables (page Config) mais **sans usage** et **sans règle de pare-feu** : ne jamais exposer ce port publiquement (avertissement officiel).

- **2 fichiers INI standards**, fusionnés en un objet `AstroneerSettings` (`AstroConfigParser.ts`, `read`/`write` avec `.backup`, écriture via `patchIniSection`) :
  - `{serverPath}/Astro/Saved/Config/WindowsServer/Engine.ini` → `[URL]`, `Port` (défaut 8777)
  - `{serverPath}/Astro/Saved/Config/WindowsServer/AstroServerSettings.ini` → `[/Script/Astro.AstroServerSettings]`, ~17 clés (`ServerName`, `MaxPlayerCount`, `OwnerName`, `ConsolePort`…)
- ⚠️ Astroneer ne garde pas les changements faits serveur lancé : `ConfigPage` avec `lockWhileRunning`.
- UI data-driven : `games/astroneer/pages/Config/fields.ts` + `components/config/ConfigPage` (pas de presets). IPC `astroconfig:read` / `astroconfig:write`.
- Lancement : `astroneerConfig: { customArgs }` (`AstroneerLaunchConfig`) (quasi aucun argument CLI, tout est dans les INI).
- Sauvegardes : `{serverPath}/Astro/Saved/SaveGames/`. Pas de page Mods ni Joueurs.
