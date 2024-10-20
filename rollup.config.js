const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

function getWorkspaceLocations() {
  const output = execSync("yarn workspaces list --json", { encoding: "utf8" });
  const workspaces = output
    .split("\n")
    .filter((line) => line) // Remove empty lines
    .map((line) => JSON.parse(line)); // Parse JSON lines

  return workspaces.map((workspace) => path.join(__dirname, workspace.location));
}

function getPackageJsonFiles(workspaces) {
  const packageJsonFiles = [];

  workspaces.forEach((workspace) => {
    const packageJsonPath = path.join(workspace, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      packageJsonFiles.push(packageJsonPath);
    }
  });

  return packageJsonFiles;
}

const workspaceLocations = getWorkspaceLocations();
const allPackageJsonFiles = getPackageJsonFiles(workspaceLocations);
const deps = _.uniq(
  allPackageJsonFiles
    .map((file) => JSON.parse(fs.readFileSync(file, "utf-8")))
    .map((pkg) => {
      // Combine dependencies and devDependencies into a single array
      return Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {}));
    })
    .flat() // Flatten the array of arrays
);

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeFlowbiteHelper = {
  input: "src/scripts/index.js", // Replace with your entry file(s)
  output: {
    file: "themes/hexo-theme-flowbite/scripts/helper.js", // Output file
    format: "cjs", // Output format
    sourcemap: false // Sourcemaps for easier debugging
  },
  plugins: [
    typescript.default({
      tsconfig: false,
      compilerOptions: {
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        typeRoots: ["./src/types", "./node_modules/@types", "./node_modules/nodejs-package-types/typings"],
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      },
      include: ["./package.json", "./src/**/*", "./src/globals.d.ts", "./src/**/*.json"]
    }),
    json.default({ indent: "  " }),
    resolve.nodeResolve({
      preferBuiltins: true,
      extensions: [".mjs", ".js", ".json", ".node", ".cjs", ".mjs"]
    }),
    commonjs.default({
      // exclude: ["**/node_modules/**"],
    })
  ],
  external: deps // Exclude external dependencies from the bundle
};

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeFlowbiteCLI = {
  input: "src/cli/hexo-theme-flowbite.ts", // Replace with your entry file(s)
  output: [
    {
      file: "themes/hexo-theme-flowbite/bin/hexo-theme-flowbite.cjs", // Output file
      format: "cjs"
    },
    {
      file: "themes/hexo-theme-flowbite/bin/hexo-theme-flowbite.mjs", // Output file
      format: "esm"
    }
  ],
  plugins: [
    typescript.default({
      tsconfig: false,
      compilerOptions: {
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        typeRoots: ["./src/types", "./node_modules/@types", "./node_modules/nodejs-package-types/typings"],
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      },
      include: ["./package.json", "./src/**/*", "./src/globals.d.ts", "./src/**/*.json"],
      exclude: ["**/*.test.js", "**/*.test.ts"]
    }),
    json.default(),
    resolve.nodeResolve({
      extensions: [".mjs", ".js", ".json", ".node"]
    }),
    commonjs.default({
      include: "node_modules/**" // Include node_modules
    })
  ],
  external: deps // Exclude external dependencies from the bundle
};

/**
 * @type {import("rollup").RollupOptions}
 */
const hexoThemeButterflyHelper = {
  input: "src/scripts/hexo-theme-butterfly.js", // Replace with your entry file(s)
  output: {
    file: "themes/hexo-theme-butterfly/scripts/helper.js", // Output file
    format: "cjs", // Output format
    sourcemap: false // Sourcemaps for easier debugging
  },
  plugins: [
    typescript.default({
      tsconfig: false,
      compilerOptions: {
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        typeRoots: ["./src/types", "./node_modules/@types", "./node_modules/nodejs-package-types/typings"],
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      },
      include: ["./package.json", "./src/**/*", "./src/globals.d.ts", "./src/**/*.json"]
    }),
    json.default({ indent: "  " }),
    resolve.nodeResolve({
      preferBuiltins: true,
      extensions: [".mjs", ".js", ".json", ".node", ".cjs", ".mjs"]
    }),
    commonjs.default({
      // exclude: ["**/node_modules/**"],
    })
  ],
  external: deps // Exclude external dependencies from the bundle
};

module.exports = [hexoThemeFlowbiteHelper, hexoThemeFlowbiteCLI, hexoThemeButterflyHelper];
