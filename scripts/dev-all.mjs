/**
 * Run the web app (Vite) and the AI helper proxy together for local dev.
 * Vite proxies /api to the helper, so everything is one origin at :5173.
 */
import { spawn } from "node:child_process";

const procs = [
  spawn("npm", ["run", "server"], { stdio: "inherit" }),
  spawn("npm", ["run", "dev"], { stdio: "inherit" }),
];

let stopping = false;
function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const p of procs) p.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
for (const p of procs) p.on("exit", (code) => stopAll(code ?? 0));
