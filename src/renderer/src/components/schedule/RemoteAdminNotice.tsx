import { useEffect, useState } from "react";
import { Alert, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { appErrorMessage, errorMessage } from "../../utils/appErrorMessage";

interface Props {
  /** L'accès admin du jeu (API REST Palworld, RCON ARK) est-il activé ? */
  readEnabled: () => Promise<boolean>;
  enable: () => Promise<{ success: boolean; error?: string }>;
  warningKey: string;
  buttonKey: string;
  /** Notification après activation. */
  enabledKey: string;
  /** Repli si l'écriture échoue sans erreur codée. */
  failedKey?: string;
  /** Message si l'appel est rejeté (sinon le texte de l'erreur). */
  cannotWriteKey?: string;
  /**
   * Le jeu réécrit sa config serveur lancé (ARK) : l'écriture serait
   * refusée, le bouton est désactivé et `lockedHintKey` s'ajoute au texte.
   */
  lockedHintKey?: string;
}

/**
 * Avertissement « accès admin désactivé » avec un bouton pour l'activer :
 * sans lui, ni annonce ni sauvegarde avant l'arrêt. Rien tant que l'état
 * n'est pas lu, ni s'il est activé.
 */
export default function RemoteAdminNotice({
  readEnabled,
  enable,
  warningKey,
  buttonKey,
  enabledKey,
  failedKey,
  cannotWriteKey,
  lockedHintKey,
}: Props) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const running = state.status !== "stopped" && state.status !== "crashed";
  const locked = Boolean(lockedHintKey) && running;

  const check = async () => {
    try {
      setEnabled(await readEnabled());
    } catch {
      setEnabled(null);
    }
  };

  useEffect(() => {
    check();
    // Lecture au montage seulement (la page est remontée au changement de
    // serveur) : `readEnabled` change à chaque rendu du parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnable = async () => {
    try {
      const result = await enable();
      if (result.success) {
        notify(t(enabledKey), "success");
        await check();
      } else {
        notify(
          appErrorMessage(
            t,
            result.error,
            failedKey ? t(failedKey) : undefined,
          ),
        );
      }
    } catch (error) {
      notify(cannotWriteKey ? t(cannotWriteKey) : errorMessage(t, error));
    }
  };

  if (enabled !== false) return null;
  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleEnable}
          disabled={locked}
        >
          {t(buttonKey)}
        </Button>
      }
    >
      {t(warningKey)}
      {locked && lockedHintKey ? ` ${t(lockedHintKey)}` : ""}
    </Alert>
  );
}
