import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useFirewall } from "./hooks/useFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";

export default function Network() {
  const { t } = useTranslation();
  const { state } = useServer();
  const {
    isAdmin,
    rules,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  } = useFirewall(state.serverPath);

  return (
    <FormPage>
      <Box>
        <Typography variant="h6">{t("network.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("network.subtitle")}
        </Typography>
      </Box>

      <AdminBanner isAdmin={isAdmin} />

      <StandardRules
        rules={rules}
        loading={loading}
        onRefresh={refresh}
        onToggle={onToggle}
        onApplyAll={onApplyAll}
        onRemoveAll={onRemoveAll}
      />

      <CustomRules rules={customRules} onRefresh={refresh} />
    </FormPage>
  );
}
