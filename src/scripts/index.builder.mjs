import { ESLint } from "eslint";
import fs from "fs-extra";
import { glob } from "glob";
import path from "path";
import { normalizePathUnix } from "sbg-utility";
import { fileURLToPath } from "url";

// index.ts exports builder
// this only for development and excluded from build config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create export
glob("**/*.{ts,js,jsx,tsx,cjs,mjs}", {
  ignore: ["**/*.builder.*", "**/*.test.*", "**/*.spec*.*", "**/*.runner.*", "**/_*test"],
  cwd: __dirname,
  absolute: true
}).then(async (files) => {
  const map = files
    .map((f) => normalizePathUnix(f))
    .filter((file) => {
      const isFile = fs.statSync(file).isFile();
      const currentIndex = normalizePathUnix(__dirname, "index.ts");
      const currentIndexExports = normalizePathUnix(__dirname, "index-exports.ts");
      return isFile && file !== currentIndex && file !== currentIndexExports;
    })
    .map((file) => normalizePathUnix(file).replace(normalizePathUnix(__dirname), ""))
    .map((file) => {
      return `import '.${file.replace(/.(ts|js|tsx|jsx|cjs)$/, "")}';`;
    })
    .sort((a, b) => a.localeCompare(b));

  fs.writeFileSync(path.join(__dirname, "index.ts"), map.join("\n"));

  const lint = new ESLint({ fix: true });
  // Lint the specified TypeScript file.
  const results = await lint.lintFiles(["src/**/*.ts"]);

  // Apply the fixes to the file.
  await ESLint.outputFixes(results);

  // Format and display the results.
  const formatter = await lint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  console.log(resultText);
});
