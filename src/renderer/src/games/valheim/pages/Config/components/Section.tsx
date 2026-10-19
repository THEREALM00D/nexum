import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { SkeletonChildren } from "../../../../../components/common/LoadingSkeleton";

export default function Section({
  label,
  loading = false,
  children,
}: {
  label: string;
  /** Pendant le chargement : titre visible, chaque champ en skeleton. */
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          color: "text.secondary",
          textTransform: "uppercase",
          fontSize: 11,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Stack spacing={2}>
        <SkeletonChildren loading={loading}>{children}</SkeletonChildren>
      </Stack>
    </Paper>
  );
}
