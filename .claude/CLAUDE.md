# Règles de travail

Doc technique : `CLAUDE.md` racine et les `CLAUDE.md` de chaque dossier. Ce fichier = comment on travaille. Les skills (`/issue`, `/nexum`, `/test-app`, `/new-game`, `/revue`) et l'agent `nexum-reviewer` appliquent ces règles sans les répéter.

## Langue

- Avec l'utilisateur : **français** (réponses, explications, questions).
- Code : commentaires en **français**, UI en FR **et** EN via `t()`.
- Tout ce qui est public : **anglais** (commits, PR, issues, commentaires GitHub).

## Tâches : une issue pour tout travail, sans exception

- Les tâches vivent dans les issues GitHub et le [Project](https://github.com/users/THEREALM00D/projects/4) (Ideas, To do, In dev, To test, Done). Script : `node .claude/scripts/project-status.mjs <N> "<colonne>"` (`gh` doit avoir le droit `project` : `gh auth refresh -s project`).
- Avant de créer une branche (au plus tard avant la PR) : une issue existe, sinon la créer (`/issue`, colonne « In dev » si le travail démarre). Vaut aussi pour une demande faite en conversation, une PR de doc ou d'outillage.
- Branche `<type>/<N>-<slug>` depuis `origin/main`. Carte « In dev » au début, « To test » à l'ouverture de la PR ; `Closes #N` la ferme à la fusion (le Project la passe en Done).
- Deux sujets distincts = deux issues et deux PR. Un sujet découvert en route → sa propre issue.
- `BACKLOG.md` : notes personnelles locales, ignorées par git. Ne jamais le mentionner publiquement.

## Commits et PR

- Commits en anglais, Conventional Commits, impératif, concis. **Aucune ligne d'attribution** (désactivée dans `.claude/settings.json`).
- **Titre de PR en Conventional Commits** (vérifié par `pr-title.yml`) : il devient le commit squash sur `main` et décide de la version. `feat` → mineur, `fix` → patch (**changement visible dans l'app seulement**), `chore` / `docs` / `ci` / `refactor` → pas de release. Outillage, CI, doc ou CLAUDE.md : jamais `fix:` ni `feat:`.
- Description en anglais, ligne **`Closes #N`** obligatoire (vérifiée par `pr-issue.yml`), sections Summary (quoi et pourquoi) + Test plan (`.github/pull_request_template.md`).
- Demander avant de pousser ou d'ouvrir une PR. Ne jamais bumper `version` dans `package.json` ni créer de tag (`.github/CLAUDE.md`).

## Règles de développement

- Pages = affichage, composants et hooks = logique. Fichiers < 200 lignes.
- Pas de duplication : chercher le composant, hook ou helper existant avant d'en écrire un ; extraire un composant réutilisable plutôt que copier.
- Avant d'ajouter un comportement à un domaine, lire son `CLAUDE.md` (tableau « Où est la doc » du `CLAUDE.md` racine).
- Questions MUI : serveur MCP MUI s'il est configuré (`claude mcp add mui-mcp -- npx -y @mui/mcp@latest`) : `useMuiDocs` pour le paquet concerné, puis `fetchDocs` uniquement sur les URL renvoyées, jusqu'à avoir tout ce qu'il faut. Sinon, la doc de mui.com.
- Pour un jeu ou une API externe : la doc officielle ci-dessous, puis vérifier sur un vrai serveur. Les guides officiels se trompent souvent (écarts notés dans le `CLAUDE.md` du jeu).
- Lancer l'app pour tester : toujours `/test-app` (jamais sur les données de l'app installée).

## Doc à mettre à jour dans la même PR, sans attendre qu'on le demande

- **Doc utilisateur** `docs/*.md` + `docs/*.fr.md` : mêmes changements des deux côtés. Feature visible sans page de doc → créer la page + son lien dans la section « Documentation » des deux README. `README.md` / `README.fr.md` si le démarrage rapide, la liste des pages ou la stack changent. Retirer ce qui devient faux.
- **Confidentialité** : tout nouvel appel réseau de l'app → `docs/code-signing.md` + `.fr.md`.
- **CLAUDE.md** : ce qu'un dev ne devinerait pas, dans le fichier du domaine, selon « Écrire dans les CLAUDE.md » du `CLAUDE.md` racine.

## Tout ce qui est public

Fichiers suivis, commits, PR, issues décrivent ce que Nexum fait et ajoute : pas de comparaison avec d'autres apps, pas de sources d'inspiration, pas de pseudos de testeurs. Restent autorisés : les services avec lesquels Nexum s'intègre (Thunderstore, Hexium, BepInEx, Steam…) et les jeux ; r2modman et Gale seulement quand il faut les nommer pour se servir d'une fonction (codes et fichiers de profil).

## Doc officielle

- Valheim : https://valheim.fandom.com/wiki/Dedicated_servers, https://www.valheimgame.com/support/a-guide-to-dedicated-servers/
- Thunderstore : https://thunderstore.io/api/docs/ (OpenAPI : `?format=openapi`). Hexium : `https://hexium.gg/api/openapi.json`
- Odin-Eye (joueurs Valheim) : https://sparcopt.github.io/odin-eye/ (⚠️ diverge du plugin v1.0.0.0)
- Astroneer : https://blog.astroneer.space/p/astroneer-dedicated-server-details/
- Palworld : https://docs.palworldgame.com/
- Dragonwilds : https://dragonwilds.runescape.com/news/how-to-dedicated-servers (⚠️ plusieurs erreurs), https://github.com/runescape/rsdw-dedicated (modèle `DedicatedServer.ini`, arguments dans `steamrt4/`), https://dragonwilds.runescape.wiki/w/Dedicated_Servers
- Enshrouded : articles Zendesk [16055441447709](https://enshrouded.zendesk.com/hc/en-us/articles/16055441447709) (configuration), [16051370691485](https://enshrouded.zendesk.com/hc/en-us/articles/16051370691485) (installation), [20453241249821](https://enshrouded.zendesk.com/hc/en-us/articles/20453241249821) (réglages de partie), [19191581489309](https://enshrouded.zendesk.com/hc/en-us/articles/19191581489309) (groupes), [16056312924957](https://enshrouded.zendesk.com/hc/en-us/articles/16056312924957) (FAQ). ⚠️ Zendesk renvoie 403 sans navigateur : lire `https://enshrouded.zendesk.com/api/v2/help_center/en-us/articles/<id>.json` (champ `body`). Plus à jour : `enshrouded_server_readme.txt` livré avec le serveur.
