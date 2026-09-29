import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

export const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
];

interface Props {
  value: string | null;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}
        component="div"
      >
        {t("servers.dialog.color")}
      </Box>
      <Stack direction="row" spacing={1}>
        {DEFAULT_COLORS.map((c) => (
          <Box
            key={c}
            onClick={() => onChange(c)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: c,
              cursor: "pointer",
              border: "2px solid",
              borderColor: value === c ? "white" : "transparent",
              transition: "transform 0.1s",
              "&:hover": { transform: "scale(1.1)" },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
