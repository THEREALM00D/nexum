# Page de config partagée

- `ConfigPage` (Palworld, Astroneer, Dragonwilds) : groupes de champs data-driven (`FIELD_GROUPS` du jeu), recherche, presets (`onFieldChange`). Options : `lockWhileRunning` (alerte + Enregistrer désactivé tant que le serveur n'est ni `stopped` ni `crashed`, relecture du fichier à l'arrêt si rien n'est en cours de saisie), `notice` (bloc d'info du jeu).
- `FieldDef.required` : astérisque + erreur si vide ; `min` / `max` / `step` : bornes d'un champ nombre (flèches, saisie non bloquée).
- `useConfigLoad<T>` générique (verrou + relecture à l'arrêt). Enshrouded n'utilise que `ConfigGroup` / `ConfigField` / `useConfigLoad` (page structurée comme Valheim).
- Textes : clés `config.*` (dans les fichiers i18n de Palworld, historique) et `configPage.*` (`components/config/__i18n__`, importé par les manifests d'Astroneer et Dragonwilds). Ne pas créer de clé de 1er niveau `config` ailleurs (la fusion i18n écraserait celle de Palworld).
