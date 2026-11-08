# Page Mods Valheim (UI)

Registres, installation, mises à jour, partage et import : `src/main/games/valheim/CLAUDE.md`.

- **Rappel côté joueurs** (`ClientModsHint`, sous le bandeau BepInEx) : Nexum n'installe que sur le serveur, la plupart des mods doivent aussi être chez chaque joueur. Masquable et mémorisé (lien d'une ligne pour le rouvrir).
- **Pastille de provenance** `RegistryChip` : `NEXUM.thunderstore` (bleu), `NEXUM.hexium` (violet), gris pour « Manuel ». Hors des couleurs de statut (vert/orange/rouge déjà pris). `DeprecatedChip` partagé (Installés + Parcourir), tooltip qui cite le registre alternatif quand une MàJ `sourceChanged` existe.
- **Dates** : Parcourir affiche `updated_timestamp` (déjà dans la liste, aucun appel en plus) via `ModUpdatedDate`, orange au-delà d'**un an** (`STALE_AFTER_MS`), volontairement pas comparé au dernier patch de Valheim (appel Steam en plus, tout passerait en alerte). Installés : `publishedAt` = date de la **version installée**, libellé « Version publiée sur {registre} ».
- **Installés** : `InstalledModsList` (recherche nom/auteur, même normalisation que Parcourir : sans espaces/tirets/soulignés, tous les mots requis + compteur) → `InstalledModRow`. Tri `InstalledSortSelect` (`utils/sortInstalledMods.ts`) : nom (défaut), MàJ puis dépréciés d'abord, installés récemment (`installedAt`), version publiée récemment (`publishedAt`), auteur ; le nom départage, mods manuels en bas. Choix dans `localStorage` (`valheimMods.installedSort`, try/catch).
- **Parcourir** : `ToggleButtonGroup` Thunderstore/Hexium (`ModBrowser.tsx`), deux listes indépendantes. Même sélecteur dans le dialogue « coller un code » (`Mods.tsx`) : `Auteur-Nom-Version` est ambigu entre les deux.
- **Mettre à jour / Tout mettre à jour** : `hooks/useBackupBeforeUpdate` (une sauvegarde pour la série, voir `src/main/backup/CLAUDE.md`).
- `ShareModpackButton` : partage du modpack.

## Onglet Configs

- `ConfigFilesList` (un champ : nom de fichier **ou** paramètres de tous les fichiers, issue #148) → `ConfigFileEditorDialog` (recherche + `CfgStructuredEditor`, filtre section/clé/description avec `useDeferredValue`).
- Perf (Valheim Plus = centaines de paramètres) : sections en accordéons (`CfgSection`, `unmountOnExit` ; une recherche n'ouvre les sections que sous 40 résultats), lignes `CfgEntryRow` en `React.memo` : `updateEntry` ne remplace que l'objet modifié et `onChange` reste stable.
- **Recherche dans tous les fichiers** : `useConfigFilesSearch` + `useConfigSearchIndex` (renderer seul : `readConfigFile` + `parseCfg` en parallèle). Rien n'est lu avant la 1re recherche non vide ; cache nom + `mtime`. Même règle que l'éditeur (`cfgEntryMatches`, `utils/cfgSearch.ts` : section / clé / description, **pas la valeur**). Pendant la 1re lecture : fichiers trouvés par leur nom + lignes en skeleton. Clic → `openFile(nom, recherche)` → `initialSearch` **seulement si des paramètres correspondent**.
- `ConfigFileRow` : 3 paramètres trouvés max (`Section › Clé`) puis « +N » ; son bouton Éditer n'a pas d'`onClick` (le clic remonte à la ligne).
- ⚠️ Pas de `content-visibility: auto` sur les lignes (rogne le label flottant des Select) ni d'`InputLabel` sur les Select (la clé est déjà affichée).
