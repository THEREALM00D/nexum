#!/usr/bin/env node
// Hook PostToolUse (Write|Edit) : passe Prettier sur le fichier que Claude Code vient d'écrire.
// Lit le JSON du hook sur stdin, ignore les fichiers hors du projet (scratchpad, mémoire…)
// et les extensions que Prettier ne connaît pas (--ignore-unknown). Ne fait jamais échouer
// l'outil : une erreur de formatage est seulement signalée sur stderr.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir =
  process.env.CLAUDE_PROJECT_DIR ||
  path.resolve(fileURLToPath(import.meta.url), "../../..");
const prettier = path.join(
  projectDir,
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let file;
  try {
    file = JSON.parse(input)?.tool_input?.file_path;
  } catch {
    return;
  }
  if (!file || !existsSync(prettier)) return;

  const relative = path.relative(projectDir, path.resolve(file));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    return;
  if (/^(node_modules|dist|out|\.git)[\\/]/.test(relative)) return;

  try {
    execFileSync(
      process.execPath,
      [
        prettier,
        "--write",
        "--ignore-unknown",
        "--log-level",
        "warn",
        relative,
      ],
      {
        cwd: projectDir,
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
  } catch (err) {
    process.stderr.write(
      `Prettier : ${String(err.stderr || err.message).trim()}\n`,
    );
  }
});
