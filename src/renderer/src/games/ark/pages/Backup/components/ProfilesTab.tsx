import { useState } from "react";
import { Box } from "@mui/material";
import { useArkProfiles, type RestoreRequest } from "../hooks/useArkProfiles";
import ProfileBackupSettings from "./ProfileBackupSettings";
import ProfileList from "./ProfileList";
import RestoreProfileDialog from "./RestoreProfileDialog";

/** Onglet « Profils des joueurs » de la page Sauvegardes d'ARK. */
export default function ProfilesTab() {
  const profiles = useArkProfiles();
  const [request, setRequest] = useState<RestoreRequest | null>(null);

  return (
    <Box
      sx={{
        display: "grid",
        // Une colonne sous 900 px de large (réglages au-dessus de la liste).
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "340px minmax(0, 1fr)",
        },
        gap: 3,
        alignItems: "start",
        flex: 1,
        minHeight: 0,
      }}
    >
      <ProfileBackupSettings
        config={profiles.config}
        loading={profiles.loading}
        onChange={profiles.changeConfig}
      />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <ProfileList
          players={profiles.players}
          loading={profiles.loading}
          backingUp={profiles.backingUp}
          enabled={profiles.config.intervalMinutes > 0}
          hasServer={profiles.hasServer}
          canRestore={profiles.canRestore}
          onBackupNow={profiles.backupNow}
          onRestore={(player, version) => setRequest({ player, version })}
        />
      </Box>
      <RestoreProfileDialog
        request={request}
        restoring={profiles.restoring}
        onCancel={() => setRequest(null)}
        onConfirm={async (current) => {
          if (await profiles.restore(current)) setRequest(null);
        }}
      />
    </Box>
  );
}
