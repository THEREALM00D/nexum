import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";

interface Props {
  /** Logo du registre ; absent : icône de remplacement (même place). */
  logoUrl?: string | null;
  name: string;
  /** Après le nom, en petit (version…). */
  nameSuffix?: ReactNode;
  /** Puces après le nom (registre, mise à jour, cosmétique…). */
  chips?: ReactNode;
  /** Ligne de détails (auteur, dates, fichier…). */
  details: ReactNode;
  /** Résumé du mod, sous les détails. */
  summary?: string;
  /** Mod désactivé : ligne estompée. */
  dimmed?: boolean;
  /** Interrupteur, ordre, page du mod, retirer… */
  actions?: ReactNode;
}

const LOGO_SIZE = 40;

/**
 * Une ligne de mod, commune aux pages Mods (Valheim, ARK) : logo, nom,
 * puces, détails et actions. Passe à la ligne dans une fenêtre étroite.
 * Sert aussi aux skeletons (données factices).
 */
export default function ModRow({
  logoUrl,
  name,
  nameSuffix,
  chips,
  details,
  summary,
  dimmed,
  actions,
}: Props) {
  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        alignItems: "center",
        gap: 2,
        py: 1.25,
        flexWrap: "wrap",
        opacity: dimmed ? 0.55 : 1,
      }}
    >
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt=""
          loading="lazy"
          sx={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            objectFit: "cover",
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            borderRadius: 1,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <ExtensionIcon fontSize="small" />
        </Box>
      )}
      <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {name}
            {nameSuffix && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.secondary", ml: 0.75 }}
              >
                {nameSuffix}
              </Typography>
            )}
          </Typography>
          {chips}
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block" }}
          noWrap
        >
          {details}
        </Typography>
        {summary && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
            noWrap
          >
            {summary}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
