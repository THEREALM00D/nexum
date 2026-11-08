# CI, releases et publication

Chargé quand on travaille dans `.github/`. Règles de travail (issues, PR, commits) : `.claude/CLAUDE.md`.

## Workflows

- **`ci.yml`** : `yarn typecheck` + `yarn lint:check` sur chaque PR/push vers `main` (Node 22, `windows-latest`). `main` est protégée, PR obligatoire.
- **`pr-title.yml`** : titre de PR en Conventional Commits obligatoire.
- **`pr-issue.yml`** : échoue si la description ne contient pas `Closes|Fixes|Resolves #N` (insensible à la casse ; PR de bots dispensées : `user.type == 'Bot'`). Le corps de la PR passe par une variable d'environnement, **jamais interpolé dans le script** (texte libre = injection). Pour bloquer la fusion, le job `linked-issue` doit figurer dans les vérifications obligatoires de la protection de `main`. Modèle de PR : ligne `Closes #` en tête.
- **`release.yml`** (push sur `main`) : release-please, build Windows, publication, annonce Discord. Tout dans **un seul workflow** : un tag créé avec `GITHUB_TOKEN` ne déclenche aucun autre workflow.
- **`beta.yml`** (`workflow_dispatch`) : versions bêta, voir plus bas.
- **`.yarnrc`** : `network-timeout 600000`. Un `ESOCKETTIMEDOUT` en CI (gros tarballs, `@mui/icons-material`) est un problème réseau : relancer le job.
- **Dependabot** (`dependabot.yml`) : PR hebdo npm (minor/patch groupées) + GitHub Actions. Un bump majeur qui casse la CI se corrige **sur la branche de la PR**. Cause la plus probable : une dépendance passée en ESM pur (voir « Stack » dans `CLAUDE.md`).

## Versioning (release-please)

- Semver `0.x.y` sans suffixe. Version calculée depuis les **titres de PR** (squash-merge, le titre devient le commit) : `fix:` → patch, `feat:` → mineur, `feat!:` → mineur aussi tant qu'on est en `0.x` (`bump-minor-pre-major`) ; `chore:`/`docs:`/`ci:`/`refactor:` → pas de release (masqués du CHANGELOG, `changelog-sections`). Un changement d'outillage ou de doc n'est jamais `fix:`.
- Chaque push sur `main` met à jour la PR `chore(main): release X.Y.Z` (bump `package.json`, `.release-please-manifest.json`, `CHANGELOG.md`). **Merger cette PR = publier** : release **en draft** + tag (`force-tag-creation`, sinon GitHub ne crée le tag d'un draft qu'à la publication et release-please ne retrouve plus la release précédente), puis `build-windows` lance `yarn build --publish always` (electron-builder réutilise le draft ; `releaseType: draft` dans `electron-builder.yml` pour ne jamais publier seul), puis `gh release edit --draft=false`. L'updater ne voit donc jamais une release sans `latest.yml`.
- **Ne jamais** bumper `version` dans `package.json` ni pousser de tag à la main.
- Forcer une version (ex. `1.0.0`) : `"release-as": "X.Y.Z"` temporaire dans `packages["."]` de `release-please-config.json`, à retirer après la release. ⚠️ Aucune PR de release tant qu'il n'y a pas au moins un commit `feat`/`fix`/`perf`/`revert`/`deps` depuis la dernière release, même avec `release-as`.
- Prérequis du repo : _Settings → Actions → General → « Allow GitHub Actions to create and approve pull requests »_, squash-merge avec _« Default to pull request title »_.

### « Publish release » a échoué (ex. HTTP 502 après 5 tentatives)

Build et upload sont faits, la release reste en draft. Vérifier les assets (`gh release view vX.Y.Z` → `latest.yml` + setup + portable + blockmap) puis `gh release edit vX.Y.Z --draft=false --latest`. Inutile de relancer le job.

## Versions bêta (`beta.yml`)

Actions → **Beta release** → _Run workflow_ sur une branche poussée qui contient le workflow.

- Version = entrée `version` (`X.Y.Z`, au-dessus de la dernière stable) ou dernière stable + 1 patch, puis `-beta.N` (N suivant d'après les tags **et** les releases : un draft raté n'a pas de tag ; `concurrency` évite les doublons). Par défaut + 1 patch : une bêta numérotée au-dessus de la stable suivante bloquerait les testeurs dessus.
- `npm pkg set version=…` le temps du build (rien n'est commité). Draft `--prerelease` créé avant le build. Sans `publish.channel`, electron-builder génère `latest.yml`, pas `beta.yml` (vérifié en v24 et v26). Notes = branche, SHA, commits depuis la stable + SHA256. Publiée `--prerelease --latest=false`. Pas de VirusTotal ni d'annonce Discord.
- release-please ne voit pas ces releases (il part du manifest) ; la stable suivante remplace la bêta chez les testeurs. Côté app : `src/main/update/CLAUDE.md`.

## Vérification des téléchargements et signature

- Les exe ne sont **pas signés**. Avant publication, le workflow ajoute aux notes le **SHA256** de chaque `.exe` et, si le secret `VT_API_KEY` existe, les liens **VirusTotal** (`crazy-max/ghaction-virustotal`, `continue-on-error`).
- `docs/code-signing.md` (+ `.fr.md`) le dit explicitement. La phrase « Free code signing provided by SignPath.io, certificate by SignPath Foundation » n'y apparaît **qu'une fois la signature réellement en place**. Cette page contient les rôles de l'équipe et la **déclaration de confidentialité**, qui liste chaque connexion réseau de l'app : tout nouvel appel réseau doit y être ajouté. `package.json` → `author` alimente le champ éditeur de l'exe. Conditions SignPath : pas de double licence commerciale, MFA sur GitHub et SignPath, approbation manuelle de chaque signature.

## Annonce Discord (job `discord-notify` de `release.yml`)

- Après `build-windows` : embed « Nexum vX.Y.Z » avec les notes de release-please (sans la ligne de titre, la section SHA256/VirusTotal ni les liens de commit, tronqué à ~3900 caractères), via le secret **`DISCORD_RELEASE_WEBHOOK`** (absent → étape sautée).
- Mention du rôle « Release Ping » : ID dans la **variable** `DISCORD_RELEASE_ROLE_ID`. La mention va dans `content` (⚠️ une mention dans un embed ne notifie personne), `allowed_mentions` n'autorise que ce rôle ; variable absente ou non numérique → annonce sans mention. `continue-on-error` : ne fait jamais échouer une release.
- Appel fait par la CI, pas par l'app : rien à déclarer dans la confidentialité.

## Invitation Discord

`https://discord.gg/DbJ3WkK5QU`, utilisée à 4 endroits à garder synchronisés : `DISCORD_INVITE_URL` (`src/renderer/src/components/Sidebar/DiscordButton.tsx`), badge + section « Aide et communauté / Help & community » des deux README, `contact_links` de `ISSUE_TEMPLATE/config.yml` (questions → Discord, issues → bugs). ⚠️ Avant d'en publier une nouvelle, vérifier qu'elle est permanente (`expires_at: null` sur `https://discord.com/api/v10/invites/<code>?with_expiration=true`) : une invitation expirée a déjà cassé le bouton de l'app.

## Templates d'issue

La liste des jeux (champ « Game ») de `ISSUE_TEMPLATE/*.yml` est la référence utilisée par le skill `/issue` : la compléter à chaque nouveau jeu.
