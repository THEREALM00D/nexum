import { useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadingSkeleton from "../../../../components/common/LoadingSkeleton";
import SectionTitle from "../../../../components/common/SectionTitle";
import { FONT_MONO } from "../../../../theme";
import { formatDate } from "../../../../utils/format";
import LaunchImportSummary from "./LaunchImportSummary";
import { PLACEHOLDER_PREVIEW } from "./placeholderPreview";
import {
  useLaunchImport,
  type LaunchImportState,
  type LaunchSource,
} from "./useLaunchImport";

interface Props {
  serverPath: string;
  /** Serveur déjà dans Nexum (onglet Général), null à l'ajout. */
  serverId?: string | null;
  onChange: (state: LaunchImportState | null) => void;
  /** Lecture ou aperçu en cours : le parent bloque son bouton. */
  onPendingChange?: (pending: boolean) => void;
}

const fileName = (path: string) => path.split(/[\\/]/).pop() ?? path;

/**
 * Ligne de lancement d'un serveur ARK existant et aperçu de ce qui sera
 * repris. Remonté à chaque dossier (clé posée par le parent).
 */
export default function LaunchImportPanel({
  serverPath,
  serverId = null,
  onChange,
  onPendingChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const launch = useLaunchImport(serverPath, serverId);
  const { state } = launch;

  useEffect(() => {
    onChange(state);
    // Seul l'état compte : onChange peut changer à chaque rendu du parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.line, state?.saveDirectory]);

  useEffect(() => {
    onPendingChange?.(launch.pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launch.pending]);
  // Démonté (autre dossier, exe absent) : plus rien en attente.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => onPendingChange?.(false), []);

  // Place réservée pendant le 1er aperçu : le résumé n'apparaît pas d'un
  // coup en poussant le dialogue.
  const shownPreview =
    launch.preview ?? (launch.previewing ? PLACEHOLDER_PREVIEW : null);

  const hint =
    launch.source === "log"
      ? launch.found &&
        t("arkLaunchImport.foundInLog", {
          file: fileName(launch.found.file),
          date: formatDate(launch.found.modifiedAt, i18n.language),
        })
      : launch.source === "file"
        ? launch.fileSource &&
          t("arkLaunchImport.fromFile", {
            file: fileName(launch.fileSource.file),
          })
        : !launch.found && t("arkLaunchImport.noLog");

  return (
    // Séparé par un trait, pas une carte : il s'affiche déjà dans une carte
    // (assistant) ou un dialogue.
    <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
      <Stack spacing={1.5}>
        <SectionTitle>{t("arkLaunchImport.title")}</SectionTitle>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("arkLaunchImport.intro")}
        </Typography>
        <LoadingSkeleton loading={launch.loading} fullWidth>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={launch.source}
            // Bouton déjà choisi recliqué (next null) : on refait l'action
            // (autre .bat, retour à la ligne du log après une retouche).
            onChange={(_, next: LaunchSource | null) =>
              void launch.changeSource(next ?? launch.source)
            }
            sx={{ flexWrap: "wrap" }}
          >
            <ToggleButton value="log" disabled={!launch.found}>
              {t("arkLaunchImport.sources.log")}
            </ToggleButton>
            <ToggleButton value="paste">
              {t("arkLaunchImport.sources.paste")}
            </ToggleButton>
            <ToggleButton value="file">
              {t("arkLaunchImport.sources.file")}
            </ToggleButton>
          </ToggleButtonGroup>
        </LoadingSkeleton>
        <LoadingSkeleton loading={launch.loading} fullWidth>
          <TextField
            label={t("arkLaunchImport.line")}
            multiline
            minRows={2}
            maxRows={6}
            value={launch.line}
            onChange={(event) => launch.setLine(event.target.value)}
            placeholder={t("arkLaunchImport.linePlaceholder")}
            helperText={hint || " "}
            slotProps={{ htmlInput: { spellCheck: false } }}
            sx={{
              "& textarea": { typography: "code", fontFamily: FONT_MONO },
            }}
          />
        </LoadingSkeleton>
        {shownPreview && (
          <LoadingSkeleton loading={!launch.preview} fullWidth>
            <LaunchImportSummary
              preview={shownPreview}
              saveDirectory={launch.saveDirectory}
              onSaveDirectoryChange={launch.chooseWorld}
            />
          </LoadingSkeleton>
        )}
      </Stack>
    </Box>
  );
}
