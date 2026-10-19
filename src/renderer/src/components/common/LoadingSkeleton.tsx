import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Skeleton,
  TableCell,
  TableRow,
  type SxProps,
  type Theme,
} from "@mui/material";

type SizeSx = { width?: unknown; maxWidth?: unknown };

/**
 * Chaque enfant direct d'une colonne (`Stack`) en skeleton pendant le
 * chargement (champs d'un formulaire, d'une carte…). Dans une colonne, un
 * enfant est étiré sur toute la largeur : le skeleton aussi, en reprenant la
 * `width` / `maxWidth` de son `sx` s'il en a une → même boîte. Rendu tel
 * quel une fois chargé.
 */
export function SkeletonChildren({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return Children.map(children, (child) => {
    if (!isValidElement<{ sx?: unknown }>(child)) return child;
    const sx = child.props.sx;
    const { width, maxWidth } =
      sx && typeof sx === "object" && !Array.isArray(sx) ? (sx as SizeSx) : {};
    return (
      <LoadingSkeleton
        loading={loading}
        fullWidth={width === undefined}
        sx={{ width, maxWidth } as SxProps<Theme>}
      >
        {child}
      </LoadingSkeleton>
    );
  });
}

/**
 * Liste pas encore chargée : `count` lignes en skeleton, chacune construite
 * avec le VRAI composant de ligne (données de forme réaliste, masquées) →
 * même hauteur que les lignes finales. Renvoie un tableau (pas un composant)
 * pour qu'une `Stack` à `divider` place ses séparateurs entre les lignes.
 * Le nombre réel d'éléments n'est pas connu avant le chargement : 3 par
 * défaut.
 */
/**
 * Lignes de tableau en skeleton (une barre de texte par cellule) : un
 * skeleton ne peut pas envelopper un `<tr>` (pas de `div` dans un `tbody`).
 */
export function skeletonTableRows(columns: number, count = 3): ReactElement[] {
  return Array.from({ length: count }, (_, i) => (
    <TableRow key={i}>
      {Array.from({ length: columns }, (_, c) => (
        <TableCell key={c}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function skeletonRows(row: ReactElement, count = 3): ReactElement[] {
  return Array.from({ length: count }, (_, i) => (
    <LoadingSkeleton key={i} loading fullWidth>
      {row}
    </LoadingSkeleton>
  ));
}

interface Props {
  /** Tant que vrai, l'élément est remplacé visuellement par un skeleton. */
  loading: boolean;
  /** L'élément final (champ, interrupteur, carte…). */
  children: ReactElement;
  /** Élément pleine largeur (champ `fullWidth`, ligne de liste…). */
  fullWidth?: boolean;
  variant?: "rounded" | "rectangular" | "circular" | "text";
  /**
   * Contraintes de taille de l'élément à reporter sur le skeleton (ex.
   * `{ maxWidth: 200 }` avec `fullWidth` pour un champ étiré jusqu'à 200 px).
   */
  sx?: SxProps<Theme>;
}

/**
 * Skeleton aux dimensions exactes du contenu final : pendant le chargement,
 * l'élément est rendu mais masqué (`visibility: hidden`, ni visible ni
 * atteignable au clavier) et le skeleton prend sa taille → aucun décalage
 * de mise en page quand les vraies valeurs arrivent, et aucune valeur par
 * défaut affichée avant elles. À utiliser pour TOUT état de chargement
 * (jamais de texte « Chargement... »).
 */
export default function LoadingSkeleton({
  loading,
  children,
  fullWidth,
  variant = "rounded",
  sx,
}: Props) {
  if (!loading) return children;
  return (
    <Skeleton
      variant={variant}
      width={fullWidth ? "100%" : undefined}
      // Enfant qui ne rend rien (avertissement absent…) : pas de bloc vide
      // qui ajouterait un espacement de Stack absent une fois chargé.
      sx={[
        { "&:empty": { display: "none" } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Skeleton>
  );
}
