import type { LaunchArgsConfig } from "../../../shared/types";
import type { PalConfigParser } from "./PalConfigParser";
import type { GamePort } from "../ports";

const PERFORMANCE_FLAGS = [
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
];

export const palworldServerConfig = {
  exeName: "PalServer.exe",

  buildArgs(cfg: LaunchArgsConfig): string[] {
    const args: string[] = [];
    if (cfg.publicLobby) args.push("-publiclobby");
    if (cfg.performanceFlags) args.push(...PERFORMANCE_FLAGS);
    const custom = cfg.customArgs.trim();
    if (custom) args.push(...custom.split(/\s+/));
    return args;
  },

  getStopConfig(serverPath: string, configParser: PalConfigParser) {
    const cfg = configParser.read(serverPath);
    return {
      restApiEnabled: cfg.RESTAPIEnabled === true,
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
      adminPassword: String(cfg.AdminPassword ?? ""),
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  },

  // PublicPort = port annoncé aux joueurs ; RCON et REST seulement s'ils sont
  // activés (TCP, jamais à rediriger sur la box).
  getPorts(serverPath: string, configParser: PalConfigParser): GamePort[] {
    const cfg = configParser.read(serverPath);
    const ports: GamePort[] = [
      {
        port: Number(cfg.PublicPort ?? 8211),
        protocol: "UDP",
        label: "game",
        forward: true,
      },
    ];
    if (cfg.RCONEnabled) {
      ports.push({
        port: Number(cfg.RCONPort ?? 25575),
        protocol: "TCP",
        label: "rcon",
        forward: false,
      });
    }
    if (cfg.RESTAPIEnabled) {
      ports.push({
        port: Number(cfg.RESTAPIPort ?? 8212),
        protocol: "TCP",
        label: "restapi",
        forward: false,
      });
    }
    return ports;
  },
};
