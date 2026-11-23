import { Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Libellé d'un champ de config, avec la description en infobulle.
export default function ConfigFieldLabel({
  label,
  description,
  minWidth,
}: {
  label: string;
  description?: string;
  minWidth?: number;
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.5, minWidth }}
      component="span"
    >
      <Typography variant="body2" component="span">
        {label}
      </Typography>
      {description && (
        <Tooltip title={description} arrow placement="top">
          <InfoOutlinedIcon
            sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}
