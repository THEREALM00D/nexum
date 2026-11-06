#!/usr/bin/env node
// Place une issue dans une colonne (champ « Status ») du GitHub Project de Nexum.
// Usage : node .claude/scripts/project-status.mjs <numéro d'issue> "<colonne>"
//   ex. : node .claude/scripts/project-status.mjs 42 "In dev"
// Colonnes : Ideas, To do, In dev, To test, Done (casse ignorée).
// Ajoute l'issue au Project si elle n'y est pas encore (item-add est idempotent).
// Prérequis : gh authentifié avec le droit `project` (gh auth refresh -s project).
import { execFileSync } from "node:child_process";

const OWNER = "THEREALM00D";
const REPO = "nexum";
const PROJECT_NUMBER = "4";
const FIELD_NAME = "Status";

const [issue, column] = process.argv.slice(2);
if (!/^\d+$/.test(issue ?? "") || !column) {
  console.error('Usage : node .claude/scripts/project-status.mjs <numéro> "<colonne>"');
  process.exit(1);
}

const gh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8" }));
const projectArgs = [PROJECT_NUMBER, "--owner", OWNER, "--format", "json"];

try {
  const projectId = gh(["project", "view", ...projectArgs]).id;

  const field = gh(["project", "field-list", ...projectArgs, "--limit", "100"]).fields.find(
    (f) => f.name === FIELD_NAME
  );
  if (!field?.options) throw new Error(`Champ « ${FIELD_NAME} » introuvable dans le Project.`);

  const option = field.options.find((o) => o.name.toLowerCase() === column.trim().toLowerCase());
  if (!option) {
    const names = field.options.map((o) => o.name).join(", ");
    throw new Error(`Colonne « ${column} » inconnue. Colonnes disponibles : ${names}`);
  }

  const url = `https://github.com/${OWNER}/${REPO}/issues/${issue}`;
  const item = gh(["project", "item-add", ...projectArgs, "--url", url]);

  execFileSync(
    "gh",
    [
      "project", "item-edit",
      "--id", item.id,
      "--project-id", projectId,
      "--field-id", field.id,
      "--single-select-option-id", option.id
    ],
    { stdio: "ignore" }
  );

  console.log(`#${issue} → ${option.name}`);
} catch (err) {
  const msg = String(err.stderr || err.message || err);
  if (/scope|project/i.test(msg) && /permission|scope|INSUFFICIENT/i.test(msg)) {
    console.error("gh n'a pas le droit `project`. Lance : gh auth refresh -s project");
  }
  console.error(msg.trim());
  process.exit(1);
}
