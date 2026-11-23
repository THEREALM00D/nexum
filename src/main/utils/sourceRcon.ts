import { Socket } from "net";
import { AppError } from "./appError";

// Protocole Source RCON (https://developer.valvesoftware.com/wiki/Source_RCON_Protocol),
// utilisé par ARK: Survival Ascended. Paquet : taille (int32 LE, sans
// elle-même), id (int32), type (int32), corps ASCII terminé par \0, puis \0.
const PACKET_AUTH = 3;
const PACKET_AUTH_RESPONSE = 2;
const PACKET_EXEC_COMMAND = 2;
const PACKET_RESPONSE_VALUE = 0;
const HEADER_SIZE = 12;
const DEFAULT_TIMEOUT_MS = 8000;
// Corps d'un paquet de réponse plein (limite du protocole : 4096 octets par
// paquet, en-tête compris) et attente des paquets suivants dans ce cas.
const FULL_PACKET_BODY = 4000;
const MORE_PACKETS_WAIT_MS = 300;

interface RconPacket {
  id: number;
  type: number;
  body: string;
}

function encodePacket(id: number, type: number, body: string): Buffer {
  const bodyBytes = Buffer.from(body, "utf8");
  const packet = Buffer.alloc(HEADER_SIZE + bodyBytes.length + 2);
  packet.writeInt32LE(packet.length - 4, 0);
  packet.writeInt32LE(id, 4);
  packet.writeInt32LE(type, 8);
  bodyBytes.copy(packet, HEADER_SIZE);
  return packet;
}

/** Extrait les paquets complets du tampon, renvoie le reste non lu. */
function decodePackets(buffer: Buffer): {
  packets: RconPacket[];
  rest: Buffer;
} {
  const packets: RconPacket[] = [];
  let offset = 0;
  while (buffer.length - offset >= 4) {
    const size = buffer.readInt32LE(offset);
    if (buffer.length - offset - 4 < size) break;
    const id = buffer.readInt32LE(offset + 4);
    const type = buffer.readInt32LE(offset + 8);
    const bodyEnd = offset + 4 + size - 2;
    const body = buffer.toString("utf8", offset + HEADER_SIZE, bodyEnd);
    packets.push({ id, type, body });
    offset += 4 + size;
  }
  return { packets, rest: buffer.subarray(offset) };
}

/**
 * Exécute des commandes RCON dans une seule connexion (authentification,
 * puis chaque commande dans l'ordre) et renvoie leurs réponses. Toujours
 * sur 127.0.0.1 : le port RCON n'est jamais ouvert dans le pare-feu.
 */
export function runRconCommands(
  port: number,
  password: string,
  commands: string[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const responses: string[] = [];
    let pending: Buffer = Buffer.alloc(0);
    let authenticated = false;
    let commandIndex = 0;
    let settled = false;

    const finish = (error: Error | null) => {
      if (settled) return;
      settled = true;
      if (moreTimer) clearTimeout(moreTimer);
      socket.destroy();
      if (error) reject(error);
      else resolve(responses);
    };

    // L'id d'un paquet de commande = son rang + 1 ; l'authentification a 0.
    const sendNextCommand = () => {
      if (commandIndex >= commands.length) {
        finish(null);
        return;
      }
      socket.write(
        encodePacket(
          commandIndex + 1,
          PACKET_EXEC_COMMAND,
          commands[commandIndex],
        ),
      );
    };

    // Une réponse trop longue pour un paquet arrive en plusieurs paquets du
    // même id. ⚠️ Le paquet vide « sentinelle » habituel bloque ARK (aucune
    // réponse, vérifié) : un paquet presque plein fait attendre la suite.
    let responseParts: string[] = [];
    let moreTimer: NodeJS.Timeout | null = null;
    const completeResponse = () => {
      moreTimer = null;
      responses.push(responseParts.join(""));
      responseParts = [];
      commandIndex += 1;
      sendNextCommand();
    };
    const receiveResponsePart = (body: string) => {
      responseParts.push(body);
      if (moreTimer) clearTimeout(moreTimer);
      if (Buffer.byteLength(body) >= FULL_PACKET_BODY) {
        moreTimer = setTimeout(completeResponse, MORE_PACKETS_WAIT_MS);
      } else {
        completeResponse();
      }
    };

    socket.setTimeout(timeoutMs, () => finish(new AppError("RCON_TIMEOUT")));
    // Refus de connexion (RCON désactivé, serveur pas encore prêt) ou
    // coupure : même message, le port aide à vérifier la config.
    socket.on("error", () =>
      finish(new AppError("RCON_UNREACHABLE", { port })),
    );
    socket.on("close", () => {
      if (!settled) finish(new AppError("RCON_UNREACHABLE", { port }));
    });

    socket.on("data", (chunk: Buffer) => {
      const decoded = decodePackets(Buffer.concat([pending, chunk]));
      pending = decoded.rest;
      for (const packet of decoded.packets) {
        if (!authenticated) {
          // Certains serveurs envoient d'abord un RESPONSE_VALUE vide.
          if (packet.type !== PACKET_AUTH_RESPONSE) continue;
          if (packet.id === -1) {
            finish(new AppError("RCON_AUTH_FAILED"));
            return;
          }
          authenticated = true;
          sendNextCommand();
          continue;
        }
        if (
          packet.type === PACKET_RESPONSE_VALUE &&
          packet.id === commandIndex + 1
        ) {
          receiveResponsePart(packet.body);
        }
      }
    });

    socket.connect(port, "127.0.0.1", () => {
      socket.write(encodePacket(0, PACKET_AUTH, password));
    });
  });
}
