#!/usr/bin/env node

"use strict";

import fs from "fs";
import path from "path";

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")));
const isESM = pkg.type === "module";

console.log("hexo-theme-flowbite cli running on", isESM ? "ESM" : "CJS");

if (isESM) {
  import("./hexo-theme-flowbite.mjs");
} else {
  import("./hexo-theme-flowbite.cjs");
}
