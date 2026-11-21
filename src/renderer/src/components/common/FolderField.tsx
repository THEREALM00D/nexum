import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { useServer } from "../../context/ServerContext";
import { dialogService } from "../../services/dialogService";
import InstallDirWarning from "./InstallDirWarning";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Choix fait dans le dialogue, à la place de `onChange` (détection du jeu…). */
  onPicked?: (path: string) => void;
  helper?: ReactNode;
  error?: boolean;
  placeholder?: string;
  /** Choix par le bouton seulement (réglage enregistré à chaque changement). */
  readOnly?: boolean;
  autoFocus?: boolean;
  /** Fichier (sélecteur de fichier) plutôt que dossier. */
  file?: boolean;
  /** Chemin lu par le serveur du jeu : relatif à son dossier (`./savegame`). */
  serverRelative?: boolean;
  /** Dossier du serveur pour `serverRelative` quand ce n'est pas le serveur actif (import). */
  basePath?: string;
  /** Réécrire en relatif (`./x`) un dossier choisi dans le dossier du serveur. */
  keepRelative?: boolean;
  /** Dossier ouvert quand le champ est vide (dossier par défaut du jeu). */
  fallbackPath?: string;
  /** Avertissement sous le champ s'il pointe dans le dossier d'installation de Nexum. */
  installDirWarning?: boolean;
  /** Boutons après Parcourir (ouvrir le dossier…). */
  actions?: ReactNode;
}

/**
 * Champ de chemin + bouton Parcourir (dialogue natif de dossier ou de
 * fichier), ouvert sur le dossier du champ ou son premier parent existant.
 */
export default function FolderField({
  label,
  value,
  onChange,
  onPicked,
  helper,
  error,
  placeholder,
  readOnly,
  autoFocus,
  file,
  serverRelative = false,
  basePath: base,
  keepRelative = false,
  fallbackPath,
  installDirWarning = false,
  actions,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();
  const basePath = serverRelative ? (base ?? state.serverPath) : undefined;

  const browse = async () => {
    const current = value.trim() || fallbackPath;
    const picked = file
      ? await dialogService.selectFile(undefined, current || undefined)
      : await dialogService.selectFolder({
          defaultPath: current,
          basePath: basePath || undefined,
          relativeToBase: keepRelative,
        });
    if (!picked) return;
    if (onPicked) onPicked(picked);
    else onChange(picked);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <TextField
          label={label}
          size="small"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          helperText={helper}
          error={error}
          placeholder={placeholder}
          autoFocus={autoFocus}
          slotProps={readOnly ? { input: { readOnly: true } } : undefined}
          fullWidth
        />
        <Tooltip title={t("common.browse")}>
          <IconButton
            onClick={browse}
            sx={{ mt: 0.5 }}
            aria-label={t("common.browse")}
          >
            <FolderOpenIcon />
          </IconButton>
        </Tooltip>
        {actions}
      </Stack>
      {installDirWarning && (
        <InstallDirWarning
          path={value}
          serverRelative={serverRelative}
          basePath={base}
        />
      )}
    </>
  );
}
