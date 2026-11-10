import { useEffect, useState } from "react";
import type {
  ServerArchivePreview,
  ServerImportConflicts,
  TransferServerPaths,
} from "@shared/types";

const NONE: ServerImportConflicts = {
  world: false,
  configFiles: [],
  runningServer: null,
};

/**
 * Ce que l'import toucherait dans les dossiers choisis (monde et fichiers de
 * config déjà présents, serveur lancé), relu 300 ms après la dernière frappe.
 * Le main refait la vérification à l'import.
 */
export function useImportConflicts(
  preview: ServerArchivePreview | null,
  paths: TransferServerPaths | null,
): ServerImportConflicts {
  const [conflicts, setConflicts] = useState(NONE);

  useEffect(() => {
    if (!preview || !paths?.path.trim()) {
      setConflicts(NONE);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      window.api.transfer
        .serverImportConflicts(preview.token, paths)
        .then((result) => !cancelled && setConflicts(result))
        .catch(() => !cancelled && setConflicts(NONE));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [preview, paths]);

  return conflicts;
}
