# Pages globales (hors jeu)

`GLOBAL_PAGES` (`App.tsx`) : pages indépendantes du jeu et du serveur actif, toujours affichées, groupe du bas de la Sidebar (après un séparateur), pas de remount au changement de serveur. Toute nouvelle page globale doit y être ajoutée. Entrée de menu : `components/Sidebar/SidebarNavItem.tsx`.

## Assistant de démarrage (`Setup/`)

- Page `"setup"` (hors Sidebar et hors `GLOBAL_PAGES`) : ouverte par `AppShell` quand `refreshServers()` renvoie une liste vide au lancement (décidé en `useLayoutEffect` sur `loaded`), ou via **Serveurs → Assistant de démarrage** (`onOpenSetup`).
- `StepGame` (jeu via `GAMES`, nouveau / existant, nom, dossier ; `useExeDetection` + `ExeStatusHint` + `detectGameType` repris de Serveurs ; dossiers par défaut `DEFAULT_INSTALL_PATHS` de `useInstall`) **crée le serveur** (`servers.create`, `importValheimWorld` partagé avec `useServers`) et le rend actif. Les étapes suivantes **affichent les pages existantes** sans les dupliquer : `Install` (nouveau serveur seulement), `plugin.pages.config`, `plugin.pages.network`, puis `StepStart` (`ServerControls` sans `onViewLogs`, pour ne pas quitter l'assistant, + `JoinServerCard`). Clé = `activeServerId`. Pas de retour vers l'étape 1 une fois le serveur créé ; « Passer » ferme à tout moment.
- Tester le premier lancement : skill `/test-app` (dossier de données vide).

## Paramètres (`Settings/`)

Démarrage (`LaunchAtLoginSwitch`, `CloseToTraySwitch`), Langue (`components/common/LanguageToggle`, seul endroit où la changer), Mises à jour (`UpdateIndicator`, `BetaUpdatesSwitch`), Aide et à propos (Discord, docs, bug, confidentialité). Règle : réglage **de l'app** → Paramètres ; réglage **d'un serveur** → `ServerDialog` ou les pages du jeu.

## Serveurs (`Servers/`)

`ServerDialog` : création, import d'un dossier existant (voir `src/main/servers/CLAUDE.md`), cases `autoStart` / `autoRestart` (`components/common/CheckboxField`). `ServersTable` : `TableContainer`, chemin tronqué avec `Tooltip`. `ServerRow` : le clic sur la ligne active le serveur ; le nom est un `ButtonBase` sans `onClick` pour l'accès clavier (son clic remonte à la ligne). ⚠️ La cellule d'actions arrête la propagation, sinon chaque action activerait aussi le serveur, y compris depuis le `Menu` : un portail React remonte ses clics à ses parents. Supprimer reste dans le menu « ⋯ », loin d'Arrêter. Libellés des jeux : `servers.games.<jeu>` dans `Servers/__i18n__`.

## Installation (`Install/`)

Installation et mise à jour SteamCMD pour tous les jeux (`services/steamService.ts`), `GameRequirementsHint` (nouvelle install), section « Arguments de lancement » pour Palworld seulement.
