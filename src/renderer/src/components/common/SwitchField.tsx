import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Explication sous le libellé. */
  helper?: string;
  disabled?: boolean;
}

/** Interrupteur avec son libellé et, en dessous, une ligne d'explication. */
export default function SwitchField({
  checked,
  onChange,
  label,
  helper,
  disabled,
}: Props) {
  return (
    <FormControlLabel
      disabled={disabled}
      control={
        <Switch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      label={
        helper ? (
          <Stack>
            <Typography variant="body2">{label}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {helper}
            </Typography>
          </Stack>
        ) : (
          label
        )
      }
    />
  );
}
