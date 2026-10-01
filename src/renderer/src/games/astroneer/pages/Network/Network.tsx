import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { astroConfigService } from "../../services/configService";
import { useAstroneerFirewall } from "./hooks/useAstroneerFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";

export default function AstroneerNetwork() {
  const { t } = useTranslation();
  const [gamePort, setGamePort] = useState(8777);

  useEffect(() => {
    astroConfigService
      .readConfig()
      .then((cfg) => setGamePort(Number(cfg.Port) || 8777))
      .catch(() => {});
  }, []);

  const {
    isAdmin,
    rules,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  } = useAstroneerFirewall(gamePort);

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">{t("astroneerNetwork.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("astroneerNetwork.subtitle")}
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
