import { spawn } from "node:child_process";

/** Execute an isolated Node ESM fixture and retain diagnostics on failure. */
export function runNode(args: string[], cwd: string, environment: Record<string, string> = {}) {
  return new Promise<{ success: boolean; stdout: Uint8Array; stderr: Uint8Array }>(
    (resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd,
        env: { ...process.env, ...environment },
        stdio: ["ignore", "pipe", "pipe"],
      });
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
      child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
      child.on("error", reject);
      child.on("close", (code) =>
        resolve({
          success: code === 0,
          stdout: Buffer.concat(stdout),
          stderr: Buffer.concat(stderr),
        }),
      );
    },
  );
}
