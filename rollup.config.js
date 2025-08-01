import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getPackageJsonFiles = () => {
  const workspaces = execSync("yarn workspaces list --json", { encoding: "utf8" })
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line).location)
    .map((location) => path.join(__dirname, location, "package.json"))
    .filter(fs.existsSync);

  return workspaces.map((file) => JSON.parse(fs.readFileSync(file, "utf-8")));
};

const deps = Array.from(
  new Set(
    getPackageJsonFiles().flatMap((pkg) => [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...["cheerio", "lodash", "jquery"]
    ])
  )
).filter((pkgName) => !["deepmerge-ts", "p-limit", "sanitize-filename"].includes(pkgName));

/**
 * Shared TypeScript options
 */
const tsOptions = {
  tsconfig: false,
  compilerOptions: {
    lib: ["DOM", "DOM.Iterable", "ES2020"],
    typeRoots: ["./src/types", "./node_modules/@types", "./node_modules/nodejs-package-types/typings"],
    allowSyntheticDefaultImports: true,
    esModuleInterop: true
  },
  include: ["./package.json", "./src/**/*", "./src/globals.d.ts", "./src/**/*.json"],
  exclude: ["**/*.test.js", "**/*.test.ts", "**/*.builder.*"]
};

// Shared plugin array
const sharedPlugins = [
  json({ indent: "  " }),
  resolve({
    preferBuiltins: true,
    extensions: [".mjs", ".js", ".json", ".node", ".cjs", ".mjs"]
  }),
  commonjs()
];

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeFlowbiteHelper = {
  input: "src/scripts/index.ts",
  output: {
    file: "themes/hexo-theme-flowbite/scripts/helper.js",
    format: "cjs",
    sourcemap: false
  },
  plugins: [typescript(tsOptions), ...sharedPlugins],
  external: deps
};

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeFlowbiteCLI = {
  input: "src/cli/hexo-theme-flowbite.ts",
  output: [
    { file: "themes/hexo-theme-flowbite/bin/hexo-theme-flowbite.cjs", format: "cjs" },
    { file: "themes/hexo-theme-flowbite/bin/hexo-theme-flowbite.mjs", format: "esm" }
  ],
  plugins: [
    typescript({
      ...tsOptions
    }),
    ...sharedPlugins
  ],
  external: deps
};

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeButterflyHelper = {
  input: "src/scripts/hexo-theme-butterfly.ts",
  output: {
    file: "themes/hexo-theme-butterfly/scripts/helper.js",
    format: "cjs",
    sourcemap: false
  },
  plugins: [
    typescript({
      ...tsOptions,
      compilerOptions: {
        ...tsOptions.compilerOptions,
        allowJs: true,
        checkJs: false
      }
    }),
    ...sharedPlugins
  ],
  external: deps
};

export default [hexoThemeFlowbiteHelper, hexoThemeFlowbiteCLI, hexoThemeButterflyHelper];
