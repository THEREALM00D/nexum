import { runRconCommands } from "../../utils/sourceRcon";

// DoExit sauvegarde le monde avant de quitter : ~20 s sur un monde neuf
// (vérifié), davantage sur un gros monde. Un taskkill pendant cette
// sauvegarde la perdrait.
export const ARK_EXIT_TIMEOUT_SECONDS = 120;

export interface ArkPlayer {
  userId: string;
  playerId: string;
  name: string;
}

// Une ligne par joueur : « 0. Nom du joueur, <EOS ID> ». Le nom peut
// contenir des virgules : l'identifiant est ce qui suit la dernière.
// Sans joueur, la réponse est « No Players Connected ».
const PLAYER_LINE = /^\s*\d+\.\s*(.*),\s*(\S+)\s*$/;

export function parseListPlayers(response: string): ArkPlayer[] {
  const players: ArkPlayer[] = [];
  for (const line of response.split(/\r?\n/)) {
    const match = line.match(PLAYER_LINE);
    if (!match) continue;
    const [, name, eosId] = match;
    players.push({ userId: eosId, playerId: eosId, name: name.trim() });
  }
  return players;
}

/**
 * Commandes RCON d'un serveur ARK, toujours sur 127.0.0.1. Une connexion par
 * appel : le serveur ne répond qu'à une commande à la fois et le suivi des
 * joueurs n'interroge que toutes les 30 s.
 */
export class ArkRconClient {
  constructor(
    private port: number,
    private password: string,
  ) {}

  private async run(command: string): Promise<string> {
    const [response] = await runRconCommands(this.port, this.password, [
      command,
    ]);
    return response ?? "";
  }

  async announce(message: string): Promise<void> {
    await this.run(`Broadcast ${message.replace(/[\r\n]+/g, " ")}`);
  }

  /** Synchrone : la réponse « World Saved » arrive une fois le monde écrit. */
  async save(): Promise<void> {
    await this.run("SaveWorld");
  }

  /**
   * Arrêt immédiat : DoExit sauvegarde le monde avant de quitter (vérifié).
   * ARK n'a pas d'arrêt différé : le délai annoncé est attendu par
   * ServerManager.stop, interruptible et arrêté net si le serveur meurt.
   */
  async shutdown(): Promise<void> {
    await this.run("DoExit");
  }

  async getPlayers(): Promise<{ players: ArkPlayer[] }> {
    return { players: parseListPlayers(await this.run("ListPlayers")) };
  }
}
