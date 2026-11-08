---
name: test-app
description: Lance Nexum sur un dossier de données isolé (dev ou build packagé) pour tester un changement sans toucher aux vrais serveurs de l'app installée, et le pilote par CDP (captures, taille de fenêtre, état de la page). Utiliser dès qu'il faut lancer, démarrer, tester, vérifier visuellement ou faire une capture de Nexum, y compris le premier lancement, l'assistant, un build packagé ou la CSP.
argument-hint: [dev|packaged] [ce qu'il faut vérifier]
---

# Lancer Nexum isolé

Demande : $ARGUMENTS

⚠️ **Règle absolue** : sans `NEXUM_USER_DATA_DIR`, `yarn dev` et `electron.exe` ouvrent `%APPDATA%\server-forge`, les **vraies** données de l'app installée (ses serveurs, leur config, leurs logs). Ne jamais lancer Nexum sans cette variable, et ne jamais lancer `dist/win-unpacked/nexum.exe` (vraies données + démarrage auto des serveurs).

## 1. Choisir le mode

- **dev** (par défaut) : changement de code en cours, hot reload.
- **packaged** : CSP, icône, chemins `process.resourcesPath`, `node_modules` collectés par electron-builder, tout ce qui ne se voit qu'en build. `isPackaged` reste faux (pas de démarrage auto ni de verrou d'instance).

## 2. Préparer le dossier de données

Dossier dans le scratchpad, **neuf** pour tester le premier lancement (l'assistant s'ouvre quand la liste des serveurs est vide), réutilisé sinon. Pour un vrai serveur de jeu, l'installer dans un dossier de test séparé (page Installation ou SteamCMD), jamais dans le dossier d'un serveur de l'utilisateur.

Avant de lancer, vérifier que `ELECTRON_RUN_AS_NODE` n'est pas défini (le terminal de VS Code le transmet : Electron démarrerait comme un simple Node).

## 3. Lancer (en arrière-plan, Git Bash)

Choisir un port CDP libre (ex. 9333). Un serveur Dragonwilds lancé par une session précédente peut garder le port d'avant : en changer.

**dev** :

```bash
env -u ELECTRON_RUN_AS_NODE NEXUM_USER_DATA_DIR="<dossier>" yarn dev --remoteDebuggingPort 9333
```

**packaged** (après `yarn electron-vite build && yarn electron-builder --win --dir --publish never`, ou un `dist/win-unpacked` récent) :

```bash
env -u ELECTRON_RUN_AS_NODE NEXUM_USER_DATA_DIR="<dossier>" node_modules/electron/dist/electron.exe dist/win-unpacked/resources/app.asar --remote-debugging-port=9333
```

Options de dev utiles (à ne jamais laisser dans le code) : `NEXUM_DEV_AUTOSTART=1` (tester le démarrage auto), `NEXUM_DEV_ADOPT=1` (adoption sur le dossier partagé : à éviter), `NEXUM_DEV_INSTALL_DIR=<dossier>` (avertissement « dossier d'installation »).

## 4. Piloter et vérifier

- Cible CDP : `http://127.0.0.1:9333/json` → `webSocketDebuggerUrl` de la page `index.html`. Un petit script Node (`ws` ou `fetch` + WebSocket natif de Node 22) dans le scratchpad suffit : `Runtime.evaluate` pour lire le DOM, `Page.captureScreenshot` pour une capture.
- **Taille d'écran de portable** sans toucher à la fenêtre : `Emulation.setDeviceMetricsOverride` (ex. 1366×768, 1920×1080 à 125-150 %).
- **Skeletons** : forcer temporairement `window.__forceSkeleton` (lu dans `LoadingSkeleton`, à retirer avant le commit) et comparer positions et tailles chargé / skeleton. `window.api` est figé par `contextBridge` : impossible de le ralentir.
- **Boîte « Quitter Nexum »** : `window.close()` par CDP puis `WScript.Shell.AppActivate("Quitter Nexum")` + `SendKeys("{ENTER}")` / `{ESC}`.
- Logs du main : sortie du processus lancé en arrière-plan. Fichiers de session : `<dossier>/servers/<id>/logs/`.
- Montrer à l'utilisateur les captures qui prouvent le résultat (avant / après si c'est un correctif visuel).

## 5. Nettoyer

- Arrêter les serveurs de jeu lancés pendant le test, puis Nexum (fermer la fenêtre ou tuer **le PID lancé**, jamais tous les `electron.exe` : l'utilisateur peut en avoir d'autres).
- Retirer tout code temporaire (`__forceSkeleton`, `forceDevUpdateConfig`, `dev-app-update.yml`, version baissée dans `package.json`).
- Garder le dossier de données si l'utilisateur veut refaire le test, sinon le laisser dans le scratchpad.

Rapporter ce qui a été vérifié et ce qui ne l'a pas été (ex. « pas testé avec un vrai joueur »).
