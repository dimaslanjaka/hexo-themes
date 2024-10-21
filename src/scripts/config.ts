import { deepmerge } from "deepmerge-ts";
import fs from "fs-extra";
import Hexo from "hexo";
import path from "path";
import yaml from "yaml";

// themes/<your_theme>/scripts/example.js
export function themeConfig(this: Hexo | undefined) {
  let config = {};
  const instance = this instanceof Hexo ? this : hexo;

  const theme_names = [instance.config.theme, "hexo-theme-" + instance.config.theme];
  const theme_dirs = theme_names
    .map((name) => {
      return [path.join(instance.base_dir, "themes", name), path.join(instance.base_dir, "node_modules", name)];
    })
    .flat()
    .filter(fs.existsSync);
  const theme_config_file = theme_dirs
    .map((dir) => path.join(dir, "_config.yml"))
    .filter((filePath) => fs.existsSync(filePath))[0];
  if (theme_config_file) {
    config = yaml.parse(fs.readFileSync(theme_config_file, "utf-8"));
  }

  const user_defined_theme_config_file = theme_names
    .map((name) => {
      return [
        path.join(instance.base_dir, `_config.${name}.yml`),
        path.join(instance.base_dir, `_config.hexo-theme-${name}.yml`)
      ];
    })
    .flat()
    .filter((filePath) => fs.existsSync(filePath))[0];
  if (user_defined_theme_config_file) {
    config = Object.assign(config, yaml.parse(fs.readFileSync(user_defined_theme_config_file, "utf-8")));
  }

  if ("nav" in instance.config.theme_config) {
    delete instance.config.theme_config.nav;
  }
  if ("footer_nav" in instance.config.theme_config) {
    delete instance.config.theme_config.footer_nav;
  }
  config = deepmerge(instance.config.theme_config, config);

  return config;
}

hexo.extend.helper.register("themeConfig", themeConfig);
