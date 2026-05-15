import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

/**
 * Detects the package manager used in a project directory
 * by checking for known lock files.
 *
 * Detection order:
 * - `pnpm-lock.yaml` → `pnpm`
 * - `yarn.lock` → `yarn`
 * - `bun.lockb` / `bun.lock` → `bun`
 * - `package-lock.json` → `npm`
 *
 * Falls back to `yarn` if no known lock file is found.
 *
 * @param cwd - The project directory to inspect. Defaults to `process.cwd()`.
 * @returns The detected package manager name.
 */
export function detectPackageManager(cwd = process.cwd()): "pnpm" | "yarn" | "bun" | "npm" {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
    return "bun";
  }

  if (fs.existsSync(path.join(cwd, "package-lock.json"))) {
    return "npm";
  }

  // fallback
  return "yarn";
}

/**
 * Installs a package using the package manager detected
 * from the target project directory.
 *
 * Supported package managers:
 * - npm
 * - yarn
 * - pnpm
 * - bun
 *
 * @param pkg - The package name to install.
 * @param cwd - The target project directory. Defaults to `process.cwd()`.
 * @param verbose - Whether to display verbose output. Defaults to `false`.
 */
export function installPackage(pkg: string, cwd = process.cwd(), verbose = false): void {
  const pm = detectPackageManager(cwd);

  if (verbose) console.log(`Installing "${pkg}" using ${pm}...`);

  switch (pm) {
    case "pnpm":
      execSync(`pnpm add ${pkg}`, {
        cwd,
        stdio: verbose ? "inherit" : "ignore"
      });
      break;

    case "yarn":
      execSync(`yarn add ${pkg}`, {
        cwd,
        stdio: verbose ? "inherit" : "ignore"
      });
      break;

    case "bun":
      execSync(`bun add ${pkg}`, {
        cwd,
        stdio: verbose ? "inherit" : "ignore"
      });
      break;

    default:
      execSync(`npm install ${pkg}`, {
        cwd,
        stdio: verbose ? "inherit" : "ignore"
      });
      break;
  }
}
