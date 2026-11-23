import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

// Clé de l'API CurseForge (mods ARK) : variable d'environnement de la CI
// (secret CURSEFORGE_API_KEY), sinon ligne CURSEFORGE_API_KEY= de .env.local
// (ignoré par git). ⚠️ Pas de MAIN_VITE_ dans .env.local : Vite y remplace
// les « $nom » et une clé CurseForge contient des « $ » (vérifié : la valeur
// arrivait vide, même entre guillemets ou avec \$). Absente : chaîne vide,
// Nexum n'appelle pas l'API.
function curseforgeApiKey(): string {
  if (process.env.CURSEFORGE_API_KEY) return process.env.CURSEFORGE_API_KEY;
  try {
    const line = readFileSync(resolve(".env.local"), "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("CURSEFORGE_API_KEY="));
    // Guillemets autour de la valeur retirés, comme dans un .env.
    return (line?.slice("CURSEFORGE_API_KEY=".length).trim() ?? "").replace(
      /^(["'])(.*)\1$/,
      "$2",
    );
  } catch {
    return "";
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: {
      "import.meta.env.MAIN_VITE_CURSEFORGE_API_KEY":
        JSON.stringify(curseforgeApiKey()),
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared"),
      },
    },
    plugins: [react()],
  },
});
