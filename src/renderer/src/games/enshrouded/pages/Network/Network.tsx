import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEnshroudedFirewall } from "./hooks/useEnshroudedFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";
import { enshroudedConfigService } from "../../services/configService";
import PageHeader from "../../../../components/common/PageHeader";

export default function EnshroudedNetwork() {
  const { t } = useTranslation();
  const [queryPort, setQueryPort] = useState(15637);
  const [portReady, setPortReady] = useState(false);

  useEffect(() => {
    enshroudedConfigService
      .readConfig()
      .then((cfg) => setQueryPort(cfg.queryPort))
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
  } = useEnshroudedFirewall(queryPort, portReady);

  return (
    <FormPage>
      <PageHeader
        title={t("enshroudedNetwork.title")}
        subtitle={t("enshroudedNetwork.subtitle")}
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
