import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Section from "./Section";
import AdminListField from "./AdminListField";

interface AdminListState {
  value: string;
  saved: boolean;
  loading: boolean;
  handleChange: (v: string) => void;
  handleSave: () => void;
}

export default function AdministrationSection({
  adminList,
  bannedList,
  permittedList,
}: {
  adminList: AdminListState;
  bannedList: AdminListState;
  permittedList: AdminListState;
}) {
  const { t } = useTranslation();
  return (
    <Section
      label={t("valheimConfig.sections.administration")}
      loading={adminList.loading || bannedList.loading || permittedList.loading}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("valheimConfig.administration.description")}
      </Typography>
      <AdminListField
        label={t("valheimConfig.administration.adminList")}
        helper={t("valheimConfig.administration.adminListHelper")}
        value={adminList.value}
        saved={adminList.saved}
        onChange={adminList.handleChange}
        onSave={adminList.handleSave}
        saveLabel={t("valheimConfig.administration.save")}
        savedLabel={t("valheimConfig.administration.saved")}
      />
      <AdminListField
        label={t("valheimConfig.administration.bannedList")}
        helper={t("valheimConfig.administration.bannedListHelper")}
        value={bannedList.value}
        saved={bannedList.saved}
        onChange={bannedList.handleChange}
        onSave={bannedList.handleSave}
        saveLabel={t("valheimConfig.administration.save")}
        savedLabel={t("valheimConfig.administration.saved")}
      />
      <AdminListField
        label={t("valheimConfig.administration.permittedList")}
        helper={t("valheimConfig.administration.permittedListHelper")}
        value={permittedList.value}
        saved={permittedList.saved}
        onChange={permittedList.handleChange}
        onSave={permittedList.handleSave}
        saveLabel={t("valheimConfig.administration.save")}
        savedLabel={t("valheimConfig.administration.saved")}
      />
    </Section>
  );
}
