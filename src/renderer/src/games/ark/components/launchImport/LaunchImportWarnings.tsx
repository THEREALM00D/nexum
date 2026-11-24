import { Alert, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkLaunchImport } from "@shared/types";

/**
 * Ce que l'import signale : ports déjà pris par un serveur de Nexum,
 * plugins ServerAPI non chargés, options non reprises telles quelles.
 */
export default function LaunchImportWarnings({
  preview,
}: {
  preview: ArkLaunchImport;
}) {
  const { t } = useTranslation();
  const plugins = preview.modSettings.serverApiPlugins;
  const conflicts = preview.conflicts
    .map((conflict) =>
      t("arkLaunchImport.conflictItem", {
        label: t(`arkLaunchImport.portLabels.${conflict.label}`, {
          defaultValue: conflict.label,
        }),
        port: conflict.port,
        protocol: conflict.protocol,
        server: conflict.serverName,
      }),
    )
    .join(", ");

  return (
    <>
      {preview.conflicts.length > 0 && (
        <Alert severity="warning">
          {t("arkLaunchImport.conflicts", { list: conflicts })}{" "}
          {t("arkLaunchImport.conflictsHint")}
        </Alert>
      )}
      {plugins.length > 0 && (
        <Alert severity="warning">
          {t("arkLaunchImport.serverApi", {
            count: plugins.length,
            list: plugins.join(", "),
          })}
        </Alert>
      )}
      {preview.notices.length > 0 && (
        <Alert severity="warning">
          {t("arkLaunchImport.notices")}
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {preview.notices.map((notice) => (
              <li key={`${notice.code}:${notice.detail}`}>
                {t(`arkLaunchImport.notice.${notice.code}`, {
                  detail: notice.detail,
                })}
              </li>
            ))}
          </Box>
        </Alert>
      )}
    </>
  );
}
