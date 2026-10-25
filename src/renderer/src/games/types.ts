import type { ComponentType } from "react";
import type { GameType } from "@shared/types";
import type { Page } from "../App";

export interface GamePlugin {
  id: GameType;
  supportedPages: Page[];
  pages: Partial<Record<Page, ComponentType>>;
  i18n: {
    fr: Record<string, unknown>;
    en: Record<string, unknown>;
  };
  /** Ressources à prévoir, rappelées avant l'installation (GameRequirementsHint). */
  requirements?: { ramGb: number; diskGb: number };
}
