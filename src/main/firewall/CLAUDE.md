# Pare-feu et droits administrateur

- L'exe tourne **sans droits admin** (`requestedExecutionLevel: asInvoker`, `electron-builder.yml`) : SmartScreen + UAC à chaque lancement faisaient fuir les nouveaux utilisateurs. Seul le pare-feu (`netsh advfirewall`) en a besoin.
- `FirewallManager.runNetsh(cmds)` : déjà admin → exécution directe ; sinon **tout le lot** passe par un seul `Start-Process cmd.exe -Verb RunAs` (PowerShell `-EncodedCommand`, pour ne pas imbriquer les guillemets) → **une seule invite UAC** par action, « Tout appliquer » compris. La sortie d'un processus élevé n'est pas récupérable : `apply()` vérifie chaque règle avec `ruleExists()`. Codes `FW_ERROR` (`UAC_CANCELLED`, `INVALID_RULE`, `NOT_APPLIED`) traduits par `firewallErrorMessage()` côté renderer.
- ⚠️ **Injection** : les noms de règles finissent dans une commande exécutée en admin → `SAFE_NAME` (lettres, chiffres, espace, `- _ . ( ) :`, 80 max) + port entier 1-65535 + protocole TCP/UDP, validés avant toute commande. Ne jamais assouplir sans échapper pour cmd.exe.
- `netsh` répond dans la langue de Windows : ne jamais tester son texte de sortie, `ruleExists()` s'appuie sur le code de sortie.
- `electron-store` est ESM pur : `await import()` (exemple dans `FirewallManager.ts`).

## Règles

- Opérations groupées : IPC `firewall:applyNamedRules` / `firewall:removeNamedRules`. Ne jamais boucler sur `enableNamedRule` en parallèle (une invite UAC par appel).
- Une règle : `enableNamedRule` / `disableNamedRule` (nom exact), pour tous les jeux, Palworld compris (`games/palworld/services/firewallService.ts`). Il n'y a plus d'IPC par clé (`game` / `rcon`…) : retrouver la clé depuis le nom affiché échouait.
- ⚠️ `checkRule` ne vérifie que le **nom** : un changement de port sous le même nom passe inaperçu. D'où le port dans le nom des règles Dragonwilds et Enshrouded (plusieurs serveurs sur le même PC).
- Règles perso : liste dans le store `firewall`, fonctions pures dans `customRules.ts`. Import des réglages (`mergeImportedRules`) : une règle locale de même nom et protocole n'est jamais modifiée ; avec un autre port, celle du fichier est ignorée (ni enregistrée ni appliquée), sinon Windows ouvrait un port que la page Réseau n'affichait pas.
- Renderer : `components/firewall/useNamedRulesFirewall.ts` partagé (les hooks des jeux ne font que lister leurs règles). `useNamedRulesFirewall(rules, ready)` ne vérifie rien tant que `ready` est faux (sinon 1re vérification sur les ports par défaut).
