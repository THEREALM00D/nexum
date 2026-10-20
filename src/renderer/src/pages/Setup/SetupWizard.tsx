import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { getGamePlugin } from "../../games/registry";
import Install from "../Install/Install";
import { importValheimWorld } from "../Servers/utils/importValheimWorld";
import StepGame, {
  initialChoice,
  type SetupChoice,
} from "./components/StepGame";
import StepStart from "./components/StepStart";
import FormPage from "../../components/common/FormPage";
import { errorMessage } from "../../utils/appErrorMessage";

type StepId = "game" | "install" | "config" | "network" | "start";

/**
 * Assistant de démarrage : ouvert tout seul quand aucun serveur n'existe, ou
 * depuis la page Serveurs. L'étape 1 crée le serveur et le rend actif ; les
 * suivantes affichent les pages existantes (Installation, puis Configuration
 * et Réseau du jeu choisi) au lieu de les dupliquer.
 */
export default function SetupWizard({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state, refreshServers, switchActive } = useServer();
  const [choice, setChoice] = useState<SetupChoice>(initialChoice);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [index, setIndex] = useState(0);

  // Serveur existant : pas d'étape Installation
  const steps: StepId[] =
    choice.mode === "new"
      ? ["game", "install", "config", "network", "start"]
      : ["game", "config", "network", "start"];
  const step = steps[index];
  const plugin = getGamePlugin(choice.gameType);

  const createServer = async () => {
    setBusy(true);
    try {
      const created = await window.api.servers.create({
        name: choice.name,
        path: choice.path,
        gameType: choice.gameType,
      });
      if (created.gameType === "valheim" && choice.mode === "existing") {
        await importValheimWorld(created.id);
      }
      await refreshServers();
      await switchActive(created.id);
      setCreatedId(created.id);
      setIndex(1);
    } catch (e) {
      notify(errorMessage(t, e), "error");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step === "game" && !createdId) return void createServer();
    if (index < steps.length - 1) setIndex(index + 1);
    else onFinish();
  };

  const renderStep = () => {
    // Clé = serveur actif : les pages réutilisées lisent ses données au montage
    const key = state.activeServerId ?? "none";
    if (step === "game")
      return <StepGame value={choice} onChange={setChoice} />;
    if (step === "install") return <Install key={key} />;
    if (step === "start") return <StepStart key={key} />;
    const Page = plugin?.pages[step];
    return Page ? <Page key={key} /> : null;
  };

  return (
    <FormPage width={960}>
      <Box>
        <Typography variant="h6">{t("setup.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("setup.subtitle")}
        </Typography>
      </Box>

      <Stepper activeStep={index} alternativeLabel>
        {steps.map((s) => (
          <Step key={s}>
            <StepLabel>{t(`setup.steps.${s}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t(`setup.help.${step}`)}
      </Typography>

      <Paper sx={{ p: 3 }}>{renderStep()}</Paper>

      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
        <Button onClick={onFinish}>{t("setup.skip")}</Button>
        {/* Retour impossible vers l'étape 1 une fois le serveur créé */}
        <Button
          disabled={index === 0 || (index === 1 && !!createdId)}
          onClick={() => setIndex(index - 1)}
        >
          {t("setup.back")}
        </Button>
        <Button
          variant="contained"
          onClick={next}
          disabled={busy || (step === "game" && !choice.path.trim())}
        >
          {index === steps.length - 1
            ? t("setup.finish")
            : step === "game"
              ? t("setup.create")
              : t("setup.next")}
        </Button>
      </Stack>
    </FormPage>
  );
}
