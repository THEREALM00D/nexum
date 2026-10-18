import { closeSync, openSync, readSync, statSync } from "fs";
import { StringDecoder } from "string_decoder";

const POLL_MS = 1000;
// Lignes Unreal Engine : « [2026.10.18-00.36.00:140][  0]LogNet: … » —
// horodatage UTC du moteur retiré, Nexum ajoute le sien (heure locale).
const UE_TIMESTAMP =
  /^\[\d{4}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{2}:\d{3}\]\[\s*\d+\]/;

function readChunk(path: string, start: number, length: number): Buffer {
  const buf = Buffer.alloc(length);
  const fd = openSync(path, "r");
  try {
    const read = readSync(fd, buf, 0, length, start);
    return buf.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

/**
 * Suit un fichier de log écrit par le serveur lui-même, pour les jeux dont
 * stdout est incomplet (Dragonwilds : seulement Display/Warning/Error).
 * Lecture toutes les secondes (pas de fs.watch, peu fiable sous Windows).
 *
 * Nouvelle session détectée quand la 1re ligne change (Unreal l'horodate :
 * « Log file open, 10/17/26 21:12:55 »), quand le fichier rétrécit ou change
 * d'identifiant. ⚠️ Pas d'après l'identifiant seul : Dragonwilds copie
 * l'ancien log dans RSDragonwilds-backup-<date>.log puis vide et réutilise
 * LE MÊME fichier (même identifiant, même date de création).
 */
export class LogFileTailer {
  private timer: NodeJS.Timeout | null = null;
  private fileId: bigint | null = null;
  private header: string | null = null;
  private offset = 0;
  private partial = "";
  private decoder = new StringDecoder("utf8");

  constructor(
    private path: string,
    private onLine: (line: string) => void,
  ) {}

  /**
   * Tout ce qui est déjà dans le fichier est ignoré : au lancement, c'est la
   * session précédente (le jeu la remplace en démarrant) ; à l'adoption,
   * c'est ce qui a été écrit avant l'ouverture de Nexum.
   */
  start(): void {
    this.stop(false);
    const st = this.stat();
    this.fileId = st?.ino ?? null;
    this.offset = st ? Number(st.size) : 0;
    this.header = st ? this.readHeader() : null;
    this.timer = setInterval(() => this.poll(), POLL_MS);
  }

  /** Arrête le suivi après une dernière lecture (lignes écrites avant la sortie). */
  stop(finalRead = true): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (finalRead) {
      this.poll();
      if (this.partial) this.emit(this.partial);
    }
    this.partial = "";
  }

  private stat() {
    try {
      return statSync(this.path, { bigint: true });
    } catch {
      return null;
    }
  }

  /** 1re ligne complète du fichier, "" si elle n'est pas encore écrite. */
  private readHeader(): string {
    try {
      const head = readChunk(this.path, 0, 256).toString("utf8");
      const eol = head.indexOf("\n");
      return eol === -1 ? "" : head.slice(0, eol);
    } catch {
      return "";
    }
  }

  private poll(): void {
    const st = this.stat();
    if (!st) return;
    const size = Number(st.size);
    const header = this.readHeader();
    if (
      st.ino !== this.fileId ||
      size < this.offset ||
      header !== this.header
    ) {
      this.fileId = st.ino;
      this.header = header;
      this.offset = 0;
      this.partial = "";
      this.decoder = new StringDecoder("utf8");
    }
    if (size <= this.offset) return;

    let buf: Buffer;
    try {
      buf = readChunk(this.path, this.offset, size - this.offset);
    } catch {
      return;
    }
    const atStart = this.offset === 0;
    this.offset += buf.length;

    let text = this.partial + this.decoder.write(buf);
    if (atStart) text = text.replace(/^﻿/, "");
    const lines = text.split(/\r?\n/);
    this.partial = lines.pop() ?? "";
    lines.forEach((line) => this.emit(line));
  }

  private emit(line: string): void {
    const clean = line.replace(UE_TIMESTAMP, "").trimEnd();
    if (clean) this.onLine(clean);
  }
}
