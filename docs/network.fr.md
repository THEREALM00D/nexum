# Réseau et firewall

🇬🇧 [English](network.md) | 🇫🇷 Français

Gestion des règles du firewall Windows pour autoriser les connexions au serveur.

## Pourquoi configurer le firewall ?

Par défaut, Windows bloque les connexions entrantes vers `PalServer.exe`. Sans règle de firewall :

- Les joueurs **ne peuvent pas rejoindre** votre serveur depuis l'extérieur
- L'API REST et le RCON sont inaccessibles depuis le réseau local

Nexum crée des règles `netsh` ciblées pour les ports utilisés.

## Permissions

Nexum tourne sans droits administrateur. Quand vous ajoutez ou supprimez une règle, Windows vous demande une confirmation (UAC) : **une seule** par action, y compris pour **Tout appliquer**. Si vous refusez, rien n'est modifié.

> Les noms de règles personnalisées ne peuvent contenir que des lettres, chiffres, espaces et `- _ . ( ) :` (80 caractères max).

## Règles standard

Trois règles pré-configurées correspondent aux ports Palworld :

| Règle        | Port (défaut) | Protocole | Usage                    |
| ------------ | ------------- | --------- | ------------------------ |
| **Game**     | 8211          | UDP + TCP | Connexions des joueurs   |
| **RCON**     | 25575         | TCP       | Console d'administration |
| **REST API** | 8212          | TCP       | API HTTP locale          |

Les ports sont lus depuis `PalWorldSettings.ini` (`PublicPort`, `RCONPort`, `RESTAPIPort`).

## Actions disponibles

### Activer/désactiver une règle individuelle

Chaque règle a un toggle. Activer crée la règle dans le firewall Windows ; désactiver la supprime.

### Tout activer / Tout supprimer

- **Tout activer** : crée les 3 règles standard d'un coup
- **Tout supprimer** : retire toutes les règles Nexum (standard + custom)

### Règles personnalisées

Pour exposer d'autres ports (mods, services tiers) :

1. Entrez un **nom**, un **port** et choisissez le **protocole** (TCP ou UDP)
2. Cliquez sur **Créer**
3. La règle apparaît dans la liste avec un bouton de suppression

> Les règles custom sont préfixées par `Nexum - ` dans `netsh advfirewall` pour faciliter l'identification.

## Exposer le serveur sur Internet

Le firewall Windows ne suffit pas — vous devez aussi :

1. **Configurer le port forwarding** sur votre routeur
   - Rediriger `PublicPort` (UDP) vers l'IP locale de votre machine
   - Activer UPnP peut le faire automatiquement
2. **Connaître votre IP publique** ([whatismyipaddress.com](https://whatismyipaddress.com))
3. **Partager** : `IP_PUBLIQUE:8211`

> ⚠️ N'exposez **jamais** les ports RCON et REST API sur Internet. Ils sont conçus pour le LAN uniquement et leur exposition permettrait à n'importe qui de manipuler votre serveur.

## Vérification

Pour tester que les règles sont actives :

```powershell
netsh advfirewall firewall show rule name=all | findstr "Nexum"
```

Vous devriez voir les règles créées par l'application.
