// Fichier INI d'ARK modifié ligne par ligne : tout ce que Nexum ne touche pas
// (ordre, commentaires, sections de mods, clés inconnues) reste tel quel.
// ⚠️ Sections et clés sans tenir compte de la casse : le serveur lit
// `serverPVE=True` comme `ServerPVE` et écrit Game.ini en
// `[/Script/ShooterGame.ShooterGameMode]` ou en minuscules selon qui l'a
// créé (vérifié). Une clé peut être répétée (`Key=…` par entrée de liste)
// ou indexée (`Key[3]=…`).

import {
  SECTION_RE,
  baseKey,
  entryOf,
  normalize,
  parseLine,
  type IniEntry,
  type Line,
} from "./iniLine";

export class IniDocument {
  private lines: Line[] = [];

  constructor(text: string) {
    let section = "";
    for (const raw of text.split(/\r?\n/)) {
      const line = parseLine(raw, section);
      section = line.section;
      this.lines.push(line);
    }
    // Ligne vide finale de split : retirée, toText la remet.
    if (this.lines.length > 0 && this.lines.at(-1)?.text === "") {
      this.lines.pop();
    }
  }

  /** Texte avec des fins de ligne "\n" (writeIniText remet celles du fichier). */
  toText(): string {
    return this.lines.map((line) => line.text).join("\n") + "\n";
  }

  private entryLines(section: string): number[] {
    const wanted = normalize(section);
    return this.lines.flatMap((line, position) =>
      line.section === wanted && line.key !== null ? [position] : [],
    );
  }

  private valueAt(position: number): IniEntry {
    return entryOf(this.lines[position].text);
  }

  /** Valeur d'une clé simple (la dernière si elle est répétée), undefined si absente. */
  get(section: string, key: string): string | undefined {
    const wanted = normalize(key);
    const positions = this.entryLines(section).filter(
      (position) => this.lines[position].key === wanted,
    );
    const last = positions.at(-1);
    return last === undefined ? undefined : this.valueAt(last).value;
  }

  /** Toutes les entrées `Key=…` et `Key[n]=…` d'une clé de base, dans l'ordre. */
  getAll(section: string, key: string): IniEntry[] {
    const wanted = normalize(key);
    return this.entryLines(section)
      .filter((position) => baseKey(this.lines[position].key ?? "") === wanted)
      .map((position) => this.valueAt(position));
  }

  /** Clés présentes dans une section (casse du fichier, sans doublon). */
  keys(section: string): string[] {
    const seen = new Map<string, string>();
    for (const position of this.entryLines(section)) {
      const { key } = this.valueAt(position);
      seen.set(normalize(key), key);
    }
    return [...seen.values()];
  }

  /**
   * Écrit une clé simple : remplace la 1re occurrence (en gardant la casse
   * du fichier), retire les autres, sinon l'ajoute en fin de section (créée
   * si besoin). Un retour à la ligne dans la valeur ajouterait une clé : retiré.
   */
  set(section: string, key: string, value: string): void {
    const clean = value.replace(/[\r\n]/g, "").trim();
    const wanted = normalize(key);
    const positions = this.entryLines(section).filter(
      (position) => this.lines[position].key === wanted,
    );
    if (positions.length === 0) {
      this.insert(section, [`${key}=${clean}`]);
      return;
    }
    const [first, ...others] = positions;
    const fileKey = this.valueAt(first).key;
    this.lines[first] = { ...this.lines[first], text: `${fileKey}=${clean}` };
    this.removePositions(others);
  }

  /** Retire une clé simple (toutes ses occurrences). */
  remove(section: string, key: string): void {
    const wanted = normalize(key);
    this.removePositions(
      this.entryLines(section).filter(
        (position) => this.lines[position].key === wanted,
      ),
    );
  }

  /**
   * Remplace toutes les entrées d'une clé de base (`Key=…` et `Key[n]=…`)
   * par `entries` (lignes complètes), à la place de la première. Liste vide :
   * la clé disparaît.
   */
  replaceAll(section: string, key: string, entries: string[]): void {
    const wanted = normalize(key);
    const positions = this.entryLines(section).filter(
      (position) => baseKey(this.lines[position].key ?? "") === wanted,
    );
    const clean = entries.map((entry) => entry.replace(/[\r\n]/g, ""));
    if (positions.length === 0) {
      if (clean.length > 0) this.insert(section, clean);
      return;
    }
    const sectionName = this.lines[positions[0]].section;
    const replacement = clean.map((text) => parseLine(text, sectionName));
    const [first, ...others] = positions;
    this.removePositions(others);
    this.lines.splice(first, 1, ...replacement);
  }

  private removePositions(positions: number[]): void {
    // Du bas vers le haut : retirer une ligne ne décale pas les suivantes.
    const descending = [...positions].sort((left, right) => right - left);
    for (const position of descending) {
      this.lines.splice(position, 1);
    }
  }

  /** Ajoute des lignes à la fin de la dernière section `section`, ou crée la section. */
  private insert(section: string, texts: string[]): void {
    const wanted = normalize(section);
    let lastHeader = -1;
    this.lines.forEach((line, position) => {
      if (
        line.key === null &&
        line.section === wanted &&
        SECTION_RE.test(line.text)
      ) {
        lastHeader = position;
      }
    });
    if (lastHeader === -1) {
      if (this.lines.length > 0 && this.lines.at(-1)?.text.trim() !== "") {
        this.lines.push({
          text: "",
          section: this.lines.at(-1)?.section ?? "",
          key: null,
        });
      }
      this.lines.push(parseLine(`[${section}]`, ""));
      for (const text of texts) this.lines.push(parseLine(text, wanted));
      return;
    }
    // Après la dernière entrée de ce bloc (avant les lignes vides finales).
    let end = lastHeader;
    for (
      let position = lastHeader + 1;
      position < this.lines.length;
      position += 1
    ) {
      const line = this.lines[position];
      if (line.section !== wanted || SECTION_RE.test(line.text)) break;
      if (line.text.trim() !== "") end = position;
    }
    this.lines.splice(
      end + 1,
      0,
      ...texts.map((text) => parseLine(text, wanted)),
    );
  }
}
