import { app } from "electron/main";

// User-Agent envoyé aux API publiques (registres de mods Valheim, CurseForge).
export const USER_AGENT = `Nexum/${app.getVersion()}`;
