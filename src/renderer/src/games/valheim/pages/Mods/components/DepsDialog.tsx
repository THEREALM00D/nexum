import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ThunderstoreModInfo } from "@shared/types";
import RegistryChip from "./RegistryChip";

interface Props {
  modName: string;
  deps: ThunderstoreModInfo[];
  onInstallAll: () => void;
  onDismiss: () => void;
}

export default function DepsDialog({
  modName,
  deps,
  onInstallAll,
  onDismiss,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open onClose={onDismiss} maxWidth="xs" fullWidth>
      <DialogTitle>{t("valheimMods.deps.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("valheimMods.deps.subtitle", {
            name: modName,
            count: deps.length,
          })}
        </Typography>
        <Stack spacing={0.75}>
          {deps.map((dep) => (
            <Box key={dep.mod_id}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {dep.name}{" "}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  v{dep.version}
                </Typography>{" "}
                <RegistryChip source={dep.registry} />
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {dep.author}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss}>{t("valheimMods.deps.skip")}</Button>
        <Button variant="contained" onClick={onInstallAll}>
          {t("valheimMods.deps.installAll", { count: deps.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
