import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { NARROW_WINDOW_QUERY } from "../../theme";

const STORAGE_KEY = "sidebar.collapsed";

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // Stockage indisponible : le choix vaut pour cette session seulement
  }
}

/**
 * Repli de la Sidebar : repliée d'office dans une fenêtre étroite (portable,
 * fenêtre partagée) ; sinon, dernier choix de l'utilisateur, mémorisé. Le
 * bouton reste prioritaire jusqu'au prochain passage étroit ↔ large.
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  // noSsr : vraie valeur dès le 1er rendu (pas de dépliage puis repli)
  const narrow = useMediaQuery(NARROW_WINDOW_QUERY, { noSsr: true });
  const [collapsed, setCollapsed] = useState(() => narrow || loadCollapsed());

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setCollapsed(narrow || loadCollapsed());
  }, [narrow]);

  // Seul un choix fait dans une fenêtre large est mémorisé : déplier la
  // barre le temps d'un clic sur un portable ne doit pas changer la
  // préférence de l'écran de bureau.
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (!narrow) saveCollapsed(next);
  };

  return [collapsed, toggle];
}
