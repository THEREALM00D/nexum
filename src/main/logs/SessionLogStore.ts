import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
} from "fs";
import { basename, join } from "path";
import type { LogSession } from "../../shared/types";

// Sessions gardées par serveur (les plus anciennes sont supprimées).
const KEEP_SESSIONS = 20;
// Plafond par fichier : un serveur qui boucle sur une erreur ne doit pas
// remplir le disque.
const MAX_FILE_BYTES = 20 * 1024 * 1024;
// Les lignes sont regroupées puis écrites toutes les FLUSH_MS (un serveur
// Valheim écrit des centaines de lignes au démarrage).
const FLUSH_MS = 500;
const CRASHED_SUFFIX = ".crashed.log";

/** Ce que ServerManager voit d'une session : il ne connaît pas les fichiers. */
export interface SessionLogSink {
  begin(): void;
  line(text: string): void;
  end(crashed: boolean): void;
}

interface OpenSession {
  file: string;
  buffer: string[];
  bytes: number;
  truncated: boolean;
  timer: NodeJS.Timeout | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fileStamp = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
const timeStamp = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/**
 * Logs persistants : un fichier par session de serveur (démarrage → arrêt),
 * dans `{userData}/servers/<id>/logs/`. Écrits par le process main, donc
 * même fenêtre fermée ou Nexum lancé avec Windows. Contenu brut (IP, SteamID) :
 * le fichier reste sur le PC, le masquage ne se fait qu'à l'export.
 */
export class SessionLogStore {
  private open = new Map<string, OpenSession>();

  constructor(
    private serverDir: (serverId: string) => string,
    private onSessionStart: (serverId: string) => void,
  ) {}

  dir(serverId: string): string {
    return join(this.serverDir(serverId), "logs");
  }

  sink(serverId: string): SessionLogSink {
    return {
      begin: () => this.begin(serverId),
      line: (text) => this.line(serverId, text),
      end: (crashed) => this.end(serverId, crashed),
    };
  }

  private begin(serverId: string): void {
    // Une session encore ouverte (ex. relance auto après crash) est close
    // comme plantée : le serveur n'est pas passé par un arrêt normal.
    if (this.open.has(serverId)) this.end(serverId, true);
    const dir = this.dir(serverId);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${fileStamp(new Date())}.log`);
    // Créé tout de suite (vide) : la session en cours doit apparaître dans
    // la liste avant la première écriture groupée.
    try {
      appendFileSync(file, "", "utf-8");
    } catch {
      // disque indisponible : la session continue sans fichier
    }
    this.open.set(serverId, {
      file,
      buffer: [],
      bytes: 0,
      truncated: false,
      timer: null,
    });
    this.rotate(serverId);
    this.onSessionStart(serverId);
  }

  private line(serverId: string, text: string): void {
    const s = this.open.get(serverId);
    if (!s || s.truncated) return;
    const entry = `[${timeStamp(new Date())}] ${text}\n`;
    s.bytes += Buffer.byteLength(entry);
    if (s.bytes > MAX_FILE_BYTES) {
      s.truncated = true;
      s.buffer.push(
        `[${timeStamp(new Date())}] [Manager] Taille maximale du fichier atteinte (20 Mo) : la suite de cette session n'est pas enregistrée.\n`,
      );
    } else {
      s.buffer.push(entry);
    }
    if (!s.timer) s.timer = setTimeout(() => this.flush(serverId), FLUSH_MS);
  }

  private end(serverId: string, crashed: boolean): void {
    const s = this.open.get(serverId);
    if (!s) return;
    this.flush(serverId);
    this.open.delete(serverId);
    if (crashed && existsSync(s.file)) {
      try {
        renameSync(s.file, s.file.replace(/\.log$/, CRASHED_SUFFIX));
      } catch {
        // best-effort : la session reste lisible, juste sans marque de crash
      }
    }
  }

  private flush(serverId: string): void {
    const s = this.open.get(serverId);
    if (!s) return;
    if (s.timer) clearTimeout(s.timer);
    s.timer = null;
    if (s.buffer.length === 0) return;
    try {
      appendFileSync(s.file, s.buffer.join(""), "utf-8");
    } catch {
      // disque plein / dossier supprimé : on ne bloque jamais le serveur
    }
    s.buffer = [];
  }

  /** À appeler à la fermeture de Nexum pour ne pas perdre le dernier tampon. */
  flushAll(): void {
    for (const id of this.open.keys()) this.flush(id);
  }

  list(serverId: string): LogSession[] {
    const dir = this.dir(serverId);
    if (!existsSync(dir)) return [];
    const current = this.open.get(serverId)?.file;
    return readdirSync(dir)
      .filter((f) => f.endsWith(".log"))
      .sort()
      .reverse()
      .map((name) => {
        const path = join(dir, name);
        const [date, time] = name.split(".")[0].split("_");
        return {
          name,
          startedAt: new Date(`${date}T${time.replace(/-/g, ":")}`).getTime(),
          sizeBytes: statSync(path).size,
          crashed: name.endsWith(CRASHED_SUFFIX),
          current: path === current,
        };
      });
  }

  read(serverId: string, name: string): string {
    // Nom venu du renderer : refuser tout chemin (`..`, séparateurs).
    if (basename(name) !== name || !name.endsWith(".log")) {
      throw new Error("Nom de fichier de log invalide");
    }
    if (this.open.get(serverId)?.file === join(this.dir(serverId), name)) {
      this.flush(serverId);
    }
    return readFileSync(join(this.dir(serverId), name), "utf-8");
  }

  private rotate(serverId: string): void {
    const current = this.open.get(serverId)?.file;
    const dir = this.dir(serverId);
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".log") && join(dir, f) !== current)
      .sort()
      .reverse();
    for (const old of files.slice(KEEP_SESSIONS - 1)) {
      try {
        unlinkSync(join(dir, old));
      } catch {
        // fichier verrouillé : il partira à la prochaine rotation
      }
    }
  }
}
