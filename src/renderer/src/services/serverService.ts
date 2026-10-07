import type { OperationResult, ServerStatus, ServerLogEvent } from "../types";

export const serverService = {
  start: (serverId?: string): Promise<OperationResult> =>
    window.api.server.start(serverId),
  stop: (serverId?: string): Promise<OperationResult> =>
    window.api.server.stop(serverId),
  restart: (serverId?: string): Promise<OperationResult> =>
    window.api.server.restart(serverId),
  getStatus: (): Promise<ServerStatus> => window.api.server.getStatus(),
  getStatuses: (): Promise<Record<string, ServerStatus>> =>
    window.api.server.getStatuses(),
  onLog: (cb: (event: ServerLogEvent) => void) => window.api.server.onLog(cb),
  onLogSession: (cb: (event: { serverId: string }) => void) =>
    window.api.server.onLogSession(cb),
};
