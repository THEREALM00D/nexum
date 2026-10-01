import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useValheimConfig } from "../Config/hooks/useValheimConfig";
import { useValheimFirewall } from "./hooks/useValheimFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";

export default function ValheimNetwork() {
  const { t } = useTranslation();
  const { config } = useValheimConfig();
  const gamePort = config.port || 2456;
  const {
    isAdmin,
    rules,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  } = useValheimFirewall(gamePort);

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">{t("valheimNetwork.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("valheimNetwork.subtitle")}
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
    </Stack>
  );
}
