import { Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import PageHeader from "../../../../components/common/PageHeader";
import ScrollPanel from "../../../../components/common/ScrollPanel";
import { skeletonRows } from "../../../../components/common/LoadingSkeleton";
import { useServer } from "../../../../context/ServerContext";
import { useArkMods } from "./hooks/useArkMods";
import AddModField from "./components/AddModField";
import ArkModRow from "./components/ArkModRow";
import ListedModActions from "./components/ListedModActions";
import DownloadedModsList from "./components/DownloadedModsList";
import ModsNotices from "./components/ModsNotices";

// Ligne factice des skeletons (vrai composant, données réalistes).
const PLACEHOLDER: ArkModInfo = {
  id: 928621,
  name: "Utilities Plus",
  summary: "",
  logoUrl: null,
  authors: ["blitzfire911"],
  websiteUrl: null,
  premium: false,
  installedFile: "utilities-plus-windowsserver-10.zip",
  installedFileDate: "2026-11-03T08:59:25Z",
};

/**
 * Mods CurseForge du serveur : liste ordonnée écrite dans -mods=, téléchargée
 * et mise à jour par le serveur lui-même à chaque démarrage.
 */
export default function ArkMods() {
  const { t } = useTranslation();
  const { state } = useServer();
  const mods = useArkMods();
  const running = state.status !== "stopped" && state.status !== "crashed";
  const list = mods.data?.mods ?? [];

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <PageHeader title={t("arkMods.title")} subtitle={t("arkMods.subtitle")} />

      <ModsNotices
        running={running}
        argsMods={mods.data?.argsMods ?? []}
        disabled={mods.busy}
        onTakeFromArgs={() => void mods.takeFromArgs()}
      />

      <AddModField
        disabled={mods.busy || mods.loading}
        lookupAvailable={mods.data?.lookupAvailable ?? true}
        onAdd={mods.add}
      />

      <ScrollPanel minHeight={200}>
        <Stack divider={<Divider />}>
          {mods.loading
            ? skeletonRows(
                <ArkModRow
                  id={PLACEHOLDER.id}
                  info={PLACEHOLDER}
                  actions={null}
                />,
                3,
              )
            : list.map((mod, index) => (
                <ArkModRow
                  key={mod.id}
                  id={mod.id}
                  info={mod.info}
                  dimmed={!mod.enabled}
                  actions={
                    <ListedModActions
                      enabled={mod.enabled}
                      websiteUrl={mod.info?.websiteUrl ?? null}
                      isFirst={index === 0}
                      isLast={index === list.length - 1}
                      disabled={mods.busy}
                      onToggle={(enabled) => void mods.toggle(mod.id, enabled)}
                      onMove={(offset) => mods.move(mod.id, offset)}
                      onRemove={() => void mods.remove(mod.id)}
                    />
                  }
                />
              ))}
        </Stack>
        {!mods.loading && list.length === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
            {t("arkMods.list.empty")}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 2 }}
        >
          {t("arkMods.list.hint")}
        </Typography>
      </ScrollPanel>

      <DownloadedModsList
        mods={mods.data?.downloadedNotListed ?? []}
        disabled={mods.busy}
        onAdd={(id) => void mods.add(id)}
      />
    </Stack>
  );
}
