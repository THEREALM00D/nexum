import { useEffect } from "react";
import type { GameType } from "@shared/types";
import type { ExeStatus } from "../../../hooks/useExeDetection";
import { getGamePlugin } from "../../../games/registry";

interface Props {
  gameType: GameType;
  path: string;
  exeStatus: ExeStatus;
  /** Setter stable (useState) : état repassé à `existingServer.apply`. */
  onChange: (state: unknown) => void;
  /** Setter stable : création bloquée tant que c'est vrai. */
  onPendingChange: (pending: boolean) => void;
}

/**
 * Panneau de reprise d'un serveur déjà installé (`existingServer.Panel` du
 * jeu), affiché dès que l'exécutable est trouvé dans le dossier. Partagé par
 * le dialogue d'ajout et l'assistant. Remonté à chaque dossier ou jeu : rien
 * d'un autre dossier ne reste appliqué.
 */
export default function ExistingServerPanel({
  gameType,
  path,
  exeStatus,
  onChange,
  onPendingChange,
}: Props) {
  const Panel = getGamePlugin(gameType)?.existingServer?.Panel;
  const shown = Panel !== undefined && exeStatus === "found";
  // Exe en cours de détection : le panneau va peut-être s'afficher, la
  // création attend (sinon un clic rapide passait avant sa lecture).
  const detecting = Panel !== undefined && exeStatus === "checking";

  useEffect(() => {
    if (shown) return;
    onChange(null);
    onPendingChange(detecting);
  }, [shown, detecting, onChange, onPendingChange]);

  if (!shown) return null;
  return (
    <Panel
      key={`${gameType}:${path}`}
      serverPath={path}
      onChange={onChange}
      onPendingChange={onPendingChange}
    />
  );
}
