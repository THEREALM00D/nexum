# ARK: Survival Ascended (renderer)

Faits sur le jeu (fichiers, ports, arrêt, RCON, pièges vérifiés sur une vraie install) : `src/main/games/ark/CLAUDE.md`. Conventions d'UI : `src/renderer/src/CLAUDE.md`.

- **Page Mods** (`pages/Mods/`) : chaque action enregistre tout de suite (`useArkMods`, IPC `ark:mods:*` avec `serverId`) puis relit l'état, aussi à chaque changement de statut (le serveur réécrit `library.json` au démarrage). Pas de verrou serveur lancé : avertissement « au prochain démarrage ». Ajout par ID seulement (l'URL CurseForge d'un mod ne contient pas son ID). Mods téléchargés mais hors liste (`downloadedNotListed`) : ajout un par un, jamais en masse, car un mod retiré y revient (voir `src/main/games/ark/CLAUDE.md`).
