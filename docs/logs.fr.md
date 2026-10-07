# Logs

🇬🇧 [English](logs.md) | 🇫🇷 Français

Affichage en temps réel des sorties du processus `PalServer.exe` et des messages internes de Nexum.

## Source des logs

Trois sources sont fusionnées dans la même vue :

| Préfixe     | Origine                                                  |
| ----------- | -------------------------------------------------------- |
| `[Manager]` | Messages internes de Nexum (démarrage, arrêt, API, etc.) |
| `[ERR]`     | Sortie d'erreur (stderr) du processus serveur            |
| _(aucun)_   | Sortie standard (stdout) du processus serveur            |

## Couleurs

- **Rouge** : lignes commençant par `[ERR]`
- **Bleu** : lignes commençant par `[Manager]`
- **Gris** : reste (sortie standard du serveur)

## Limitations à connaître

### PalServer.exe est silencieux

Contrairement à beaucoup de serveurs de jeu, **PalServer.exe écrit très peu sur stdout/stderr**. La majorité des logs Palworld sont écrits dans des fichiers internes :

```
{serverPath}/Pal/Saved/Logs/
```

Pour les logs détaillés du serveur (connexions joueurs, erreurs Unreal Engine, etc.), consultez ces fichiers directement.

### Affichage à l'écran

La vue en direct montre les **500 dernières lignes** de la session en cours. La session complète est dans son fichier (voir plus bas).

### Serveurs démarrés avant Nexum

Si un serveur tournait déjà à l'ouverture de Nexum (Nexum l'« adopte »), sa sortie n'est pas récupérable : seules les lignes `[Manager]` de Nexum sont affichées et enregistrées pour cette session. Redémarrez le serveur depuis Nexum pour retrouver son log complet.

### Champ « Fichier de log » de Valheim

Dans **Configuration → Avancé** de Valheim, laissez **Fichier de log** vide. S'il est rempli, Valheim écrit sa sortie dans ce fichier au lieu de l'envoyer à Nexum : la page Logs, la console du Dashboard et les sessions enregistrées restent vides.

## Sessions (logs conservés sur le disque)

Chaque démarrage du serveur ouvre une **nouvelle session** : la vue repart de zéro, et tout est aussi écrit dans un fichier qui survit à la fermeture de Nexum. Un redémarrage manuel, le redémarrage planifié et la relance automatique après un crash ouvrent chacun une nouvelle session.

- **Sélecteur de session** (à côté des boutons) : **Session en cours (direct)**, ou n'importe quelle session précédente pour la relire. Les sessions marquées ⚠ **plantée** sont celles où le serveur s'est arrêté seul avec une erreur : c'est le fichier à partager dans un rapport de bug.
- **Bouton dossier** : ouvre le dossier des fichiers de log, `%APPDATA%\Nexum\servers\<id du serveur>\logs\` (`%APPDATA%\server-forge\…` pour les installations d'origine ServerForge).
- Chaque ligne du fichier commence par l'heure, ex. `[14:32:07]`.
- Nexum garde les **20 dernières sessions** par serveur et supprime les plus anciennes. Un fichier de session s'arrête à **20 Mo** (une note l'indique), pour qu'un serveur bloqué dans une boucle d'erreurs ne remplisse pas le disque.
- Les fichiers gardent le log brut (IP, identifiants Steam) : ils restent sur votre PC. Les données personnelles ne sont masquées que quand vous utilisez **Copier** ou **Enregistrer en .txt** (voir plus bas).

## Actions

### Auto-scroll

L'affichage défile automatiquement vers le bas quand de nouvelles lignes arrivent. Cliquez et scrollez vers le haut pour interrompre l'auto-scroll, puis revenez en bas pour le réactiver.

### Copier / Enregistrer en .txt

Pour partager le log (Discord, issue GitHub) :

- **Copier** : copie **tout** le log de la session choisie (le fichier complet, pas seulement les 500 lignes à l'écran) dans le presse-papiers, précédé d'une ligne avec votre version de Nexum, le jeu et la date. Collez-le directement : sur Discord, un long texte collé devient automatiquement un fichier `message.txt`.
- **Enregistrer en .txt** : ouvre la fenêtre « Enregistrer sous » de Windows (dossier Documents par défaut). Une fois le fichier enregistré, le bouton **Afficher dans le dossier** ouvre l'Explorateur, prêt à joindre le fichier.

Tout le log est exporté, pas seulement les dernières lignes : quand un serveur s'arrête tout seul, la cause est généralement au **début** du log, les dernières lignes ne montrent que la fermeture.

**Les données personnelles sont masquées automatiquement** dans le log copié ou enregistré (pas dans l'affichage à l'écran) :

| Donnée                                              | Devient                                        |
| --------------------------------------------------- | ---------------------------------------------- |
| Adresses IP publiques                               | `[IP]` (le port est conservé, ex. `[IP]:2456`) |
| Identifiants Steam (de chaque joueur déjà connecté) | `[SteamID]`                                    |
| Codes de connexion crossplay Valheim                | `join code [hidden]`                           |
| Mot de passe du serveur (ligne `[Manager] Args:`)   | `[hidden]`                                     |

Les adresses locales (`127.0.0.1`, `0.0.0.0`, `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) sont conservées : elles n'identifient personne et aident à diagnostiquer les problèmes réseau. **Les noms des joueurs sont conservés** : retirez-les vous-même au besoin. Un numéro de version en 4 parties (ex. `1.0.0.0`) peut ressembler à une adresse IP et être masqué aussi.

### Effacer

Bouton **Effacer** : vide la vue en direct. Ne supprime **pas** le fichier de la session et n'arrête **pas** la capture des logs futurs. Désactivé quand vous relisez une session précédente.

## Ce qu'on voit typiquement

### Au démarrage

```
[Manager] Starting Palworld server...
[Manager] Processus démarré.
LogPalNetServer: Server starting on port 8211
LogWorld: Bringing World up for play
```

### En cours de fonctionnement

Très peu de sortie tant qu'il n'y a pas de connexion ou d'erreur.

### À l'arrêt gracieux (avec API)

```
[Manager] Annonce envoyée: Le serveur va redémarrer...
[Manager] Sauvegarde en cours...
[Manager] Sauvegarde terminée.
[Manager] Shutdown API envoyé (attente 0s).
[Manager] Server exited with code 0
```

### À l'arrêt forcé (sans API)

```
[Manager] API indisponible: Timeout
[Manager] Server exited with code 1
```

## Diagnostic

Pour analyser un crash ou un comportement inattendu :

1. **Logs Nexum** : recherchez `[ERR]` ou `[Manager]` dans la vue
2. **Logs Palworld** : ouvrez le dernier fichier dans `{serverPath}/Pal/Saved/Logs/`
3. **Event Viewer Windows** : Application → Erreurs liées à `PalServer.exe`

Pour signaler un bug à l'équipe Palworld, joindre les fichiers de `Pal/Saved/Logs/` est plus utile que le log de Nexum.
