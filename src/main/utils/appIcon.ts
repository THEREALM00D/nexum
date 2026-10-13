import { app } from "electron/main";
import { join } from "path";
import devIconPath from "../../../resources/icon.ico?asset";

/**
 * Chemin de l'icône Nexum (.ico), pour la fenêtre et l'icône de la zone de
 * notification. App installée : `resources/` (dossier buildResources) n'est
 * pas embarqué, l'icône est copiée via `extraResources` (electron-builder.yml).
 */
export const appIconPath = (): string =>
  app.isPackaged ? join(process.resourcesPath, "icon.ico") : devIconPath;
