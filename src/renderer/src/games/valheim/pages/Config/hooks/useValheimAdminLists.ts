import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";

interface ListState {
  value: string;
  saved: boolean;
}

function useList(
  getter: () => Promise<string[]>,
  setter: (list: string[]) => Promise<void>,
) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [state, setState] = useState<ListState>({ value: "", saved: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getter()
      .then((list) => setState({ value: list.join("\n"), saved: false }))
      .catch(() =>
        notify(t("valheimConfig.administration.loadFailed"), "error"),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value: string) => {
    setState({ value, saved: false });
  };

  const handleSave = async () => {
    const list = state.value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    try {
      await setter(list);
      setState((prev) => ({ ...prev, saved: true }));
      setTimeout(() => setState((prev) => ({ ...prev, saved: false })), 2000);
    } catch {
      notify(t("valheimConfig.administration.saveFailed"), "error");
    }
  };

  return {
    value: state.value,
    saved: state.saved,
    loading,
    handleChange,
    handleSave,
  };
}

export function useValheimAdminLists() {
  const adminList = useList(
    () => window.api.valheim.getAdminList(),
    (list) => window.api.valheim.setAdminList(list),
  );
  const bannedList = useList(
    () => window.api.valheim.getBannedList(),
    (list) => window.api.valheim.setBannedList(list),
  );
  const permittedList = useList(
    () => window.api.valheim.getPermittedList(),
    (list) => window.api.valheim.setPermittedList(list),
  );

  return { adminList, bannedList, permittedList };
}
