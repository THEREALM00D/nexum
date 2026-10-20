# Suivi des joueurs Valheim (Odin-Eye)

🇬🇧 [English](valheim-players.md) | 🇫🇷 Français

Valheim n'a pas d'API REST native. Pour obtenir la page **Joueurs** (statut en ligne, temps de jeu, sessions) et un compteur de joueurs fiable sur le dashboard, Nexum s'appuie sur le plugin BepInEx tiers [Odin-Eye](https://sparcopt.github.io/odin-eye/).

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

## 2. Configurer Nexum

1. Ouvrez **Configuration → Réseau** pour votre serveur Valheim.
2. Renseignez **URL Odin-Eye** avec la même adresse, par exemple `http://127.0.0.1:21618`.
3. Serveur lancé, cliquez sur **Tester** à côté du champ : Nexum interroge le plugin et affiche le nombre de joueurs en ligne, ou ce qui ne va pas.
4. Cliquez sur **Sauvegarder** en bas de la page.

Laissez le champ vide pour désactiver le suivi des joueurs.

## 3. Ce que vous obtenez

- **Page Joueurs** : historique de tous les joueurs vus, avec statut en ligne, dernière connexion, temps de jeu total et nombre de sessions. Le suivi tourne toutes les 30 secondes **tant que le serveur est en cours d'exécution**.
- **Dashboard** : le compteur « Joueurs connectés » utilise Odin-Eye, avec ou sans crossplay. Sans Odin-Eye, le compteur ne peut être lu dans les logs de la console **que si le crossplay est activé** (Valheim n'écrit le nombre de joueurs que pour les sessions crossplay) ; sinon il affiche « — ». Il peut aussi rester faux pour un serveur déjà lancé avant Nexum (ses logs sont perdus).

Le bandeau du **Dashboard** indique l'état du suivi : désactivé (pas d'adresse), en attente du démarrage du serveur, en attente du plugin (il ne démarre qu'une fois le monde chargé, ce qui peut prendre une ou deux minutes), connecté, ou sans réponse avec la raison. « Ne répond pas » n'apparaît que si le plugin ne répond toujours pas 3 minutes après le démarrage du serveur.

## Dépannage

Si **Tester** ou le Dashboard indique qu'Odin-Eye ne répond pas :

- **« Rien ne répond à… »** : le plugin n'écoute pas à cette adresse.
  - Odin-Eye tourne dans le serveur Valheim : le serveur doit être lancé, et son monde chargé (le plugin démarre quelques secondes après le serveur).
  - Ouvrez le log BepInEx (`Valheim/BepInEx/LogOutput.log`) et cherchez `OdinEye running!`. S'il manque, le plugin ne s'est pas chargé : vérifiez que BepInEx fonctionne et que tous les `.dll` d'Odin-Eye sont dans `BepInEx/plugins/`. Si vous voyez `Starting Http Server at …` suivi d'une erreur, l'adresse de `HttpServerAddress` est invalide ou son port est déjà pris.
  - L'adresse dans Nexum doit correspondre exactement à `HttpServerAddress` (même port). Le fichier `.cfg` n'est lu qu'au démarrage du serveur : redémarrez-le après l'avoir modifié.
- **« Quelque chose répond à…, mais ce n'est pas l'API joueurs d'Odin-Eye »** : un autre programme utilise ce port, ou la version du plugin n'expose pas la liste des joueurs. Choisissez un autre port aux deux endroits.
- **« Adresse Odin-Eye invalide »** : utilisez la forme `http://127.0.0.1:21618`.

## Limitations

- Pas d'adresse IP des joueurs (le plugin ne la fournit pas) : la colonne « Dernière IP » reste vide.
- Les identifiants sont affichés en SteamID64 nu (le préfixe `Steam_` est retiré).
- Odin-Eye n'est ni installé ni mis à jour par Nexum ; vous le gérez comme n'importe quel mod BepInEx.
