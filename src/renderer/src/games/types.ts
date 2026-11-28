import type { ComponentType } from "react";
import type { GameType } from "@shared/types";
import type { Page } from "../App";

export interface ExistingServerPanelProps {
  /** Dossier choisi : le serveur n'existe pas encore dans Nexum. */
  serverPath: string;
  /** État repassé à `apply` une fois le serveur créé (null = rien). */
  onChange: (state: unknown) => void;
  /**
   * Lecture en cours : le parent bloque la création, sinon le serveur était
   * créé avant que l'état n'arrive, sans rien reprendre.
   */
  onPendingChange: (pending: boolean) => void;
}

/**
 * Reprise d'un serveur déjà installé (dossier existant), sans nom de jeu
 * dans l'ajout de serveur ni dans l'assistant.
 */
export interface ExistingServerImport {
  /** Affiché sous le dossier quand l'exécutable du jeu y est trouvé. */
  Panel?: ComponentType<ExistingServerPanelProps>;
  /** Appliqué juste après `servers.create` ; lève une erreur codée. */
  apply: (serverId: string, state: unknown) => Promise<void>;
}

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
  existingServer?: ExistingServerImport;
  /**
   * Le main connaît la ligne « serveur prêt » du jeu (`READY_LINES`,
   * `src/main/games/registry.ts`) : le dialogue du serveur propose
   * « Relancer si le démarrage n'est pas fini », avec ce texte d'aide.
   */
  startupReadyHintKey?: string;
}
