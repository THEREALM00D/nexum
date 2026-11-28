const HIDDEN = "••••";

/**
 * Masque les mots de passe d'un fichier de config avant de l'envoyer au
 * renderer (vue des différences) : valeur de toute clé contenant
 * « password », en INI (`ServerPassword=abc`, ou dans une ligne
 * `OptionSettings=(…,AdminPassword="abc",…)` de Palworld) comme en JSON
 * (`"password": "abc"`, Enshrouded). Une valeur vide reste vide.
 */
export function maskPasswords(text: string): string {
  return text
    .replace(
      /("[^"\r\n]*password[^"\r\n]*"\s*:\s*)"([^"\r\n]*)"/gi,
      (match, key: string, value: string) =>
        value ? `${key}"${HIDDEN}"` : match,
    )
    .replace(
      /(\b[\w.]*password[\w.]*\s*=\s*)("([^"\r\n]*)"|[^,)\r\n]*)/gi,
      (match, key: string, raw: string, quoted: string | undefined) => {
        if (raw.startsWith('"')) return quoted ? `${key}"${HIDDEN}"` : match;
        return raw.trim() ? `${key}${HIDDEN}` : match;
      },
    );
}
