import type { LogNoiseRules } from "../../logs/logNoise";

/**
 * Sortie d'enshrouded_server.exe (vérifiée sur le serveur 1.0.0.0, build
 * 26430253) : environ 200 lignes techniques au démarrage pour 5 utiles, puis
 * un bloc « Session » de 4 lignes toutes les 30 s (≈ 480 lignes par heure),
 * et ~370 lignes de statistiques à l'arrêt pour une vingtaine d'utiles.
 * Masqué à l'écran seulement, le fichier de session et l'export restent bruts.
 */
export const ENSHROUDED_LOG_NOISE: LogNoiseRules = {
  lines: [
    /^(Get|Set)TimerResolution /,
    /^\[os\] (Started thread|Enabled bypass io for file|Using )/,
    /^Using IoRing for async io/,
    /^\[task\] /,
    /^\[app\] start (creation|destruction) step /,
    /^\[guid_registry\] : Finished loading entry /,
    // Tableaux de statistiques réseau écrits à l'arrêt (en minuscules ; les
    // lignes « [Session] » d'état, elles, sont utiles)
    /^\[session\]( |$)/,
  ],
  blocks: [
    // Bloc répété toutes les 30 s : une ligne « m#N » par machine connectée
    {
      start: /^-+ Session -+$/,
      end: /^-{20,}$/,
      maxLines: 40,
    },
    // Logo en ASCII, entre deux lignes de tirets
    { start: /^-{60,}$/, end: /^-{60,}$/, maxLines: 20 },
    // Histogrammes écrits à l'arrêt : titre, ligne de « = », lignes indentées
    {
      start: /^Histogram: /,
      body: /^(={10,}$|\s+\S)/,
      maxLines: 500,
    },
    // Description du processeur et tableau des cœurs (lignes indentées)
    {
      start: /^(CpuInfo|CPUs|CPU Types):$/,
      body: /^\s+\S/,
      maxLines: 300,
    },
  ],
  // Écrits sur stderr, normaux pour un serveur dédié (aucun client Steam
  // connecté) : pas des erreurs.
  benignStderr: [
    /^Setting breakpad minidump AppID/,
    /^SteamInternal_SetMinidumpSteamID/,
    /^\[steam\] Could not find MatchmakingServers interface/,
    /^\[user\] Couldn't retrieve steam (friends|user) interface/,
    /^\[ecss\] Could not find component \w+ when loading template Benchmark/,
  ],
};
