import { Box, Skeleton, Stack } from "@mui/material";

/**
 * Page en cours de chargement au lancement de l'app (serveurs pas encore
 * lus, donc page du jeu inconnue) : titre, sous-titre et blocs de contenu.
 * Mêmes tailles de texte que l'en-tête des pages (h6 + body2).
 */
export default function PageSkeleton() {
  return (
    <Stack spacing={3}>
      <Box>
        <Skeleton variant="text" width={240} sx={{ fontSize: "1.25rem" }} />
        <Skeleton
          variant="text"
          width={360}
          sx={{ fontSize: "0.875rem", mt: 0.5 }}
        />
      </Box>
      <Skeleton variant="rounded" height={72} />
      <Skeleton variant="rounded" height={140} />
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}
