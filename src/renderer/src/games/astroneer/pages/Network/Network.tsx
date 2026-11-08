import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { astroConfigService } from "../../services/configService";
import { useAstroneerFirewall } from "./hooks/useAstroneerFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";
import PageHeader from "../../../../components/common/PageHeader";

export default function AstroneerNetwork() {
  const { t } = useTranslation();
  const [gamePort, setGamePort] = useState(8777);
  const [portReady, setPortReady] = useState(false);

  useEffect(() => {
    astroConfigService
      .readConfig()
      .then((cfg) => setGamePort(Number(cfg.Port) || 8777))
      .catch(() => {})
      .finally(() => setPortReady(true));
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
  } = useAstroneerFirewall(gamePort, portReady);

  return (
    <FormPage>
      <PageHeader
        title={t("astroneerNetwork.title")}
        subtitle={t("astroneerNetwork.subtitle")}
      />

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
