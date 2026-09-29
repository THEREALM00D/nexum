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
- `BACKLOG.md` est dans le `.gitignore` (local uniquement) : le mettre à jour, mais ne jamais annoncer qu'il fait partie d'une PR.
- utiliser la doc officiel dans ## Utiliser la doc
- Tu peux te utiliser et mettre a jour BACKLOG.md

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
