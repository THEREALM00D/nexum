import { Badge, Box } from "@mui/material";

interface Props {
  label: string;
  /** Nombre de mods en pastille (rien à 0 ou pendant la lecture). */
  count: number;
}

/**
 * Libellé d'onglet avec le nombre de mods en pastille, commun aux pages
 * Mods (Valheim « Installés », ARK « Liste du serveur »).
 */
export default function ModCountTab({ label, count }: Props) {
  return (
    <Badge badgeContent={count} color="primary" max={99}>
      <Box sx={{ pr: count > 0 ? 1.5 : 0 }}>{label}</Box>
    </Badge>
  );
}
