import { useEffect, useState } from "react";

/** Dossier des données de Valheim quand `savedir` est vide (LocalLow\IronGate\Valheim). */
export function useValheimDefaultDataDir(): string | undefined {
  const [dataDirectory, setDataDirectory] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    window.api.valheim
      .getDefaultDataDir()
      .then((directory) => {
        if (!cancelled) setDataDirectory(directory);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return dataDirectory;
}
