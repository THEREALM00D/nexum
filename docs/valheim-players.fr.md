# Suivi des joueurs Valheim (Odin-Eye)

🇬🇧 [English](valheim-players.md) | 🇫🇷 Français

Valheim n'a pas d'API REST native. Pour obtenir la page **Joueurs** (statut en ligne, temps de jeu, sessions) et un compteur de joueurs fiable sur le dashboard, ServerForge s'appuie sur le plugin BepInEx tiers [Odin-Eye](https://sparcopt.github.io/odin-eye/).

## 1. Installer Odin-Eye sur le serveur

Prérequis : BepInEx installé sur le serveur Valheim (5.4.22 recommandé).

1. Téléchargez la dernière release d'Odin-Eye et copiez tous les fichiers `.dll` dans `Valheim/BepInEx/plugins/`.
2. Démarrez le serveur une fois pour que le plugin génère `Valheim/BepInEx/config/org.bepinex.plugins.odineye.cfg`.
3. Éditez ce fichier et renseignez `HttpServerAddress`, par exemple :

   ```
   HttpServerAddress = http://127.0.0.1:21618/
   ```

   - Utilisez un port qui n'est **ni** le port de jeu (2456) **ni** le port de requête Steam (2457).
   - Utilisez `127.0.0.1` : le plugin n'a **aucune authentification**, n'exposez donc jamais ce port sur le réseau ou sur Internet.

4. Redémarrez le serveur et vérifiez que le log BepInEx contient `OdinEye running!`.

## 2. Configurer ServerForge

1. Ouvrez **Configuration → Réseau** pour votre serveur Valheim.
2. Renseignez **URL Odin-Eye** avec la même adresse, par exemple `http://127.0.0.1:21618`.
3. Cliquez sur **Sauvegarder** en bas de la page.

Laissez le champ vide pour désactiver le suivi des joueurs.

## 3. Ce que vous obtenez

- **Page Joueurs** : historique de tous les joueurs vus, avec statut en ligne, dernière connexion, temps de jeu total et nombre de sessions. Le suivi tourne toutes les 30 secondes **tant que le serveur est en cours d'exécution**.
- **Dashboard** : le compteur « Joueurs connectés » utilise Odin-Eye, avec ou sans crossplay. Sans Odin-Eye, le compteur ne peut être lu dans les logs de la console **que si le crossplay est activé** (Valheim n'écrit le nombre de joueurs que pour les sessions crossplay) ; sinon il affiche « — ». Il peut aussi rester faux pour un serveur déjà lancé avant ServerForge (ses logs sont perdus).

## Limitations

- Pas d'adresse IP des joueurs (le plugin ne la fournit pas) : la colonne « Dernière IP » reste vide.
- Les identifiants sont affichés en SteamID64 nu (le préfixe `Steam_` est retiré).
- Odin-Eye n'est ni installé ni mis à jour par ServerForge ; vous le gérez comme n'importe quel mod BepInEx.
