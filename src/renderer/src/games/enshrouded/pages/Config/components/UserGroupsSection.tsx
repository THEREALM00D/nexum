import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import Section from "../../../../../components/common/Section";
import UserGroupRow from "./UserGroupRow";
import type { useEnshroudedGroups } from "../hooks/useEnshroudedGroups";

/**
 * Groupes d'utilisateurs : le mot de passe saisi en rejoignant donne les
 * droits du groupe. Enregistré à part, comme l'administration de Valheim.
 */
export default function UserGroupsSection({
  groups,
}: {
  groups: ReturnType<typeof useEnshroudedGroups>;
}) {
  const { t } = useTranslation();
  return (
    <Section
      label={t("enshroudedConfig.sections.userGroups")}
      loading={groups.loading}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("enshroudedConfig.userGroups.description")}
      </Typography>
      {groups.groups.length === 0 && (
        <Typography variant="body2" sx={{ color: "warning.main" }}>
          {t("enshroudedConfig.userGroups.empty")}
        </Typography>
      )}
      {groups.groups.map((group, index) => (
        // Index en clé : le nom est éditable (et peut être vide ou en double)
        <UserGroupRow
          key={index}
          group={group}
          onChange={(patch) => groups.update(index, patch)}
          onRemove={() => groups.remove(index)}
        />
      ))}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={groups.add}
        >
          {t("enshroudedConfig.userGroups.add")}
        </Button>
        <Button
          variant="contained"
          size="small"
          color={groups.saved ? "success" : "primary"}
          onClick={groups.save}
          disabled={groups.locked}
        >
          {groups.saved
            ? t("enshroudedConfig.userGroups.saved")
            : t("enshroudedConfig.userGroups.save")}
        </Button>
      </Stack>
    </Section>
  );
}
