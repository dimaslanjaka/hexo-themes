import fs from "fs-extra";
import minimist from "minimist";
import yaml from "yaml";

// ts-node switch-theme.ts flowbite

const argv = minimist(process.argv.slice(2));
const themeName = argv._[0].includes("hexo-theme") ? argv._[0] : "hexo-theme-" + argv._[0];
const baseConfig = yaml.parse(fs.readFileSync("_config.base.yml", "utf-8"));

if (fs.existsSync(`_config.base.${themeName}.yml`)) {
  const themeConfig = yaml.parse(fs.readFileSync(`_config.base.${themeName}.yml`, "utf-8"));
  const config = Object.assign(baseConfig, themeConfig);
  fs.writeFileSync("_config.yml", yaml.stringify(config));
}
