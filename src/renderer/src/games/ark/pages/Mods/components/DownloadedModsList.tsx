import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useTranslation } from "react-i18next";
import type { ArkDownloadedMod } from "@shared/types";
import { FONT_MONO } from "../../../../../theme";
import { useFormatSize } from "../../../../../hooks/useFormatSize";
import SectionTitle from "../../../../../components/common/SectionTitle";
import ArkModRow from "./ArkModRow";

interface Props {
  /** Lignes affichées (filtrées par la recherche). */
  mods: ArkDownloadedMod[];
  /** Tous, pour le titre et l'affichage de la section : la recherche ne
   * change ni le total ni ce que le nettoyage supprime. */
  allMods: ArkDownloadedMod[];
  disabled: boolean;
  onAdd: (id: number) => void;
  onClean: () => void;
}

// Mods que le serveur a téléchargés mais qui ne sont pas dans la liste :
// retirés de la liste (le serveur garde leurs fichiers) ou installés avant
// Nexum (dossier existant). Section en bas de la liste (même zone qui
// défile), pas une 2e carte : la liste remplit la page comme sur Valheim.
export default function DownloadedModsList({
  mods,
  allMods,
  disabled,
  onAdd,
  onClean,
}: Props) {
  const { t } = useTranslation();
  const formatSize = useFormatSize();
  if (allMods.length === 0) return null;
  const total = allMods.reduce((sum, mod) => sum + mod.size, 0);

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        useFlexGap
        spacing={2}
        sx={{ alignItems: "flex-start", flexWrap: "wrap", mb: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <SectionTitle>
            {t("arkMods.downloaded.titleWithSize", {
              count: allMods.length,
              size: formatSize(total),
            })}
          </SectionTitle>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("arkMods.downloaded.hint")}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<CleaningServicesIcon />}
          disabled={disabled}
          onClick={onClean}
        >
          {t("arkMods.cleanup.open")}
        </Button>
      </Stack>
      <Stack divider={<Divider />}>
        {mods.map((info) => (
          <ArkModRow
            key={info.id}
            id={info.id}
            info={info}
            actions={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: FONT_MONO, color: "text.secondary" }}
                >
                  {formatSize(info.size)}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  disabled={disabled}
                  onClick={() => onAdd(info.id)}
                >
                  {t("arkMods.downloaded.add")}
                </Button>
              </Stack>
            }
          />
        ))}
      </Stack>
    </Box>
  );
}
