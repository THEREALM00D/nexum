// Texte d'un chat de jeu qui n'affiche pas les accents (ARK : « � » en
// UTF-8 comme en Latin-1, vérifié). Partagé : le main l'envoie, le renderer
// en montre l'aperçu.

/** Une ligne, accents retirés (« redémarrer » → « redemarrer »), ASCII seul. */
export function toAsciiChatText(message: string): string {
  return message
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\x20-\x7e]/g, "");
}
