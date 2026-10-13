/**
 * À l'import d'un serveur Valheim déjà installé, pas de fichier de config
 * à lire (tout passe par les args CLI) — mais s'il n'existe qu'un seul
 * monde déjà sur disque, on peut au moins deviner son nom sans que
 * l'utilisateur ait à retaper exactement le même. Si plusieurs mondes sont
 * trouvés, on laisse le choix se faire via l'Autocomplete de la page Config.
 * Partagé par le dialogue d'ajout de serveur et l'assistant de démarrage.
 */
export async function importValheimWorld(serverId: string): Promise<void> {
  try {
    const worlds = await window.api.valheim.listExistingWorlds("");
    if (worlds.length === 1) {
      await window.api.valheim.setConfig({ world: worlds[0].name }, serverId);
    }
  } catch {
    // best-effort — l'utilisateur peut toujours choisir manuellement
  }
}
