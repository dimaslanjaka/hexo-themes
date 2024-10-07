const Hexo = require("hexo");
const path = require("path");
const fs = require("fs-extra");
const yaml = require("yaml");
const { deepmerge } = require("deepmerge-ts");

// themes/<your_theme>/scripts/example.js
function themeConfig() {
  let config = {};

  const theme_names = [hexo.config.theme, "hexo-theme-" + hexo.config.theme];
  const theme_dirs = theme_names
    .map((name) => {
      return [path.join(hexo.base_dir, "themes", name), path.join(hexo.base_dir, "node_modules", name)];
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
        path.join(hexo.base_dir, `_config.${name}.yml`),
        path.join(hexo.base_dir, `_config.hexo-theme-${name}.yml`)
      ];
    })
    .flat()
    .filter((filePath) => fs.existsSync(filePath))[0];
  if (user_defined_theme_config_file) {
    config = Object.assign(config, yaml.parse(fs.readFileSync(user_defined_theme_config_file, "utf-8")));
  }

  if (this instanceof Hexo) {
    config = deepmerge(config, this.config.theme_config);
  } else {
    config = deepmerge(config, hexo.config.theme_config);
  }

  return config;
}

// Please see: https://hexo.io/api/filter
// hexo.extend.filter.register("after_init", themeConfig);

// Also you can use it in a template engine (e.g: EJS)
// https://hexo.io/docs/helpers
hexo.extend.helper.register("getThemeConfig", themeConfig);

module.exports = themeConfig;
