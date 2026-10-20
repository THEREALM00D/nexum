import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import { appErrorMessage } from "../../../../../utils/appErrorMessage";

/**
 * Interroge Odin-Eye à l'adresse saisie (même non enregistrée) et dit ce qui
 * ne va pas : sans ça, une adresse fausse ne se voyait nulle part.
 */
export default function OdinEyeTestButton({ url }: { url: string }) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    try {
      const count = await window.api.valheim.testOdinEye(url);
      notify(t("valheimConfig.odinEyeTest.success", { count }), "success");
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={test}
      disabled={testing || !url.trim()}
      startIcon={testing ? <CircularProgress size={16} /> : undefined}
      sx={{ flexShrink: 0, height: 40 }}
    >
      {t("valheimConfig.odinEyeTest.button")}
    </Button>
  );
}
