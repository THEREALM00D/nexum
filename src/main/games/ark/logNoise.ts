import type { LogNoiseRules } from "../../logs/logNoise";

// Tout ce que le serveur écrit sur stderr (vérifié, build 26749470) : le
// débogage du SDK GameAnalytics, ~20 lignes par minute, et les messages
// Steam d'un serveur dédié sans compte connecté. Jamais une erreur.
const GAME_ANALYTICS = /[DWIE] (Debug|Warning|Info|Error)\/GameAnalytics : /;
// Une ligne par morceau écrit pendant le téléchargement d'un mod (des
// centaines pour une liste de mods), sans rien d'utile. Dans ShooterGame.log.
const CFCORE_WRITE_BUFFER = /LogCFCore: Warning: WriteBufferWithThrottling/;

export const ARK_LOG_NOISE: LogNoiseRules = {
  lines: [GAME_ANALYTICS, CFCORE_WRITE_BUFFER],
  blocks: [],
  benignStderr: [
    GAME_ANALYTICS,
    /^Setting breakpad minidump AppID/,
    /^SteamInternal_SetMinidumpSteamID/,
    /cminterface\.cpp \(\d+\) : !BLoggedOn\(\)/,
  ],
};
