import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Snackbar, Alert, AlertColor, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/** Bouton facultatif dans la notification (ex : « Mettre à jour »). */
export interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface Notification {
  message: string;
  severity: AlertColor;
  action?: NotificationAction;
  key: number;
}

interface NotificationContextType {
  notify: (
    message: string,
    severity?: AlertColor,
    action?: NotificationAction,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback(
    (
      message: string,
      severity: AlertColor = "error",
      action?: NotificationAction,
    ) => {
      setNotification({ message, severity, action, key: Date.now() });
      setOpen(true);
    },
    [],
  );

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        key={notification?.key}
        open={open}
        // Plus longue avec un bouton : il faut le temps de lire et de cliquer
        autoHideDuration={notification?.action ? 15000 : 5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notification?.severity ?? "error"}
          variant="filled"
          onClose={() => setOpen(false)}
          // `action` remplace la croix par défaut de l'Alert : on la remet
          action={
            notification?.action && (
              <>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    notification.action?.onClick();
                    setOpen(false);
                  }}
                >
                  {notification.action.label}
                </Button>
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )
          }
          sx={{ minWidth: 300, maxWidth: 520 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}
