/// <reference types="electron-vite/node" />

// Valeurs injectées au build par electron.vite.config.ts (define).
interface ImportMetaEnv {
  /** Clé de l'API CurseForge (mods ARK). Absente : pas d'appel à l'API. */
  readonly MAIN_VITE_CURSEFORGE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
