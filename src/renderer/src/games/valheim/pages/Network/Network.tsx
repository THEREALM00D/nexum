import { useTranslation } from "react-i18next";
import { useValheimConfig } from "../Config/hooks/useValheimConfig";
import { useValheimFirewall } from "./hooks/useValheimFirewall";
import AdminBanner from "../../../../components/firewall/AdminBanner";
import StandardRules from "../../../../components/firewall/StandardRules";
import CustomRules from "../../../../components/firewall/CustomRules";
import FormPage from "../../../../components/common/FormPage";
import PageHeader from "../../../../components/common/PageHeader";

export default function ValheimNetwork() {
  const { t } = useTranslation();
  const { config, loading: configLoading } = useValheimConfig();
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
  } = useValheimFirewall(gamePort, !configLoading);

  return (
    <FormPage>
      <PageHeader
        title={t("valheimNetwork.title")}
        subtitle={t("valheimNetwork.subtitle")}
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
