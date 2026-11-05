# Réseau et firewall

🇬🇧 [English](network.md) | 🇫🇷 Français

Gestion des règles du firewall Windows pour autoriser les connexions au serveur.

## Pourquoi configurer le firewall ?

Par défaut, Windows bloque les connexions entrantes vers le serveur du jeu (`PalServer.exe`, `valheim_server.exe`…). Sans règle de firewall :

- Les joueurs **ne peuvent pas rejoindre** votre serveur depuis l'extérieur
- Sur Palworld, l'API REST et le RCON sont inaccessibles depuis le réseau local

Nexum crée des règles `netsh` ciblées pour les ports utilisés.

## Permissions

Nexum tourne sans droits administrateur. Quand vous ajoutez ou supprimez une règle, Windows vous demande une confirmation (UAC) : **une seule** par action, y compris pour **Tout appliquer**. Si vous refusez, rien n'est modifié.

> Les noms de règles personnalisées ne peuvent contenir que des lettres, chiffres, espaces et `- _ . ( ) :` (80 caractères max).

## Règles standard

Des règles pré-configurées correspondent aux ports Palworld (le port de jeu a une règle par protocole) :

| Règle        | Port (défaut) | Protocole | Usage                    |
| ------------ | ------------- | --------- | ------------------------ |
| **Game**     | 8211          | UDP + TCP | Connexions des joueurs   |
| **RCON**     | 25575         | TCP       | Console d'administration |
| **REST API** | 8212          | TCP       | API HTTP locale          |

Les ports sont lus depuis `PalWorldSettings.ini` (`PublicPort`, `RCONPort`, `RESTAPIPort`). Dans le pare-feu Windows, ces règles s'appellent `Palworld Server - Game UDP`, `Palworld Server - Game TCP`, `Palworld Server - RCON` et `Palworld Server - REST API`.

### Valheim

Deux règles UDP :

| Règle                      | Port (défaut) | Protocole | Usage                  |
| -------------------------- | ------------- | --------- | ---------------------- |
| **Valheim Server - Game**  | 2456          | UDP       | Connexions des joueurs |
| **Valheim Server - Query** | 2457          | UDP       | Requêtes Steam         |

Le port de jeu vient de **Configuration**, le port de requête vaut le port de jeu + 1. Après un changement de port, cliquez de nouveau sur **Tout appliquer**. Redirigez les ports affichés sur la carte **Rejoindre le serveur** sur votre box pour les joueurs hors de votre réseau.

### Astroneer

Une seule règle UDP :

| Règle                       | Port (défaut) | Protocole | Usage                  |
| --------------------------- | ------------- | --------- | ---------------------- |
| **Astroneer Server - Game** | 8777          | UDP       | Connexions des joueurs |

Le port vient de **Configuration** (`Engine.ini`). Après un changement de port, cliquez de nouveau sur **Tout appliquer**. Redirigez ce port sur votre box pour les joueurs hors de votre réseau. Le port de console (`ConsolePort`) n'a pas de règle : ne l'exposez jamais.

### RuneScape: Dragonwilds

Deux règles UDP, avec le port dans leur nom pour que plusieurs serveurs Dragonwilds sur le même PC aient chacun les leurs :

| Règle                                  | Port (défaut) | Protocole | Usage                  |
| -------------------------------------- | ------------- | --------- | ---------------------- |
| **Dragonwilds Server - Game (7777)**   | 7777          | UDP       | Connexions des joueurs |
| **Dragonwilds Server - Beacon (8888)** | 8888          | UDP       | Beacon                 |

Les ports viennent de **Configuration → Réseau**. Après un changement de port, supprimez l'ancienne règle (Pare-feu Windows) et appliquez la nouvelle. Redirigez les deux ports sur votre box pour les joueurs hors de votre réseau. Plus de détails dans [RuneScape: Dragonwilds](dragonwilds.fr.md).

### Enshrouded

Une seule règle UDP, avec le port dans son nom pour que plusieurs serveurs Enshrouded sur le même PC aient chacun la leur :

| Règle                                 | Port (défaut) | Protocole | Usage                  |
| ------------------------------------- | ------------- | --------- | ---------------------- |
| **Enshrouded Server - Query (15637)** | 15637         | UDP       | Connexions des joueurs |

Le port vient de **Configuration → Réseau**. Après un changement de port, supprimez l'ancienne règle (Pare-feu Windows) et appliquez la nouvelle. Redirigez ce port sur votre box pour les joueurs hors de votre réseau. Plus de détails dans [Enshrouded](enshrouded.fr.md).

## Actions disponibles

### Activer/désactiver une règle individuelle

Chaque règle a un bouton **Activer** / **Désactiver**. Activer crée la règle dans le firewall Windows ; désactiver la supprime.

### Tout appliquer / Tout supprimer

- **Tout appliquer** : crée toutes les règles standard du jeu d'un coup
- **Tout supprimer** : retire les règles standard du jeu (les règles personnalisées sont conservées)

### Règles personnalisées

Pour exposer d'autres ports (mods, services tiers) :

1. Entrez un **nom**, un **port** et choisissez le **protocole** (TCP ou UDP)
2. Cliquez sur **Créer**
3. La règle apparaît dans la liste avec un bouton de suppression

> Une règle personnalisée garde le nom que vous lui avez donné dans le pare-feu Windows, ce qui permet de la retrouver facilement.

## Exposer le serveur sur Internet

Le firewall Windows ne suffit pas — vous devez aussi :

1. **Configurer le port forwarding** sur votre routeur
   - Rediriger les ports UDP du jeu (affichés sur la carte **Rejoindre le serveur** du Dashboard ; `PublicPort` sur Palworld) vers l'IP locale de votre machine
   - Activer UPnP peut le faire automatiquement
2. **Connaître votre IP publique** : cliquez sur **Afficher mon IP publique** sur la carte **Rejoindre le serveur** du Dashboard
3. **Partager** : `IP_PUBLIQUE:8211` sur Palworld

> ⚠️ N'exposez **jamais** les ports RCON et REST API sur Internet. Ils sont conçus pour le LAN uniquement et leur exposition permettrait à n'importe qui de manipuler votre serveur.

## Vérification

Pour tester que les règles sont actives :

```powershell
netsh advfirewall firewall show rule name=all | findstr /C:"Server - "
```

Vous devriez voir les règles standard créées par Nexum (`<Jeu> Server - …`). Les règles personnalisées gardent le nom que vous leur avez donné.
