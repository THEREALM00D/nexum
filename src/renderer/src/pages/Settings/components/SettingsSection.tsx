import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import SectionTitle from "../../../components/common/SectionTitle";

// Bloc titré de la page Paramètres
export default function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={1.5}>
        <div>
          <SectionTitle>{title}</SectionTitle>
          {description && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {description}
            </Typography>
          )}
        </div>
        {children}
      </Stack>
    </Paper>
  );
}
