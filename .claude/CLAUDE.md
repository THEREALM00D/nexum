# Instructions Claude

## Langue de Communication

- Parle-moi toujours en français
- Réponds à toutes les questions en français
- Explique ton code et tes décisions en français

## Commits

- Écris les messages de commit en anglais
- Sois clair et concis dans la description des changements
- Utilise l'impératif: "fix", "feat", "chore", etc.

## Pull Requests

- Rédige les descriptions de PR en anglais
- Explique les modifications apportées en anglais
- Fournis un contexte clair sur pourquoi les changements sont nécessaires
- **Titre de PR au format Conventional Commits obligatoire** (`feat: …`, `fix: …`, `chore: …` — vérifié en CI par `pr-title.yml`) : il devient le commit squash sur `main` et détermine la version (release-please : `feat` → mineur, `fix` → patch, le reste → pas de release). Choisir le type avec soin.
- Ne jamais bumper `version` dans `package.json` ni créer de tag à la main — voir CLAUDE.md « Versioning & releases »

## Regles de developpement

- Chaque page gere l'affichage le plus possible, les components gere la logique.
- On evite la dupplication
- Preferer les components reutilisable au lieu de dupliquer les choses
- Toujours ajuster CLAUDE.md a la fin du travail pour avoir la meilleur doc possible
- **Toujours mettre à jour la doc utilisateur dans la même PR que la feature, sans attendre qu'on le demande** : `docs/*.md` + `docs/*.fr.md` (FR **et** EN, mêmes changements des deux côtés) et `README.md`/`README.fr.md` si le démarrage rapide, la liste des pages de doc ou la stack changent. Une feature visible par l'utilisateur sans page de doc → créer la page (+ son lien dans la section « Documentation » des deux README). Retirer aussi ce qui devient faux (feature supprimée ou comportement changé). CLAUDE.md = doc technique pour les devs, `docs/` = doc utilisateur : les deux sont à tenir à jour.
- **Tâches** : elles vivent dans les issues GitHub et le [Project](https://github.com/users/THEREALM00D/projects/4) (colonnes Ideas, To do, In dev, To test, Done). Skills `/issue` et `/nexum` (`.claude/skills/`) + script `.claude/scripts/project-status.mjs` pour créer une issue, la prendre en charge et déplacer sa carte. `Closes #N` dans une PR ferme la tâche à la fusion.
- **Toujours une issue GitHub pour un travail, sans exception** : avant de créer une branche (ou au plus tard avant d'ouvrir la PR), vérifier qu'une issue existe, sinon la créer (skill `/issue`, colonne « In dev » si le travail démarre tout de suite). Branche `<type>/<N>-<slug>`, carte déplacée (« In dev » au début, « To test » à l'ouverture de la PR), `Closes #N` dans la description de la PR. Vaut aussi pour une demande faite directement en conversation, hors `/nexum`, et pour une PR de doc ou d'outillage. Un travail qui touche deux sujets distincts = deux issues et deux PR. Vérifié en CI (`.github/workflows/pr-issue.yml`) : une PR sans `Closes|Fixes|Resolves #N` échoue, sauf PR de bot (release-please, Dependabot). `gh` a besoin du droit `project` pour modifier le tableau (`gh auth refresh -s project`). `BACKLOG.md` reste un fichier local ignoré par git, pour des notes personnelles : ne jamais le mentionner dans une PR.
- **Tout ce qui est public** (fichiers suivis, commits, PR, issues) décrit ce que Nexum ajoute : pas de comparaison avec d'autres apps, pas de sources d'inspiration, pas de pseudos de testeurs. Restent autorisés : les services avec lesquels Nexum s'intègre (Thunderstore, Hexium, BepInEx, Steam…) et les jeux ; r2modman et Gale seulement quand il faut les nommer pour se servir d'une fonction (codes et fichiers de profil).
- utiliser la doc officiel dans ## Utiliser la doc

## Use the mui-mcp server to answer any MUI questions --

- 1. call the "useMuiDocs" tool to fetch the docs of the package relevant in the question
- 2. call the "fetchDocs" tool to fetch any additional docs if needed using ONLY the URLs present in the returned content.
- 3. repeat steps 1-2 until you have fetched all relevant docs for the given question
- 4. use the fetched content to answer the question

## Utiliser la doc

- https://valheim.fandom.com/wiki/Dedicated_servers
- https://www.valheimgame.com/support/a-guide-to-dedicated-servers/
- https://thunderstore.io/api/docs/
- https://thunderstore.io/api/docs/?format=openapi
- https://blog.astroneer.space/p/astroneer-dedicated-server-details/
- https://sparcopt.github.io/odin-eye/ (plugin Odin-Eye, suivi joueurs Valheim — ⚠️ la doc en ligne diverge du plugin v1.0.0.0, voir CLAUDE.md « Historique des joueurs »)
- https://dragonwilds.runescape.com/news/how-to-dedicated-servers (guide Jagex des serveurs dédiés Dragonwilds — ⚠️ plusieurs points sont faux ou périmés, voir CLAUDE.md « Config INI Dragonwilds »)
- https://github.com/runescape/rsdw-dedicated (image Docker officielle de Jagex : modèle `DedicatedServer.ini` et arguments `-Port` / `-BeaconPort` dans `steamrt4/`)
- https://dragonwilds.runescape.wiki/w/Dedicated_Servers (wiki officiel Dragonwilds)
- https://enshrouded.zendesk.com/hc/en-us/articles/16055441447709 (Enshrouded : configuration du serveur dédié), [16051370691485](https://enshrouded.zendesk.com/hc/en-us/articles/16051370691485) (installation), [20453241249821](https://enshrouded.zendesk.com/hc/en-us/articles/20453241249821) (réglages de partie), [19191581489309](https://enshrouded.zendesk.com/hc/en-us/articles/19191581489309) (groupes), [16056312924957](https://enshrouded.zendesk.com/hc/en-us/articles/16056312924957) (FAQ). ⚠️ Zendesk renvoie 403 sans navigateur : lire `https://enshrouded.zendesk.com/api/v2/help_center/en-us/articles/<id>.json` (champ `body`). Plus à jour que ces pages : `enshrouded_server_readme.txt` livré avec le serveur (version, nouvelles clés). Voir CLAUDE.md « Enshrouded »
