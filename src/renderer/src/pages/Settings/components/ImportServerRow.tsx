import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SettingsImportServer, TransferServerPaths } from "@shared/types";
import ServerPathsFields from "../../../components/transfer/ServerPathsFields";

export interface ImportRowState {
  include: boolean;
  paths: TransferServerPaths;
}

interface Props {
  server: SettingsImportServer;
  value: ImportRowState;
  duplicate: boolean;
  onChange: (value: ImportRowState) => void;
}

// Un serveur du fichier : case « importer » puis ses dossiers à confirmer.
export default function ImportServerRow({
  server,
  value,
  duplicate,
  onChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Checkbox
            checked={value.include}
            onChange={(event) =>
              onChange({ ...value, include: event.target.checked })
            }
          />
        }
        label={
          <Box>
            <Typography variant="body2">{server.name}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t(`servers.games.${server.gameType}`)}
              {duplicate && ` · ${t("transfer.paths.duplicate")}`}
            </Typography>
          </Box>
        }
      />
      {value.include && (
        <Box sx={{ pl: 4 }}>
          <ServerPathsFields
            gameType={server.gameType}
            paths={value.paths}
            original={server.paths}
            duplicate={duplicate}
            onChange={(paths) => onChange({ ...value, paths })}
          />
        </Box>
      )}
    </Stack>
  );
}
