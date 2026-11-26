import { Box, Button, Popover, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props<T> {
  label: string;
  /** Valeur proposée à l'ouverture. */
  initial: T;
  /** Champ de saisie de la valeur. */
  renderField: (value: T, setValue: (value: T) => void) => ReactNode;
  /** Pourquoi la valeur est refusée (bouton Ajouter désactivé), ou null. */
  errorOf?: (value: T) => string | null;
  onAdd: (value: T) => void;
  disabled?: boolean;
}

/** Bouton texte « Ajouter… » qui ouvre un petit champ dans une bulle. */
export default function AddValueButton<T>({
  label,
  initial,
  renderField,
  errorOf = () => null,
  onAdd,
  disabled,
}: Props<T>) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<T>(initial);
  const error = errorOf(value);

  const close = () => setAnchor(null);

  return (
    <>
      <Button
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        onClick={(event) => {
          setValue(initial);
          setAnchor(event.currentTarget);
        }}
      >
        {label}
      </Button>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box
          component="form"
          sx={{ p: 2 }}
          onSubmit={(event) => {
            event.preventDefault();
            if (error !== null) return;
            onAdd(value);
            close();
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap", alignItems: "center" }}
          >
            {renderField(value, setValue)}
            <Button type="submit" variant="contained" disabled={error !== null}>
              {t("schedule.add")}
            </Button>
          </Stack>
          {error && (
            <Typography
              variant="caption"
              component="p"
              sx={{ color: "error.light", mt: 1 }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
}
