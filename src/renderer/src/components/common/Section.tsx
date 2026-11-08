import { Paper, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { SkeletonChildren } from "./LoadingSkeleton";
import SectionTitle from "./SectionTitle";

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
      <SectionTitle sx={{ mb: 2 }}>{label}</SectionTitle>
      <Stack spacing={2}>
        <SkeletonChildren loading={loading}>{children}</SkeletonChildren>
      </Stack>
    </Paper>
  );
}
