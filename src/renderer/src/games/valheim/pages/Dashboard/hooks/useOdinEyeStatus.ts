import { useEffect, useRef, useState } from "react";

const REFRESH_INTERVAL_MS = 10_000;
/**
 * Odin-Eye ne démarre qu'une fois le monde chargé, parfois plus d'une minute
 * après le lancement du serveur : pendant ce délai, un échec est une attente
 * normale, pas une erreur (avant, le bandeau passait par « ne répond pas »
 * à chaque démarrage).
 */
const BOOT_GRACE_MS = 3 * 60_000;

export interface OdinEyeStatus {
  /** Config pas encore lue (premier rendu). */
  loading: boolean;
  /** URL Odin-Eye renseignée dans Configuration → Réseau. */
  configured: boolean;
  url: string;
  /** Joueurs en ligne selon Odin-Eye (serveur lancé et plugin joignable). */
  count: number | null;
  /** Erreur brute (code `@app:ODIN_EYE_*`) de la dernière interrogation. */
  error: string | null;
  /** Serveur qui démarre : le plugin n'écoute pas encore, pas une erreur. */
  waiting: boolean;
}

const INITIAL: OdinEyeStatus = {
  loading: true,
  configured: false,
  url: "",
  count: null,
  error: null,
  waiting: false,
};

/**
 * État d'Odin-Eye pour le serveur actif, interrogé directement toutes les
 * 10 s quand le serveur tourne. Avant, le Dashboard affichait le même bandeau
 * « nécessite Odin-Eye » que le plugin marche ou non, et le tracker avalait
 * les erreurs : impossible de savoir ce qui n'allait pas (signalé sur Discord).
 *
 * `serverUptime` (secondes, 0 si inconnu) évite d'accorder le délai de
 * démarrage à un serveur lancé depuis longtemps (Dashboard ouvert après coup).
 */
export function useOdinEyeStatus(
  running: boolean,
  serverUptime: number,
): OdinEyeStatus {
  const [status, setStatus] = useState<OdinEyeStatus>(INITIAL);
  const uptimeRef = useRef(serverUptime);

  useEffect(() => {
    uptimeRef.current = serverUptime;
  }, [serverUptime]);

  useEffect(() => {
    let cancelled = false;
    const since = Date.now();
    let connectedOnce = false;
    const booting = () =>
      running &&
      !connectedOnce &&
      Date.now() - since < BOOT_GRACE_MS &&
      uptimeRef.current * 1000 < BOOT_GRACE_MS;

    // Serveur qui vient de passer en ligne : attente affichée tout de suite,
    // sans passer par un skeleton puis une erreur.
    if (booting())
      setStatus((s) => ({ ...s, count: null, error: null, waiting: true }));

    const refresh = async () => {
      let url = "";
      try {
        url = (await window.api.valheim.getConfig()).odinEyeUrl.trim();
      } catch {
        // config illisible : traité comme non configuré
      }
      const base = { loading: false, configured: !!url, url };
      if (!url || !running) {
        if (!cancelled)
          setStatus({ ...base, count: null, error: null, waiting: false });
        return;
      }
      try {
        const count = await window.api.valheim.testOdinEye();
        connectedOnce = true;
        if (!cancelled)
          setStatus({ ...base, count, error: null, waiting: false });
      } catch (e) {
        const waiting = booting();
        if (!cancelled)
          setStatus({
            ...base,
            count: null,
            error: waiting ? null : (e as Error).message,
            waiting,
          });
      }
    };

    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [running]);

  return status;
}
