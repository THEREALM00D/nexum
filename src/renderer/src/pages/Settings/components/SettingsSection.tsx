import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

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
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: "text.secondary",
            }}
          >
            {title}
          </Typography>
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
