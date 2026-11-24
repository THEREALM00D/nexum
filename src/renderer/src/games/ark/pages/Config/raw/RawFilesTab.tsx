import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";
import { useConfigLoad } from "../../../../../components/config/useConfigLoad";
import LoadingSkeleton from "../../../../../components/common/LoadingSkeleton";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../utils/appErrorMessage";
import { FONT_MONO } from "../../../../../theme";

type RawFile = "gus" | "game";

/**
 * Onglet Fichiers bruts : GameUserSettings.ini ou Game.ini tels quels, pour
 * tout ce que les autres onglets ne couvrent pas (listes rares, sections de
 * mods). Copie `.backup` à chaque enregistrement (main).
 */
export default function RawFilesTab() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId ?? "";
  const [file, setFile] = useState<RawFile>("gus");
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [saving, setSaving] = useState(false);

  const read = useCallback(
    () => window.api.arkSettings.readRaw(serverId, file),
    [serverId, file],
  );
  const load = useConfigLoad(
    read,
    (content) => {
      setText(content);
      setSavedText(content);
    },
    true,
  );

  const changeFile = async (next: RawFile) => {
    setFile(next);
    const content = await window.api.arkSettings.readRaw(serverId, next);
    setText(content);
    setSavedText(content);
    load.markClean();
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await window.api.arkSettings.writeRaw(
        serverId,
        file,
        text,
      );
      if (!result.success) {
        notify(appErrorMessage(t, result.error), "error");
        return;
      }
      setSavedText(text);
      load.markClean();
      notify(t("arkRawUi.saved"), "success");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setSaving(false);
    }
  };

  const dirty = text !== savedText;

  return (
    <Stack spacing={2}>
      <Alert severity="info">{t("arkRawUi.notice")}</Alert>
      {load.locked && (
        <Alert severity="warning">{t("configPage.lockedWhileRunning")}</Alert>
      )}
      <Stack
        direction="row"
        useFlexGap
        sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={file}
          onChange={(_, next) => next && void changeFile(next as RawFile)}
        >
          <ToggleButton value="gus" disabled={dirty}>
            GameUserSettings.ini
          </ToggleButton>
          <ToggleButton value="game" disabled={dirty}>
            Game.ini
          </ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" sx={{ gap: 1, ml: "auto" }}>
          {dirty && (
            <Button onClick={() => setText(savedText)} disabled={saving}>
              {t("arkSettingsUi.discard")}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!dirty || saving || load.locked}
            onClick={() => void save()}
          >
            {t("arkSettingsUi.save")}
          </Button>
        </Stack>
      </Stack>
      <LoadingSkeleton loading={load.loading} fullWidth>
        <TextField
          multiline
          minRows={18}
          maxRows={40}
          value={text}
          disabled={load.locked}
          onChange={(event) => {
            load.markDirty();
            setText(event.target.value);
          }}
          placeholder={t("arkRawUi.empty")}
          slotProps={{
            htmlInput: {
              spellCheck: false,
              "aria-label":
                file === "gus" ? "GameUserSettings.ini" : "Game.ini",
            },
          }}
          sx={{ "& textarea": { typography: "code", fontFamily: FONT_MONO } }}
        />
      </LoadingSkeleton>
    </Stack>
  );
}
