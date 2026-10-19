import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDragonwildsFirewall } from "./hooks/useDragonwildsFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";

export default function DragonwildsNetwork() {
  const { t } = useTranslation();
  const [ports, setPorts] = useState({ game: 7777, beacon: 8888 });
  const [portsReady, setPortsReady] = useState(false);

  useEffect(() => {
    window.api.dragonwilds
      .getConfig()
      .then((cfg) => setPorts({ game: cfg.port, beacon: cfg.beaconPort }))
      .catch(() => {})
      .finally(() => setPortsReady(true));
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
  } = useDragonwildsFirewall(ports.game, ports.beacon, portsReady);

  return (
    <FormPage>
      <Box>
        <Typography variant="h6">{t("dragonwildsNetwork.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("dragonwildsNetwork.subtitle")}
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

      <CustomRules rules={customRules} loading={loading} onRefresh={refresh} />
    </FormPage>
  );
}
