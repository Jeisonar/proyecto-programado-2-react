// Uses standard npm, or the npm bundled with Visual Studio on this Windows PC.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundled =
  "C:/Program Files/Microsoft Visual Studio/18/Community/MSBuild/Microsoft/VisualStudio/NodeJs/node_modules/npm/bin/npm-cli.js";
function npm(args) {
  const result = existsSync(bundled)
    ? spawnSync(process.execPath, [bundled, ...args], {
        cwd: root,
        stdio: "inherit",
      })
    : spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32",
      });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const action = process.argv[2] ?? "build";
if (action === "install")
  npm([existsSync(resolve(root, "package-lock.json")) ? "ci" : "install"]);
else {
  if (!existsSync(resolve(root, "node_modules/react"))) npm(["ci"]);
  npm(["run", action]);
}
