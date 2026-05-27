import fs from 'fs-extra';
import minimist from 'minimist';
import { marked } from 'marked';
import { parse, stringify } from 'yaml';
import { spawnSync } from 'cross-spawn';

const argv = minimist(process.argv.slice(2));

if (!argv._[0]) {
  console.error('Usage: switch-theme <theme-name>');
  console.error('Example: switch-theme butterfly');
  process.exit(1);
}

const themeName = argv._[0].includes('hexo-theme') ? argv._[0] : 'hexo-theme-' + argv._[0];
const baseConfig = parse(fs.readFileSync('_config.base.yml', 'utf-8'));

console.log('Switching theme to', themeName);

const themeBaseConfigFile = `_config.base.${themeName}.yml`;
if (fs.existsSync(themeBaseConfigFile)) {
  const themeConfig = parse(fs.readFileSync(themeBaseConfigFile, 'utf-8'));
  const config = Object.assign(baseConfig, themeConfig);
  config.theme = themeName; // Update theme
  if (!config.renderers) config.renderers = {};
  // --renderers=nunjucks,markdown-it
  if (argv.renderers) {
    config.renderers.engines = argv.renderers.split(',');
    console.log('renderers', config.renderers.engines, 'applied');
  }
  fs.writeFileSync('_config.yml', stringify(config));
}

const readmeContent = fs.readFileSync(`themes/${themeName}/readme.md`, 'utf-8');
const htmlContent = marked(readmeContent);
fs.writeFileSync(
  'source/index.md',
  ['---', `title: ${themeName}`, `description: HexoJS theme - ${themeName}`, '---', '', '', htmlContent].join('\n')
);

// Copy custom layouts into active theme directory
spawnSync('npx', ['-y', '-p', '@babel/core', '-p', '@babel/node', 'babel-node', '--', '_layout-loader.cjs'], {
  stdio: 'inherit'
});

// Always run hexo clean
console.log('Cleaning Hexo cache...');
spawnSync('hexo', ['clean'], { stdio: 'inherit' });
