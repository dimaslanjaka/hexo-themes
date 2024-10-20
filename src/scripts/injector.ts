import fs from "fs-extra";
import path from "path";

hexo.extend.helper.register("injectHeadHtml", function () {
  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/head.html");
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8");
  }
  return "";
});

hexo.extend.helper.register("injectBodyHtml", function () {
  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/body.html");
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8");
  }
  return "";
});

hexo.extend.helper.register("injectBeforePostHtml", function () {
  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/before-post.html");
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8");
  }
  return "";
});

hexo.extend.helper.register("injectAfterPostHtml", function () {
  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/after-post.html");
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8");
  }
  return "";
});

hexo.extend.helper.register("injectAsideHtml", function () {
  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/aside.html");
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8");
  }
  return "";
});
