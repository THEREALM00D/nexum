import {
  Button,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import { GAMES } from "../../../games/registry";
import { useExeDetection } from "../../Servers/hooks/useExeDetection";
import ExeStatusHint from "../../Servers/components/ExeStatusHint";
import InstallDirWarning from "../../../components/common/InstallDirWarning";
import GameRequirementsHint from "../../../components/common/GameRequirementsHint";
import { DEFAULT_INSTALL_PATHS } from "../../Install/hooks/useInstall";

export interface SetupChoice {
  gameType: GameType;
  /** Nouveau serveur à installer, ou serveur déjà présent sur le disque. */
  mode: "new" | "existing";
  name: string;
  path: string;
}

export const initialChoice = (): SetupChoice => ({
  gameType: GAMES[0].id,
  mode: "new",
  name: "",
  path: DEFAULT_INSTALL_PATHS[GAMES[0].id],
});

/** Étape 1 : jeu, nouveau ou existant, nom et dossier du serveur. */
export default function StepGame({
  value,
  onChange,
}: {
  value: SetupChoice;
  onChange: (v: SetupChoice) => void;
}) {
  const { t } = useTranslation();
  const exeStatus = useExeDetection(
    value.mode === "existing",
    value.path,
    value.gameType,
  );

  const setGame = (gameType: GameType) =>
    onChange({
      ...value,
      gameType,
      // Le dossier par défaut suit le jeu tant que l'utilisateur ne l'a pas changé
      path:
        value.mode === "new" &&
        Object.values(DEFAULT_INSTALL_PATHS).includes(value.path)
          ? DEFAULT_INSTALL_PATHS[gameType]
          : value.path,
    });

  const browse = async () => {
    const folder = await window.api.dialog.selectFolder();
    if (!folder) return;
    // Serveur existant : on devine le jeu d'après l'exécutable du dossier
    const detected =
      value.mode === "existing"
        ? await window.api.servers.detectGameType(folder)
        : null;
    onChange({ ...value, path: folder, gameType: detected ?? value.gameType });
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t("setup.game.which")}</Typography>
        <ToggleButtonGroup
          exclusive
          value={value.gameType}
          onChange={(_, g) => g && setGame(g)}
          // 5 jeux : passe à la ligne dans une fenêtre étroite
          sx={{ flexWrap: "wrap" }}
        >
          {GAMES.map((g) => (
            <ToggleButton key={g.id} value={g.id} sx={{ px: 3 }}>
              {t(`servers.games.${g.id}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">{t("setup.game.mode")}</Typography>
        <ToggleButtonGroup
          exclusive
          value={value.mode}
          onChange={(_, mode) =>
            mode &&
            onChange({
              ...value,
              mode,
              path: mode === "new" ? DEFAULT_INSTALL_PATHS[value.gameType] : "",
            })
          }
        >
          <ToggleButton value="new">{t("setup.game.new")}</ToggleButton>
          <ToggleButton value="existing">
            {t("setup.game.existing")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <TextField
        label={t("setup.game.name")}
        helperText={t("setup.game.nameHelper")}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        size="small"
        sx={{ maxWidth: 420 }}
      />

      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <TextField
          label={t(
            value.mode === "new"
              ? "setup.game.pathNew"
              : "setup.game.pathExisting",
          )}
          helperText={t(
            value.mode === "new"
              ? "setup.game.pathNewHelper"
              : "setup.game.pathExistingHelper",
          )}
          value={value.path}
          onChange={(e) => onChange({ ...value, path: e.target.value })}
          size="small"
          fullWidth
        />
        <Button
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          onClick={browse}
          sx={{ flexShrink: 0 }}
        >
          {t("setup.game.browse")}
        </Button>
      </Stack>
      {value.mode === "existing" && (
        <ExeStatusHint status={exeStatus} gameType={value.gameType} />
      )}
      <InstallDirWarning path={value.path} />
      {value.mode === "new" && (
        <GameRequirementsHint gameType={value.gameType} />
      )}
    </Stack>
  );
}
