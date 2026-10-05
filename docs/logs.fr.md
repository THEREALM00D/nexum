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

### Tampon limité

Nexum garde les **500 dernières lignes** en mémoire. Au-delà, les anciennes lignes sont supprimées de l'affichage (mais pas de l'historique du processus).

## Actions

### Auto-scroll

L'affichage défile automatiquement vers le bas quand de nouvelles lignes arrivent. Cliquez et scrollez vers le haut pour interrompre l'auto-scroll, puis revenez en bas pour le réactiver.

### Copier / Enregistrer en .txt

Pour partager le log (Discord, issue GitHub) :

- **Copier** : copie **tout** le log (les 500 dernières lignes gardées par Nexum) dans le presse-papiers, précédé d'une ligne avec votre version de Nexum, le jeu et la date. Collez-le directement : sur Discord, un long texte collé devient automatiquement un fichier `message.txt`.
- **Enregistrer en .txt** : ouvre la fenêtre « Enregistrer sous » de Windows (dossier Documents par défaut). Une fois le fichier enregistré, le bouton **Afficher dans le dossier** ouvre l'Explorateur, prêt à joindre le fichier.

Tout le log est exporté, pas seulement les dernières lignes : quand un serveur s'arrête tout seul, la cause est généralement au **début** du log, les dernières lignes ne montrent que la fermeture.

> ⚠️ Avant de partager, vérifiez que le log ne contient pas d'adresse IP, d'identifiant Steam ni de code de connexion. Nexum masque déjà les mots de passe dans sa ligne `[Manager] Args:`.

### Effacer

Bouton **Effacer** : vide complètement la vue. N'arrête **pas** la capture des logs futurs.

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
