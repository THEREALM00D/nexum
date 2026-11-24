import type { Server } from "@shared/types";
import { getGamePlugin } from "../../../games/registry";

/**
 * Reprise d'un serveur existant (`existingServer.apply` du jeu) juste après
 * sa création, pour l'ajout (`useServers`) et l'assistant. Une erreur passe
 * à `onError` sans bloquer : le serveur existe déjà (un 2e clic créerait un
 * doublon), la reprise se refait depuis la page du jeu.
 */
export async function applyExistingServer(
  server: Server,
  state: unknown,
  onError: (error: unknown) => void,
): Promise<void> {
  try {
    await getGamePlugin(server.gameType)?.existingServer?.apply(
      server.id,
      state,
    );
  } catch (error) {
    onError(error);
  }
}
