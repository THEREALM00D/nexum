import { useEffect, useState } from "react";
import {
  Box,
  ButtonBase,
  Collapse,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import type { CpuPriority } from "@shared/types";
import {
  CPU_PRIORITIES,
  formatCoreList,
  MAX_AFFINITY_CORES,
} from "@shared/processTuning";
import { FOCUS_RING_SX, FONT_MONO } from "../../../theme";

interface Props {
  priority: CpuPriority;
  /** Cœurs choisis, vide = tous. */
  cores: number[];
  onChange: (patch: { cpuPriority?: CpuPriority; cpuCores?: number[] }) => void;
}

/**
 * « Avancé · Processeur » du dialogue du serveur : priorité et cœurs,
 * appliqués au prochain démarrage (`src/main/server/processTuning.ts`).
 * Repliée par défaut : la plupart n'en ont pas besoin.
 */
export default function ProcessorFields({ priority, cores, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [cpuCount, setCpuCount] = useState(0);

  useEffect(() => {
    window.api.app
      .getCpuCount()
      .then(setCpuCount)
      .catch(() => setCpuCount(0));
  }, []);

  const count = Math.min(cpuCount, MAX_AFFINITY_CORES);
  const allCores = Array.from({ length: count }, (_, core) => core);
  const selected = cores.filter((core) => core < count);
  const usesAll = selected.length === 0;
  const isOn = (core: number) => usesAll || selected.includes(core);

  const toggle = (core: number) => {
    const next = usesAll
      ? allCores.filter((candidate) => candidate !== core)
      : selected.includes(core)
        ? selected.filter((candidate) => candidate !== core)
        : [...selected, core].sort((first, second) => first - second);
    // Au moins un cœur ; tous cochés = « Tous » (rien d'enregistré).
    if (next.length === 0) return;
    onChange({ cpuCores: next.length === count ? [] : next });
  };

  const free = allCores.filter((core) => !isOn(core));
  // Résumé d'après le réglage enregistré, pas d'après `count` : 0 tant que
  // le nombre de cœurs n'est pas lu, il affichait « tous les cœurs ».
  const summary = [
    t(`servers.dialog.processor.priorities.${priority}`),
    cores.length === 0
      ? t("servers.dialog.processor.allCores")
      : t("servers.dialog.processor.someCores", {
          cores: formatCoreList(cores),
        }),
  ].join(" · ");

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <ButtonBase
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: "100%",
          px: 1.75,
          py: 1.25,
          justifyContent: "space-between",
          gap: 2,
          borderRadius: 1,
          ...FOCUS_RING_SX,
        }}
      >
        <Stack sx={{ alignItems: "flex-start", minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t("servers.dialog.processor.title")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {summary}
          </Typography>
        </Stack>
        <ExpandMoreIcon
          aria-hidden
          sx={{
            color: "text.secondary",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms",
          }}
        />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Stack spacing={2} sx={{ px: 1.75, pt: 1, pb: 2 }}>
          <FormControl size="small" sx={{ maxWidth: 280 }}>
            <InputLabel>{t("servers.dialog.processor.priority")}</InputLabel>
            <Select
              label={t("servers.dialog.processor.priority")}
              value={priority}
              onChange={(event) =>
                onChange({ cpuPriority: event.target.value as CpuPriority })
              }
            >
              {CPU_PRIORITIES.map((level) => (
                <MenuItem key={level} value={level}>
                  {t(`servers.dialog.processor.priorities.${level}`)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {t("servers.dialog.processor.priorityHelper")}
            </FormHelperText>
          </FormControl>

          {count > 1 && (
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("servers.dialog.processor.cores", { count: cpuCount })}
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                role="group"
                aria-label={t("servers.dialog.processor.cores", {
                  count: cpuCount,
                })}
                sx={{ flexWrap: "wrap" }}
              >
                <ToggleButton
                  value="all"
                  size="small"
                  selected={usesAll}
                  onChange={() => onChange({ cpuCores: [] })}
                >
                  {t("servers.dialog.processor.all")}
                </ToggleButton>
                {allCores.map((core) => (
                  <ToggleButton
                    key={core}
                    value={core}
                    size="small"
                    selected={isOn(core)}
                    onChange={() => toggle(core)}
                    sx={{ fontFamily: FONT_MONO, minWidth: 40 }}
                  >
                    {core}
                  </ToggleButton>
                ))}
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {usesAll
                  ? t("servers.dialog.processor.allHelper")
                  : t("servers.dialog.processor.freeHelper", {
                      cores: formatCoreList(free),
                    })}
              </Typography>
            </Stack>
          )}
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("servers.dialog.processor.appliedHint")}
          </Typography>
        </Stack>
      </Collapse>
    </Box>
  );
}
