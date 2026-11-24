import { useState } from "react";
import { Alert, Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface Props {
  /** Clé `localStorage` qui mémorise le bandeau masqué. */
  storageKey: string;
  text: string;
  /** Lien d'une ligne qui rouvre le bandeau masqué. */
  showLabel: string;
  /** Nom du bouton de fermeture (croix). */
  hideLabel: string;
}

function loadHidden(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function saveHidden(storageKey: string, hidden: boolean): void {
  try {
    localStorage.setItem(storageKey, hidden ? "1" : "0");
  } catch {
    /* stockage indisponible */
  }
}

/**
 * Bandeau d'aide masquable (choix mémorisé) : laisse la place aux listes
 * sur un écran de portable, avec un lien d'une ligne pour le rouvrir.
 * Pages Mods de Valheim (rappel côté joueurs) et d'ARK (ordre de
 * chargement).
 */
export default function DismissibleHint({
  storageKey,
  text,
  showLabel,
  hideLabel,
}: Props) {
  const [hidden, setHidden] = useState(() => loadHidden(storageKey));

  const toggle = (next: boolean) => {
    setHidden(next);
    saveHidden(storageKey, next);
  };

  if (hidden) {
    return (
      <Button
        size="small"
        startIcon={<InfoOutlinedIcon />}
        onClick={() => toggle(false)}
        sx={{ alignSelf: "flex-start", color: "info.main" }}
      >
        {showLabel}
      </Button>
    );
  }

  return (
    <Alert severity="info" onClose={() => toggle(true)} closeText={hideLabel}>
      {text}
    </Alert>
  );
}
