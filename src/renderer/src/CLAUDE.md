# Renderer (React + MUI)

Règles générales et architecture : `CLAUDE.md` racine. Ce fichier = conventions d'UI.

## Base

- **MUI uniquement** (pas de Tailwind, pas de CSS custom sauf `index.css` minimal). Questions MUI : voir `.claude/CLAUDE.md` (serveur MCP MUI).
- **Jamais d'import depuis `src/main/`** : passer par `window.api` (IPC), types dans `@shared/types`.
- **Pages = affichage, composants et hooks = logique.** Fichiers < 200 lignes : au-delà, extraire hooks / components / data.
- Composants partagés entre jeux : `components/common/`, `server/`, `config/`, `backup/`, `schedule/`, `firewall/`, `players/`. **Ne jamais importer depuis `games/<autre-jeu>/`** : extraire le composant dans `components/`.
- `App.tsx`, `Sidebar`, `i18n/index.ts` ne contiennent aucun nom de jeu : ils lisent `GAMES` (`games/registry.ts`).

## Thème (`theme.ts`)

- Palette alignée sur le logo (constantes `NEXUM` + `darkTheme`) : Ink `#0E1116` (fond), Graphite `#161B22` (surfaces), Steel `#8B95A5` (texte secondaire), Paper `#E6EAF0` (texte), Signal `#22C55E` (`primary` **et** `success`), Signal profond `#16A34A`, Alerte `#F2A33A` (`warning`), Critique `#E5484D` (`error`), bordures `#252B35`. Boutons pleins : texte Ink (`contrastText`). Texte rouge sur une surface : `error.light` (`error.main` n'y atteint que 4,4:1).
- **Jamais de hex en dur** dans un composant : `"background.paper"`, `"text.secondary"`… ou `NEXUM.*`. (Seule exception : `backgroundColor` de la `BrowserWindow` dans le main.)
- Polices embarquées (`@fontsource/ibm-plex-sans` / `-mono`, imports dans `main.tsx` ; pas de Google Fonts : app hors-ligne + CSP `font-src 'self'`). `fontFamily: FONT_MONO` / `FONT_SANS`, jamais `"monospace"`. Logo : `assets/logo.svg` (symbole seul, pour fond sombre), ne pas le recolorer ni le déformer ; sous 24 px, l'icône plutôt que le logo horizontal. Typo de marque : Archivo Expanded 700 (logo, titres). Sources SVG hors repo. README : `docs/images/nexum-logo-{dark,light}-bg-1200.png` dans un `<picture>` qui suit le thème GitHub ; `docs/images/nexum-social-preview-1280x640.png` = aperçu social du repo.
- **Échelle de texte dans `theme.ts`** : `display`, `h1` (Archivo Expanded, `FONT_DISPLAY` + `fontStretch: 125%`, paquet `@fontsource-variable/archivo/wdth.css`), `stat`, `body1` (14), `body2` (13), `caption` (12), `overline` (titres de carte), `micro` (11, mini-chips et petits boutons), `code` (mono 13). Pas de `fontSize` de texte dans un composant : `variant` ou `sx={{ typography: "…" }}`, placé **avant** un `fontFamily` qui le complète (`LogLines`). `fontSize` reste permis sur une icône (dimension). ⚠️ `body1` et `body2` servent aussi de défaut aux composants MUI (champs, menus, `TableCell`, `Alert`) : les changer modifie toute l'app.
- **En-têtes et titres** : `components/common/PageHeader` pour toute page (le seul `h1`), `SectionTitle` pour tout titre de carte (`component="span"` dans un `AccordionSummary`, qui est un bouton). Page affichée dans une autre : `embedded`, sinon deux `h1` (`<Logs embedded />`).
- **Identité d'un serveur** : `components/common/ServerTile` (tuile carrée + initiale). Le rond est réservé au statut, ne pas y afficher la couleur d'un serveur. Palette : `SERVER_COLORS` (`src/shared/serverColors.ts`), sans vert, orange ni rouge.
- **Clavier et noms accessibles** : tout élément cliquable est un vrai bouton, jamais un `Box` avec `onClick` ; `ButtonBase` nu → `FOCUS_RING_SX`, sinon le focus clavier ne se voit pas. Un `Tooltip` au texte simple nomme son enfant direct. ⚠️ Avec `Tooltip` > `<span>` > `IconButton` (bouton désactivable), le nom va sur le `span` : `aria-label` obligatoire sur l'`IconButton`. Sans `Tooltip`, `aria-label` aussi.
- `components/Sidebar/DiscordButton.tsx` : logo SVG Simple Icons (absent de `@mui/icons-material`), icône seule Sidebar repliée ; invitation à garder synchronisée (voir `.github/CLAUDE.md`).

## i18n

- Chaque page a son `__i18n__/{fr,en}.ts`, regroupés dans le manifest `games/<jeu>/index.ts` (ou importés par les manifests pour un composant partagé : `components/server/__i18n__`, `components/players/`, `components/config/__i18n__`). **Ne pas les importer dans `i18n/index.ts`.**
- ⚠️ Fusion à **un seul niveau** : une clé de 1er niveau présente dans deux fichiers écrase l'autre en entier. Préfixer par le jeu (`valheimConfig`, `enshroudedDashboard`…) ; textes d'un composant partagé → clé propre (`configPage`).
- Toute string visible passe par `t()` (FR **et** EN). Interpolation `t("key", { name })` + `"{{name}}"`. Les `value` des `<Select>` restent les valeurs brutes du fichier de config, seuls les labels sont traduits.
- Langue : FR par défaut, détection navigateur, choix dans `localStorage.locale`, envoyée au main par `app:setLanguage` à chaque `languageChanged`.

## Notifications et erreurs

- `useNotification().notify()` avec `t()`, jamais `alert()` ni état d'erreur local. `notify()` accepte une `action` (bouton + croix, 15 s).
- **Toute erreur affichée** : `errorMessage(t, e, fallback?)` dans un `catch`, ou `appErrorMessage(t, res.error)` pour un champ `error` (`utils/appErrorMessage.ts`, textes sous `appErrors` dans `i18n/__i18n__`). Jamais `notify((e as Error).message)` : un texte non codé garde le préfixe « Error invoking remote method… » d'Electron. Les codes viennent du main (`AppError`, voir `CLAUDE.md` racine).
- Notifications envoyées par le main pour un serveur : un seul hook, `hooks/useServerNotices` (MàJ du jeu → Installation, mods → Mods, abandon de relance → Logs).

## États de chargement : skeletons (`components/common/LoadingSkeleton.tsx`)

Jamais de texte « Chargement... » ni de valeurs par défaut affichées avant les vraies (interrupteur qui passe de OFF à ON).

- `<LoadingSkeleton loading>` enveloppe l'élément **final** (rendu mais `visibility: hidden`, le `Skeleton` prend sa taille → aucun décalage). `fullWidth` pour un élément étiré, `sx` pour reporter `width`/`maxWidth` (la prop `width` du Skeleton est inline et écraserait `sx`). `Chip` dans une rangée : `sx={{ display: "flex" }}`. Un enfant qui ne rend rien ne crée pas de bloc vide (`&:empty`).
- `<SkeletonChildren loading>` : chaque enfant d'une colonne `Stack` (cartes de formulaire).
- `skeletonRows(<VraieLigne data={PLACEHOLDER} />, n)` : lignes construites avec le **vrai** composant et des données réalistes (d'où les extractions `BackupRow`, `BrowseModCard`, `ModVersionsDialog`, `ConfigFileRow`) (renvoie un tableau : les `divider` d'une `Stack` tombent entre les lignes). `skeletonTableRows(colonnes, n)` pour un tableau.
- Le hook expose `loading` (vrai au départ, `finally(() => setLoading(false))`, 1er chargement seulement), jamais déduit d'une valeur `null` (qui reste `null` en cas d'erreur).
- Réserver la place du cas courant pendant une vérification (avertissement « pas admin », « SteamCMD installé »…).
- Démarrage : `ServerContext.state.loaded` (serveurs, serveur actif **et** statuts lus) ; tant qu'il est faux : `PageSkeleton`, entrées de Sidebar, sélecteur et statut en skeleton.
- Vérifier : forcer temporairement `LoadingSkeleton` (drapeau `window.__forceSkeleton`, à retirer) et comparer par CDP positions et tailles chargé / skeleton. `window.api` est figé par `contextBridge` : impossible de le ralentir.
- Les spinners restent pour les **actions** (installer, restaurer…), pas pour lire des données.

## Mise en page (écrans de portable)

- Contenu centré et borné à `CONTENT_MAX_WIDTH` (1280 px, wrapper d'`App.tsx`), sauf `FULL_WIDTH_PAGES` (Logs). Pages à formulaire → `components/common/FormPage` (720 px par défaut, prop `width`), jamais un `Stack` avec `maxWidth` collé à gauche.
- **Marge basse** : pas de padding bas sur `<main>`, mais un `::after` de 24 px (16 en compact) en fin de racine de page. ⚠️ Ne pas le remplacer par `minHeight: min-content` (les `ScrollPanel` s'étirent sur toute leur longueur).
- `COMPACT_MEDIA` (≤ 820 px de haut ou ≤ 1100 px de large) réduit la marge (24 → 16 px). `NARROW_WINDOW_QUERY` replie la Sidebar (`components/Sidebar/useSidebarCollapsed.ts` ; seul un choix fait fenêtre large est mémorisé, `localStorage` `sidebar.collapsed`). `SHORT_WINDOW_QUERY` retire la langue de la Sidebar, seule la liste des pages du jeu défile.
- Pas de rangée flex sans `flexWrap` (barres d'outils, `ServerControls`, `JoinServerCard`, panneaux du Dashboard Palworld en `flex: "1 1 360px"`) (`Stack` + `useFlexGap`, sinon `spacing` décale la 2e ligne). Pas de hauteur fixe en px pour une zone qui défile (`clamp(220px, 40vh, 400px)`). Tableaux dans un `TableContainer`, colonne de chemin tronquée + `Tooltip`. Bloc d'info long et répétitif → masquable et mémorisé.
- `StatsGrid` : 3 colonnes, 6 à partir de `xl` avec une valeur plus petite et `nowrap`.
- Tester une taille sans la changer : CDP `Emulation.setDeviceMetricsOverride` (skill `/test-app`).

## Listes longues : `components/common/ScrollPanel`

La liste a sa propre barre de défilement, l'en-tête (recherche, tri, onglets) reste en place. La page est une colonne de hauteur contrainte (`<Stack spacing={3} sx={{ height: "100%" }}>`, grâce au wrapper `height: 100%` d'`App.tsx`). `minHeight` = hauteur minimale de la zone qui défile. ⚠️ Pas de `flex: 1` (base 0 %) ni `overflow: hidden` sur le panneau : il ne défilerait plus. Options : `grow={false}` (liste courte), `padding={0}` + `<Table stickyHeader>`, `paper={false}` (cartes), `resetKey` (retour en haut au changement de tri / onglet). Dans un dialogue, la recherche se place hors du `DialogContent`.
