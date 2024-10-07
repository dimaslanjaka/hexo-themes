import path from "path";
import { extractTarGz } from "./extract";

extractTarGz(
  path.join(process.cwd(), "releases", "hexo-theme-flowbite.tgz"),
  path.join(process.cwd(), "tmp", "hexo-theme-flowbite"),
  "package/", // Only extract files from the "package/" directory
  true
);
