import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import SectionTitle from "../../../../../components/common/SectionTitle";
import ArkModRow from "./ArkModRow";

interface Props {
  mods: ArkModInfo[];
  disabled: boolean;
  onAdd: (id: number) => void;
}

// Mods que le serveur a téléchargés mais qui ne sont pas dans la liste :
// retirés de la liste (le serveur garde leurs fichiers) ou installés avant
// Nexum (dossier existant). Section en bas de la liste (même zone qui
// défile), pas une 2e carte : la liste remplit la page comme sur Valheim.
export default function DownloadedModsList({ mods, disabled, onAdd }: Props) {
  const { t } = useTranslation();
  if (mods.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <SectionTitle>{t("arkMods.downloaded.title")}</SectionTitle>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        {t("arkMods.downloaded.hint")}
      </Typography>
      <Stack divider={<Divider />}>
        {mods.map((info) => (
          <ArkModRow
            key={info.id}
            id={info.id}
            info={info}
            actions={
              <Button
                size="small"
                startIcon={<AddIcon />}
                disabled={disabled}
                onClick={() => onAdd(info.id)}
              >
                {t("arkMods.downloaded.add")}
              </Button>
            }
          />
        ))}
      </Stack>
    </Box>
  );
}
