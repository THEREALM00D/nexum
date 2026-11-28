# Passer un serveur ARK existant à Nexum

🇬🇧 [English](ark-import.md) | 🇫🇷 Français

Vous hébergez déjà un serveur ARK: Survival Ascended avec un autre outil ou un fichier `.bat` ? Nexum le reprend sur place : même dossier, même monde, mêmes joueurs et tribus, mêmes mods et réglages. Rien n'est copié ni déplacé.

## Avant de commencer

- **Arrêtez le serveur dans l'ancien outil** et coupez son redémarrage automatique : deux programmes ne doivent pas lancer le même serveur.
- Gardez l'ancien outil installé jusqu'à ce que le serveur tourne bien dans Nexum.
- La première mise à jour depuis Nexum peut être plus longue si l'ancien outil a laissé une ancienne version du jeu : voir [Mise à jour du serveur](installation.fr.md#mise-à-jour-du-serveur).

## Ajouter le serveur

Passez par **Serveurs → Ajouter un serveur** (ou l'assistant, **J'ai déjà un serveur**) et choisissez le dossier du serveur, celui qui contient `ShooterGame`. Nexum reconnaît ARK et affiche **Reprendre la ligne de lancement**.

Les fichiers du dossier restent tels quels : `GameUserSettings.ini`, `Game.ini`, sections des mods et fichiers que les mods écrivent sous `ShooterGame\Saved`, mondes de `SavedArks`, et mods déjà téléchargés (le premier démarrage ne les télécharge pas à nouveau).

Ce qui n'existe que sur la **ligne de lancement** de l'ancien outil (carte, ports, mods, options) doit être repris. Nexum la trouve tout seul :

- **Log du serveur** : le serveur écrit sa ligne de lancement complète dans `ShooterGame\Saved\Logs\ShooterGame.log` à chaque démarrage. Nexum lit le log le plus récent qui en contient une, en passant les lignes avec lesquelles Nexum lui-même a démarré le serveur. Rien à faire.
- **Coller** : collez la ligne vous-même (copiée depuis l'ancien outil).
- **Fichier .bat** : choisissez le fichier `.bat` ou `.cmd` qui lance le serveur.

Vous pouvez modifier la ligne avant d'enregistrer.

## Ce qui est repris

Le résumé montre ce que Nexum utilisera :

| Sur la ligne de lancement                                   | Dans Nexum                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| Carte (`TheIsland_WP`, carte moddée…)                       | **Configuration → Général**, Carte                                     |
| `?Port=` ou `-port=`, `?QueryPort=`, `?RCONPort=`           | **Configuration → Général**, Réseau (`?Port` l'emporte sur `-port`)    |
| `-WinLiveMaxPlayers=`, `-NoBattlEye`                        | **Configuration → Général**                                            |
| `-mods=`                                                    | Page **Mods**, dans le même ordre                                      |
| `-passivemods=`                                             | Page **Mods**, en mods passifs (actifs s'ils sont aussi dans `-mods=`) |
| `-clusterid=`, `-ClusterDirOverride=`, `-ServerPlatform=`…  | **Configuration → Réglages de jeu**, options de lancement              |
| `?SessionName=`, `?ServerAdminPassword=` et autres clés `?` | Écrits dans `GameUserSettings.ini`, comme le fait le serveur           |
| Tout le reste (`-servergamelogincludetribelogs`…)           | **Configuration → Général**, arguments supplémentaires                 |

Le port RCON et le nombre de joueurs viennent de `GameUserSettings.ini` quand la ligne ne les donne pas.

**Monde** : Nexum cherche le monde de la carte dans `SavedArks` et dans chaque dossier `AltSaveDirectoryName`, et choisit le plus récent. S'il en trouve plusieurs, choisissez dans le résumé : le `?AltSaveDirectoryName=` de la ligne ne décide pas, car un ancien outil a pu le laisser alors que le monde était enregistré ailleurs. Le dossier choisi est gardé dans le champ **Dossier du monde** de l'onglet Général.

Le résumé liste aussi les réglages des mods gardés en place : sections des mods dans les INI et fichiers que les mods écrivent dans `ShooterGame\Saved\SaveGames`. Ensuite, chaque section de mod est un groupe **Mod : [Section]** dans **Configuration → Réglages de jeu**, où vous pouvez changer ses réglages ([page ARK](ark.fr.md#réglages-de-jeu)). Les fichiers de `SaveGames` sont écrits par les mods eux-mêmes : ils continuent de fonctionner, mais Nexum ne les modifie pas.

## Ce que Nexum signale

- **Ports déjà utilisés** par un autre serveur de Nexum, lancé ou non. Deux serveurs d'un cluster partagent souvent le port de requête par défaut (27015) : donnez-en un à chacun avant de les lancer ensemble.
- Les options que Nexum ne peut pas reprendre telles quelles : une valeur avec des espaces (par exemple le chemin d'un dossier de cluster avec des espaces), une valeur invalide, `-MULTIHOME` (gardé, mais RCON peut ne plus répondre).
- **Plugins ServerAPI** (`AsaApiLoader.exe`) : Nexum lance `ArkAscendedServer.exe` directement, ces plugins ne sont donc pas chargés.
- Variables de script (`%NOM%`) dans une ligne de `.bat` : remplacez-les par leur valeur dans la ligne.
- **Aucun monde trouvé** : le serveur créera un nouveau monde à son premier démarrage. Vérifiez la carte et le dossier.

## Serveur déjà ajouté

Pour un serveur ARK ajouté avant cette fonction, ou pour reprendre une nouvelle ligne : **Configuration → Général → Reprendre une ligne de lancement**. La carte, les ports, les mods, les options de lancement et les arguments supplémentaires du serveur sont remplacés.
