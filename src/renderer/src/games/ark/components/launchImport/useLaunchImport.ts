import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkLaunchImport, ArkLaunchLineSource } from "@shared/types";
import { useNotification } from "../../../../context/NotificationContext";
import { errorMessage } from "../../../../utils/appErrorMessage";

export type LaunchSource = "log" | "paste" | "file";

/** État repassé à `existingServer.apply` ou au bouton Appliquer. */
export interface LaunchImportState {
  line: string;
  saveDirectory: string;
}

export const isLaunchImportState = (
  value: unknown,
): value is LaunchImportState =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as LaunchImportState).line === "string" &&
  typeof (value as LaunchImportState).saveDirectory === "string";

const PREVIEW_DELAY_MS = 300;

/**
 * Ligne de lancement d'un serveur ARK existant : lue dans ses logs à
 * l'ouverture, sinon collée ou lue dans un .bat ; aperçu recalculé par le
 * main à chaque changement (différé). `pending` tant que la lecture ou
 * l'aperçu est en cours : le parent bloque Enregistrer, sinon le serveur
 * était créé sans rien reprendre. Le monde choisi à la main est gardé tant
 * qu'il existe ; sinon le plus récent est présélectionné.
 */
export function useLaunchImport(serverPath: string, serverId: string | null) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  // Ligne du dernier aperçu revenu (ou en échec) : tant qu'elle diffère de
  // la ligne affichée, l'aperçu est en cours (pas de rendu « libre » entre
  // la lecture du log et le lancement de l'aperçu).
  const [previewedLine, setPreviewedLine] = useState<string | null>(null);
  const [source, setSource] = useState<LaunchSource>("paste");
  const [found, setFound] = useState<ArkLaunchLineSource | null>(null);
  const [fileSource, setFileSource] = useState<ArkLaunchLineSource | null>(
    null,
  );
  const [line, setLine] = useState("");
  const [preview, setPreview] = useState<ArkLaunchImport | null>(null);
  const [saveDirectory, setSaveDirectory] = useState("");
  const chosenWorld = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    window.api.arkLaunchImport
      .fromLog(serverPath, serverId)
      .then((result) => {
        if (cancelled || !result) return;
        setFound(result);
        setSource("log");
        setLine(result.line);
      })
      .catch((error) => !cancelled && notify(errorMessage(t, error), "error"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Lu une fois par dossier (le panneau est remonté à chaque dossier).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPath]);

  useEffect(() => {
    if (!line.trim()) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      window.api.arkLaunchImport
        .preview(serverPath, line, serverId)
        .then((result) => {
          if (cancelled) return;
          setPreview(result);
          const worlds = result?.worlds ?? [];
          const kept = worlds.some(
            (world) => world.saveDirectory === chosenWorld.current,
          );
          if (!kept) chosenWorld.current = null;
          setSaveDirectory(
            kept && chosenWorld.current !== null
              ? chosenWorld.current
              : (result?.launch.saveDirectory ?? ""),
          );
        })
        .catch((error) => {
          if (cancelled) return;
          setPreview(null);
          notify(errorMessage(t, error), "error");
        })
        .finally(() => !cancelled && setPreviewedLine(line));
    }, PREVIEW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPath, serverId, line]);

  const chooseWorld = (next: string) => {
    chosenWorld.current = next;
    setSaveDirectory(next);
  };

  /** .bat / .cmd choisi dans le dialogue modal partagé, lu par le main. */
  const pickScript = async (): Promise<boolean> => {
    const path = await window.api.dialog.selectFile(
      [{ name: t("arkLaunchImport.scriptFilter"), extensions: ["bat", "cmd"] }],
      serverPath,
    );
    if (!path) return false;
    const result = await window.api.arkLaunchImport.fromScript(path);
    if (!result.line) {
      notify(t("arkLaunchImport.noLineInFile"), "warning");
      return false;
    }
    setFileSource(result);
    setLine(result.line);
    return true;
  };

  const changeSource = async (next: LaunchSource) => {
    try {
      if (next === "file" && !(await pickScript())) return;
    } catch (error) {
      notify(errorMessage(t, error), "error");
      return;
    }
    if (next === "log" && found) setLine(found.line);
    setSource(next);
  };

  const previewing = line.trim() !== "" && line !== previewedLine;
  const state: LaunchImportState | null =
    preview && line.trim() && !previewing ? { line, saveDirectory } : null;

  return {
    loading,
    previewing,
    pending: loading || previewing,
    source,
    changeSource,
    found,
    fileSource,
    line,
    setLine,
    preview,
    saveDirectory,
    chooseWorld,
    state,
  };
}
