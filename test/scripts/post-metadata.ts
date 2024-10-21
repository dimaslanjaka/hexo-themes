import fs from "fs";
import Hexo from "hexo";
import path from "path";

process.cwd = () => path.join(__dirname, "/../../");
const hexo = new Hexo(process.cwd(), { silent: false });

const main = async () => {
  await hexo.init();
  await hexo.load();

  const { compile } = Object.assign({}, hexo.extend.renderer.store.njk);
  // Setup layout
  const view = new hexo.theme.View("test.njk", ["<html>", "{{ content }}", "</html>"].join("\n"));
  // Restore compile function
  hexo.extend.renderer.store.njk.compile = compile;
  // render post path
  const postPath = path.join(hexo.base_dir, "source/_posts/images.md");
  console.log({ postPath });
  const renderData = await hexo.post.render(postPath, {
    content: fs.readFileSync(postPath, "utf-8"),
    engine: "markdown"
  });
  // const body = ['layout: test', '---', '', content].join('\n');
  const result = await view.render({
    ...renderData,
    config: hexo.config,
    page: {}
  });
  console.log(result);
  await hexo.exit();
};

main();
