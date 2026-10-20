import http from "http";
import type {
  PalServerInfo,
  PalPlayer,
  PalMetrics,
} from "../../../shared/types";
import { AppError } from "../../utils/appError";

export class PalworldApiClient {
  private auth: string;

  constructor(
    private port: number,
    adminPassword: string,
  ) {
    this.auth = Buffer.from(`admin:${adminPassword}`).toString("base64");
  }

  private request<T = void>(
    method: string,
    path: string,
    body?: object,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : "";
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: this.port,
          path: `/v1/api${path}`,
          method,
          headers: {
            Authorization: `Basic ${this.auth}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 8000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              try {
                resolve(data ? (JSON.parse(data) as T) : (undefined as T));
              } catch {
                resolve(undefined as T);
              }
            } else {
              reject(
                new AppError("PAL_API_HTTP", { status: res.statusCode ?? 0 }),
              );
            }
          });
        },
      );
      req.on("error", () => reject(new AppError("PAL_API_UNREACHABLE")));
      req.on("timeout", () => {
        req.destroy();
        reject(new AppError("PAL_API_TIMEOUT"));
      });
      if (payload) req.write(payload);
      req.end();
    });
  }

  getInfo() {
    return this.request<PalServerInfo>("GET", "/info");
  }
  getPlayers() {
    return this.request<{ players: PalPlayer[] }>("GET", "/players");
  }
  getMetrics() {
    return this.request<PalMetrics>("GET", "/metrics");
  }
  getSettings() {
    return this.request<Record<string, unknown>>("GET", "/settings");
  }

  announce(message: string) {
    return this.request("POST", "/announce", { message });
  }
  save() {
    return this.request("POST", "/save");
  }
  shutdown(waittime: number, message = "") {
    return this.request("POST", "/shutdown", { waittime, message });
  }
  stop() {
    return this.request("POST", "/stop");
  }

  kick(userid: string, message?: string) {
    return this.request("POST", "/kick", { userid, message });
  }
  ban(userid: string, message?: string) {
    return this.request("POST", "/ban", { userid, message });
  }
  unban(userid: string) {
    return this.request("POST", "/unban", { userid });
  }
}
