// Sections des INI d'ARK que le jeu n'écrit pas lui-même : celles des mods
// (ou d'une carte : [Ragnarok]). Sans casse, comme le jeu.
const GAME_SECTIONS = new Set([
  "serversettings",
  "sessionsettings",
  "scalabilitygroups",
  "messageoftheday",
  "startup",
]);
// Nom écrit entre crochets : sans crochet ni retour à la ligne.
const SECTION_NAME = /^[^[\]\r\n]+$/;

export function isModSection(section: string): boolean {
  const lower = section.trim().toLowerCase();
  return (
    SECTION_NAME.test(section) &&
    lower !== "" &&
    !lower.startsWith("/script/") &&
    !GAME_SECTIONS.has(lower)
  );
}
