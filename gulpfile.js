const { spawnAsync } = require("cross-spawn");
const gulp = require("gulp");

async function build() {
  // yarn workspaces foreach --no-private --all run build
  await spawnAsync("yarn", ["workspace", "hexo-theme-flowbite", "run", "build"], { stdio: "inherit", cwd: __dirname });
}

function watch() {
  gulp.watch(["themes/hexo-theme-flowbite/**/*.{njk,scss,js,cjs}"], build);
}

exports.watch = watch;
