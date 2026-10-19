// Masque les données personnelles d'un log avant export (Copier / Enregistrer).
// Beaucoup d'utilisateurs partagent le fichier tel quel : un log Valheim
// contient l'IP publique du serveur plusieurs fois et le SteamID de chaque
// joueur déjà connecté. Les marqueurs sont entre crochets plutôt qu'en `***`,
// que Discord interprète comme du gras/italique.

const IPV4 =
  /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
// SteamID64 : 17 chiffres commençant par 7656119 (aussi dans `steam_7656…`).
const STEAM_ID = /7656119\d{10}(?!\d)/g;
// Code de connexion crossplay Valheim (`with join code 123456`, `that has join code 123456`).
const JOIN_CODE = /(join code )([A-Za-z0-9]+)/gi;
// Identifiants de 32 caractères hexadécimaux : EOS ID des joueurs et du
// propriétaire (Dragonwilds), GUID des mondes et des sessions.
const HEX_ID = /\b[0-9a-f]{32}\b/gi;
// Dragonwilds écrit le mot de passe du monde en clair
// (`Dedicated Server WorldPassword: x`, `Password[x]`), en base64 dans le
// paramètre `?p=` des demandes de connexion (`Login request: ?p=…` puis
// `Join request: /Game/Maps/…?p=…`, d'où un motif sans préfixe), son
// empreinte et le code de connexion dans les réglages de session.
const DRAGONWILDS_SECRETS: RegExp[] = [
  /(WorldPassword: )(\S+)/g,
  /(\bPassword\[)([^\]]+)/g,
  /(\?p=)([^?\s]+)/g,
  /(\["(?:JoinCode|PasswordHash)"\] written with key\[\w+\] value\[)([^\]]+)/g,
];

/**
 * Adresses gardées : boucle locale, « toutes interfaces » et réseaux privés
 * (192.168.x.x, 10.x.x.x, 172.16-31.x.x) n'identifient personne et aident au
 * diagnostic (serveur lié à la bonne interface, test en LAN).
 */
function isHarmlessIp(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 127 ||
    a === 10 ||
    ip === "0.0.0.0" ||
    (a === 192 && b === 168) ||
    (a === 172 && b >= 16 && b <= 31)
  );
}

export function redactLog(text: string): string {
  const masked = text
    .replace(IPV4, (ip) => (isHarmlessIp(ip) ? ip : "[IP]"))
    .replace(STEAM_ID, "[SteamID]")
    .replace(JOIN_CODE, "$1[hidden]")
    .replace(HEX_ID, "[ID]");
  return DRAGONWILDS_SECRETS.reduce(
    (out, re) => out.replace(re, "$1[hidden]"),
    masked,
  );
}
