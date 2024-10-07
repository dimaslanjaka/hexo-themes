process.cwd = () => __dirname + "/../";

const Hexo = require("hexo");

async function main() {
  const hexo = new Hexo(process.cwd(), { silent: true });
  await hexo.init();
}

main();
