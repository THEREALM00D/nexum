# Planification

🇬🇧 [English](scheduling.md) | 🇫🇷 Français

Redémarrages automatiques du serveur à heures fixes ou toutes les X heures, annonces échelonnées aux joueurs et vérification des mises à jour du jeu pendant que le serveur tourne.

## À quoi ça sert ?

Les serveurs de jeu peuvent souffrir de fuites mémoire ou de ralentissements après plusieurs jours d'uptime. Un redémarrage régulier :

- Libère la mémoire et améliore les performances
- Permet d'appliquer les modifications de configuration en attente
- Force la création d'un point de sauvegarde propre
- Réduit les chances de plantage en pleine session

La page a une carte par sujet (**Redémarrages**, **Avertir les joueurs**, **Mises à jour du jeu**, et **Créatures sauvages** pour ARK) et un seul bouton **Enregistrer** en bas.

## Redémarrages

### Activer le redémarrage planifié

Interrupteur en haut de la carte. Désactivé, aucun redémarrage automatique n'a lieu.

### Heures fixes

- **Heures d'arrêt (24h)** : une puce par heure. **Ajouter une heure** ouvre un sélecteur (tapez l'heure, ou cliquez sur l'icône d'horloge pour choisir heures et minutes) ; la croix d'une puce la retire.
- **Jours** : les jours de la semaine concernés (tous par défaut). Cliquez sur un jour pour le retirer.

Exemple : `04:00` et `16:00`, du lundi au vendredi.

### Toutes les X heures

- **Toutes les (heures)** : de 1 à 24.
- **À partir de (24h)** : la première heure de la journée ; les suivantes viennent toutes les X heures jusqu'à minuit. Toutes les 6 heures à partir de 04:00 donne 04:00, 10:00, 16:00 et 22:00, tous les jours.

### L'heure est celle de l'arrêt

L'heure planifiée est celle où le serveur **s'arrête** : avec des annonces à 30, 15… 1 minutes, la première part 30 minutes avant. Une heure juste après minuit fait donc commencer les annonces la veille au soir.

La ligne **Prochain redémarrage** sous la carte donne le prochain arrêt (ex. « aujourd'hui à 16:00 ») ; le Dashboard du serveur l'affiche aussi, sous « En ligne depuis ».

> Choisissez des heures creuses (ex : 04:00 du matin) pour minimiser l'impact sur les joueurs.

> Jusqu'à la version 0.25, l'heure était celle de l'annonce et le serveur s'arrêtait après le délai d'avertissement. Un redémarrage déjà réglé garde son heure : le serveur s'arrête désormais à cette heure, donc quelques minutes plus tôt qu'avant.

## Avertir les joueurs

### Annonces avant l'arrêt (minutes)

Une annonce à chaque délai, du plus long au plus court. Par défaut pour un nouveau serveur : **30, 15, 10, 5, 4, 3, 2, 1**. **Ajouter** ouvre un champ pour un nouveau délai (1 à 120 minutes) ; la croix d'une puce la retire. Sans aucun délai, le serveur s'arrête sans prévenir.

Le monde est sauvegardé juste avant l'arrêt. Si le serveur démarre moins de 30 minutes avant un redémarrage, seules les annonces encore à venir sont envoyées.

### Message d'annonce

Texte envoyé à tous les joueurs. `{minutes}` est remplacé par chaque délai : `"Maintenance dans {minutes} min"` devient `"Maintenance dans 30 min"`, puis `"Maintenance dans 15 min"`…

Laissez le champ **vide** pour envoyer le message par défaut, dans la langue de Nexum (français ou anglais, réglée dans **Paramètres**) au moment de l'annonce (« Le serveur va redémarrer dans 1 minute » pour la dernière).

## Mises à jour du jeu

### Mettre à jour le jeu au moment du redémarrage

Désactivée par défaut, et active seulement avec le redémarrage planifié. Juste avant l'arrêt, Nexum vérifie si une mise à jour du serveur est disponible sur Steam :

- **Mise à jour disponible** : arrêt, [sauvegarde du monde](backups.fr.md#sauvegarde-avant-chaque-mise-à-jour), mise à jour avec SteamCMD, puis démarrage. Le résultat (build installé, nom de la sauvegarde) est écrit dans les logs de la nouvelle session.
- **Serveur à jour**, ou Steam ne répond pas : simple redémarrage.
- Si la sauvegarde ou la mise à jour échoue, le serveur redémarre sur la version déjà installée et les logs disent pourquoi.

### Vérifier les mises à jour pendant que le serveur tourne

Désactivée par défaut, et indépendante du redémarrage planifié. Nexum demande à Steam si une mise à jour du serveur est sortie toutes les **1, 2, 4, 6 ou 12 heures** (comptées depuis le démarrage du serveur). Quand il en trouve une :

1. Une ligne dans les logs du serveur donne le build installé et le nouveau.
2. Les joueurs sont prévenus pendant **Prévenir (minutes avant)** (10 par défaut) : une annonce à ce délai, puis à chaque délai plus court de la carte **Avertir les joueurs**. Le message par défaut dit qu'il s'agit d'une mise à jour du jeu.
3. Arrêt, sauvegarde du monde, mise à jour avec SteamCMD, puis démarrage.

Jeu à jour : rien n'est écrit dans les logs. Si un redémarrage planifié est déjà en cours d'annonce, la vérification attend la suivante. Si la sauvegarde ou la mise à jour échoue, le serveur redémarre sur la version installée et Nexum ne retente pas cette même mise à jour tant qu'il tourne (il réessaie pour un build plus récent, au redémarrage planifié si **Mettre à jour le jeu au moment du redémarrage** est coché, ou au prochain lancement de Nexum).

Les deux options gardent le serveur au niveau des patchs du jeu sans intervention : un serveur en retard d'une version refuse les joueurs qui ont mis leur jeu à jour. Sans effet pour un serveur installé via la **bibliothèque Steam** (c'est Steam qui le met à jour) ou si SteamCMD n'est pas installé. Les mods Valheim ne sont pas mis à jour automatiquement.

## Créatures sauvages (ARK)

Sur un serveur ARK: Survival Ascended, la page a une carte **Créatures sauvages**. Les deux options envoient la commande RCON `DestroyWildDinos` : les créatures sauvages disparaissent et réapparaissent selon les réglages actuels (utile après un changement de mods ou de niveaux des créatures). Les créatures apprivoisées ne sont pas touchées.

- **Renouveler les créatures sauvages après chaque démarrage** : après chaque démarrage (bouton, démarrage automatique, redémarrage, relance après un plantage). Nexum attend que RCON réponde (le serveur met 1 à 2 minutes à charger) et abandonne au bout de 15 minutes.
- **Et pendant que le serveur tourne, à intervalle régulier** : toutes les N heures (12 par défaut), comptées depuis le démarrage du serveur.

Le résultat est écrit dans les logs du serveur. RCON doit être activé.

## Comment ça fonctionne

Chaque serveur a sa propre planification : tous les serveurs lancés sont traités à leurs heures, qu'ils soient sélectionnés dans Nexum ou non.

1. Toutes les 30 secondes, Nexum cherche le prochain arrêt de chaque serveur lancé.
2. À l'heure de la première annonce, le compte à rebours commence : une annonce à chaque délai.
3. Au dernier délai, l'arrêt commence : dernière annonce, sauvegarde du monde, puis arrêt à la fin du délai.
4. Courte pause, puis le serveur redémarre.

Le compte à rebours est annulé si le serveur est arrêté ou relancé à la main entre-temps, ou si l'heure est retirée de la planification (une ligne dans les logs le dit).

## Prérequis

> ⚠️ **Palworld : l'API REST doit être activée** dans `PalWorldSettings.ini` (`RESTAPIEnabled=True`) pour les annonces et la sauvegarde. Si elle est désactivée, Nexum affiche un avertissement avec un bouton **Activer**. Sans elle, le serveur est arrêté à l'heure prévue via `taskkill /F`, sans annonce ni sauvegarde : vous risquez de perdre les données récentes.

**ARK: Survival Ascended** passe par RCON : Nexum envoie les annonces en jeu, sauvegarde le monde, puis arrête le serveur avec `DoExit` (le monde est de nouveau sauvegardé) et le relance. Sans RCON, le redémarrage l'arrête à l'heure prévue sans annonce ni sauvegarde (le jeu sauvegarde toutes les 15 minutes par défaut) ; la page **Planification** propose d'activer RCON.

**Valheim** n'a pas d'API : impossible de prévenir les joueurs en jeu, mais il s'arrête proprement à l'heure prévue : Nexum lui envoie CTRL+Pause et le serveur sauvegarde le monde avant de se fermer. Un arrêt forcé n'a lieu qu'en dernier recours, si le serveur ne répond pas.

**Enshrouded** n'a pas d'API non plus : impossible de prévenir les joueurs en jeu, mais il s'arrête proprement : Nexum lui envoie CTRL+Pause, le serveur sauvegarde le monde, puis redémarre.

**Astroneer** : Nexum n'utilise pas sa console d'administration, le redémarrage l'arrête donc à l'heure prévue, sans annonce en jeu ni sauvegarde préalable.

**RuneScape: Dragonwilds** n'a pas d'API et ne sait pas s'arrêter proprement sous Windows : le redémarrage l'arrête à l'heure prévue, sans annonce en jeu. Le serveur sauvegarde lui-même le monde toutes les 5 minutes : au plus les 5 dernières minutes sont perdues.

## Cas d'usage

### Redémarrage nocturne (recommandé)

```
Heures fixes : 04:00, tous les jours
Annonces : 30 15 10 5 4 3 2 1
Message : "Maintenance quotidienne dans {minutes} min"
```

### Deux redémarrages en semaine

```
Heures fixes : 06:00 et 18:00, du lundi au vendredi
Annonces : 15 5 1
```

### Serveur très fréquenté

```
Toutes les 6 heures à partir de 04:00
Vérifier les mises à jour pendant que le serveur tourne : toutes les 2 heures, prévenir 10 minutes avant
```

## Interaction avec les sauvegardes automatiques

Le redémarrage planifié et les sauvegardes automatiques sont **indépendants**. Vous pouvez activer les deux :

- Sauvegardes auto toutes les heures (filet de sécurité continu)
- Redémarrage planifié à 4h du matin (maintenance quotidienne)

> L'arrêt propre fait sa propre sauvegarde via l'API, indépendamment du scheduler de backups ZIP.

## Limitations actuelles

- Le mode « Toutes les X heures » tourne tous les jours (les jours de la semaine ne valent que pour les heures fixes)
- Pas de notification en cas d'échec du redémarrage (consulter les logs)
