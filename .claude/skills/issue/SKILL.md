---
name: issue
description: Crée une ou plusieurs issues GitHub pour Nexum (bug, feature ou tâche d'outillage/doc, selon les templates du repo), en anglais, après validation du brouillon, puis les place dans le GitHub Project. Utiliser quand l'utilisateur veut créer, ouvrir ou noter une issue, un bug ou une idée pour Nexum, ET avant de commencer tout travail (branche, commit, PR) qui n'a pas encore d'issue : chaque PR de Nexum doit fermer une issue.
argument-hint: <description du bug, de la feature ou de la tâche>
---

# Créer une issue Nexum

Demande : $ARGUMENTS

Règles (langue, « tout ce qui est public », une issue par travail) : `.claude/CLAUDE.md`. L'issue est publique : titre et corps en **anglais**.

Si un travail démarre sans issue : crée-la **avant** la branche, en colonne « In dev », puis branche `<type>/<N>-<slug>`. Si une PR existe déjà sans issue : crée l'issue, ajoute `Closes #N` en tête de la description (`gh pr edit <pr> --body-file -`) et place la carte en « To test ».

## 1. Comprendre et compléter

- **Type** et labels :
  - bug visible dans l'app → `bug`
  - nouvelle fonction ou amélioration de l'app → `enhancement`
  - outillage, CI, dépendances, réglages Claude → `chore` (+ `bug` si quelque chose est cassé)
  - doc seule → `documentation` (+ `chore`)
  - idée pas encore prête → `idea` (colonne « Ideas »)
- **Jeu** : une des options du champ « Game » de `.github/ISSUE_TEMPLATE/bug_report.yml` (ou « Not game-specific »). Jeu précis → ajoute aussi le label `game:<jeu>` (`gh label list` pour les noms exacts).
- Plusieurs sujets distincts → une issue par sujet.
- Info clé manquante (version de Nexum pour un bug, comportement attendu, étapes) → `AskUserQuestion`. Ne demande pas ce que le code ou les `CLAUDE.md` disent. Version par défaut acceptable : `version` de `package.json` si l'utilisateur teste `main`.
- Demande vague ou solution discutable : dis-le et propose mieux.

## 2. Chercher les doublons

```bash
gh issue list --repo THEREALM00D/nexum --state all --search "<mots-clés>" --limit 10
```

Issue proche (ouverte ou fermée récemment) → montre-la et demande s'il faut la commenter, la rouvrir ou en créer une nouvelle.

## 3. Rédiger le brouillon

Sections des templates `.github/ISSUE_TEMPLATE/` en titres markdown :

- **Bug** : `### Nexum version`, `### Game`, `### What happened?`, `### What did you expect to happen?`, `### Steps to reproduce`, `### Relevant logs` (omise si vide ; logs anonymisés : l'export de Nexum le fait).
- **Feature / tâche** : `### Game`, `### What problem would this solve?`, `### Proposed solution`.

Titre court et descriptif, **sans préfixe** `bug:` / `feat:` (ex. « Backup restore fails when the world name contains spaces »). Décris ce que Nexum doit faire, pas comment un autre outil le fait.

## 4. Valider

Montre titre, labels, colonne et corps de chaque issue, puis **une seule** question `AskUserQuestion` : **Créer** / **Modifier** / **Annuler**.

## 5. Créer et placer dans le Project

```bash
gh issue create --repo THEREALM00D/nexum --title "<titre>" --label "<label>" [--label "<label>"] --body-file - <<'EOF'
<corps>
EOF
node .claude/scripts/project-status.mjs <numéro> "To do"
```

Colonne : « To do » par défaut, « In dev » si le travail démarre maintenant, « Ideas » pour une idée. Si le script échoue faute de droit `project` : l'issue est créée, donne `gh auth refresh -s project`.

## 6. Conclure

Lien de chaque issue + colonne. Si le travail ne démarre pas tout de suite, propose `/nexum <numéro>` en une ligne.
