---
name: revue
description: Revue de code de Nexum par l'agent spécialiste nexum-reviewer — branche locale, PR GitHub ou fichiers — contre les conventions des CLAUDE.md et à la recherche de vrais bugs, avec typecheck et lint, puis (sur accord) corrections ou commentaires sur la PR. Utiliser quand l'utilisateur écrit « revue », « revue 42 », « /revue », ou demande de relire, revoir, auditer le code ou une PR de Nexum, et à l'étape « Vérifier » de /nexum.
argument-hint: "[numéro de PR | branche | chemin…]"
---

# Revue de code Nexum : $ARGUMENTS

Règles de travail (langue, public, PR) : `.claude/CLAUDE.md`. Échanges avec l'utilisateur en français ; tout ce qui part sur GitHub en anglais.

## 1. Cible

| `$ARGUMENTS`         | Cible                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| vide                 | branche courante vs `origin/main`, modifications non commitées comprises               |
| nombre (`42`, `#42`) | PR GitHub n°42                                                                         |
| nom de branche       | `origin/main...<branche>` ; le disque n'a pas son code : `git show <branche>:<chemin>` |
| chemin(s)            | ces fichiers / dossiers en entier (audit, pas de diff)                                 |

```bash
git fetch origin --quiet
git diff --stat $(git merge-base origin/main HEAD)     # cible vide ; adapter selon la cible
```

Diff vide → dis-le et arrête-toi. PR : `gh pr view <N> --repo THEREALM00D/nexum --json title,state,headRefName` (PR fermée ou fusionnée → demande s'il faut continuer).

## 2. Lancer la revue et les vérifications en parallèle

Dans le **même** message :

- **Agent `nexum-reviewer`** (`Agent`, `subagent_type: "nexum-reviewer"`) avec la cible exacte (commande de diff, ou PR + `refs/review/pr-<N>`), la liste des fichiers touchés et, si connue, l'issue liée. Diff de plus de ~800 lignes qui touche le main **et** le renderer → deux agents, l'un sur `src/main` + `src/shared` + `src/preload`, l'autre sur `src/renderer` ; la doc et la PR vont au premier.
- **Vérifications** sur le code du disque, donc seulement quand la cible est la branche courante. PR : la CI les fait, lire `gh pr checks <N>`. Autre branche : pas de vérification (le dire dans le rapport), ou proposer de basculer dessus si l'arbre de travail est propre.

```bash
yarn typecheck
yarn lint:check
```

Ne lance pas `yarn lint` (auto-fix) : la revue ne modifie rien.

## 3. Trier le rapport

Quand l'agent a rendu son rapport, avant de le montrer :

- Revérifie toi-même chaque 🔴 dans le code (une lecture ciblée suffit). Faux positif → retire-le.
- Ajoute les erreurs de typecheck / lint en 🔴 (les avertissements déjà présents sur `main` ne comptent pas).
- Fusionne les doublons si deux agents ont tourné.

Puis montre le rapport à l'utilisateur, tel quel (format de l'agent), en français.

## 4. Suite (sur accord)

Une seule question `AskUserQuestion`, options selon la cible :

- **Corriger** (recommandé s'il y a du 🔴 ou du 🟠, branche locale) : corriger les constats choisis (multiSelect si plus de quatre : par gravité), puis relancer `yarn typecheck` et `yarn lint:check`. Ne pas commiter sans qu'on le demande.
- **Commenter la PR** (cible PR) : commentaires en **anglais**, un par constat, sur la ligne (`gh api repos/THEREALM00D/nexum/pulls/<N>/comments` avec `commit_id`, `path`, `line`, `side: RIGHT`) ou, à défaut, un commentaire de synthèse (`gh pr comment`). Montrer le texte avant d'envoyer : c'est public. Pas de pseudo de testeur ni de comparaison avec une autre app.
- **Rien** : la revue s'arrête là.

Après des corrections, propose une seconde passe de `/revue` seulement si les changements sont importants.
