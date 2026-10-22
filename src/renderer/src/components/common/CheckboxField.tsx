import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helper?: string;
}

// Case à cocher avec une ligne d'explication sous son libellé.
export default function CheckboxField({
  checked,
  onChange,
  label,
  helper,
}: Props) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={
        <Box>
          <Typography variant="body2">{label}</Typography>
          {helper && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {helper}
            </Typography>
          )}
        </Box>
      }
    />
  );
}
