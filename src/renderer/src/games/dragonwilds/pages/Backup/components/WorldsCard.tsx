import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { useTranslation } from "react-i18next";
import type { DragonwildsWorld } from "@shared/types";
import { useDragonwildsWorlds } from "../hooks/useDragonwildsWorlds";
import WorldRow from "./WorldRow";
import LoadingSkeleton, {
  skeletonRows,
} from "../../../../../components/common/LoadingSkeleton";

// Monde d'exemple des lignes en skeleton (jamais affiché)
const PLACEHOLDER_WORLD: DragonwildsWorld = {
  worldName: "World",
  fileName: "World.sav",
  path: "",
  sizeBytes: 250_000,
  lastModified: 0,
};

/**
 * Mondes Dragonwilds : celui que le serveur charge au démarrage
 * (DefaultWorldName = nom du fichier .sav), les autres mondes du serveur, et
 * l'import d'un monde solo de ce PC ou d'un fichier .sav.
 */
export default function WorldsCard({
  onImported,
}: {
  onImported: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { worlds, busy, stopped, loadWorld, importWorld, importFromFile } =
    useDragonwildsWorlds(onImported);
  // Pas encore lus : la carte garde sa forme, contenu en skeleton
  const loading = worlds === null;
  const disabled = loading || !stopped || busy;
  const placeholderRow = (
    <WorldRow
      world={PLACEHOLDER_WORLD}
      actionLabel={t("dragonwildsWorlds.load")}
      disabled
      onAction={() => {}}
    />
  );

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {t("dragonwildsWorlds.title")}
      </Typography>
      <LoadingSkeleton loading={loading} sx={{ mb: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: loading ? 0 : 1.5 }}
        >
          {worlds?.current || loading
            ? t("dragonwildsWorlds.currentHint", {
                name: worlds?.current ?? "World",
              })
            : t("dragonwildsWorlds.noCurrent")}
        </Typography>
      </LoadingSkeleton>

      {!stopped && (
        <Alert severity="warning" sx={{ fontSize: 13, mb: 1.5 }}>
          {t("dragonwildsWorlds.stopFirst")}
        </Alert>
      )}

      <Stack divider={<Divider flexItem />}>
        {loading && skeletonRows(placeholderRow, 2)}
        {worlds?.server.map((w) => (
          <WorldRow
            key={w.path}
            world={w}
            current={w.worldName === worlds?.current}
            actionLabel={t("dragonwildsWorlds.load")}
            disabled={disabled}
            onAction={() => loadWorld(w.worldName)}
          />
        ))}
      </Stack>
      {worlds?.server.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("dragonwildsWorlds.noServerWorlds")}
        </Typography>
      )}

      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5 }}>
        {t("dragonwildsWorlds.importTitle")}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {t("dragonwildsWorlds.importHint")}
      </Typography>
      <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
        {loading && skeletonRows(placeholderRow, 1)}
        {worlds?.solo.map((w) => (
          <WorldRow
            key={w.path}
            world={w}
            actionLabel={t("dragonwildsWorlds.import")}
            disabled={disabled}
            onAction={() => importWorld(w.path)}
          />
        ))}
      </Stack>
      {worlds?.solo.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("dragonwildsWorlds.noSoloWorlds", { dir: worlds.soloDir })}
        </Typography>
      )}
      <Box sx={{ mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<FileOpenIcon />}
          disabled={disabled}
          onClick={importFromFile}
        >
          {t("dragonwildsWorlds.importFile")}
        </Button>
      </Box>
    </Paper>
  );
}
