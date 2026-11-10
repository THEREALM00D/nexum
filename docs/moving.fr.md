# Changer de PC

🇬🇧 [English](moving.md) | 🇫🇷 Français

Emportez vos serveurs sur un nouveau PC sans les rajouter à la main. Nexum propose deux exports :

|                        | **Export des réglages** (page Paramètres)                                                      | **Export d'un serveur** (page Serveurs)                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Quoi                   | Tous les serveurs et leurs réglages Nexum, les réglages de l'app, les règles de pare-feu perso | Un serveur : ses réglages Nexum, son monde, les fichiers de config du jeu, ses mods |
| Fichier                | `nexum-settings-AAAA-MM-JJ.json` (quelques Ko)                                                 | `<nom>-AAAA-MM-JJ.nexum-server.zip` (la taille du monde)                            |
| Le serveur fonctionne… | une fois son dossier copié ou le jeu réinstallé, avec son monde                                | dès que le jeu est installé sur le nouveau PC                                       |

Aucun des deux fichiers ne contient le jeu lui-même, SteamCMD, les sauvegardes, les logs de session ni l'historique des joueurs.

## Export des réglages

**Paramètres → Changer de PC → Exporter les réglages.**

Le fichier contient :

- la liste des serveurs et, pour chacun : les réglages de lancement (page Configuration), les réglages de sauvegarde, le redémarrage planifié, le démarrage et la relance automatiques ;
- les réglages de l'app : langue, zone de notification, versions bêta, lancement au démarrage de Windows ;
- vos règles de pare-feu perso (page Réseau).

Les réglages enregistrés dans les fichiers du jeu (`PalWorldSettings.ini`, fichiers INI d'Astroneer, `DedicatedServer.ini`, `enshrouded_server.json`) sont dans le dossier du serveur : ils suivent si vous copiez ce dossier, ou avec l'export d'un serveur.

### Import

**Paramètres → Changer de PC → Importer des réglages**, puis choisissez le fichier. Rien n'est écrit avant votre confirmation.

- Cochez les serveurs à importer. Les dossiers de l'ancien PC n'existent souvent pas sur le nouveau : changez le **dossier du serveur**, et le **dossier des sauvegardes** et le **dossier des données du jeu** Valheim s'ils étaient renseignés.
- **Jeu absent de ce dossier** : le serveur est importé quand même ; installez le jeu depuis la page **Installation**.
- **Déjà présent** : un serveur de Nexum utilise déjà ce dossier. Chaque import ajoute de nouveaux serveurs, il ne remplace jamais un serveur existant.
- **Réglages de l'app** : langue, zone de notification, versions bêta, lancement au démarrage de Windows.
- **Règles de pare-feu perso** : ajoutées à la liste de la page Réseau. Cochez **Les créer aussi dans le pare-feu de Windows** pour les créer tout de suite (Windows demande une autorisation, une seule fois) ; sinon créez-les depuis la page Réseau. Une règle de même nom et protocole qu'une règle déjà présente sur ce PC, mais avec un autre port, est écartée : la règle de ce PC est gardée.

## Export d'un serveur (« déplacer un serveur »)

Page **Serveurs**, menu **⋯** du serveur → **Exporter pour un autre PC**. Le serveur doit être arrêté : son monde ne doit pas changer pendant la copie.

Le ZIP contient :

- les réglages Nexum du serveur ;
- son monde (dossier de sauvegarde du jeu). Pour Valheim, seulement le monde du serveur : ni les autres mondes du même dossier, ni les sauvegardes automatiques de Valheim ;
- les fichiers de config du jeu : `PalWorldSettings.ini` et `GameUserSettings.ini` (Palworld, ce dernier dit au serveur quel monde charger), `AstroServerSettings.ini` et `Engine.ini` (Astroneer), `DedicatedServer.ini` (RuneScape: Dragonwilds), `enshrouded_server.json` (Enshrouded), les listes d'admins / bannis / autorisés et les réglages des mods (`BepInEx/config`) pour Valheim ;
- pour Valheim, la liste des mods installés depuis Thunderstore ou Hexium (les mods installés à la main n'y sont pas).

### Import

**Serveurs → Importer un serveur**, puis choisissez le ZIP.

1. Vérifiez le nom et les dossiers (dossier du serveur, et dossier des données du jeu Valheim s'il était renseigné).
2. Si un monde du même nom est déjà dans le dossier des mondes, Nexum ne l'écrase pas, sauf si vous cochez **Remplacer le monde déjà présent**.
3. Les fichiers de config du jeu déjà présents sont listés dans le dialogue avant l'import, et gardés à côté des nouveaux en copie `.backup`.
4. Si un serveur lancé utilise ces dossiers (même dossier du serveur, ou pour Valheim même dossier des données du jeu), l'import est refusé : arrêtez ce serveur ou choisissez d'autres dossiers.
5. Si un fichier ne peut pas être écrit (dossier sans droit d'écriture, lecteur absent), l'import s'arrête et aucun serveur n'est ajouté : corrigez le dossier et relancez l'import.

Ordre conseillé sur le nouveau PC : importer le serveur, installer le jeu depuis la page **Installation**, puis (Valheim) ouvrir la page **Mods** et cliquer sur **Réinstaller** dans le bandeau « mods à réinstaller ». Nexum installe BepInEx si besoin (les réglages des mods importés, dans `BepInEx/config`, sont gardés), puis chaque mod depuis son registre ; les mods désactivés restent désactivés. Un mod en échec reste dans la liste pour un nouvel essai, ou cliquez sur **Ignorer**.

## Mots de passe

Par défaut, les mots de passe enregistrés par Nexum (mot de passe du serveur Valheim, mot de passe admin Dragonwilds) ne sont **pas** exportés : ressaisissez-les dans la page Configuration du serveur après l'import. Cochez **Inclure les mots de passe** pour les exporter : le fichier les contient alors en clair, ne le partagez pas et supprimez-le après l'import.

Les fichiers de config du jeu d'un export de serveur sont copiés tels quels, avec les mots de passe qu'ils contiennent (mot de passe admin Palworld, mots de passe des groupes Enshrouded…).
