import { useState } from "react";
import {
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import { useTranslation } from "react-i18next";
import type { ArkProfilePlayer, ArkProfileVersion } from "@shared/types";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import SearchField from "../../../../../components/common/SearchField";
import SectionTitle from "../../../../../components/common/SectionTitle";
import LoadingSkeleton, {
  skeletonRows,
} from "../../../../../components/common/LoadingSkeleton";
import ProfileRow from "./ProfileRow";

// Ligne d'exemple des skeletons (forme d'un vrai joueur, jamais affichée).
const PLACEHOLDER: ArkProfilePlayer = {
  eosId: "00000000000000000000000000000000",
  playerName: "Survivor",
  characterName: "Human",
  versions: [{ id: "", createdAt: 0, size: 50_000 }],
};

interface Props {
  players: ArkProfilePlayer[];
  loading: boolean;
  backingUp: boolean;
  /** Sauvegarde des profils activée (texte de la liste vide). */
  enabled: boolean;
  hasServer: boolean;
  canRestore: boolean;
  onBackupNow: () => void;
  onRestore: (player: ArkProfilePlayer, version: ArkProfileVersion) => void;
}

const matches = (player: ArkProfilePlayer, search: string) =>
  [player.playerName, player.characterName, player.eosId].some((text) =>
    text?.toLowerCase().includes(search),
  );

/** Carte « Profils sauvegardés » : recherche, sauvegarde manuelle, joueurs. */
export default function ProfileList({
  players,
  loading,
  backingUp,
  enabled,
  hasServer,
  canRestore,
  onBackupNow,
  onRestore,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const shown = query
    ? players.filter((player) => matches(player, query))
    : players;
  const noop = () => {};

  const empty =
    players.length === 0
      ? t(
          enabled
            ? "arkBackup.profiles.emptyEnabled"
            : "arkBackup.profiles.emptyDisabled",
        )
      : t("arkBackup.profiles.noMatch");

  return (
    <ScrollPanel
      padding={2.5}
      minHeight={200}
      resetKey={query}
      header={
        <>
          <Stack
            direction="row"
            useFlexGap
            spacing={1.5}
            sx={{ alignItems: "center", flexWrap: "wrap", mb: 1.5 }}
          >
            <LoadingSkeleton loading={loading} sx={{ flex: 1 }}>
              <SectionTitle sx={{ flex: 1 }}>
                {t("arkBackup.profiles.title", { count: players.length })}
              </SectionTitle>
            </LoadingSkeleton>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder={t("arkBackup.profiles.search")}
              sx={{ width: 260, maxWidth: "100%" }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={
                backingUp ? <CircularProgress size={14} /> : <BackupIcon />
              }
              disabled={!hasServer || backingUp}
              onClick={onBackupNow}
            >
              {t("arkBackup.profiles.backupNow")}
            </Button>
          </Stack>
          <Divider />
        </>
      }
    >
      {loading ? (
        <Stack>
          {skeletonRows(
            <ProfileRow
              player={PLACEHOLDER}
              canRestore={false}
              onRestore={noop}
            />,
          )}
        </Stack>
      ) : shown.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center", py: 4, px: 1 }}
        >
          {empty}
        </Typography>
      ) : (
        <Stack>
          {shown.map((player) => (
            <ProfileRow
              key={player.eosId}
              player={player}
              canRestore={canRestore}
              onRestore={onRestore}
            />
          ))}
        </Stack>
      )}
    </ScrollPanel>
  );
}
