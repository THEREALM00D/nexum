# Configuration du serveur

🇬🇧 [English](configuration.md) | 🇫🇷 Français

Éditeur graphique du fichier `PalWorldSettings.ini`.

## Fichier source

```
{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini
```

Nexum lit ce fichier au chargement de la page **Configuration** et écrit les modifications quand vous cliquez sur **Enregistrer**.

> ⚠️ Le serveur doit être **redémarré** pour que les changements prennent effet.

## Presets de difficulté

Trois presets prédéfinis modifient une vingtaine de paramètres en un clic :

### Casual

- XP, capture et drop ×2 à ×3
- Dégâts subis très réduits
- Régénération rapide
- Pas de pénalité de mort
- Pas d'invasions

### Normal

- Tous les paramètres aux valeurs par défaut Palworld

### Hard

- XP et capture réduits (×0.8)
- Dégâts subis augmentés
- Pénalité de mort active
- Invasions activées

## Paramètres principaux

### Serveur

| Paramètre            | Description                                     |
| -------------------- | ----------------------------------------------- |
| `ServerName`         | Nom affiché dans la liste des serveurs          |
| `ServerDescription`  | Description courte                              |
| `AdminPassword`      | Mot de passe admin (requis pour l'API REST)     |
| `ServerPassword`     | Mot de passe d'accès au serveur (vide = public) |
| `ServerPlayerMaxNum` | Nombre maximal de joueurs (défaut 32)           |
| `PublicPort`         | Port d'écoute du jeu (défaut 8211, UDP)         |
| `Region`             | Région d'hébergement                            |

### API REST

| Paramètre        | Description                                      |
| ---------------- | ------------------------------------------------ |
| `RESTAPIEnabled` | Active l'API REST locale (recommandé pour Nexum) |
| `RESTAPIPort`    | Port HTTP de l'API (défaut 8212)                 |

> **Important** : avec l'API REST activée, Nexum peut afficher les joueurs, gérer kick/ban, et arrêter proprement le serveur avec sauvegarde.

### RCON

| Paramètre     | Description              |
| ------------- | ------------------------ |
| `RCONEnabled` | Active le protocole RCON |
| `RCONPort`    | Port RCON (défaut 25575) |

### Gameplay (extraits)

| Paramètre                | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `Difficulty`             | Difficulté globale (None / Easy / Normal / Hard)          |
| `DayTimeSpeedRate`       | Vitesse du jour                                           |
| `NightTimeSpeedRate`     | Vitesse de la nuit                                        |
| `ExpRate`                | Multiplicateur d'XP                                       |
| `PalCaptureRate`         | Taux de capture des Pals                                  |
| `DeathPenalty`           | Pénalité à la mort (None / Item / ItemAndEquipment / All) |
| `bIsPvP`                 | Active le PvP                                             |
| `bEnableInvaderEnemy`    | Active les raids/invasions                                |
| `bEnableFriendlyFire`    | Tir allié                                                 |
| `bEnableNonLoginPenalty` | Décompte du temps offline pour les bases                  |

> Plus de **170 paramètres** sont accessibles dans l'éditeur. Voir la [doc officielle Palworld](https://docs.palworldgame.com) pour la liste complète.

## Sauvegarde de la configuration

Le bouton **Enregistrer** :

1. Écrit toutes les valeurs modifiées dans `PalWorldSettings.ini`
2. Préserve la structure et la section `[/Script/Pal.PalGameWorldSettings]`
3. Affiche une notification de succès ou d'erreur

> Si le serveur est en cours, **redémarrez-le** depuis le Dashboard pour appliquer les changements.

## Conseils

- **Activez RESTAPI** dès le départ pour profiter de toutes les fonctionnalités de Nexum
- Définissez un **mot de passe admin fort** : il sert à l'API REST et au RCON
- **Sauvegardez votre INI** avant de tester un preset (le bouton de preset écrase les valeurs concernées)
