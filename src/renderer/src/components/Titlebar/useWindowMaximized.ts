import { useEffect, useState } from "react";

/** La fenêtre est-elle agrandie (bouton, double-clic, snap Windows) ? */
export function useWindowMaximized(): boolean {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.api.window.isMaximized().then(setMaximized);
    return window.api.window.onMaximizedChange(setMaximized);
  }, []);

  return maximized;
}
