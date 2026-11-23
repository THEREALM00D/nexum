import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useArkFirewall } from "./hooks/useArkFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";
import PageHeader from "../../../../components/common/PageHeader";
import { arkConfigService } from "../../services/configService";

export default function ArkNetwork() {
  const { t } = useTranslation();
  const [port, setPort] = useState(7777);
  const [portReady, setPortReady] = useState(false);

  useEffect(() => {
    arkConfigService
      .readConfig()
      .then((config) => setPort(Number(config.port)))
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
  } = useArkFirewall(port, portReady);

  return (
    <FormPage>
      <PageHeader
        title={t("arkNetwork.title")}
        subtitle={t("arkNetwork.subtitle")}
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
