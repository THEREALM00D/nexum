import type { ReactNode } from "react";
import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkLaunchImport, ArkWorldLocation } from "@shared/types";
import { formatDay } from "../../../../utils/format";
import SectionTitle from "../../../../components/common/SectionTitle";
import LaunchImportWarnings from "./LaunchImportWarnings";

interface Props {
  preview: ArkLaunchImport;
  saveDirectory: string;
  onSaveDirectoryChange: (saveDirectory: string) => void;
}

// Options affichées à part (Cluster) : pas répétées dans la liste.
const CLUSTER_KEYS = ["clusterid", "ClusterDirOverride"];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "baseline" }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", flex: "0 0 180px" }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ flex: "1 1 240px", minWidth: 0, overflowWrap: "anywhere" }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/** Ce que l'import reprendra, avec le choix du monde et ce qui est signalé. */
export default function LaunchImportSummary({
  preview,
  saveDirectory,
  onSaveDirectoryChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const { launch, modSettings: mods } = preview;
  const options = Object.entries(launch.launchOptions)
    .filter(([key]) => !CLUSTER_KEYS.includes(key))
    .map(([key, value]) => (value === "True" ? `-${key}` : `${key}=${value}`));
  const clusterId = launch.launchOptions.clusterid;
  const worldLabel = (world: ArkWorldLocation) =>
    t("arkLaunchImport.worldOption", {
      folder: world.saveDirectory || "SavedArks",
      date: formatDay(world.modifiedAt, i18n.language),
      profiles: world.profiles,
      tribes: world.tribes,
    });

  return (
    <Stack spacing={1.5}>
      <SectionTitle>{t("arkLaunchImport.summary")}</SectionTitle>
      <Row label={t("arkLaunchImport.map")}>{launch.map}</Row>
      <Row label={t("arkLaunchImport.world")}>
        {preview.worlds.length > 1 ? (
          <TextField
            select
            size="small"
            fullWidth
            value={saveDirectory}
            onChange={(event) => onSaveDirectoryChange(event.target.value)}
            slotProps={{
              select: {
                // SavedArks a la valeur "" : sans displayEmpty, le champ
                // restait vide alors que ce monde était choisi.
                displayEmpty: true,
                SelectDisplayProps: {
                  "aria-label": t("arkLaunchImport.world"),
                },
              },
            }}
          >
            {preview.worlds.map((world) => (
              <MenuItem key={world.saveDirectory} value={world.saveDirectory}>
                {worldLabel(world)}
              </MenuItem>
            ))}
          </TextField>
        ) : preview.worlds.length === 1 ? (
          worldLabel(preview.worlds[0])
        ) : (
          t("arkLaunchImport.newWorld")
        )}
        {preview.lineSaveDirectory &&
          saveDirectory !== preview.lineSaveDirectory && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t(
                // Présélection du main = le plus récent ; un autre choix
                // est celui de l'utilisateur.
                saveDirectory === launch.saveDirectory
                  ? "arkLaunchImport.worldHint"
                  : "arkLaunchImport.worldLineHint",
                { folder: preview.lineSaveDirectory },
              )}
            </Typography>
          )}
      </Row>
      <Row label={t("arkLaunchImport.ports")}>
        {t("arkLaunchImport.portsValue", {
          game: launch.port,
          query: launch.queryPort,
          rcon: launch.rconPort,
        })}
      </Row>
      <Row label={t("arkLaunchImport.players")}>{launch.maxPlayers}</Row>
      <Row label={t("arkLaunchImport.battlEye")}>
        {t(launch.battlEye ? "arkLaunchImport.yes" : "arkLaunchImport.no")}
      </Row>
      <Row label={t("arkLaunchImport.mods")}>
        {t("arkLaunchImport.modsCount", { count: launch.mods.length })}
      </Row>
      {clusterId && (
        <Row label={t("arkLaunchImport.cluster")}>
          {t("arkLaunchImport.clusterValue", {
            id: clusterId,
            folder: launch.launchOptions.ClusterDirOverride ?? "—",
          })}
        </Row>
      )}
      <Row label={t("arkLaunchImport.options")}>
        {options.join(" ") || t("arkLaunchImport.none")}
      </Row>
      <Row label={t("arkLaunchImport.iniSettings")}>
        {preview.iniKeys.join(", ") || t("arkLaunchImport.none")}
      </Row>
      <Row label={t("arkLaunchImport.customArgs")}>
        {launch.customArgs || t("arkLaunchImport.none")}
      </Row>
      <Row label={t("arkLaunchImport.modSettings")}>
        {mods.iniSections.length === 0 && mods.files.length === 0
          ? t("arkLaunchImport.none")
          : [
              mods.iniSections.length > 0 &&
                t("arkLaunchImport.modSections", {
                  count: mods.iniSections.length,
                  list: mods.iniSections.join(", "),
                }),
              mods.files.length > 0 &&
                t("arkLaunchImport.modFiles", {
                  count: mods.files.length,
                  list: mods.files.join(", "),
                }),
            ]
              .filter(Boolean)
              .map((text) => <div key={String(text)}>{text}</div>)}
      </Row>
      <LaunchImportWarnings preview={preview} />
    </Stack>
  );
}
