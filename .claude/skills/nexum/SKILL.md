---
name: nexum
description: Prend en charge une issue GitHub de Nexum de bout en bout — lecture de l'issue, plan mode, questions, plan, développement, vérifications, puis (sur accord) push + PR. Utiliser quand l'utilisateur écrit « nexum 42 », « nexum #42 », « nexum(42) », « /nexum 42 » ou demande de travailler sur une issue précise de Nexum.
argument-hint: <numéro d'issue>
---

# Travailler sur l'issue Nexum #$ARGUMENTS

Tu prends en charge l'issue **#$ARGUMENTS** du repo `THEREALM00D/nexum`. Le cycle est
toujours le même : **comprendre → questionner → planifier → (approbation) → développer →
vérifier → demander avant de publier**. Ne saute aucune étape.

Si `$ARGUMENTS` est vide ou n'est pas un numéro : demande le numéro d'issue. S'il n'y a pas
encore d'issue pour ce travail, crée-la d'abord en suivant le skill `/issue` (règle du repo :
**aucun travail ni PR sans issue**, vérifié en CI par `pr-issue.yml`), puis reprends ici avec
son numéro.

Communique en **français** avec l'utilisateur. Tout ce qui est public (commits, PR,
commentaires d'issue) est en **anglais**.

## 1. Passer en plan mode

Avant toute autre chose, entre en plan mode avec l'outil `EnterPlanMode`. Si l'outil n'est
pas disponible, demande à l'utilisateur d'activer le plan mode (Shift+Tab) et, en attendant,
respecte la même règle : **aucune modification de fichier, aucune commande qui écrit
(git checkout -b, commit, gh issue edit…) avant que le plan soit approuvé.**

## 2. Comprendre l'issue

```bash
gh issue view $ARGUMENTS --repo THEREALM00D/nexum --json number,title,body,labels,state,comments,url
```

- Issue fermée → signale-le et demande s'il faut continuer.
- Lis les commentaires : ils précisent souvent le besoin.
- Labels → type Conventional Commits : `bug` → `fix`, `enhancement` → `feat`, doc → `docs`,
  outillage/CI/dépendances → `chore` (ou `ci`, `refactor`). En cas de doute, pose la question :
  le type du titre de PR décide de la version publiée (release-please).

## 3. Lire le contexte du repo

- `CLAUDE.md` (racine) : lis la table des matières (`grep -n '^#' CLAUDE.md`), puis **les
  sections qui touchent l'issue** (jeu concerné, page, IPC, i18n, skeletons, ScrollPanel…).
  Le fichier est long : ne le lis pas en entier si ce n'est pas utile.
- `.claude/CLAUDE.md` : règles de dev, de commit et de PR.
- Explore le code concerné. Cherche les composants, hooks et patterns **déjà existants** à
  réutiliser : la règle est d'éviter la duplication.
- Si l'issue touche une API externe ou un jeu, utilise les liens de « Utiliser la doc » de
  `.claude/CLAUDE.md` et le serveur MCP MUI pour les questions MUI.

## 4. Poser les questions nécessaires

Utilise `AskUserQuestion` (1 à 4 questions par appel, plusieurs appels si besoin) pour tout ce
qui reste flou et changerait l'implémentation : comportement attendu, cas limites, jeux
concernés, emplacement dans l'UI, texte FR/EN, impact sur la config existante des
utilisateurs, type `feat`/`fix`. Mets l'option recommandée en premier.

**Challenge l'utilisateur** : si l'issue propose une solution qui va contre une convention du
repo, qui duplique l'existant ou qui a une meilleure alternative, dis-le et propose
l'alternative. Ne pose pas de questions dont la réponse se trouve dans le code ou dans
CLAUDE.md.

## 5. Présenter le plan

Le plan (via `ExitPlanMode`) contient :

1. **Résumé** de ce que l'issue demande, en une ou deux phrases.
2. **Type et titre de PR** prévus : ex. `feat: add backup retention per server`.
3. **Branche** : `<type>/$ARGUMENTS-<slug-court-en-anglais>` (ex. `feat/42-backup-retention`).
4. **Fichiers** à créer ou modifier, avec ce qui change dans chacun.
5. **Réutilisation** : composants/hooks existants utilisés ou extraits.
6. **i18n** : nouvelles clés FR + EN.
7. **Doc** : pages `docs/*.md` + `docs/*.fr.md` (et README) à mettre à jour ou créer, et
   sections de `CLAUDE.md` à ajuster.
8. **Réseau** : tout nouvel appel réseau → déclaration de confidentialité dans
   `docs/code-signing.md` + `.fr.md`.
9. **Plan de test manuel** : étapes concrètes pour l'utilisateur (quel jeu, quelle page).

Attends l'approbation. Si l'utilisateur demande des changements, ajuste et représente le plan.

## 6. Démarrer (après approbation)

```bash
git status --porcelain            # doit être vide, sinon demande quoi faire
git fetch origin
git switch -c <branche> origin/main
node .claude/scripts/project-status.mjs $ARGUMENTS "In dev"
```

Si le script échoue faute de droit `project`, indique la commande
`gh auth refresh -s project` et continue le développement.

## 7. Développer

Respecte les conventions de `CLAUDE.md`, en particulier :

- Les pages gèrent l'affichage, les composants gèrent la logique. Fichiers < 200 lignes.
- Toute string visible passe par `t()`, avec les clés FR **et** EN. Commentaires de code en
  français.
- MUI uniquement. Notifications via `useNotification().notify()`. Skeletons pour les
  chargements.
- Jamais d'import de `src/main/` dans le renderer (passer par l'IPC, types dans
  `src/shared/types.ts`).
- Dépendances ESM pures → `await import()` dans le main process. Licence compatible GPL-3.0.
- Pas de tests unitaires (ne pas en ajouter sans demander).
- Ne touche jamais à `version` dans `package.json` et ne crée pas de tag.
- Règle publique : pas de comparaison avec d'autres apps, pas de sources d'inspiration, pas de
  pseudos de testeurs dans le code, les commits ou la PR. Ne mentionne jamais `BACKLOG.md`.

Si tu découvres en cours de route que le plan ne tient plus (changement de portée, nouvelle
décision à prendre), arrête-toi et demande avant de dévier.

## 8. Vérifier

```bash
yarn typecheck
yarn lint:check
```

Corrige jusqu'à ce que les deux passent. Puis termine la doc :

- `docs/*.md` + `docs/*.fr.md` mis à jour des deux côtés (mêmes changements).
- `README.md` / `README.fr.md` si une page de doc est ajoutée ou si le démarrage change.
- `CLAUDE.md` ajusté (décisions non évidentes, pièges rencontrés) : c'est obligatoire à la
  fin de chaque travail.

Relis ton propre diff (`git diff origin/main`) comme le ferait un relecteur : duplication,
strings en dur, fichiers trop longs, doc oubliée.

## 9. Commit

Commits en anglais, Conventional Commits, impératif, concis
(ex. `feat: add per-server backup retention`). N'ajoute **aucune** ligne d'attribution
(`Co-Authored-By`, « Generated with ») : le repo les désactive.

## 10. Demander avant de publier

Fais un récapitulatif en français (ce qui a changé, résultat de typecheck/lint, plan de test
manuel), puis demande avec `AskUserQuestion` :

- **Pousser et ouvrir la PR** (recommandé)
- **Garder en local** : je teste d'abord
- **Corriger quelque chose avant**

Si l'utilisateur dit oui :

```bash
git push -u origin <branche>
gh pr create --repo THEREALM00D/nexum --base main --title "<type>: <description>" --body-file - <<'EOF'
## Summary

<what changed and why, in English>

## Test plan

- [x] `yarn typecheck` passes
- [x] `yarn lint:check` passes
- [ ] Tested manually: <steps>

Closes #$ARGUMENTS
EOF
node .claude/scripts/project-status.mjs $ARGUMENTS "To test"
```

Le titre de PR doit être en Conventional Commits (vérifié par `pr-title.yml`). Il devient le
commit squash sur `main` et décide de la release. La ligne `Closes #$ARGUMENTS` est
obligatoire (vérifiée par `pr-issue.yml`). Si le travail a débordé sur un autre sujet, ouvre
une issue pour ce sujet et sépare-le dans sa propre PR plutôt que de l'ajouter ici. Donne le lien de la PR à la fin.
Ne déplace pas la carte vers « Done » : à la fusion, `Closes #N` ferme l'issue et le workflow
intégré du Project (« Item closed → Done ») la déplace.
