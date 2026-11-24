import type { ReactNode } from "react";
import { Stack } from "@mui/material";
import FormPage from "../common/FormPage";

interface Props {
  /** Colonne seule : la page du jeu fournit `FormPage` et l'en-tête. */
  embedded?: boolean;
  width?: number;
  header: ReactNode;
  children: ReactNode;
}

/** Cadre de `ConfigPage` : `FormPage` + en-tête, ou colonne seule (ARK). */
export default function PageFrame({
  embedded,
  width,
  header,
  children,
}: Props) {
  if (embedded) return <Stack spacing={3}>{children}</Stack>;
  return (
    <FormPage width={width}>
      {header}
      {children}
    </FormPage>
  );
}
