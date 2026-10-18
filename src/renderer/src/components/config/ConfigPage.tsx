import { useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { useConfigGroups } from "./useConfigGroups";
import { useConfigLoad } from "./useConfigLoad";
import ConfigGroup from "./ConfigGroup";
import ConfigField from "./ConfigField";
import ConfigPageHeader from "./ConfigPageHeader";
import ConfigSearchBar from "./ConfigSearchBar";
import type { ConfigSettings, FieldGroup } from "./types";
import { appErrorMessage } from "../../utils/appErrorMessage";

const SAVE_FLASH_MS = 2000;

interface ConfigPageProps {
  titleKey: string;
  subtitleKey: string;
  /** Chemin du dossier de config .ini à ouvrir, dérivé du serverPath. */
  folderPath: (serverPath: string) => string;
  fieldGroups: FieldGroup[];
  /** Préfixe des clés i18n des champs (ex: "config.fields"). */
  i18nFieldsPrefix: string;
  readConfig: () => Promise<ConfigSettings>;
  writeConfig: (
    settings: ConfigSettings,
  ) => Promise<{ success: boolean; error?: string }>;
  /**
   * Appelé après le changement d'un champ — utilisé par Palworld pour
   * appliquer un preset de difficulté quand `Difficulty` change.
   */
  onFieldChange?: (
    key: string,
    value: string | number | boolean,
    setFieldValue: (key: string, value: string | number | boolean) => void,
  ) => void;
  /**
   * Jeux qui réécrivent leur .ini pendant qu'ils tournent (Astroneer,
   * Dragonwilds) : une modification faite serveur lancé serait perdue.
   * Enregistrement bloqué tant que le serveur n'est pas arrêté, puis
   * relecture du fichier à l'arrêt (le serveur a pu le modifier).
   */
  lockWhileRunning?: boolean;
  /** Bloc d'information propre au jeu, affiché sous le titre. */
  notice?: ReactNode;
}

/**
 * Page de config .ini data-driven (groupes de champs, recherche,
 * expand/collapse) — partagée entre Palworld, Astroneer et Dragonwilds, qui
 * ne diffèrent que par le service de lecture/écriture, les clés i18n et
 * quelques options (preset Palworld, verrou serveur lancé).
 */
export default function ConfigPage({
  titleKey,
  subtitleKey,
  folderPath,
  fieldGroups,
  i18nFieldsPrefix,
  readConfig,
  writeConfig,
  onFieldChange,
  lockWhileRunning,
  notice,
}: ConfigPageProps) {
  const { t } = useTranslation();
  const { state } = useServer();
  const { notify } = useNotification();
  const [saved, setSaved] = useState(false);

  const groups = useConfigGroups(fieldGroups, i18nFieldsPrefix);

  const form = useForm({
    defaultValues: {} as ConfigSettings,
    onSubmit: async ({ value }) => {
      try {
        const res = await writeConfig(value);
        if (res.success) {
          markClean();
          setSaved(true);
          setTimeout(() => setSaved(false), SAVE_FLASH_MS);
        } else
          notify(
            appErrorMessage(t, res.error, t("config.unknownError")),
            "error",
          );
      } catch (e) {
        notify(appErrorMessage(t, (e as Error).message), "error");
      }
    },
  });

  const { loading, locked, markDirty, markClean } = useConfigLoad(
    readConfig,
    (settings) =>
      Object.entries(settings).forEach(([key, val]) =>
        form.setFieldValue(key as never, val as never),
      ),
    lockWhileRunning,
  );

  if (!state.serverPath) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60%",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>
          {t("config.noServerPath")}
        </Typography>
      </Box>
    );
  }

  if (loading)
    return (
      <Typography sx={{ color: "text.secondary" }}>
        {t("common.loading")}
      </Typography>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <ConfigPageHeader
        titleKey={titleKey}
        subtitleKey={subtitleKey}
        folderPath={folderPath(state.serverPath)}
      />

      {notice}

      {locked && (
        <Alert severity="warning" sx={{ fontSize: 13 }}>
          {t("configPage.lockedWhileRunning")}
        </Alert>
      )}

      <ConfigSearchBar
        search={groups.search}
        onSearch={groups.setSearch}
        allExpanded={groups.allExpanded}
        onToggleAll={groups.toggleAll}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Stack spacing={2}>
          {groups.visibleGroups.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("config.noResults", { query: groups.search })}
            </Typography>
          )}
          {groups.visibleGroups.map((group) => (
            <ConfigGroup
              key={group.labelKey}
              group={group}
              expanded={groups.expandedGroups.has(group.labelKey)}
              onToggle={() => groups.toggleGroup(group.labelKey)}
              renderField={(field) => (
                <form.Field name={field.key as never}>
                  {(f) => (
                    <ConfigField
                      field={field}
                      value={f.state.value as string | number | boolean}
                      i18nPrefix={i18nFieldsPrefix}
                      onChange={(v) => {
                        markDirty();
                        f.handleChange(v as never);
                        onFieldChange?.(field.key, v, (k, val) =>
                          form.setFieldValue(k as never, val as never),
                        );
                      }}
                    />
                  )}
                </form.Field>
              )}
            />
          ))}
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            color={saved ? "success" : "primary"}
            disabled={locked}
          >
            {saved ? t("config.saved") : t("config.save")}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
