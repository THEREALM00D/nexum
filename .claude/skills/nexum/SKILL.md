---
name: nexum
description: Prend en charge une issue GitHub de Nexum de bout en bout — lecture de l'issue, plan mode, questions, plan, développement, vérifications (typecheck, lint, test dans l'app isolée), doc, puis (sur accord) push + PR. Utiliser quand l'utilisateur écrit « nexum 42 », « nexum #42 », « nexum(42) », « /nexum 42 » ou demande de travailler sur une issue précise de Nexum.
argument-hint: <numéro d'issue>
---

# Travailler sur l'issue Nexum #$ARGUMENTS

Cycle : **comprendre → questionner → planifier → (approbation) → développer → vérifier → documenter → demander avant de publier**. Ne saute aucune étape. Règles de travail (langue, branches, commits, PR, doc, public) : `.claude/CLAUDE.md`, à appliquer sans les redemander.

`$ARGUMENTS` vide ou pas un numéro → demande le numéro. Pas encore d'issue pour ce travail → crée-la avec `/issue` (colonne « In dev »), puis reprends ici.

## 1. Plan mode

Entre en plan mode (`EnterPlanMode`). S'il n'est pas disponible, demande à l'utilisateur de l'activer (Shift+Tab) et, en attendant : **aucune modification de fichier ni commande qui écrit** (branche, commit, `gh issue edit`…) avant l'approbation du plan.

## 2. Comprendre l'issue

```bash
gh issue view $ARGUMENTS --repo THEREALM00D/nexum --json number,title,body,labels,state,comments,url
```

- Issue fermée → signale-le et demande s'il faut continuer.
- Lis les commentaires (ils précisent souvent le besoin).
- Type Conventional Commits : `bug` → `fix`, `enhancement` → `feat`, `documentation` → `docs`, `chore` → `chore` (ou `ci`, `refactor`). Un changement qui ne se voit pas dans l'app n'est jamais `fix`/`feat` (il publierait une version). En cas de doute, demande : le type décide de la release.

## 3. Lire le contexte

- Tableau « Où est la doc » du `CLAUDE.md` racine → lis les `CLAUDE.md` des domaines touchés (jeu, page, logs, sauvegardes…). Nouveau jeu → suis aussi `/new-game`.
- Explore le code concerné et cherche ce qui existe déjà (composants, hooks, helpers) : la règle est de ne pas dupliquer.
- Jeu ou API externe : liens « Doc officielle » de `.claude/CLAUDE.md`, en gardant en tête les écarts notés dans le `CLAUDE.md` du jeu.

## 4. Questions

`AskUserQuestion` (1 à 4 questions par appel, option recommandée en premier) pour ce qui reste flou **et changerait l'implémentation** : comportement attendu, cas limites, jeux concernés, emplacement dans l'UI, textes FR/EN, effet sur la config existante des utilisateurs, type de PR. Pas de question dont la réponse est dans le code ou les `CLAUDE.md`.

**Challenge** : si l'issue propose une solution qui va contre une convention, duplique l'existant ou a une meilleure alternative, dis-le et propose l'alternative.

## 5. Plan (`ExitPlanMode`)

1. **Résumé** de la demande (1-2 phrases).
2. **Titre de PR** : ex. `feat: add backup retention per server`.
3. **Branche** : `<type>/$ARGUMENTS-<slug-court-en-anglais>`.
4. **Fichiers** à créer ou modifier, avec ce qui change.
5. **Réutilisation** : composants / hooks existants utilisés ou extraits.
6. **i18n** : nouvelles clés FR + EN (préfixées par le jeu si besoin).
7. **Doc** : `docs/*.md` + `.fr.md`, README, `CLAUDE.md` du domaine.
8. **Réseau** : nouvel appel → déclaration de confidentialité.
9. **Vérification** : ce que tu testeras dans l'app isolée (`/test-app`) et le plan de test manuel pour l'utilisateur (jeu, page, étapes).

Attends l'approbation ; ajuste et représente le plan si l'utilisateur demande des changements.

## 6. Démarrer

```bash
git status --porcelain            # doit être vide, sinon demande quoi faire
git fetch origin
git switch -c <branche> origin/main
node .claude/scripts/project-status.mjs $ARGUMENTS "In dev"
```

Échec du script faute de droit `project` → donne `gh auth refresh -s project` et continue.

## 7. Développer

Conventions : `CLAUDE.md` racine + `src/renderer/src/CLAUDE.md` (UI) + `CLAUDE.md` du domaine. Les pièges les plus fréquents : string hors `t()`, erreur affichée sans `errorMessage` / `appErrorMessage`, phrase en dur dans le main au lieu d'un code `AppError` ou de `logStrings`, import statique d'une dépendance ESM dans le main, texte « Chargement... » au lieu d'un skeleton, import depuis un autre jeu, fichier > 200 lignes.

Si le plan ne tient plus (portée, nouvelle décision), arrête-toi et demande avant de dévier. Un autre sujet découvert en route → propose une issue séparée, ne l'ajoute pas ici.

## 8. Vérifier

```bash
yarn typecheck
yarn lint:check
```

Corrige jusqu'à ce que les deux passent (les avertissements déjà présents sur `main` ne sont pas à corriger ici). Changement visible ou comportement du main → teste-le avec `/test-app` (jamais sur les données de l'app installée) et garde les captures utiles. Dis clairement ce qui n'a pas pu être testé (vrai serveur, vrai joueur…).

Puis lance `/revue` (agent `nexum-reviewer` sur la branche) et corrige ses 🔴 et 🟠 avant de passer à la suite, ou explique à l'utilisateur pourquoi un constat est écarté.

## 9. Documenter

- `docs/*.md` + `docs/*.fr.md` (mêmes changements), README si besoin, confidentialité si nouvel appel réseau.
- `CLAUDE.md` du domaine : décisions non évidentes et pièges rencontrés, selon « Écrire dans les CLAUDE.md » du `CLAUDE.md` racine (au bon endroit, court, sans historique). Obligatoire à la fin de chaque travail.

## 10. Commit

Anglais, Conventional Commits, impératif, concis, sans ligne d'attribution.

## 11. Demander avant de publier

Récapitulatif en français (ce qui a changé, typecheck / lint, ce qui a été testé dans l'app, plan de test manuel), puis `AskUserQuestion` : **Pousser et ouvrir la PR** (recommandé) / **Garder en local** / **Corriger quelque chose avant**.

Si oui :

```bash
git push -u origin <branche>
gh pr create --repo THEREALM00D/nexum --base main --title "<type>: <description>" --body-file - <<'EOF'
Closes #$ARGUMENTS

## Summary

<what changed and why, in English>

## Test plan

- [x] `yarn typecheck` passes
- [x] `yarn lint:check` passes
- [x] <what was checked in the app>
- [ ] Tested manually: <steps for the user>
EOF
node .claude/scripts/project-status.mjs $ARGUMENTS "To test"
```

Donne le lien de la PR. Ne déplace pas la carte vers « Done » : à la fusion, `Closes #N` ferme l'issue et le Project la passe en Done.
