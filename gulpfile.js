const { spawnAsync } = require("cross-spawn");
const gulp = require("gulp");

async function build() {
  // yarn workspaces foreach --no-private --all run build
  await spawnAsync("yarn", ["workspace", "hexo-theme-flowbite", "run", "build"], { stdio: "inherit", cwd: __dirname });
}
const buildRollup = () => spawnAsync("rollup", ["-c"], { cwd: __dirname, stdio: "inherit" });
const buildFlowbite = () =>
  spawnAsync("yarn", ["workspace", "hexo-theme-flowbite", "run", "build"], { stdio: "inherit", cwd: __dirname });
function watch() {
  gulp.watch(
    [
      "themes/hexo-theme-flowbite/layout/**/*",
      "themes/hexo-theme-flowbite/src/**/*",
      "themes/hexo-theme-flowbite/*.js"
    ],
    buildFlowbite
  );
  gulp.watch(["./src/**/*", "./rollup.config.*"], buildRollup);
}

exports.watch = watch;
exports.build = build;
