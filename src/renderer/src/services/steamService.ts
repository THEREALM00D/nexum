import type { GameType } from "@shared/types";
import type { OperationResult } from "../types";

export const steamService = {
  isInstalled: (): Promise<boolean> => window.api.steamcmd.isInstalled(),
  install: (): Promise<OperationResult> => window.api.steamcmd.install(),
  installGame: (gameType: GameType, path: string): Promise<OperationResult> =>
    window.api.steamcmd.installGame(gameType, path),
  updateGame: (): Promise<OperationResult> => window.api.steamcmd.updateGame(),
  checkForUpdate: () => window.api.steamcmd.checkForUpdate(),
  onProgress: (cb: (msg: string) => void) => window.api.steamcmd.onProgress(cb),
};
