process.cwd = () => __dirname + "/../";

const Hexo = require("hexo");
const fs = require("fs");
const path = require("path");

async function main() {
  const hexo = new Hexo(process.cwd(), { silent: true });
  await hexo.init();
  await hexo.load();
  // not working
  const postPath = path.join(hexo.base_dir, "source/_posts/images.md");
  const result = await hexo.post.render(null, {
    engine: "markdown",
    content: fs.readFileSync(postPath, "utf-8")
  });
  const view = hexo.theme.getView("_layout.njk");
  // const result = await view.render({});
  console.log(result.data);
}

main();
