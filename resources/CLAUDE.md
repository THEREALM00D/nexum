# `resources/` : icône et installeur NSIS

- `resources/` est le dossier `buildResources` d'electron-builder : **jamais embarqué** dans l'app (ni `?asset` ni `asarUnpack` n'y changent rien). L'icône de la zone de notification est copiée via `extraResources` (`electron-builder.yml`) et lue à `process.resourcesPath/icon.ico` ; en dev, `?asset`. `icon.ico` = 16 → 256 px.
- **Contenu de `app.asar`** : liste blanche `files` dans `electron-builder.yml` (`out/**`, `package.json`, `LICENSE` ; les `node_modules` de production sont ajoutés par electron-builder). Ne jamais revenir à une liste d'exclusions : tout le reste du repo partait dans l'app (`docs/` et ses images, `.claude/`, `CLAUDE.md`, fichiers non suivis d'un build local). Un fichier lu à l'exécution hors de `out/` doit être ajouté à la liste. Vérifier : `@electron/asar` → `listPackage` sur `dist/win-unpacked/resources/app.asar`.
- Installeur NSIS assisté (`oneClick: false`, `allowToChangeInstallationDirectory: true`), nécessaire pour l'auto-update avec un dossier choisi. Il ajoute `\Nexum` au dossier choisi s'il ne contient pas déjà « Nexum ».

## Désinstalleur = liste blanche (`installer.nsh`, macro `customRemoveFiles`)

Le désinstalleur par défaut fait `RMDir /r $INSTDIR` et tourne **à chaque mise à jour** (l'installeur lance celui de l'ancienne version) : jusqu'à la 0.12.3, une mise à jour effaçait tout ce que l'utilisateur avait rangé dans le dossier d'installation (ex. un `savedir` Valheim).

- La macro ne retire que les fichiers de Nexum (contenu de `dist/win-unpacked` + désinstalleur), garde le comportement d'origine en mise à jour (déplacement dans `$PLUGINSDIR\old-install`, tout est remis en place et l'opération abandonnée si un fichier est occupé) et ne supprime le dossier que s'il est vide.
- ⚠️ **Un dossier ne se renomme jamais d'un bloc** vers `$PLUGINSDIR` : il est dans `%TEMP%` (C:) et Windows refuse de déplacer un dossier vers un autre lecteur (l'échec passait pour un fichier occupé et l'installeur bouclait sur « Nexum cannot be closed »). Les dossiers (`resources`, `locales`) passent par `un.atomicRMDir` (fichier par fichier), puis leurs coquilles vides sont supprimées.
- **Côté installeur** (`customInit` / `customInstall`), pour les installs qui ont encore un ancien désinstalleur cassé : si `InstallLocation` (registre) n'est pas sur le lecteur de `%TEMP%`, `TEMP`/`TMP` pointent vers `<install>.update-tmp` (même lecteur) le temps de l'ancien désinstalleur, puis sont remis en place et le dossier supprimé.
- Limite : passer d'une version ≤ 0.12.3 à une version corrigée lance encore l'**ancien** désinstalleur, donc un dernier effacement.

### À revoir à chaque bump majeur

- **Electron** : comparer la liste de la macro avec `dist/win-unpacked` (un fichier oublié reste sur le disque, et le dossier avec lui). Electron 45 : `electron_wer.dll` ajouté ; `libEGL.dll`, `libGLESv2.dll`, `dxil.dll` disparus (gardés, sans effet).
- **electron-builder** : la macro remplace une partie de `templates/nsis/uninstaller.nsh`, comparer ce fichier (v26 : `SetOutPath $TEMP` avant de supprimer `$INSTDIR`, sinon le répertoire courant d'`un.onInit` bloque le `RMDir`).

### Tester

Mini-désinstalleur compilé par le `makensis` du cache d'electron-builder (`%LOCALAPPDATA%\electron-builder\Cache\nsis`, `-WX`) sur un faux dossier d'installation placé sur **un autre lecteur que `%TEMP%`** : mise à jour, fichier verrouillé, désinstallation avec et sans fichiers de l'utilisateur. ⚠️ Le lancer depuis PowerShell (`Start-Process … -ArgumentList '/S','--updated','_?=<dossier>'`), pas depuis Git Bash : ses conversions d'arguments visent un autre dossier, code de sortie 0 et rien de supprimé.

## Avertissement dans l'app

`installDirConflict(path)` (`src/main/utils/installDir.ts`, IPC `app:installDirConflict`) renvoie le dossier d'installation si un chemin est dedans (null en dev et en portable ; `NEXUM_DEV_INSTALL_DIR` pour tester). Composant `components/common/InstallDirWarning` sous **chaque** champ de dossier choisi par l'utilisateur (`ServerDialog`, `StepGame`, `InstallFolderCard`, `WorldSection` de Valheim, `BackupConfig`).
