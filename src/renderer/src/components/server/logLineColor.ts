/** Couleur d'une ligne de log (page Logs et aperçu du Dashboard). */
export const logLineColor = (line: string) =>
  line.includes("[ERR]") || line.includes("Error")
    ? "error.light"
    : line.includes("[WRN]") || line.includes("Warning")
      ? "warning.main"
      : line.includes("[Manager]")
        ? "primary.main"
        : "text.secondary";
