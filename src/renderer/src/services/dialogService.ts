import type { SelectFolderOptions } from "@shared/types";

export const dialogService = {
  selectFolder: (options?: SelectFolderOptions): Promise<string | null> =>
    window.api.dialog.selectFolder(options),
  selectFile: (
    filters?: { name: string; extensions: string[] }[],
    defaultPath?: string,
  ): Promise<string | null> =>
    window.api.dialog.selectFile(filters, defaultPath),
};
