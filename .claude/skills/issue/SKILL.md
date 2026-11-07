---
name: issue
description: Crée une ou plusieurs issues GitHub pour Nexum (bug ou feature, selon les templates du repo), en anglais, après validation du brouillon, puis les place dans la colonne « To do » du GitHub Project. Utiliser quand l'utilisateur veut créer, ouvrir ou noter une issue, un bug ou une idée de feature pour Nexum, ET avant de commencer tout travail (branche, commit, PR) qui n'a pas encore d'issue : chaque PR de Nexum doit fermer une issue.
argument-hint: <description du bug ou de la feature>
---

# Créer une issue Nexum

Demande de l'utilisateur : $ARGUMENTS

Communique en **français**. L'issue est publique : titre et corps en **anglais**.

**Règle du repo : tout travail a son issue, et toute PR la ferme (`Closes #N`, vérifié en
CI par `pr-issue.yml`).** Ce skill sert donc aussi quand un travail démarre sans issue
(demande faite en conversation, hors `/nexum`) : crée l'issue **avant** la branche, place-la
directement en « In dev », puis nomme la branche `<type>/<N>-<slug>`. Si une PR existe déjà
sans issue, crée l'issue, ajoute `Closes #N` à la description de la PR
(`gh pr edit <pr> --body-file -`) et place la carte en « To test ».

## 1. Comprendre et compléter

- Détermine le type : **bug** (label `bug`) ou **feature** (label `enhancement`). Si la demande
  contient plusieurs sujets distincts, propose une issue par sujet.
- Identifie le jeu : Palworld, Valheim, Astroneer, RuneScape: Dragonwilds, Enshrouded ou
  « Not game-specific ».
- Si une info clé manque (version de Nexum pour un bug, comportement attendu, étapes de
  reproduction), pose la question avec `AskUserQuestion`. Ne demande pas ce que tu peux trouver
  dans le code. Pour la version, `package.json` → `version` est une valeur par défaut acceptable
  si l'utilisateur teste la version de `main`.
- Si la demande est vague ou que la solution proposée semble discutable, dis-le et propose une
  meilleure formulation.

## 2. Chercher les doublons

```bash
gh issue list --repo THEREALM00D/nexum --state all --search "<mots-clés>" --limit 10
```

Si une issue proche existe, montre-la et demande s'il faut plutôt la commenter ou la compléter.

## 3. Rédiger le brouillon

Reprends les sections des templates `.github/ISSUE_TEMPLATE/` sous forme de titres markdown.

**Bug** :

```markdown
### Nexum version

v0.18.0

### Game

Valheim

### What happened?

...

### What did you expect to happen?

...

### Steps to reproduce

1. ...

### Relevant logs

(omit section if none)
```

**Feature** :

```markdown
### Game

Not game-specific

### What problem would this solve?

...

### Proposed solution

...
```

Titre : court, descriptif, sans préfixe (`bug:`/`feat:` n'est pas utilisé dans les titres
d'issue). Ex. « Backup restore fails when the world name contains spaces ».

Règle publique : décris ce que Nexum doit faire. Pas de comparaison avec d'autres apps, pas de
sources d'inspiration, pas de pseudos de testeurs. Les services intégrés (Thunderstore,
Hexium, BepInEx, Steam…) et les jeux peuvent être nommés. Ne mentionne jamais `BACKLOG.md`.

## 4. Valider

Montre le brouillon (titre, label, corps) et demande avec `AskUserQuestion` : **Créer** /
**Modifier** / **Annuler**. Pour plusieurs issues, montre-les toutes et fais une seule
validation.

## 5. Créer et placer dans le Project

```bash
gh issue create --repo THEREALM00D/nexum --title "<titre>" --label "<bug|enhancement>" --body-file - <<'EOF'
<corps>
EOF
```

Récupère le numéro dans l'URL renvoyée, puis :

```bash
node .claude/scripts/project-status.mjs <numéro> "To do"
```

Si l'utilisateur précise une autre colonne (Ideas, In dev…), utilise-la. Si le script
échoue faute de droit `project`, donne la commande `gh auth refresh -s project` : l'issue est
quand même créée.

## 6. Conclure

Donne le lien de chaque issue et sa colonne. Propose en une ligne de la prendre en charge avec
`/nexum <numéro>`.
