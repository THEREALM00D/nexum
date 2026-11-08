import { createContext, useContext } from "react";
import type { Page } from "../App";

// Changer de page depuis un composant de jeu : ces pages ne reçoivent aucune
// prop (voir GamePlugin.pages).
export const NavigationContext = createContext<(page: Page) => void>(() => {});

export const useNavigate = () => useContext(NavigationContext);
