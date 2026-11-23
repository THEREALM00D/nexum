import { Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";
import type { useArkMods } from "../hooks/useArkMods";
import AddModField from "./AddModField";
import ArkModRow from "./ArkModRow";
import ListedModActions from "./ListedModActions";
import DownloadedModsList from "./DownloadedModsList";

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

interface Props {
  mods: ReturnType<typeof useArkMods>;
}

// Onglet Liste : ajout par ID, liste ordonnée du serveur, mods téléchargés
// hors liste. Fragment : les blocs prennent l'espacement de la page.
export default function ModListTab({ mods }: Props) {
  const { t } = useTranslation();
  const list = mods.data?.mods ?? [];

  return (
    <>
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
    </>
  );
}
