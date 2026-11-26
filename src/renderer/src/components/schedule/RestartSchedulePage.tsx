import { Alert, Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRestartSchedule, type ScheduleForm } from "./useRestartSchedule";
import RestartTimesSection from "./RestartTimesSection";
import WarningsSection from "./WarningsSection";
import GameUpdatesSection from "./GameUpdatesSection";
import FormPage from "../common/FormPage";
import LoadingSkeleton from "../common/LoadingSkeleton";
import PageHeader from "../common/PageHeader";

interface Props {
  /** Texte d'information du jeu (comment se passe l'arrêt). */
  infoKey?: string;
  /** Bloc propre au jeu affiché au-dessus du formulaire (Palworld : API REST). */
  notice?: ReactNode;
  /** Cartes propres au jeu, enregistrées avec le reste (ARK : créatures sauvages). */
  extraSections?: (form: ScheduleForm) => ReactNode;
}

/**
 * Page « Planification » de tous les jeux : seuls le texte d'information,
 * un éventuel bloc et des cartes propres au jeu changent d'un jeu à l'autre.
 */
export default function RestartSchedulePage({
  infoKey,
  notice,
  extraSections,
}: Props) {
  const { t } = useTranslation();
  const { config, loading, dirty, invalid, update, save } =
    useRestartSchedule();
  const form: ScheduleForm = { config, update, loading };

  return (
    <FormPage>
      <PageHeader
        title={t("schedule.title")}
        subtitle={t("schedule.subtitle")}
      />

      {infoKey && (
        <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />}>
          {t(infoKey)}
        </Alert>
      )}
      {notice}

      <RestartTimesSection {...form} />
      <WarningsSection {...form} />
      <GameUpdatesSection {...form} />
      {extraSections?.(form)}

      <LoadingSkeleton loading={loading} sx={{ alignSelf: "flex-end" }}>
        <Button
          variant="contained"
          disabled={loading || !dirty || invalid}
          onClick={save}
          sx={{ alignSelf: "flex-end" }}
        >
          {t("schedule.save")}
        </Button>
      </LoadingSkeleton>
    </FormPage>
  );
}
