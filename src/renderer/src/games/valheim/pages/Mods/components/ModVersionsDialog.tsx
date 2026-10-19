import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import type {
  ThunderstoreModInfo,
  ThunderstoreModVersion,
} from "@shared/types";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";

// Version d'exemple des lignes en skeleton (jamais affichée)
const PLACEHOLDER_VERSION: ThunderstoreModVersion = {
  file_id: 0,
  file_name: "Author-ModName-1.0.0.zip",
  version: "1.0.0",
  size_kb: 100,
  category_name: "",
  description: "",
  uploaded_timestamp: 0,
};

function VersionRow({
  version,
  onInstall,
}: {
  version: ThunderstoreModVersion;
  onInstall: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box sx={{ py: 1.5 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {version.file_name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("valheimMods.browse.filesDialog.size", {
              size: version.size_kb.toLocaleString(),
            })}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onInstall}
        >
          {t("valheimMods.thunderstore.install")}
        </Button>
      </Stack>
    </Box>
  );
}

interface Props {
  mod: ThunderstoreModInfo;
  /** null tant que les versions ne sont pas chargées (lignes en skeleton). */
  versions: ThunderstoreModVersion[] | null;
  onInstall: (code: string) => void;
  onClose: () => void;
}

/** Versions publiées d'un mod (onglet Parcourir), chacune installable. */
export default function ModVersionsDialog({
  mod,
  versions,
  onInstall,
  onClose,
}: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("valheimMods.browse.filesDialog.title", { name: mod.name })}
      </DialogTitle>
      <DialogContent dividers>
        {versions?.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimMods.browse.filesDialog.noFiles")}
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {versions === null
              ? skeletonRows(
                  <VersionRow
                    version={PLACEHOLDER_VERSION}
                    onInstall={() => {}}
                  />,
                )
              : versions.map((v) => (
                  <VersionRow
                    key={v.file_id}
                    version={v}
                    onInstall={() =>
                      onInstall(`${mod.author}-${mod.name}-${v.version}`)
                    }
                  />
                ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t("valheimMods.browse.filesDialog.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
