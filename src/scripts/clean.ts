import fs from "fs-extra";
import path from "path";
import { searchFiles } from "./post/search";

// clean build and temp folder on `hexo clean`
hexo.extend.filter.register("after_clean", function () {
  // remove some other temporary files
  hexo.log.debug("cleaning build and temp folder");
  const folders = [
    path.join(hexo.base_dir, "tmp/hexo-theme-flowbite"),
    path.join(hexo.base_dir, "tmp/hexo-theme-claudia"),
    path.join(hexo.base_dir, "tmp/hexo-theme-butterfly"),
    path.join(hexo.base_dir, "tmp/hexo-themes")
  ]
    .concat(searchFiles)
    .flat();
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    try {
      if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
    } catch (error) {
      hexo.log.warn("fail delete " + folder, error.message);
    }
  }
});
